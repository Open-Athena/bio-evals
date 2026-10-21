import test from 'node:test';
import assert from 'node:assert/strict';
import {filterCatalog,catalogCounts} from '../src/components/catalog.js';
const families=[{id:'family',name:'Family',description:'Biological reasoning',creators:['Institute'],notes:[],variants:[
  {name:'Text protocol',description:'MCQ',creators:[],notes:[],assignment:'ID',implementations:[{framework:'Evalchemy',status:'yes'}]},
  {name:'Tool protocol',description:'Analysis',creators:['Curator'],notes:['Private inputs'],assignment:'OOD',implementations:[{framework:'Harbor',status:'unknown'}]}
]}];
test('filtering preserves family grouping while selecting matching variants',()=>{
  assert.equal(filterCatalog(families,'biology').length,0);
  assert.equal(filterCatalog(families,'Biological Institute')[0].variants.length,2);
  assert.equal(filterCatalog(families,'curator')[0].variants[0].name,'Tool protocol');
  assert.equal(filterCatalog(families,'','Harbor','unknown')[0].variants.length,1);
  assert.equal(filterCatalog(families,'','Harbor','yes').length,0);
  assert.equal(families[0].variants.length,2);
});
test('assignment filtering intersects search, framework and implementation without changing input',()=>{
  assert.equal(filterCatalog(families,'','All frameworks','All states','ID')[0].variants[0].name,'Text protocol');
  assert.equal(filterCatalog(families,'curator','Harbor','unknown','OOD')[0].variants[0].name,'Tool protocol');
  assert.equal(filterCatalog(families,'','Harbor','unknown','ID').length,0);
  assert.equal(filterCatalog(families,'curator','Harbor','yes','OOD').length,0);
  const unassigned=structuredClone(families);
  unassigned[0].variants[0].assignment=null;
  assert.equal(filterCatalog(unassigned,'','All frameworks','All states','Unassigned')[0].variants[0].name,'Text protocol');
  assert.equal(families[0].variants.length,2);
  assert.equal(families[0].variants[0].assignment,'ID');
});
test('assignment counts count each family once per category and retain empty categories',()=>{
  const copy=structuredClone(families);
  copy[0].variants.push(structuredClone(copy[0].variants[0]));
  copy.push({...structuredClone(copy[0]),id:'unassigned',variants:[{...structuredClone(copy[0].variants[0]),assignment:null}]});
  assert.deepEqual(catalogCounts(copy,'assignment',['ID','OOD','Unassigned','Other']).map(d=>[d.key,d.count]),[
    ['ID',1],['OOD',1],['Unassigned',1],['Other',0]
  ]);
  assert.deepEqual(catalogCounts(filterCatalog(copy,'','Harbor','unknown','OOD'),'assignment',['ID','OOD']).map(d=>d.count),[0,1]);
});
