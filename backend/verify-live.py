"""Explicit pre-release integration check. Removes only its own synthetic pledge.
No emails are sent. Requires AWS operator credentials, never browser credentials.
Usage: python backend/verify-live.py --verify
"""
import argparse
import hashlib
import json
import uuid
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.error import HTTPError
import boto3

parser=argparse.ArgumentParser();parser.add_argument('--verify',action='store_true');args=parser.parse_args()
if not args.verify:raise SystemExit('Use --verify to run the temporary pre-release check.')
root=Path(__file__).resolve().parents[1]
url=json.loads((root/'src/config/pledge-api.json').read_text())['url']
origin='https://main.d2pqbeealr8kyx.amplifyapp.com'
session=boto3.Session(profile_name='pia',region_name='us-west-2')
stack=session.client('cloudformation').describe_stacks(StackName='patriot-paper-pledges')['Stacks'][0]
table=next(o['OutputValue'] for o in stack['Outputs'] if o['OutputKey']=='TableName')
ddb=session.client('dynamodb')

def call(path,body=None,origin_header=origin):
    request=Request(url+path,data=json.dumps(body).encode() if body is not None else None,headers={'Origin':origin_header,'Content-Type':'application/json'})
    try:
        with urlopen(request,timeout=25) as response:return response.status,json.load(response),response.headers
    except HTTPError as error:return error.code,json.load(error),error.headers

email=f'deployment-{uuid.uuid4().hex}@example.invalid'
pledge={'name':'Deployment verification fixture','email':email,'state':'TX','countyFips':'48381','role':'','agreePrivacyPolicy':True}
key={'pk':{'S':'PLEDGE#'+hashlib.sha256(email.encode()).hexdigest()},'sk':{'S':'PROFILE'}}
baseline=call('/counts')[1]
try:
    assert call('/pledges',{**pledge,'state':'CA'})[0]==400
    assert call('/pledges',pledge,origin_header='https://untrusted.example')[0]==403
    assert call('/pledges',pledge)[0]==200
    assert call('/pledges',{**pledge,'email':email.upper()})[0]==200
    assert call('/pledges',{**pledge,'state':'OR','countyFips':'41067'})[0]==200
    status,totals,headers=call('/counts')
    assert status==200 and headers['Access-Control-Allow-Origin']==origin
    assert totals['counties'].get('48381',0)==baseline['counties'].get('48381',0)+1
    assert totals['counties'].get('41067',0)==baseline['counties'].get('41067',0)
    assert totals['total']==baseline['total']+1
    assert set(totals)=={'counties','states','total','countiesRepresented','updatedAt','asOf'}
    assert email not in json.dumps(totals) and pledge['name'] not in json.dumps(totals)
    print('Live transaction, duplicate suppression, county validation, CORS and public privacy checks passed.')
finally:
    # Conditional transaction cannot remove another pledge or decrement a different county.
    if ddb.get_item(TableName=table,Key=key,ConsistentRead=True).get('Item'):
        ddb.transact_write_items(TransactItems=[
            {'Delete':{'TableName':table,'Key':key,'ConditionExpression':'email = :email AND countyFips = :county','ExpressionAttributeValues':{':email':{'S':email},':county':{'S':'48381'}}}},
            {'Update':{'TableName':table,'Key':{'pk':{'S':'PUBLIC'},'sk':{'S':'COUNTS'}},'UpdateExpression':'SET #counts.#county = #counts.#county - :one','ConditionExpression':'#counts.#county >= :one','ExpressionAttributeNames':{'#counts':'counts','#county':'48381'},'ExpressionAttributeValues':{':one':{'N':'1'}}}}
        ])
    assert not ddb.get_item(TableName=table,Key=key,ConsistentRead=True).get('Item')
    after=call('/counts')[1]
    assert after['counties'].get('48381',0)==baseline['counties'].get('48381',0)
    print('Synthetic pledge removed; county total restored. No notification emails sent.')
