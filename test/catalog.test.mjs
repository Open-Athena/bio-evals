import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {loadCatalog,root,validateCatalog,linkedWork} from '../scripts/catalog.mjs';

import {selectedVersion,trackedCatalog,filterCatalog} from '../src/components/catalog.js';
const source={label:'Source',url:'https://example.org/benchmark'};
const variant=(id,row)=>({id,name:id,description:'Example scope',creators:['Example'],notes:[],
  assignment:'ID',sources:[source],work:[],
  implementations:[{framework:'Harbor',status:'no',evidence:[],
    assessment:{checked_at:'2026-10-15',reason:'Needs validation',sources:[source]}}],
  provenance:[{sheet:'Examples',gid:1,row,imported_at:'2026-10-15'}]});
const catalog=[{id:'example',name:'Example',description:'Example benchmark',creators:['Example'],
  notes:[],sources:[source],selected_variant:'current',variants:[variant('current',2),variant('historical',3)]},
  {id:'other',name:'Other',description:'Another benchmark',creators:['Example'],notes:[],sources:[source],variants:[variant('other-current',4)]}];
catalog[0].variants[1].work=['https://github.com/example/repo/pull/1'];
const inventory={records:[2,3,4].map(row=>({provenance:{gid:1,row}}))};
test('current catalog satisfies schema and source coverage rules',async()=>{
  const current=await loadCatalog();
  const imported=JSON.parse(await readFile(new URL('data/source-inventory.json',root)));
  assert.deepEqual(validateCatalog(current,imported),[]);
});
test('assignments remain editable',()=>{
  const updated=structuredClone(catalog);
  updated[0].variants[0].assignment='OOD';
  assert.deepEqual(validateCatalog(updated,inventory),[]);
});
test('new candidates can cite a direct source without inventing spreadsheet rows',()=>{
  const copy=structuredClone(catalog), variant=structuredClone(copy[0].variants[0]);
  variant.id='new-candidate';variant.assignment=null;
  variant.provenance=[{url:'https://example.org/benchmark',imported_at:'2026-10-14'}];
  copy[0].selected_variant=copy[0].variants[0].id;
  copy[0].variants.push(variant);
  assert.deepEqual(validateCatalog(copy,inventory),[]);
});
test('a merged work link cannot substitute for execution evidence',()=>{
  const copy=structuredClone(catalog), variant=copy[0].variants[0];
  variant.implementations[0]={framework:'Harbor',status:'yes',evidence:[]};
  variant.work=['https://github.com/example/repo/pull/1'];
  assert.ok(validateCatalog(copy).some(e=>e.includes('requires evidence')));
});
test('duplicates, malformed work URLs, unmapped rows, and script URLs fail validation',()=>{
  const copy=structuredClone(catalog);
  copy[0].variants[0].sources.push({label:'unsafe',url:'javascript:alert(1)'});
  copy[0].variants[0].work=['https://github.com/org/repo'];
  copy[1].id=copy[0].id;
  copy[1].variants[0].id=copy[0].variants[0].id;
  copy[0].variants[0].provenance=[];
  const errors=validateCatalog(copy,inventory).join('\n');
  for(const term of ['duplicate family','duplicate variant','malformed work','Unmapped source','invalid metadata'])assert.ok(errors.includes(term),term);
});

test('only the selected version supplies tracking state and work',()=>{
  const tracked=trackedCatalog(catalog);
  assert.equal(tracked.length,catalog.length);
  assert.ok(tracked.every(b=>b.variants.length===1));
  const family=catalog[0];
  assert.equal(selectedVersion(family).id,'current');
  assert.ok(!linkedWork(catalog).includes('https://github.com/example/repo/pull/1'));
  assert.equal(filterCatalog(tracked,'historical').length,0);
  const invalid=structuredClone(catalog);
  invalid[0].selected_variant='missing';
  assert.ok(validateCatalog(invalid).some(e=>e.includes('selected_variant')));
});

test('tracked statuses require sourced reasons and active work links',()=>{
  const copy=structuredClone(catalog), v=selectedVersion(copy[0]);
  v.implementations[0].status='unknown';
  assert.ok(validateCatalog(copy).some(e=>e.includes('actionable status')));
  v.implementations[0].status='blocked';
  delete v.implementations[0].assessment;
  assert.ok(validateCatalog(copy).some(e=>e.includes('sourced assessment')));
  const progress=structuredClone(catalog), active=selectedVersion(progress[0]);
  active.implementations[0].status='in_progress';
  active.work=[];
  assert.ok(validateCatalog(progress).some(e=>e.includes('in-progress work')));
});
