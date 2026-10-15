import {readdir, readFile} from 'node:fs/promises';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import {selectedVersion} from '../src/components/catalog.js';
const h=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const md=new MarkdownIt({html:false, linkify:false, highlight:(code,lang)=>lang && hljs.getLanguage(lang)?hljs.highlight(code,{language:lang}).value:''});
const link=(label,url)=>{
  if(!/^https:\/\//.test(url))throw new Error('Example source must use HTTPS');
  return `<a href="${h(url)}">${h(label)}</a>`;
};
const code=(value,lang='text')=>`<pre><code class="language-${h(lang)}">${hljs.getLanguage(lang)?hljs.highlight(String(value),{language:lang}).value:h(value)}</code></pre>`;
const details=(title,body)=>`<details><summary>${h(title)}</summary>${body}</details>`;
export function renderExample(e) {
  let body=`<header><span class="badge">${h(e.kind)}</span><h3>${h(e.title)}</h3><small class="muted">Task ${h(e.id)}</small></header>`;
  if(e.scope)body+=`<p class="task-scope muted">${h(e.scope)}</p>`;
  body+='<div class="task-layout"><section class="task-prompt"><h4>Task</h4>'+md.render(e.prompt);
  for(const img of e.images||[]) {
    if(!/^\.\.\/assets\/task-examples\/[a-z0-9-]+\.(png|jpg|webp)$/.test(img.url))throw new Error('Task images must be bundled assets');
    body+=`<figure><a data-task-image-link="${h(img.url)}"><img data-task-image="${h(img.url)}" alt="${h(img.caption)}" loading="lazy"></a><figcaption>${h(img.caption)} · Open image for full resolution</figcaption></figure>`;
  }
  if(e.choices)body+=`<ol type="A" class="task-choices">${e.choices.map(c=>`<li>${h(c)}</li>`).join('')}</ol>`;
  if(e.code)body+='<h4>Code / dependencies</h4>'+code(e.code,e.code_language);
  if(e.context)body+=details('Domain context',md.render(e.context));
  if(e.steps)body+=details(`Subproblems (${e.steps.length})`,e.steps.map(s=>`<h4>${h(s.title)}</h4>${md.render(s.prompt)}${code(s.code,'python')}`).join(''));
  if(e.runner_instructions)body+=details('Full runner instructions',md.render(e.runner_instructions));
  body+='</section><aside class="task-context"><h4>Inputs</h4>';
  body+=e.inputs.length?`<ul>${e.inputs.map(i=>`<li>${i.url?link(i.name,i.url):`<code>${h(i.name)}</code>`}<p>${h(i.description)}</p></li>`).join('')}</ul>`:'<p>No separate input files listed in this preview.</p>';
  if(e.input_tree)body+=details('Input file tree',code(e.input_tree));
  body+='<h4>Expected output</h4>'+(e.output_language?code(e.output,e.output_language):md.render(e.output))+'<h4>How it is graded</h4>'+md.render(e.grading);
  if(e.grading_details)body+=details('Grading details',md.render(e.grading_details));
  if(e.reference!==undefined)body+=details('Reveal reference answer',code(e.reference,e.reference_language));
  else if(e.reference_note)body+=`<p class="muted">${h(e.reference_note)}</p>`;
  body+='</aside></div>';
  body+=`<footer class="task-source">${link(e.source_label,e.source)}${(e.extra_sources||[]).map(s=>' · '+link(s.label,s.url)).join('')}<br>Source revision: <code>${h(e.revision)}</code></footer>`;
  return body;
}
export async function loadExamples(catalog) {
  const dir=new URL('../data/task-examples/',import.meta.url), collections=new Map();
  for(const file of (await readdir(dir)).filter(f=>f.endsWith('.json')&&f!=='source-receipts.json')) {
    const c=JSON.parse(await readFile(new URL(file,dir),'utf8'));
    const b=catalog.find(b=>b.id===c.benchmark);
    if(!b || selectedVersion(b).id!==c.version)throw new Error(`Examples do not match tracked version: ${file}`);
    if(!c.examples.length && (!c.availability?.reason || !c.availability?.sources?.length))throw new Error(`Missing example or availability evidence: ${file}`);
    if(!c.examples.length && !['external','unavailable'].includes(c.availability.status))throw new Error(`Invalid availability status: ${file}`);
    if(new Set(c.examples.map(e=>e.id)).size!==c.examples.length)throw new Error(`Duplicate examples: ${file}`);
    if(!c.attribution || !c.license || !c.checked_at || !c.selection)throw new Error(`Missing provenance: ${file}`);
    for(const s of c.availability?.sources||[])link(s.label,s.url);
    for(const e of c.examples)if(!e.prompt || !e.source || !e.revision)throw new Error(`Missing source/prompt: ${file}`);
    if(collections.has(c.benchmark))throw new Error(`Duplicate benchmark collection: ${file}`);
    const rendered=c.examples.map(e=>({id:e.id,title:e.title,html:renderExample(e)}));
    const assets=[...new Set(c.examples.flatMap(e=>(e.images||[]).map(i=>i.url)))];
    for(const path of assets)await readFile(new URL(`../src/${path.slice(3)}`,import.meta.url));
    collections.set(c.benchmark,{...c,assets,examples:rendered});
  }
  for(const b of catalog)if(selectedVersion(b).implementations.some(i=>i.status==='yes')&&!collections.get(b.id)?.examples.length)throw new Error(`Implemented benchmark needs examples: ${b.id}`);
  for(const b of catalog)if(!collections.has(b.id))throw new Error(`Benchmark needs an example or a documented gap: ${b.id}`);
  return collections;
}
