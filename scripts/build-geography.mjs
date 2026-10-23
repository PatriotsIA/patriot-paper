// Rebuild from the Census 2025 1:20m cartographic boundary shapefiles.
// Usage: node scripts/build-geography.mjs /path/to/extracted/shapefiles
import { read } from 'shapefile';
import { geoAlbersUsa, geoAzimuthalEqualArea, geoMercator, geoPath } from 'd3-geo';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const dir=process.argv[2];
if(!dir) throw new Error('Provide the directory containing cb_2025_us_{county,state}_20m.shp');
const counties=await read(`${dir}/cb_2025_us_county_20m.shp`, undefined, {encoding:'utf-8'});
const states=await read(`${dir}/cb_2025_us_state_20m.shp`, undefined, {encoding:'utf-8'});
const round=n=>Math.round(n*100)/100;
const compact=feature=>({id:feature.properties.GEOID,state:feature.properties.STUSPS,name:feature.properties.NAMELSAD});
const catalog=counties.features.map(compact).sort((a,b)=>a.id.localeCompare(b.id));
const stateList=states.features.filter(s=>catalog.some(c=>c.state===s.properties.STUSPS)).map(s=>({id:s.properties.GEOID,code:s.properties.STUSPS,name:s.properties.NAME})).sort((a,b)=>a.name.localeCompare(b.name));
const usa=geoAlbersUsa().fitExtent([[20,15],[980,610]], {type:'FeatureCollection',features:counties.features.filter(c=>c.properties.STUSPS!=='PR')});
// Keep Puerto Rico in the open Gulf inset, clear of Florida and Texas.
const pr=geoMercator().fitExtent([[600,560],[780,625]],{type:'FeatureCollection',features:counties.features.filter(c=>c.properties.STUSPS==='PR')});
const shape=(feature,projection)=>{
 const path=geoPath(projection).digits(2),d=path(feature);
 if(!d) throw new Error(`Empty geometry: ${feature.properties.GEOID}`);
 const [[x0,y0],[x1,y1]]=path.bounds(feature);
 return {id:feature.properties.GEOID,d,center:path.centroid(feature).map(round),bounds:[x0,y0,x1,y1].map(round)};
};
const national={counties:counties.features.map(c=>shape(c,c.properties.STUSPS==='PR'?pr:usa)),states:states.features.filter(s=>stateList.some(x=>x.id===s.properties.GEOID)).map(s=>shape(s,s.properties.STUSPS==='PR'?pr:usa))};
await mkdir('src/data',{recursive:true});await mkdir('public/maps/states',{recursive:true});await mkdir('backend',{recursive:true});
await writeFile('src/data/counties.json',JSON.stringify(catalog));
await writeFile('src/data/states.json',JSON.stringify(stateList));
await writeFile('backend/counties.json',JSON.stringify(Object.fromEntries(catalog.map(c=>[c.id,{state:c.state,name:c.name}]))));
await writeFile('public/maps/us-counties.json',JSON.stringify(national));
for(const s of stateList){
 const features=counties.features.filter(c=>c.properties.STUSPS===s.code);
 // Rotate before fitting so Alaska's western Aleutians do not wrap across the map.
 const nationalCenter=s.code==='AK'?[-154,63]:s.code==='HI'?[-157,20]:s.code==='PR'?[-66.5,18]:[-96,38];
 const projection=geoAzimuthalEqualArea().rotate([-nationalCenter[0],-nationalCenter[1]]).fitExtent([[25,25],[975,625]],{type:'FeatureCollection',features});
 await writeFile(`public/maps/states/${s.code}.json`,JSON.stringify({counties:features.map(c=>shape(c,projection)),states:[]}));
}
await writeFile('public/maps/provenance.json',JSON.stringify({vintage:2025,source:'U.S. Census Bureau, 2025 Cartographic Boundary Files, 1:20,000,000',urls:['https://www2.census.gov/geo/tiger/GENZ2025/shp/cb_2025_us_county_20m.zip','https://www2.census.gov/geo/tiger/GENZ2025/shp/cb_2025_us_state_20m.zip'],countyCount:catalog.length,stateCount:stateList.length,catalogSha256:createHash('sha256').update(JSON.stringify(catalog)).digest('hex')},null,2));
if(catalog.length!==3222||stateList.length!==52)throw new Error('Unexpected county/state coverage');
console.log(`Generated ${catalog.length} counties and equivalents across ${stateList.length} states/DC/PR; national map + state views.`);
