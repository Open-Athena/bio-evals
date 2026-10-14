# About this catalog

This public catalog helps us understand biology evaluations and organize implementation and porting. It includes agentic and non-agentic evaluations, including candidates we have not committed to implementing.

## Reading the catalog

- **Benchmarks:** each benchmark tracks one selected version. Prefer a version with verified implementation evidence, otherwise the main/original version. Ambiguous selections are flagged for review. Other releases, subsets, and protocols are described in notes; their results are not interchangeable.
- **What it measures:** a free-text description imported and cleaned up from our existing inventory, with version-specific descriptions on benchmark pages.
- **ID/OOD:** an evolving internal assignment inherited from the spreadsheet. Previously TBD assignments were changed to ID on October 14, 2026; unassigned values stay explicit. It is not a verified claim about contamination or a model's training data.
- **Implementation:** tracked for the selected version and framework. Implemented requires evidence of end-to-end execution including grading for the stated scope. A merged PR alone is insufficient. **In progress** means active implementation work remains (for example, an open port PR), even when a pilot has graded results. **To do** includes porting or validation of an existing integration. **Blocked** means a specific access, release, or other prerequisite prevents completion. Each status has dated sources and a reason. Open maintenance issues do not automatically downgrade an implemented benchmark.
- **Linked work:** issue and PR state and assignees are fetched from GitHub daily and on catalog changes. These are work-item assignments, not automatically benchmark owners. Links remain the source of current status.

## Sources and coverage

The initial import on October 14, 2026 read both populated tabs of the [biology evaluation spreadsheet](https://docs.google.com/spreadsheets/d/13wfLWv0dHw57_0_yf1p2h9u5z8yojaYM7I9BLFVhd3k/edit): 48 agentic entries and 72 non-agentic entries. All 120 source rows are mapped to 94 benchmarks, with 120 original variant/protocol records retained for provenance. These are inventory counts, not counts of validated or independent question banks.

Source evidence dates are retained per entry. Imported access and grading notes are historical and may need refreshing. The October 14 implementation audit checked the Harbor and Evalchemy forks, the pinned lm-eval inventory, open issues/PRs, and linked execution/release evidence. Missing integrations are scoped to those revisions; this is not a claim that no external implementation exists. No new benchmark evaluations were run. See the [audit method and findings](https://github.com/Open-Athena/bio-evals/blob/main/docs/implementation-audit.md). Benchmark pages flag gaps and link supporting evidence.

## Contributing

Use **Edit this entry** on a benchmark page to edit its YAML record on GitHub. Routine changes can go to main; larger renderer changes may use PRs. See the [contributor guide](https://github.com/Open-Athena/bio-evals/blob/main/CONTRIBUTING.md) for fields and validation.

Adapters, execution, and graders belong in their framework repositories, such as Harbor and Evalchemy. Model attempts and result displays are deferred. Results remain in Marin evaldash; this explorer focuses on understanding evaluations and coordinating work. The source spreadsheet remains unchanged until a separate cutover is agreed.

[Return to the catalog](./)
