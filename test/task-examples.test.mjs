import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {loadCatalog} from '../scripts/catalog.mjs';
import {selectedVersion} from '../src/components/catalog.js';
import {loadExamples,renderExample} from '../scripts/task-examples.mjs';
test('every benchmark has sourced examples or an explicit availability gap',async()=>{
  const catalog=await loadCatalog(), examples=await loadExamples(catalog);
  assert.equal(examples.size,catalog.length);
  for(const c of examples.values()) {
    if(!c.examples.length) {
      assert.ok(['external','unavailable'].includes(c.availability.status));
      assert.ok(c.availability.reason.length>30);
      assert.ok(c.availability.sources.every(s=>s.url.startsWith('https://')));
    }
    assert.ok(c.examples.every(e=>e.html.includes('Source revision:')));
  }
  const changed=structuredClone(catalog);
  selectedVersion(changed[0]).id='changed-version';
  await assert.rejects(loadExamples(changed),/tracked version/);
});
test('visual task inputs are bundled assets with verified hashes',async()=>{
  const examples=await loadExamples(await loadCatalog());
  for(const benchmark of examples.keys()) {
    const c=JSON.parse(await readFile(new URL(`../data/task-examples/${benchmark}.json`,import.meta.url)));
    for(const e of c.examples)for(const img of e.images||[]) {
      const bytes=await readFile(new URL(`../src/${img.url.slice(3)}`,import.meta.url));
      assert.equal(createHash('sha256').update(bytes).digest('hex'),img.sha256);
      assert.match(renderExample(e),/data-task-image=/);
    }
  }
});
test('source Markdown cannot inject HTML or script links; answers stay collapsed',()=>{
  const rendered=renderExample({id:'test',title:'<img onerror=alert(1)>',kind:'test',prompt:'<script>alert(1)</script>\n\n[bad](javascript:alert(1))',inputs:[],output:'text',grading:'text',reference:'<svg onload=alert(1)>',source:'https://example.org',source_label:'source',revision:'abc'});
  assert.ok(!rendered.includes('<script>'));
  assert.ok(!rendered.includes('href="javascript:'));
  assert.ok(!rendered.includes('<svg'));
  assert.match(rendered,/<details><summary>Reveal reference answer<\/summary>/);
});

test('example rendering preserves choices, output, code and provenance',()=>{
  const html=renderExample({id:'fixture',title:'Example',kind:'test',prompt:'Choose a result',
    choices:['First option','Second option'],code:'print(1)',code_language:'python',
    inputs:[],output:'Write result.json',grading:'Exact match',reference:'First option',
    source:'https://example.org/task',source_label:'Example source',revision:'fixture-revision'});
  for(const text of ['First option','Second option','Write result.json','Exact match','fixture-revision'])assert.ok(html.includes(text));
  assert.match(html,/language-python/);
  assert.match(html,/<ol type="A"/);
});
