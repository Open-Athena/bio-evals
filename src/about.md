# About this catalog

This public catalog helps us understand biology evaluations and organize implementation and porting. It includes agentic and non-agentic evaluations, including candidates we have not committed to implementing.

## Reading the catalog

- **Families and variants:** related releases, subsets, and protocols are grouped for navigation. Grouping does not make their questions, graders, creators, or results interchangeable.
- **What it measures:** a free-text description imported and cleaned up from our existing inventory, with variant-specific descriptions on family pages.
- **ID/OOD:** an evolving internal assignment inherited from the spreadsheet. TBD and unassigned values stay explicit. It is not a verified claim about contamination or a model's training data.
- **Implementation:** tracked per variant and framework. Implemented requires evidence of end-to-end execution including grading for the stated scope. A merged PR alone is insufficient. Unknown means the evidence has not been established here.
- **Linked work:** issue and PR state and assignees are fetched from GitHub daily and on catalog changes. These are work-item assignments, not automatically benchmark owners. Links remain the source of current status.

## Sources and coverage

The initial import on October 14, 2026 read both populated tabs of the [biology evaluation spreadsheet](https://docs.google.com/spreadsheets/d/13wfLWv0dHw57_0_yf1p2h9u5z8yojaYM7I9BLFVhd3k/edit): 48 agentic entries and 72 non-agentic entries. All 120 source rows are mapped to 94 families and 120 variant/protocol records. These are inventory counts, not counts of validated or independent question banks.

Source evidence dates are retained per entry. Imported access and grading notes are historical and may need refreshing. The current import cleans up existing information; it is not a fresh audit of every benchmark. Family pages flag gaps and link supporting evidence.

## Contributing

Use **Edit this entry** on a family page to edit its YAML record on GitHub. Routine changes can go to main; larger renderer changes may use PRs. See the [contributor guide](https://github.com/Open-Athena/bio-evals/blob/main/CONTRIBUTING.md) for fields and validation.

Adapters, execution, and graders belong in their framework repositories, such as Harbor and Evalchemy. Model attempts and result displays are deferred. Results remain in Marin evaldash; this explorer focuses on understanding evaluations and coordinating work. The source spreadsheet remains unchanged until a separate cutover is agreed.

[Return to the catalog](./)
