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


def names(api, **params):
    return request(api, rawPath='/supporters', queryStringParameters=params)


def test_private_pledges_never_appear_or_gain_consent_on_repeat(api):
    assert request(api, pledge())[0] == 200
    assert names(api)[1] == {'items': [], 'nextCursor': None}
    assert request(api, pledge(publishFirstName=True, publicFirstName='Test'))[0] == 200
    assert names(api)[1]['items'] == []
    assert request(api)[1]['total'] == 1


def test_public_names_are_explicit_minimal_atomic_and_deduplicated(api):
    public = pledge(publishFirstName=True, publicFirstName=' Ana María ')
    assert request(api, public)[0] == 200
    assert request(api, {**public, 'countyFips': '48375', 'publicFirstName': 'Changed'})[0] == 200
    status, page = names(api)
    assert status == 200 and len(page['items']) == 1
    row = page['items'][0]
    assert set(row) == {'id', 'firstName', 'countyFips'}
    assert row['firstName'] == 'Ana María' and row['countyFips'] == '48381'
    assert len(row['id']) == 32 and row['id'] != api.hashlib.sha256(public['email'].encode()).hexdigest()
    assert names(api, county='48381')[1]['items'] == [row]
    assert names(api, county='48375')[1]['items'] == []
    assert 'Supporter' not in json.dumps(page) and '@' not in json.dumps(page)
    assert request(api)[1]['total'] == 1


def test_public_names_pagination_and_county_isolation(api):
    for n in range(7):
        api.save_pledge(api.validate(pledge(email=f'person{n}@example.invalid', publicFirstName='Same', publishFirstName=True, countyFips='48381' if n % 2 else '48375')))
    for county, expected in [('', 7), ('48381', 3), ('48375', 4)]:
        seen = []; cursor = ''; pages = 0
        while True:
            status, page = names(api, county=county, limit='2', cursor=cursor)
            assert status == 200 and len(page['items']) <= 2
            seen.extend(page['items']); pages += 1
            cursor = page['nextCursor']
            if not cursor: break
            assert pages < 6
        assert len(seen) == expected and len({row['id'] for row in seen}) == expected
        assert all(not county or row['countyFips'] == county for row in seen)


@pytest.mark.parametrize('params', [{'county':'99999'}, {'limit':'0'}, {'limit':'51'}, {'limit':'oops'}, {'cursor':'%%%invalid'}, {'cursor':'UFJPRklMRQ=='}, {'cursor':'x'*1000}])
def test_public_query_rejects_invalid_requests(api, params):
    assert names(api, **params)[0] == 400


@pytest.mark.parametrize('fields', [{'publishFirstName':'true'}, {'publishFirstName':True}, {'publishFirstName':True,'publicFirstName':' '}, {'publishFirstName':True,'publicFirstName':'x'*61}, {'publishFirstName':True,'publicFirstName':'A\nB'}])
def test_public_consent_validation(api, fields):
    assert request(api, pledge(**fields))[0] == 400
    assert names(api)[1]['items'] == []
    assert request(api)[1]['total'] == 0


def test_public_rows_roll_back_when_aggregate_fails(api):
    api.DDB.delete_item(TableName=api.TABLE,Key={'pk':{'S':'PUBLIC'},'sk':{'S':'COUNTS'}})
    assert request(api, pledge(publishFirstName=True, publicFirstName='Test'))[0] == 503
    assert names(api)[1]['items'] == []
    assert names(api, county='48381')[1]['items'] == []


def test_legacy_publication_requires_missing_preference_is_idempotent_and_keeps_counts(api):
    from publish_existing import publish_legacy
    # Model a profile created before public-name consent existed.
    api.save_pledge(api.validate(pledge()))
    digest = api.hashlib.sha256(pledge()['email'].encode()).hexdigest()
    key = {'pk': {'S': 'PLEDGE#' + digest}, 'sk': {'S': 'PROFILE'}}
    api.DDB.update_item(TableName=api.TABLE, Key=key, UpdateExpression='REMOVE publishFirstName')
    api.save_pledge(api.validate(pledge(email='private@example.invalid', publishFirstName=False)))
    before = api.get_counts()
    plan = publish_legacy(api.DDB, api.TABLE, api.COUNTIES)
    assert plan['eligible'] == 1 and plan['published'] == 0
    assert api.get_supporters({})['items'] == []
    result = publish_legacy(api.DDB, api.TABLE, api.COUNTIES, apply=True)
    assert result['published'] == 1 and result['skipped'] == 1
    rows = api.get_supporters({})['items']
    assert len(rows) == 1 and rows[0]['firstName'] == 'Test'
    assert api.get_supporters({'county':'48381'})['items'] == rows
    assert api.get_counts()['counties'] == before['counties']
    assert publish_legacy(api.DDB, api.TABLE, api.COUNTIES, apply=True)['published'] == 0
    assert api.get_supporters({})['items'] == rows
    item = api.DDB.get_item(TableName=api.TABLE, Key=key)['Item']
    assert item['publicNameConsentSource']['S'] == 'site-owner-confirmed-existing-signer-permission'
    assert item['name']['S'] == 'Test Supporter'
