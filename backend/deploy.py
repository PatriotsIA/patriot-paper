"""Deploy only this application's API; prints no keys or pledge records.
Run: /path/to/python-with-boto3 backend/deploy.py --deploy
"""
import argparse
import hashlib
import io
import json
import time
import zipfile
from pathlib import Path
import boto3
from botocore.exceptions import ClientError
from infrastructure import template

parser=argparse.ArgumentParser()
parser.add_argument('--deploy',action='store_true')
args=parser.parse_args()
root=Path(__file__).resolve().parents[1]
if not args.deploy:
    print(json.dumps(template(),indent=2))
    raise SystemExit(0)
session=boto3.Session(profile_name='pia',region_name='us-west-2')
cf=session.client('cloudformation');s3=session.client('s3');ddb=session.client('dynamodb')
account=session.client('sts').get_caller_identity()['Account']
bucket=f'patriot-paper-pledge-artifacts-{account}-us-west-2'
try:s3.head_bucket(Bucket=bucket)
except ClientError as exc:
    if exc.response['Error']['Code'] not in ('404','NoSuchBucket'):raise
    s3.create_bucket(Bucket=bucket,CreateBucketConfiguration={'LocationConstraint':'us-west-2'})
    s3.put_public_access_block(Bucket=bucket,PublicAccessBlockConfiguration={k:True for k in ['BlockPublicAcls','IgnorePublicAcls','BlockPublicPolicy','RestrictPublicBuckets']})
    s3.put_bucket_encryption(Bucket=bucket,ServerSideEncryptionConfiguration={'Rules':[{'ApplyServerSideEncryptionByDefault':{'SSEAlgorithm':'AES256'}}]})
    s3.put_bucket_tagging(Bucket=bucket,Tagging={'TagSet':[{'Key':'Project','Value':'patriot-paper'}]})
archive=io.BytesIO()
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    for name in ['app.py','counties.json']:z.write(root/'backend'/name,name)
code=archive.getvalue();key='lambda/'+hashlib.sha256(code).hexdigest()+'.zip'
s3.put_object(Bucket=bucket,Key=key,Body=code,ContentType='application/zip')
params=[{'ParameterKey':'CodeBucket','ParameterValue':bucket},{'ParameterKey':'CodeKey','ParameterValue':key}]
stack='patriot-paper-pledges'
kwargs=dict(StackName=stack,TemplateBody=json.dumps(template()),Parameters=params,Capabilities=['CAPABILITY_IAM'],Tags=[{'Key':'Project','Value':'patriot-paper'}])
try:
    cf.describe_stacks(StackName=stack)
except ClientError as exc:
    if 'does not exist' not in str(exc):raise
    cf.create_stack(**kwargs,DisableRollback=True)
else:
    try:cf.update_stack(**kwargs)
    except ClientError as exc:
        if 'No updates are to be performed' not in str(exc):raise
while True:
    detail=cf.describe_stacks(StackName=stack)['Stacks'][0];status=detail['StackStatus']
    print(status,flush=True)
    if status in ('CREATE_COMPLETE','UPDATE_COMPLETE'):break
    if status.endswith('FAILED') or 'ROLLBACK' in status:
        events=cf.describe_stack_events(StackName=stack)['StackEvents']
        for event in events:
            if 'FAILED' in event['ResourceStatus']:print(event['LogicalResourceId'],event.get('ResourceStatusReason',''))
        raise SystemExit('Deployment failed')
    time.sleep(15)
outputs={o['OutputKey']:o['OutputValue'] for o in detail['Outputs']}
try:
    ddb.put_item(TableName=outputs['TableName'],Item={'pk':{'S':'PUBLIC'},'sk':{'S':'COUNTS'},'counts':{'M':{}}},ConditionExpression='attribute_not_exists(pk)')
except ClientError as exc:
    if exc.response['Error']['Code']!='ConditionalCheckFailedException':raise
# Public endpoint is configuration, not a secret. No AWS resource IDs go into the browser.
(root/'src/config/pledge-api.json').write_text(json.dumps({'url':outputs['ApiUrl']},indent=2)+'\n')
print(json.dumps({'api':outputs['ApiUrl'],'stack':stack,'aggregateInitialized':True}))
