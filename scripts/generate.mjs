import {loadExamples} from './task-examples.mjs';
import {selectedVersion,implementationLabel} from '../src/components/catalog.js';
import {mkdir, readFile, writeFile, rm} from 'node:fs/promises';
import {loadCatalog, root, validateCatalog} from './catalog.mjs';

export const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const h=escapeHtml;
const anchor=(label,url)=>`<a href="${h(url)}">${h(label)}</a>`;
const list=items=>`<ul>${items.map(i=>`<li>${i}</li>`).join('')}</ul>`;

const families=await loadCatalog();
const errors=validateCatalog(families);
if(errors.length)throw new Error(errors.join('\n'));
const examples=await loadExamples(families);
for(const b of families)b.example_count=examples.get(b.id)?.examples.length || 0;
const snapshot=JSON.parse(await readFile(new URL('data/github-status.json',root)));
const directory=new URL('src/benchmarks/',root);
// Only generated pages live here; source records are in benchmarks/.
await rm(directory,{recursive:true,force:true});
await mkdir(directory,{recursive:true});
await mkdir(new URL('src/data/',root),{recursive:true});
await writeFile(new URL('src/data/catalog.json',root),JSON.stringify(families));
await writeFile(new URL('src/data/github-status.json',root),JSON.stringify(snapshot));
await writeFile(new URL('src/github-status.json',root),JSON.stringify(snapshot));

function workHtml(url) {
  const item=snapshot.items[url];
  if(!item?.fetched_at)return `${anchor(url,url)} — status unavailable`;
  const assignees=item.assignees.length?item.assignees.map(a=>'@'+a).join(', '):'Unassigned';
  return `${anchor(item.title,url)} <span class="badge ${h(item.state)}">${h(item.state)}</span> · ${h(assignees)} <small class="muted">${item.stale?'Stale · ':''}fetched ${h(item.fetched_at)}</small>`;
}
for(const family of families){
  const edit=`https://github.com/Open-Athena/bio-evals/edit/main/benchmarks/${family.id}.yaml`;
  let page=`---\ntitle: ${JSON.stringify(family.name)}\n---\n\n[← All evaluations](../)\n\n`;
  page+=`<h1>${h(family.name)}</h1>\n\n<p>${h(family.description)}</p>\n\n`;
  page+=`<div class="family-meta"><span>${h(family.creators.join('; ') || 'Creator not recorded')}</span>${anchor('Edit this entry ↗',edit)}</div>\n\n`;
  page+=`<p>${family.sources.map(s=>anchor(s.label,s.url)).join(' · ')}</p>\n\n`;
  if(examples.has(family.id)) {
    await writeFile(new URL(`src/data/examples-${family.id}.json`,root),JSON.stringify(examples.get(family.id)));
    page+=`

\`\`\`js
import {taskExamples} from '../components/task-examples.js';
const examples = await FileAttachment('../data/examples-${family.id}.json').json();
display(taskExamples(examples, Inputs));
\`\`\`

`;
  }
  if(family.notes.length)page+=`<div class="muted">${list(family.notes.map(h))}</div>\n\n`;
  for(const variant of [selectedVersion(family)]){
    page+=`<section class="variant-detail" id="${h(variant.id)}">\n<h2>${h(variant.name)}</h2>\n<p>${h(variant.description)}</p>\n`;
    page+=`<p><strong>Creator / curator:</strong> ${h(variant.creators.join('; ') || 'Not recorded')}<br><strong>Internal ID/OOD:</strong> ${h(variant.assignment || 'Unassigned')}</p>\n`;
    for(const impl of variant.implementations){
      const label=implementationLabel(impl.status);
      page+=`<p><strong>${h(impl.framework)}:</strong> <span class="badge ${h(impl.status)}">${label}</span></p>\n`;
      if(impl.assessment)page+=`<p>${h(impl.assessment.reason)}</p><p class="muted">Checked ${h(impl.assessment.checked_at)} · ${impl.assessment.sources.map(s=>anchor(s.label,s.url)).join(' · ')}</p>\n`;
      if(impl.evidence.length)page+=list(impl.evidence.map(e=>`${anchor('Execution and grading evidence',e.url)} — ${h(e.scope)} <span class="muted">Checked ${h(e.checked_at)}.</span>`))+'\n';
    }
    page+=`<h3>Linked work</h3>\n${variant.work.length?list(variant.work.map(workHtml)):'<p class="muted">No linked work. Catalog inclusion does not imply an implementation commitment.</p>'}\n`;
    page+=`<h3>Sources</h3>\n${list(variant.sources.map(s=>anchor(s.label,s.url)))}\n`;
    page+=`<details><summary>Notes and gaps (${variant.notes.length})</summary>${list(variant.notes.map(h))}</details>\n`;
    page+=`<p class="provenance">${variant.provenance.map(p=>`${p.gid===undefined?anchor('Source',p.url):anchor(`${p.sheet}, row ${p.row}`,`https://docs.google.com/spreadsheets/d/13wfLWv0dHw57_0_yf1p2h9u5z8yojaYM7I9BLFVhd3k/edit#gid=${p.gid}&range=A${p.row}`)} · source evidence date ${h(p.evidence_date || 'not recorded')} · imported ${h(p.imported_at)}`).join('<br>')}</p>\n</section>\n\n`;
  }
  const alternatives=family.variants.filter(v=>v.id!==selectedVersion(family).id);
  if(alternatives.length) {
    page+='<section class="variant-notes"><h2>Notes on other variants</h2><p>These versions are documented for context; only the version above is tracked.</p>\n';
    for(const v of alternatives) {
      page+=`<details id="${h(v.id)}"><summary>${h(v.name)}</summary><p>${h(v.description)}</p><p>Creator / curator: ${h(v.creators.join('; '))}</p>${list(v.notes.map(h))}<p>${v.sources.map(s=>anchor(s.label,s.url)).join(' · ')}</p></details>\n`;
    }
    page+='</section>\n\n';
  }
  page+='[About the fields and implementation criteria](../about)\n';
  await writeFile(new URL(`${family.id}.md`,directory),page);
}
console.log(`Generated ${families.length} benchmark pages and catalog data.`);
