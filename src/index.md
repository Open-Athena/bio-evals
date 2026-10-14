---
title: Biology evaluations
---

# Biology evaluations

What the evaluations measure, and where implementation stands. Explore benchmarks and follow the work across repositories.

```js
import {filterCatalog, catalogTable, trackedCatalog} from './components/catalog.js';
const catalog = trackedCatalog(await FileAttachment('./data/catalog.json').json());
const snapshot = await FileAttachment('./data/github-status.json').json();
const variants = catalog.flatMap(f => f.variants);
```

<div class="summary">
  <div class="card"><strong>${catalog.length}</strong>benchmarks</div>
  <div class="card"><strong>${variants.filter(v => v.implementations.some(i => i.status === 'yes')).length}</strong>implemented</div>
  <div class="card"><strong>${new Set(variants.flatMap(v => v.work)).size}</strong>linked issues & PRs</div>
</div>

```js
const filters = view(Inputs.form({
  query: Inputs.text({label: 'Search evaluations', placeholder: 'Name, what it measures, organization…', width: 320}),
  framework: Inputs.select(['All frameworks', ...new Set(variants.flatMap(v => v.implementations.map(i => i.framework)))], {label: 'Framework', width: 220}),
  implementation: Inputs.select(new Map([['All states','All states'],['Implemented','yes'],['In progress','in_progress'],['To do','no'],['Blocked','blocked']]), {label: 'Implementation', width: 220})
}, {template: inputs => html`<div class="filters">${Object.values(inputs)}</div>`}));
```

```js
const filtered = filterCatalog(catalog, filters.query || '', filters.framework, filters.implementation);
```

```js
display(catalogTable(filtered, snapshot, Inputs));
```

<p class="muted">GitHub last successfully fetched: ${snapshot.last_successful_fetch_at ? new Date(snapshot.last_successful_fetch_at).toLocaleString() : 'not yet fetched'}. ${snapshot.complete ? '' : 'Some statuses are unavailable or stale; follow the links for current work.'} Refreshes daily and on catalog updates.</p>

**Implemented** means end-to-end execution including grading has been demonstrated for the stated scope. **In progress** has active implementation work. **To do** means porting or validation remains. **Blocked** has a documented prerequisite. Open a benchmark for evidence, caveats, and source dates.

[About this catalog](./about) · [Edit or add an evaluation](https://github.com/Open-Athena/bio-evals/tree/main/benchmarks) · [Project issues](https://github.com/Open-Athena/bio-evals/issues)
