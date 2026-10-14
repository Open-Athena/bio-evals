---
title: Biology evaluations
---

# Biology evaluations

What the evaluations measure, and where implementation stands. Explore benchmark families, compare variants, and follow the work across repositories.

```js
import {filterCatalog, familyLink, variantCell, workCell} from './components/catalog.js';
const catalog = await FileAttachment('./data/catalog.json').json();
const snapshot = await FileAttachment('./data/github-status.json').json();
const variants = catalog.flatMap(f => f.variants);
```

<div class="summary">
  <div class="card"><strong>${catalog.length}</strong>benchmark families</div>
  <div class="card"><strong>${variants.length}</strong>variants / protocols</div>
  <div class="card"><strong>${variants.filter(v => v.implementations.some(i => i.status === 'yes')).length}</strong>with end-to-end evidence</div>
  <div class="card"><strong>${Object.keys(snapshot.items).length}</strong>linked issues & PRs</div>
</div>

```js
const query = view(Inputs.text({label: 'Search evaluations', placeholder: 'Name, what it measures, organization…', width: 440}));
```

```js
const framework = view(Inputs.select(['All frameworks', ...new Set(variants.flatMap(v => v.implementations.map(i => i.framework)))], {label: 'Framework'}));
```

```js
const implementation = view(Inputs.select(new Map([['All states','All states'],['Implemented','yes'],['Not implemented','no'],['Unknown','unknown']]), {label: 'Implementation'}));
```

```js
const filtered = filterCatalog(catalog, query || '', framework, implementation);
```

<p class="muted">Families: ${filtered.length} · Variants: ${filtered.reduce((n,f) => n + f.variants.length, 0)}. ID/OOD is our editable internal assignment. Inclusion is not a commitment to implement.</p>

```js
const table = Inputs.table(filtered.map(f => ({...f, work:f})), {
  columns: ['name','description','creators','variants','work'],
  header: {name:'Benchmark family',description:'What it measures',creators:'Creator organization(s)',variants:'Variants · ID/OOD · implementation',work:'Linked work'},
  format: {
    name: (_,i) => familyLink(filtered[i]),
    creators: creators => creators.join('; '),
    variants: (_,i) => variantCell(filtered[i]),
    work: (_,i) => workCell(filtered[i],snapshot)
  },
  width: {name:160,description:280,creators:170,variants:350,work:230},
  rows:15, maxHeight:1100, select:false, sort:'name'
});
const container = document.createElement('div');
container.className = 'catalog-table';
container.append(table);
display(container);
```

<p class="muted">GitHub last successfully fetched: ${snapshot.last_successful_fetch_at ? new Date(snapshot.last_successful_fetch_at).toLocaleString() : 'not yet fetched'}. ${snapshot.complete ? '' : 'Some statuses are unavailable or stale; follow the links for current work.'} Refreshes daily and on catalog updates.</p>

**Implemented** means end-to-end execution including grading has been demonstrated for the stated scope. Unknown means we have not verified it here; it does not mean an adapter is absent. Open a family for evidence, caveats, and source dates.

[About this catalog](./about) · [Edit or add an evaluation](https://github.com/Open-Athena/bio-evals/tree/main/benchmarks) · [Project issues](https://github.com/Open-Athena/bio-evals/issues)
