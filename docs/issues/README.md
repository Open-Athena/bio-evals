# Explorer v1 issues

Filed October 14, 2026 as issues [#1](https://github.com/Open-Athena/bio-evals/issues/1),
[#2](https://github.com/Open-Athena/bio-evals/issues/2),
[#3](https://github.com/Open-Athena/bio-evals/issues/3), and
[#4](https://github.com/Open-Athena/bio-evals/issues/4). These local specifications
record the agreed scope; GitHub issues track the work.

The October 14, 2026 scope interview established a simple public explorer for
understanding biology evaluations and organizing implementation. Include both
agentic and non-agentic evaluations and candidates; inclusion is not a commitment
to implement. Group variants under families and track implementation separately.
Use Observable Framework for good visual defaults and deploy to GitHub Pages.

Implementation includes the reconciled catalog, renderer, GitHub sync, and Pages
workflow. See the root README for delivery status. The source spreadsheet is
unchanged. Adapters, execution, and graders remain in
their framework repositories, including Harbor and Evalchemy. BioTasks generation
research is outside this project.

| Issue specification | Deliverable | Dependencies |
| --- | --- | --- |
| [1. Catalog and import](01-catalog-import.md) | Minimal records, validation, reconciled spreadsheet import | None |
| [2. GitHub status](02-github-status.md) | Fetch linked issue/PR metadata into a timestamped snapshot | Record contract from 1 |
| [3. Explorer](03-explorer.md) | Observable overview and family pages | 1; snapshot contract from 2 |
| [4. Deployment](04-deployment.md) | Validation, daily refresh, and GitHub Pages | 1–3 |

Local specification numbers match GitHub issue numbers. The dependency order
does not authorize parallel agents or compute.

Each draft includes its relevant context and source links. Draft 1 contains the
field definitions and migration evidence; draft 3 records the interface choices;
draft 4 records the update and deployment workflow. Draft 1 consolidates schema
and migration so the first real records can inform the smallest useful structure.
Examples are optional for the first release. Model attempts, new evaluations,
result dashboards, and spreadsheet retirement are outside these four drafts.
