# Biology evaluations

A public catalog of biology evaluations: what they measure, benchmark variants,
implementation status, and linked GitHub issues and PRs.

**[Open the explorer](https://openathena.ai/bio-evals/)**

The catalog contains 94 benchmark families and 120 variant/protocol entries,
imported from both spreadsheet tabs. It uses Observable Framework with a
searchable overview, family pages, and daily GitHub issue/PR status snapshots.

[Project issues and scope](docs/issues/README.md) ·
[Contributing](CONTRIBUTING.md) · [Import reconciliation](docs/import.md)

Edit YAML records in `benchmarks/` and commit to main. GitHub Actions validates
the records, runs focused tests and browser checks, and deploys to GitHub Pages.
Linked GitHub status refreshes daily and on catalog deployments, with a manual
refresh option. The explorer is deployed at the link above.

Evaluation adapters remain in their framework repositories. Model attempts
and result displays are deferred; the explorer focuses on understanding
evaluations and coordinating implementation.
