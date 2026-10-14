import test from 'node:test';
import assert from 'node:assert/strict';
import {loadCatalog} from '../scripts/catalog.mjs';
import {loadExamples,renderExample} from '../scripts/task-examples.mjs';
test('examples cover every implemented benchmark and match the selected version',async()=>{
  const catalog=await loadCatalog(), examples=await loadExamples(catalog);
  assert.equal(examples.size,5);
  assert.equal([...examples.values()].reduce((n,c)=>n+c.examples.length,0),15);
  const changed=structuredClone(catalog);changed.find(b=>b.id==='scicode').variants[0].id='changed';
  await assert.rejects(loadExamples(changed),/tracked version/);
});
test('source Markdown cannot inject HTML or script links; answers stay collapsed',()=>{
  const rendered=renderExample({id:'test',title:'<img onerror=alert(1)>',kind:'test',prompt:'<script>alert(1)</script>\n\n[bad](javascript:alert(1))',inputs:[],output:'text',grading:'text',reference:'<svg onload=alert(1)>',source:'https://example.org',source_label:'source',revision:'abc'});
  assert.ok(!rendered.includes('<script>'));
  assert.ok(!rendered.includes('href="javascript:'));
  assert.ok(!rendered.includes('<svg'));
  assert.match(rendered,/<details><summary>Reveal reference answer<\/summary>/);
});
