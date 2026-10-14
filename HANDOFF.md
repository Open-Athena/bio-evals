# Agentic biology evaluation explorer handoff

Recorded October 14, 2026.

## Objective and agreed decisions

Build a public HTML explorer that lets the team inspect biology evaluations,
understand actual tasks, see implementation progress, and follow model results.

- Scope v1 to agentic biology evaluations. Non-agentic Evalchemy benchmarks are
  outside the initial scope.
- Keep source in the dedicated public `Open-Athena/bio-evals` repository.
- Use `main` as the authoritative source. Routine updates should allow direct
  commits without mandatory PR approval. Larger renderer changes may use PRs.
- Store catalog entries as structured records and generate HTML from them.
  Contributors should not need to edit rendered HTML to update an entry.
- Use GitHub Actions to validate and build on pushes to `main`, then deploy to
  GitHub Pages. Add an “Edit this entry” link to each benchmark page.
- Replace the Google Sheet after importing and checking its agentic inventory.
  Preserve the sheet as an archived snapshot with a pointer to the explorer.
- The user confirmed that this work is public.

## Current state and scope of this handoff

The public repository has been created and cloned beside the Marin checkout.
This initial documentation commit contains only README.md and HANDOFF.md.
No catalog entries, examples, renderer, validator, or Actions workflow have been
implemented. GitHub Pages has not been enabled, and there is no deployed site.
The Google Sheet has not been changed or deprecated.

Creation of the repository, its clone, and this handoff were requested. The
explorer and deployment are the agreed direction for subsequent implementation.
No model evaluations or paid compute are part of this setup.

## Sources inspected during planning

### Biology evaluation tracking issue

[Marin #9258: Track biology evals](https://github.com/marin-community/marin/issues/9258)
tracks benchmark selection, integration, protocols, baseline results, and
unresolved grading issues. Read its current body and relevant comments when
importing results; the observations below are a planning snapshot.

The issue records BixBench v1.5 at 101 correct / 187 graded / 205 attempted,
Verified-50 with Terminus-2 at 42 / 49 / 50 after saved-answer regrading, and
Verified-50 with Pi at 39 / 46 / 50. These are separate protocols, with different
budgets and grading histories. Preserve their provenance and ungraded outcomes.
Do not present them as a controlled harness comparison.

### Existing inventory

[Biology evals spreadsheet, Agentic (Harbor) tab](https://docs.google.com/spreadsheets/d/13wfLWv0dHw57_0_yf1p2h9u5z8yojaYM7I9BLFVhd3k/edit?gid=846608904#gid=846608904)

The tab includes benchmark/protocol, creator, ID/OOD designation, feasibility,
Harbor support, readiness, owner, next action/blocker, scientific scope, token
budget, runtime, network requirements, grading and access, selection rationale,
evidence date, and source/integration links.

Import only the agentic tab initially. Read the full populated range during
migration; the planning inspection was bounded and was not a complete inventory
reconciliation. Some entries have September evidence dates. For example, the
Verified-50 row records the Terminus-2 result while the tracking issue also
records the later Pi run. Reconcile source conflicts explicitly. Do not infer
current readiness or ownership from old notes, and do not carry ID/OOD labels
forward without preserving their definition and supporting evidence.

### Tim O'Donnell's earlier explorer

[Source gist](https://gist.github.com/timodonnell/2b4a637d32945ff12ed0432f6e907c9a)

[Rendered HTML preview](https://htmlpreview.github.io/?https://gist.githubusercontent.com/timodonnell/2b4a637d32945ff12ed0432f6e907c9a/raw/e3fafd93244b922d91c2c2eb745b1004830e2534/biology-llm-benchmarks.html)

The gist was created July 30, 2026. Its HTML source was inspected during planning.
It contains a comparison table, capability groups, benchmark cards, expandable
example questions and answers, data/code links, and reported model performance.
Use its concrete examples and card structure as design references. The document
flags some reported scores as requiring primary-source verification; its claims
and examples have not been independently audited for this project. Check source
provenance and reuse terms before importing example text or code.

## Proposed interface

- Catalog: search and filters for capability, implementation stage, work status,
  owner, and availability of results. Show the next action or blocker and a last
  verified date.
- Benchmark detail: scientific purpose, actual task examples, input files or
  previews, expected outputs, grading explanation, access, and known limitations.
- Results: model/checkpoint, harness, protocol, score, grading coverage, runtime,
  evidence links, and model answers or artifacts when available.
- Work queue: planned, active, blocked, or paused work, with owner and issue/PR.

Keep examples prominent. Two or three sourced examples per benchmark are a useful
initial target, where redistribution is permitted. Link to existing artifacts
instead of copying large datasets or trajectories into this repository.

## Proposed data model

The file format and exact schema remain to be implemented. A possible layout is:

```text
benchmarks/         # One YAML file per benchmark or explicit variant
examples/           # Sourced examples linked by stable benchmark ID
runs/               # Small result summaries linked by benchmark and protocol ID
explorer/           # Renderer, styles, and build script
.github/workflows/  # Validation, build, and Pages deployment
```

Track these dimensions separately:

1. Implementation: discovered, porting, implemented, validated.
2. Work: planned, active, blocked, paused; owner and next action.
3. Run: not run, running, completed, partial, failed; attempted, graded, correct,
   and ungraded counts as applicable.

An existing adapter does not establish end-to-end validation. A failed or partial
run does not erase a benchmark's implementation status. Missing results must
remain missing, not become zero scores.

Use stable IDs and source links. Each result should identify the benchmark
revision and subset, model/checkpoint, harness/version, grading protocol,
budgets, date, metric definition and aggregation, coverage, and evidence.
Separate paper-reported scores from team measurements. Preserve original grades
and regrades as separate records. Label public subsets and modified protocols.
A completed smoke test must not be displayed as a full benchmark score.

## Implementation sequence

1. Refresh the issue and spreadsheet evidence. Inventory the full agentic tab
   and decide how benchmark families, variants, and protocols receive stable IDs.
2. Define the smallest schema that supports the catalog, examples, and results.
   Import entries with source dates and explicit unknowns.
3. Build the static explorer. Start detailed pages with BixBench and
   BixBench-Verified-50, which have documented team results; keep other imported
   entries visible even if examples or results are still missing.
4. Add validation for malformed records, duplicate IDs, broken internal
   references, missing provenance, and inconsistent result counts. Check search,
   filters, example expansion, and navigation in a browser.
5. Add a GitHub Actions build and Pages deployment. Verify repository and
   organization settings permit the intended direct-update workflow; report any
   inherited restriction rather than silently changing organization policy.
   Verify a deployed URL before advertising it as live.
6. After coverage and deployment are verified, archive the sheet with a link to
   the replacement. Avoid maintaining two independent editable catalogs.

## Ownership boundaries

- This repository: evaluation catalog, examples, status, and result summaries.
- Harbor: benchmark adapters, task packaging, execution, and graders.
- Marin issue #9258 and linked issues/PRs: existing evaluation evidence and work
  coordination. Link to these records rather than duplicating their full history.
- BioTasks: task-generation research; outside the initial explorer scope.

## Local continuation

The clone is a sibling of the Marin checkout used for setup. Open the `bio-evals`
directory as the working repository for subsequent changes. The parent Marin
checkout is not the source repository for this site.

Follow the VM's shared-node resource rules for local builds or tests. Start with
small static inputs; building the explorer should not require running evaluations
or downloading benchmark datasets.
