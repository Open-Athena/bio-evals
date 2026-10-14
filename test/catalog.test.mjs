import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {loadCatalog,root,validateCatalog} from '../scripts/catalog.mjs';

const catalog=await loadCatalog();
const inventory=JSON.parse(await readFile(new URL('data/source-inventory.json',root)));
test('full source coverage preserves distinct protocols and editable assignments',()=>{
  assert.deepEqual(validateCatalog(catalog,inventory),[]);
  assert.equal(inventory.records.length,120);
  const variants=catalog.flatMap(f=>f.variants);
  for(const row of inventory.records){
    const variant=variants.find(v=>v.provenance.some(p=>p.gid===row.provenance.gid&&p.row===row.provenance.row));
    assert.ok(variant,row.name);
  }
  const bix=catalog.find(f=>f.id==='bixbench');
  assert.ok(bix.variants.length>=4);
  assert.ok(bix.variants.find(v=>v.name.includes('Verified-50')).creators.some(c=>c.includes('Phylo')));
  assert.ok(catalog.find(f=>f.id==='bioasq').variants.length>=4);
  const updated=structuredClone(catalog);
  updated[0].variants[0].assignment='OOD';
  assert.deepEqual(validateCatalog(updated,inventory),[]);
});
test('new candidates can cite a direct source without inventing spreadsheet rows',()=>{
  const copy=structuredClone(catalog), variant=structuredClone(copy[0].variants[0]);
  variant.id='new-candidate';variant.assignment=null;
  variant.provenance=[{url:'https://example.org/benchmark',imported_at:'2026-10-14'}];
  copy[0].variants.push(variant);
  assert.deepEqual(validateCatalog(copy,inventory),[]);
});
test('a merged work link cannot substitute for execution evidence',()=>{
  const copy=structuredClone(catalog), variant=copy[0].variants[0];
  variant.implementations[0]={framework:'Harbor',status:'yes',evidence:[]};
  variant.work=['https://github.com/marin-community/harbor/pull/180'];
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
