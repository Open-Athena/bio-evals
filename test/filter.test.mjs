import test from 'node:test';
import assert from 'node:assert/strict';
import {filterCatalog} from '../src/components/catalog.js';
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
