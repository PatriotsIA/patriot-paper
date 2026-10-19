"""Private pledge storage and public county aggregates. Never log request bodies."""
import base64
import hashlib
import json
import os
import re
import time
from datetime import datetime, timezone
from pathlib import Path

import boto3
from botocore.exceptions import ClientError

COUNTIES = json.loads(Path(__file__).with_name('counties.json').read_text())
ALLOWED_ORIGINS = set(os.environ.get('ALLOWED_ORIGINS', '').split(','))
ROLES = {'', 'Attend meetings', 'Public records requests', 'Volunteer coordination', 'Poll watcher / observer', 'Other'}
TABLE = os.environ.get('TABLE_NAME', 'patriot-paper-pledges')
DDB = boto3.client('dynamodb')


def response(status, body):
    return {'statusCode': status, 'headers': {'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'}, 'body': json.dumps(body)}


def validate(data):
    if not isinstance(data, dict):
        raise ValueError('Please submit a valid pledge.')
    for key, limit in [('name', 120), ('email', 254), ('state', 2), ('countyFips', 5), ('role', 80), ('website', 200)]:
        value = data.get(key, '')
        if not isinstance(value, str) or len(value) > limit:
            raise ValueError('Please check your pledge details.')
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    county_id = data.get('countyFips', '')
    county = COUNTIES.get(county_id)
    if not name or any(ord(c) < 32 for c in name):
        raise ValueError('Please enter your name.')
    if not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', email):
        raise ValueError('Please enter a valid email address.')
    if not county or county['state'] != data.get('state'):
        raise ValueError('Please select a county in your chosen state.')
    if data.get('agreePrivacyPolicy') is not True:
        raise ValueError('Please agree to the Privacy Policy and Terms & Conditions.')
    if data.get('role', '') not in ROLES:
        raise ValueError('Please select a valid way to help.')
    return {'name': name, 'email': email, 'countyFips': county_id, 'county': county['name'], 'state': county['state'], 'role': data.get('role', '')}


def rate_limit(ip):
    now = int(time.time())
    # Hashes rotate with each time window; raw IP addresses are never stored.
    for seconds, limit in [(60, 10), (86400, 100)]:
        window = now // seconds
        key = hashlib.sha256(f'{seconds}:{window}:{ip}'.encode()).hexdigest()
        try:
            DDB.update_item(TableName=TABLE, Key={'pk': {'S': 'RATE#' + key}, 'sk': {'S': 'LIMIT'}},
                UpdateExpression='SET expiresAt = :ttl ADD attempts :one',
                ConditionExpression='attribute_not_exists(attempts) OR attempts < :limit',
                ExpressionAttributeValues={':ttl': {'N': str(now + seconds * 2)}, ':one': {'N': '1'}, ':limit': {'N': str(limit)}})
        except ClientError as exc:
            if exc.response['Error']['Code'] == 'ConditionalCheckFailedException':
                return False
            raise
    return True


def save_pledge(pledge):
    now = datetime.now(timezone.utc).isoformat()
    digest = hashlib.sha256(pledge['email'].encode()).hexdigest()
    item = {key: {'S': value} for key, value in pledge.items()}
    item.update(pk={'S': 'PLEDGE#' + digest}, sk={'S': 'PROFILE'}, createdAt={'S': now}, privacyConsent={'BOOL': True}, consentVersion={'S': '2026-10-19'})
    writes = [
        {'Put': {'TableName': TABLE, 'Item': item, 'ConditionExpression': 'attribute_not_exists(pk)'}},
        {'Update': {'TableName': TABLE, 'Key': {'pk': {'S': 'PUBLIC'}, 'sk': {'S': 'COUNTS'}},
            'UpdateExpression': 'SET #counts.#county = if_not_exists(#counts.#county, :zero) + :one, updatedAt = :now',
            'ExpressionAttributeNames': {'#counts': 'counts', '#county': pledge['countyFips']},
            'ExpressionAttributeValues': {':zero': {'N': '0'}, ':one': {'N': '1'}, ':now': {'S': now}}}},
    ]
    for attempt in range(4):
        try:
            DDB.transact_write_items(TransactItems=writes)
            return
        except ClientError as exc:
            if exc.response['Error']['Code'] != 'TransactionCanceledException':
                raise
            reasons = exc.response.get('CancellationReasons', [])
            if reasons and reasons[0].get('Code') == 'ConditionalCheckFailed':
                # Existing emails never increment or move a pledge to a different county.
                # Use the same public response as a newly accepted pledge.
                return
            if attempt == 3 or not any(r.get('Code') == 'TransactionConflict' for r in reasons):
                raise
            time.sleep(.05 * (2 ** attempt))


def get_counts():
    item = DDB.get_item(TableName=TABLE, Key={'pk': {'S': 'PUBLIC'}, 'sk': {'S': 'COUNTS'}}, ConsistentRead=True).get('Item')
    if not item:
        raise RuntimeError('Aggregate record is not initialized')
    counts = {fips: int(value['N']) for fips, value in item['counts']['M'].items() if fips in COUNTIES and int(value['N']) > 0}
    states = {}
    for fips, count in counts.items():
        state = COUNTIES[fips]['state']
        states[state] = states.get(state, 0) + count
    return {'counties': counts, 'states': states, 'total': sum(counts.values()), 'countiesRepresented': len(counts), 'updatedAt': item.get('updatedAt', {}).get('S'), 'asOf': datetime.now(timezone.utc).isoformat()}


def handler(event, context):
    method = event.get('requestContext', {}).get('http', {}).get('method', '')
    path = event.get('rawPath', '')
    headers = {k.lower(): v for k, v in (event.get('headers') or {}).items()}
    origin = headers.get('origin', '')
    if origin and origin not in ALLOWED_ORIGINS:
        return response(403, {'message': 'This site is not allowed to submit pledges.'})
    try:
        if method == 'GET' and path == '/counts':
            return response(200, get_counts())
        if method != 'POST' or path != '/pledges':
            return response(404, {'message': 'Not found.'})
        if not origin or origin not in ALLOWED_ORIGINS:
            return response(403, {'message': 'Please submit your pledge through the website.'})
        if headers.get('content-type', '').split(';')[0].strip() != 'application/json':
            return response(415, {'message': 'Please submit your pledge as JSON.'})
        body = event.get('body') or ''
        if len(body) > 12000:
            return response(413, {'message': 'Your pledge is too long.'})
        if event.get('isBase64Encoded'):
            body = base64.b64decode(body, validate=True).decode('utf-8')
        if len(body.encode('utf-8')) > 8192:
            return response(413, {'message': 'Your pledge is too long.'})
        data = json.loads(body)
        pledge = validate(data)
        if data.get('website'):
            return response(200, {'accepted': True})
        ip = event.get('requestContext', {}).get('http', {}).get('sourceIp', '')
        if not rate_limit(ip):
            result = response(429, {'message': 'Too many attempts. Please try again later.'})
            result['headers']['Retry-After'] = '60'
            return result
        save_pledge(pledge)
        return response(200, {'accepted': True})
    except (ValueError, UnicodeError) as exc:
        message = str(exc) if type(exc) is ValueError else 'Please submit a valid pledge.'
        return response(400, {'message': message})
    except Exception:
        # No personal details or database exception payloads enter logs/public responses.
        print(json.dumps({'event': 'pledge_api_error', 'requestId': getattr(context, 'aws_request_id', None), 'method': method}))
        return response(503, {'message': 'Pledges are temporarily unavailable. Please try again shortly.'})
