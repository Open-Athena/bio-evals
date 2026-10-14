import {readFile} from 'node:fs/promises';
import {loadCatalog, root, validateCatalog} from './catalog.mjs';
const catalog = await loadCatalog();
const inventory = JSON.parse(await readFile(new URL('data/source-inventory.json', root)));
const errors = validateCatalog(catalog, inventory);
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Validated ${catalog.length} families, ${catalog.reduce((n,f)=>n+f.variants.length,0)} variants and ${inventory.records.length} source rows.`);
