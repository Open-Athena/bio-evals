# Define the minimal catalog and import both spreadsheet tabs

The inventory is split between agentic and non-agentic spreadsheet tabs, with
more columns than the explorer needs. Create structured records for every
evaluation, grouped into deduplicated families with distinct variants, so the
site can explain evaluations and track implementation without editing HTML.

This catalog belongs in the public Open-Athena/bio-evals repository. Inclusion
means an evaluation is worth cataloging, not that implementation is committed.
Adapters, execution, and graders remain in the evaluation framework repositories.
Track whether a variant works end to end in its framework; a separate "ready in
Marin" milestone and intermediate adapter stages are outside v1.

## Fields

Use stable family and variant IDs internally. The schema is still to be
implemented; these are the agreed fields and their proposed placement.

| Level | Field | Meaning |
| --- | --- | --- |
| Family | Name | Canonical benchmark family name |
| Family | What it measures | Free text cleaned up from existing scientific scope |
| Family | Creator organization(s) | Preserve multiple creators and distinguish curators |
| Family | Source links | Official benchmark, paper, data, and scorer links where available |
| Variant | Name / scope | Version, subset, or protocol distinction |
| Variant | ID/OOD | Editable internal assignment; retain current values, including TBD |
| Variant | Framework | Current or intended evaluation framework; unknown allowed |
| Variant/framework | Implemented | Yes / no / unknown; yes requires evidence and tested scope |
| Variant | Issues and PRs | Explicit links to work in the owning repositories |
| Either | Notes / gaps | Missing information, caveats, and unresolved source conflicts |

## Scope

- Read the full populated inventory of both Agentic (Harbor) and Non-agentic
  (Evalchemy), including source links. The planning read covered only A1:AD4.
- Use one editable YAML record per family as the proposed storage convention,
  with stable family/variant IDs and a short contributor guide.
- Associate status with the variant/framework pair if a variant has multiple
  implementations. Keep fetched GitHub metadata separate from edited records.
- Allow variant attribution, source, and description overrides. Preserve
  original creators separately from subset curators where the source does.
- Preserve spreadsheet ID/OOD assignments verbatim, including TBD or unresolved
  values. These are editable internal assignments, not contamination claims.
  Do not infer an assignment from creator, framework, or benchmark name.
- Require an evidence link and tested scope for implemented=yes, reflecting
  a successful end-to-end smoke test including grading. Do not infer yes from
  adapter existence or a merged PR, and do not create an intermediate stage.
- Clean up existing descriptions; flag absent, ambiguous, or conflicting
  information. Researching every evaluation and running smoke tests are
  outside this import task.
- Retain source tab/row, import date, and source evidence date internally.
  Exclude dedicated scores, budgets, runtime, feasibility, popularity, and
  selection-rationale fields. Preserve material caveats in notes.
- Keep an explicit mapping from each source row to its family/variant record.
  Merge duplicate entries without losing distinct subsets or protocols.
- Import concrete issue/PR links where present. Generic repository links and
  old owner/work-status text are not current issue metadata or commitments.

## Acceptance criteria

- Every populated evaluation row in both tabs is accounted for in the mapping;
  duplicate merges and unresolved grouping decisions are explained.
- Candidates remain visible without linked work or an implementation commitment.
- BixBench and Verified-50 appear under one family with distinct variant
  statuses and creator/curator attribution.
- Validation catches duplicate IDs, malformed records and work links, invalid
  internal references, and implemented=yes records without supporting evidence.
  Incomplete records are permitted with explicit gaps.
- Focused checks cover deduplication/variant preservation, unknown states, and
  implementation evidence requirements.
- The spreadsheet is unchanged; no evaluations or model calls are launched.

## Sources and inspection boundary

[Biology evals spreadsheet](https://docs.google.com/spreadsheets/d/13wfLWv0dHw57_0_yf1p2h9u5z8yojaYM7I9BLFVhd3k/edit):

- Agentic (Harbor), gid 846608904.
- Non-agentic (Evalchemy), gid 776831399.

The October 14, 2026 planning read confirmed both tabs and inspected A1:AD4 of
each. Both have benchmark/protocol, creators, ID/OOD, scientific scope, work
notes, evidence dates, and source/integration links. Sampled assignments include
ID, OOD, and TBD. BixBench and Verified-50 name different creators/subset curators.
This is not a complete inventory or verification of current implementation.

[Marin tracking issue #9258](https://github.com/marin-community/marin/issues/9258)
and its linked issues/PRs provide implementation evidence and work coordination.
Check relevant evidence before marking implemented; preserve unknowns and
conflicts when the available sources do not establish successful validation.
