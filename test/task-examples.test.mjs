import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {loadCatalog} from '../scripts/catalog.mjs';
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
  for(const b of ['mmlu','bixbench','scicode','scienceagentbench'])assert.ok(examples.get(b).examples.length);
  const changed=structuredClone(catalog);changed.find(b=>b.id==='scicode').variants[0].id='changed';
  await assert.rejects(loadExamples(changed),/tracked version/);
});
test('visual task inputs are frozen local assets with verified hashes',async()=>{
  for(const benchmark of ['microvqa','mmmu','bioreasonbench']) {
    const c=JSON.parse(await readFile(new URL(`../data/task-examples/${benchmark}.json`,import.meta.url)));
    for(const e of c.examples)for(const img of e.images) {
      assert.ok(!img.url.includes('Expires='));
      const bytes=await readFile(new URL(`../src/${img.url.slice(3)}`,import.meta.url));
      assert.equal(createHash('sha256').update(bytes).digest('hex'),img.sha256);
      assert.match(renderExample(e),/data-task-image=/);
    }
  }
});
test('partial examples retain essential context and separate source answers',async()=>{
  const get=async b=>JSON.parse(await readFile(new URL(`../data/task-examples/${b}.json`,import.meta.url))).examples[0];
  assert.deepEqual((await get('genomeqa')).choices,['No','Yes']);
  assert.match((await get('core-bench')).prompt,/Report Institutions Sampled/);
  const heureka=await get('sc-heurekabench');
  assert.ok(!heureka.prompt.includes('Answer1'));
  assert.equal(heureka.reference,'A');
  const gym=await get('scigym');
  assert.ok(!gym.prompt.includes('Thoughts'));
  assert.match(gym.code,/<sbml/);
});
test('source Markdown cannot inject HTML or script links; answers stay collapsed',()=>{
  const rendered=renderExample({id:'test',title:'<img onerror=alert(1)>',kind:'test',prompt:'<script>alert(1)</script>\n\n[bad](javascript:alert(1))',inputs:[],output:'text',grading:'text',reference:'<svg onload=alert(1)>',source:'https://example.org',source_label:'source',revision:'abc'});
  assert.ok(!rendered.includes('<script>'));
  assert.ok(!rendered.includes('href="javascript:'));
  assert.ok(!rendered.includes('<svg'));
  assert.match(rendered,/<details><summary>Reveal reference answer<\/summary>/);
});

test('reviewed previews preserve question, task scope, output contract and provenance',async()=>{
  const get=async b=>JSON.parse(await readFile(new URL(`../data/task-examples/${b}.json`,import.meta.url))).examples[0];
  const sci=await get('scieval');
  assert.ok(sci.prompt.length>1000);
  assert.equal(sci.choices.length,4);
  assert.equal(sci.reference,'D');
  const blurb=await get('blurb');
  assert.match(blurb.prompt,/copper toxicosis/);
  assert.match(blurb.kind,/entity/i);
  assert.match((await get('scienceqa')).source_label,/test/);
  assert.match((await get('promptbio-bench')).output,/sequence.fasta/);
  assert.match((await get('promptbio-bench')).output,/>reverse_complement/);
  assert.equal((await get('sciknoweval')).reference,'B');
  assert.equal((await get('epibench')).input_tree.split('\n').length,48);
});
