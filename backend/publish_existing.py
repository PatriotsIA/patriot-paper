"""Publish legacy first names only with separately confirmed signer permission.

Dry run by default. Never print names, email addresses or private record keys.
New records with any explicit public-name preference are always excluded.
"""
import argparse
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

import boto3
from botocore.exceptions import ClientError


def publish_legacy(ddb, table, counties, apply=False):
    stats = {'eligible': 0, 'published': 0, 'skipped': 0, 'changedDuringRun': 0}
    options = dict(TableName=table, ConsistentRead=True,
        FilterExpression='begins_with(pk, :prefix) AND sk = :profile',
        ExpressionAttributeValues={':prefix': {'S': 'PLEDGE#'}, ':profile': {'S': 'PROFILE'}},
        ProjectionExpression='pk, sk, #name, countyFips, createdAt, publishFirstName',
        ExpressionAttributeNames={'#name': 'name'})
    while True:
        page = ddb.scan(**options)
        for item in page.get('Items', []):
            county = item.get('countyFips', {}).get('S', '')
            full_name = item.get('name', {}).get('S', '').strip()
            first_name = full_name.split()[0] if full_name else ''
            created = item.get('createdAt', {}).get('S', '')
            if 'publishFirstName' in item or county not in counties or not first_name or len(first_name) > 60 or '@' in first_name:
                stats['skipped'] += 1
                continue
            try:
                timestamp = datetime.fromisoformat(created).astimezone(timezone.utc).isoformat()
            except ValueError:
                stats['skipped'] += 1
                continue
            stats['eligible'] += 1
            if not apply:
                continue
            public_id = uuid.uuid4().hex
            sort_key = timestamp + '#' + public_id
            confirmed = datetime.now(timezone.utc).isoformat()
            writes = [{'Update': {'TableName': table, 'Key': {'pk': item['pk'], 'sk': item['sk']},
                'ConditionExpression': 'attribute_not_exists(publishFirstName) AND #name = :original AND countyFips = :county',
                'UpdateExpression': 'SET publishFirstName = :yes, publicFirstName = :first, publicNameId = :id, publicNameSortKey = :sort, publicNameConsentVersion = :version, publicNameConsentSource = :source, publicNamePermissionRecordedAt = :recorded',
                'ExpressionAttributeNames': {'#name': 'name'},
                'ExpressionAttributeValues': {':yes': {'BOOL': True}, ':original': item['name'], ':county': item['countyFips'],
                    ':first': {'S': first_name}, ':id': {'S': public_id}, ':sort': {'S': sort_key},
                    ':version': {'S': '2026-10-23'}, ':source': {'S': 'site-owner-confirmed-existing-signer-permission'}, ':recorded': {'S': confirmed}}}}]
            for partition in ['SUPPORTERS#ALL', 'SUPPORTERS#COUNTY#' + county]:
                writes.append({'Put': {'TableName': table, 'ConditionExpression': 'attribute_not_exists(pk)', 'Item': {
                    'pk': {'S': partition}, 'sk': {'S': sort_key}, 'id': {'S': public_id},
                    'firstName': {'S': first_name}, 'countyFips': {'S': county}}}})
            try:
                ddb.transact_write_items(TransactItems=writes)
                stats['published'] += 1
            except ClientError as exc:
                if exc.response['Error']['Code'] == 'TransactionCanceledException' and any(reason.get('Code') == 'ConditionalCheckFailed' for reason in exc.response.get('CancellationReasons', [])):
                    stats['changedDuringRun'] += 1
                else:
                    raise
        if not page.get('LastEvaluatedKey'):
            return stats
        options['ExclusiveStartKey'] = page['LastEvaluatedKey']


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true')
    parser.add_argument('--permission-confirmed', action='store_true')
    args = parser.parse_args()
    if args.apply and not args.permission_confirmed:
        parser.error('--apply requires --permission-confirmed for separately obtained signer permission')
    session = boto3.Session(profile_name='pia', region_name='us-west-2')
    stack = 'patriot-paper-pledges'
    outputs = session.client('cloudformation').describe_stacks(StackName=stack)['Stacks'][0]['Outputs']
    table = next(value['OutputValue'] for value in outputs if value['OutputKey'] == 'TableName')
    counties = json.loads(Path(__file__).with_name('counties.json').read_text())
    print(json.dumps({'stack': stack, 'dryRun': not args.apply, **publish_legacy(session.client('dynamodb'), table, counties, args.apply)}))
