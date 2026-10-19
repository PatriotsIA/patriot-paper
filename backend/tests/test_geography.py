import json
import math
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]


def test_every_county_has_matching_form_api_and_map_identity():
    catalog=json.loads((ROOT/'src/data/counties.json').read_text())
    states=json.loads((ROOT/'src/data/states.json').read_text())
    lookup=json.loads((ROOT/'backend/counties.json').read_text())
    national=json.loads((ROOT/'public/maps/us-counties.json').read_text())
    assert lookup['35013']['name'] == 'Doña Ana County'
    assert lookup['72011']['name'] == 'Añasco Municipio'
    assert len(catalog)==len(lookup)==len(national['counties'])==3222
    assert len(states)==len(national['states'])==52
    assert {c['id'] for c in catalog}=={c['id'] for c in national['counties']}==set(lookup)
    for county in catalog:
        assert lookup[county['id']]=={'state':county['state'],'name':county['name']}
        assert len(county['id'])==5 and county['id'].isdigit()
    for state in states:
        geometry=json.loads((ROOT/f"public/maps/states/{state['code']}.json").read_text())
        assert {c['id'] for c in geometry['counties']}=={c['id'] for c in catalog if c['state']==state['code']}
        assert all(c['id'].startswith(state['id']) for c in geometry['counties'])
        for county in geometry['counties']:
            assert county['d'].startswith('M')
            assert all(math.isfinite(n) for n in county['bounds']+county['center'])
            assert 0<=county['bounds'][0]<county['bounds'][2]<=1000
            assert 0<=county['bounds'][1]<county['bounds'][3]<=650
