# Build the biology evaluation explorer with Observable Framework

Create a simple, visually coherent catalog that explains what evaluations
measure and shows implementation work. Use Observable's visual defaults so
the first release requires little custom design or deployment infrastructure.

The public Open-Athena/bio-evals catalog covers both agentic and non-agentic
evaluations, including candidates with no implementation commitment. The primary
goals are understanding what evaluations measure and coordinating their ports.
Model results are served by Marin evaldash; this site does not need a results
dashboard. Benchmark descriptions use free text rather than required biological
domain or capability categories. Concrete task examples are optional for v1.

## Scope

- Build a searchable overview with one family grouping and visible variants.
  Show name, what it measures, creator organization(s), internal ID/OOD,
  framework, implementation, and linked work without requiring a taxonomy.
- Provide stable family pages with variant sections, source links, notes/gaps,
  validation evidence, and linked issues/PRs with fetched state and assignees.
- Use built-in themes, layouts, tables, and inputs where appropriate. A useful
  interactive overview is sufficient; elaborate charts are not required.
- Search names, descriptions, organizations, and notes. Allow simple filtering
  by framework and implementation state where useful.
- Distinguish family count from variant count in any summary. Grouping must
  not hide different implementation states or internal assignments.
- Label ID/OOD as an evolving internal assignment. Render unknown values and
  documentation gaps explicitly. Do not present candidates as committed work.
- Display GitHub snapshot freshness and unavailable/stale item states. Keep
  source links usable when a status fetch fails.
- Include "Edit this entry" links to source records on main.
- Link to Marin evaldash if a relevant verified URL is available. Task examples
  are optional; model attempts and result displays are deferred.

## Acceptance criteria

- Browser checks demonstrate text search, filters, family navigation, variant
  distinctions, and source/edit links using representative imported records.
- Long descriptions, multiple creators, unknown implementation, missing work
  links, and failed status fetches remain readable on desktop and narrow screens.
- Controls work with a keyboard and state is not conveyed by color alone.
- Site builds from small catalog/snapshot inputs without evaluation execution,
  dataset downloads, or visitor-side GitHub API requests.

Dependencies: catalog from draft 1 and snapshot contract from draft 2.

## Design references

- [Observable Framework](https://observablehq.github.io/framework/) was selected
  for visual defaults and deployment simplicity. Keep custom UI code modest.
- [Tim O'Donnell's earlier explorer](https://gist.github.com/timodonnell/2b4a637d32945ff12ed0432f6e907c9a)
  is a reference for comparison tables and benchmark cards. Its claims and
  reuse terms have not been independently audited for this project. Check
  provenance and reuse terms before importing its content or code.
