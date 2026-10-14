// One-time, non-destructive conversion of the inspected spreadsheet projection.
import {mkdir, readdir, readFile, writeFile} from 'node:fs/promises';
import {stringify} from 'yaml';
import {root, validateCatalog} from './catalog.mjs';

const directory = new URL('benchmarks/', root);
await mkdir(directory, {recursive:true});
if ((await readdir(directory)).length) throw new Error('Refusing to overwrite edited catalog records. Import into an empty benchmarks directory.');
const source = JSON.parse(await readFile(new URL('data/source-inventory.json', root)));
const summaries = {
  bixbench: 'Biological data analysis, from notebook questions and a curated verified subset to research-scale workflows.',
  'lab-bench': 'Life-science research skills: protocol reasoning, sequences, cloning, literature retrieval, and interpretation of figures and tables.',
  scbench: 'Single-cell analysis tasks, including workflow snapshots and longer research workflows.',
  spatialbench: 'Spatial transcriptomics analysis and study-scale biological inference.',
  genebench: 'Quantitative genomics, statistical modeling, and biological judgment across original and Pro releases.',
  txbench: 'Assay-grounded decisions in preclinical pharmacology, antibody discovery, and oligonucleotide discovery.',
  biosecbench: 'Defensive biological analysis and refusal assessment, with distinct surveillance, functional-interpretation, and decision protocols.',
  bioasq: 'Biomedical literature question answering, from retrieval to supplied-evidence answers and synthesis.',
  bioprobench: 'Biological protocol understanding, error detection, step ordering, generation, and reasoning conditions.',
  mmlu: 'Biology and biomedical multiple-choice knowledge and reasoning, including original and Pro question sets.',
  gpqa: 'Graduate-level biology reasoning across overlapping Diamond, Main, and Extended subsets.',
  microvqa: 'Microscopy-based scientific reasoning, with an announced extension whose independent test protocol remains unverified.',
  mmmu: 'Multimodal academic biology and basic medical science questions, including original and Pro variants.',
  sciknoweval: 'Biology knowledge and reasoning across closed-choice and open-ended task families.',
  'terminal-bench-science': 'Executable scientific workflows in life sciences, with a separately listed upcoming lite release.'
};
const known = {
  'bixbench-v1-5-harbor-cli': {
    url:'https://github.com/marin-community/marin/issues/9258#issuecomment-5744365667',
    scope:'Harbor CLI v1.5: end-to-end execution and grading demonstrated in the 205-question run. Partial grading coverage and modified judge protocol remain caveats.',
    work:['https://github.com/marin-community/harbor/pull/174','https://github.com/marin-community/harbor/issues/166']
  },
  'bixbench-verified-50-harbor-cli': {
    url:'https://github.com/marin-community/harbor/pull/180#issuecomment-5766684283',
    scope:'Verified-50 v1.0: end-to-end execution and saved-answer grading demonstrated with decimal-precision-v1. Known source defects and ungraded outcomes remain.',
    work:['https://github.com/marin-community/harbor/pull/180','https://github.com/marin-community/harbor/issues/177','https://github.com/marin-community/harbor/issues/192']
  },
  'mmlu-biology-biomedical-subjects': {
    partial:true,
    url:'https://github.com/marin-community/marin/issues/9258',
    scope:'Evalchemy biology subset: 554 questions executed and graded. This evidence does not establish coverage of every biomedical subject listed in the source row.',
    work:[]
  }
};
const groups = new Map();
for (const row of source.records) {
  if (!groups.has(row.family_id)) groups.set(row.family_id, {
    id:row.family_id, name:row.family_name, description:summaries[row.family_id] || row.description,
    creators:row.creators, sources:row.sources.filter(s=>s.label==='Benchmark'), notes:[], variants:[]
  });
  const family = groups.get(row.family_id);
  const verified = known[row.variant_id];
  const notes = [...row.notes];
  if (!verified) notes.push('Gap: end-to-end implementation has not been verified for this catalog. Imported readiness notes are historical.');
  if (verified?.partial) notes.push('Gap: end-to-end evidence covers the 554-question biology subset, not all biomedical subjects named in this entry.');
  if (row.family_id==='bixbench') notes.push('ID/OOD retains the spreadsheet assignment. The tracking issue described assignments as unresolved; the catalog uses the internal sheet assignment as requested.');
  if (row.family_id==='genebench' && row.name==='GeneBench-Pro') {
    const index=notes.findIndex(n=>n.startsWith('Limitations:'));
    notes[index]='Limitations: the public package is a ten-case subset of the full 129-task suite; do not equate public-subset coverage with full-suite implementation.';
  }
  family.variants.push({id:row.variant_id, name:row.name, description:row.description,
    creators:row.creators, assignment:row.assignment || null, sources:row.sources,
    implementations:[{framework:row.framework, status:verified && !verified.partial?'yes':'unknown',
      evidence:verified?[{url:verified.url,scope:verified.scope,checked_at:'2026-10-14'}]:[]}],
    work:[...new Set([...row.work, ...(verified?.work || [])])], notes,
    provenance:[row.provenance]});
}
const families = [...groups.values()].sort((a,b)=>a.name.localeCompare(b.name));
for (const family of families) {
  if (family.id==='lab-bench') {
    const original=family.variants.find(v=>v.name==='LAB-Bench — tool-free text MCQ');
    family.creators=original.creators; family.sources=original.sources.filter(s=>s.label==='Benchmark');
  }
  if (family.variants.length>1) family.notes.push('Family grouping is for navigation; variants may have different creators, datasets, grading protocols, and internal assignments.');
}
const errors=validateCatalog(families,source);
if(errors.length)throw new Error(errors.join('\n'));
for (const family of families) await writeFile(new URL(`${family.id}.yaml`,directory), stringify(family,{lineWidth:100,aliasDuplicateObjects:false}));
const mapping=source.records.map(r=>({sheet:r.provenance.sheet,row:r.provenance.row,gid:r.provenance.gid,source_name:r.name,family_id:r.family_id,variant_id:r.variant_id}));
await writeFile(new URL('data/import-map.json',root),JSON.stringify(mapping,null,2)+'\n');
console.log(`Imported ${mapping.length} source rows into ${families.length} families.`);
