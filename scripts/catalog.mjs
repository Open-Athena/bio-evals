import {readdir, readFile} from 'node:fs/promises';
import {parse} from 'yaml';

export const root = new URL('../', import.meta.url);
export const workPattern = /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/(issues|pull)\/([1-9]\d*)$/;
export async function loadCatalog(directory = new URL('benchmarks/', root)) {
  const files = (await readdir(directory)).filter(f => f.endsWith('.yaml')).sort();
  return Promise.all(files.map(async file => {
    const data = parse(await readFile(new URL(file, directory), 'utf8'), {maxAliasCount: 0});
    if (data.id + '.yaml' !== file) throw new Error(`Filename must match family ID: ${file}`);
    return data;
  }));
}

export function validateCatalog(families, inventory) {
  const errors = [], familyIds = new Set(), variantIds = new Set(), rows = new Set();
  const check = (condition, message) => { if (!condition) errors.push(message); };
  const string = x => typeof x === 'string' && x.trim().length > 0;
  const strings = x => Array.isArray(x) && x.every(string);
  const url = x => { try { return ['https:', 'http:'].includes(new URL(x).protocol); } catch { return false; } };
  const id = x => typeof x === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(x);
  const sources = x => Array.isArray(x) && x.every(s => string(s.label) && url(s.url));
  check(Array.isArray(families) && families.length > 0, 'Catalog must not be empty');
  for (const f of families) {
    const label = f.id || '(unnamed family)';
    check(id(f.id) && !familyIds.has(f.id), `${label}: invalid or duplicate family ID`);
    familyIds.add(f.id);
    check(string(f.name) && string(f.description), `${label}: name and description required`);
    check(strings(f.creators) && sources(f.sources) && strings(f.notes), `${label}: invalid creators/sources/notes`);
    check(Array.isArray(f.variants) && f.variants.length, `${label}: variants required`);
    for (const v of f.variants || []) {
      const key = `${label}/${v.id}`;
      check(id(v.id) && !variantIds.has(v.id), `${key}: invalid or duplicate variant ID`);
      variantIds.add(v.id);
      check(string(v.name) && string(v.description), `${key}: name and scope required`);
      check(v.assignment === null || string(v.assignment), `${key}: invalid internal assignment`);
      check(strings(v.creators) && strings(v.notes) && sources(v.sources), `${key}: invalid metadata`);
      check(Array.isArray(v.work) && v.work.every(w => workPattern.test(w)), `${key}: malformed work URL`);
      check(new Set(v.work).size === v.work.length, `${key}: duplicate work links`);
      const frameworks = new Set();
      check(Array.isArray(v.implementations) && v.implementations.length, `${key}: implementation state required`);
      for (const implementation of v.implementations || []) {
        const {framework, status, evidence} = implementation;
        check(string(framework) && !frameworks.has(framework), `${key}: invalid or duplicate framework`);
        frameworks.add(framework);
        check(['yes', 'no', 'unknown'].includes(status), `${key}: invalid implementation status`);
        check(Array.isArray(evidence) && evidence.every(e => url(e.url) && string(e.scope) && /^\d{4}-\d{2}-\d{2}$/.test(e.checked_at)), `${key}: invalid evidence`);
        check(status !== 'yes' || evidence?.length > 0, `${key}: implemented=yes requires evidence and scope`);
      }
      check(Array.isArray(v.provenance) && v.provenance.length, `${key}: provenance required`);
      for (const p of v.provenance || []) {
        if(p.gid===undefined) {
          check(url(p.url) && /^\d{4}-\d{2}-\d{2}$/.test(p.imported_at), `${key}: source URL and date required for new entries`);
          continue;
        }
        const rowKey = `${p.gid}:${p.row}`;
        check(string(p.sheet) && Number.isInteger(p.gid) && Number.isInteger(p.row) && p.row >= 2 && /^\d{4}-\d{2}-\d{2}$/.test(p.imported_at), `${key}: invalid provenance`);
        check(!rows.has(rowKey), `${key}: source row mapped more than once`);
        rows.add(rowKey);
      }
    }
  }
  if (inventory) {
    const expected = new Set(inventory.records.map(r => `${r.provenance.gid}:${r.provenance.row}`));
    for (const key of expected) check(rows.has(key), `Unmapped source row: ${key}`);
    for (const key of rows) check(expected.has(key), `Unknown source row: ${key}`);
  }
  return errors;
}

export function linkedWork(families) {
  return [...new Set(families.flatMap(f => f.variants.flatMap(v => v.work)))].sort();
}
