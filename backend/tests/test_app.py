import importlib
import json
import sys
from pathlib import Path

import boto3
import pytest
from moto import mock_aws

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
ORIGIN = 'https://main.d2pqbeealr8kyx.amplifyapp.com'


@pytest.fixture
def api(monkeypatch):
    monkeypatch.setenv('AWS_DEFAULT_REGION', 'us-west-2')
    monkeypatch.setenv('TABLE_NAME', 'test-pledges')
    monkeypatch.setenv('ALLOWED_ORIGINS', ORIGIN)
    with mock_aws():
        ddb = boto3.client('dynamodb')
        ddb.create_table(TableName='test-pledges', KeySchema=[{'AttributeName':'pk','KeyType':'HASH'},{'AttributeName':'sk','KeyType':'RANGE'}], AttributeDefinitions=[{'AttributeName':'pk','AttributeType':'S'},{'AttributeName':'sk','AttributeType':'S'}], BillingMode='PAY_PER_REQUEST')
        ddb.put_item(TableName='test-pledges', Item={'pk':{'S':'PUBLIC'},'sk':{'S':'COUNTS'},'counts':{'M':{}}})
        import app
        yield importlib.reload(app)


def request(api, data=None, **overrides):
    event={'rawPath':'/pledges' if data is not None else '/counts','requestContext':{'http':{'method':'POST' if data is not None else 'GET','sourceIp':'192.0.2.1'}},'headers':{'origin':ORIGIN,'content-type':'application/json'},'body':json.dumps(data) if data is not None else ''}
    event.update(overrides)
    result=api.handler(event,None)
    return result['statusCode'],json.loads(result['body'])


def pledge(**changes):
    return dict(name='Test Supporter',email='test@example.invalid',countyFips='48381',state='TX',role='',agreePrivacyPolicy=True,**changes) if not changes else {**pledge(),**changes}


def test_zero_and_private_data(api):
    assert request(api)[1]['total']==0
    assert request(api,pledge())[0]==200
    status,counts=request(api)
    assert status==200 and counts['counties']=={'48381':1} and counts['states']=={'TX':1}
    assert counts['total']==1 and counts['countiesRepresented']==1
    assert 'Test Supporter' not in json.dumps(counts) and 'email' not in json.dumps(counts)


def test_duplicate_normalization_and_no_county_move(api):
    request(api,pledge())
    for email,county in [(' TEST@EXAMPLE.INVALID ','48381'),('test@example.invalid','48375')]:
        assert request(api,pledge(email=email,countyFips=county))[0]==200
    assert request(api)[1]['counties']=={'48381':1}


def test_same_county_name_different_states(api):
    request(api,pledge(countyFips='48477')) # Washington County, TX
    request(api,pledge(email='other@example.invalid',state='OR',countyFips='41067'))
    data=request(api)[1]
    assert data['total']==2 and data['counties']=={'48477':1,'41067':1}
    assert data['states']=={'TX':1,'OR':1}


@pytest.mark.parametrize('changes',[{'state':'CA'},{'countyFips':'99999'},{'countyFips':'Randall'},{'agreePrivacyPolicy':False},{'email':'bad'},{'name':''},{'role':'<script>'},{'name':'x'*121},{'countyFips':48381}])
def test_rejected_input_does_not_increment(api,changes):
    assert request(api,pledge(**changes))[0]==400
    assert request(api)[1]['total']==0


def test_census_equivalents(api):
    for index,(fips,state) in enumerate([('09110','CT'),('02063','AK'),('15005','HI'),('11001','DC'),('72001','PR'),('51013','VA'),('22071','LA')]):
        assert fips in api.COUNTIES
        assert request(api,pledge(email=f'test{index}@example.invalid',countyFips=fips,state=state))[0]==200
    assert request(api)[1]['total']==7


def test_origins_honeypot_and_malformed_json(api):
    assert request(api,pledge(),headers={'origin':'https://evil.example','content-type':'application/json'})[0]==403
    assert request(api,pledge(),headers={'content-type':'application/json'})[0]==403
    assert request(api,pledge(website='spam'))[0]==200
    assert request(api,pledge(),body='not json')[0]==400
    assert request(api)[1]['total']==0


def test_rate_limit(api):
    for i in range(10):
        assert request(api,pledge(email=f'test{i}@example.invalid'))[0]==200
    assert request(api,pledge(email='last@example.invalid'))[0]==429
    assert request(api)[1]['total']==10


def test_aggregate_failure_rolls_back_private_pledge(api):
    api.DDB.delete_item(TableName=api.TABLE,Key={'pk':{'S':'PUBLIC'},'sk':{'S':'COUNTS'}})
    assert request(api,pledge())[0]==503
    items=api.DDB.scan(TableName=api.TABLE)['Items']
    assert not any(i['pk']['S'].startswith('PLEDGE#') for i in items)
    assert request(api)[0]==503 # Outages must never pretend the count is zero.
