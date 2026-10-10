import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { cities, globePoint, journeyCamera, mercator, unproject, visits, activeVisit } from '../app/network-geo.ts';

test('city projection matches the downloaded imagery metadata', async () => {
  const sites=JSON.parse(await readFile(new URL('../public/maps/sites.json',import.meta.url),'utf8'));
  for(const city of cities){
    const record=sites.find(s=>s.id===city.id);
    const [x,y]=mercator(city.lon,city.lat);
    assert.ok(Math.abs(record.bounds[0]-(x-city.width/2))<.001);
    assert.ok(Math.abs(record.bounds[1]-(y-city.height/2))<.001);
    const [lon,lat]=unproject(x,y);
    assert.ok(Math.abs(lon-city.lon)<1e-8 && Math.abs(lat-city.lat)<1e-8);
  }
});
test('camera holds at all six cities and matches their profiles',()=>{
  assert.equal(visits.length,6);
  for(const visit of visits){
    const camera=journeyCamera(visit.jump);
    const turns=(camera.lon-visit.city.lon)/360;
    assert.ok(Math.abs(turns-Math.round(turns))<1e-8);
    assert.equal(camera.lat,visit.city.lat);
    assert.equal(camera.altitude,journeyCamera(visit.jump+.01).altitude);
    assert.equal(activeVisit(visit.jump)?.index,visit.index);
  }
  let previous=journeyCamera(1/6).lon;
  for(let p=1/6;p<1.2/6;p+=.0001){const lon=journeyCamera(p).lon;assert.ok(lon<=previous);previous=lon;}
  assert.ok(journeyCamera(1.15/6).lon < -180);
});
test('camera is continuous and remains above Earth, including reverse traversal',()=>{
  let previous=journeyCamera(0);
  for(let p=.00001;p<=1;p+=.00001){const next=journeyCamera(p);assert.ok(next.altitude>0);assert.ok(Math.abs(next.lon-previous.lon)<.2);assert.ok(Math.abs(Math.log(next.altitude/previous.altitude))<.02);previous=next;}
  for(const p of [0,.25,.53,.7,.86,1])assert.deepEqual(journeyCamera(p),journeyCamera(p));
});
test('globe coordinates use the Earth texture longitude convention',()=>{
  assert.deepEqual(globePoint(0,0),[1,0,-0]);
  assert.ok(Math.abs(globePoint(90,0)[2]+1)<1e-8);
  assert.ok(Math.abs(globePoint(0,90)[1]-1)<1e-8);
});
test('LA River comes from nonempty geographic features, not invented paths',async()=>{
  const river=JSON.parse(await readFile(new URL('../public/maps/la-river.geojson',import.meta.url),'utf8'));
  assert.ok(river.features.length>0);
  for(const feature of river.features){assert.ok(feature.properties.osmId);assert.equal(feature.geometry.type,'LineString');assert.ok(feature.geometry.coordinates.length>1);}
});
