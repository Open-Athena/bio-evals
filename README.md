# Biology evaluations

A public catalog of agentic biology evaluations: task examples, implementation
status, owners, blockers, and model results.

The repository currently contains the [implementation handoff](HANDOFF.md).
The explorer, catalog import, and GitHub Pages deployment are not implemented yet.

The intended workflow is to edit structured source records, commit directly to
`main`, and have GitHub Actions validate the records and deploy the generated
HTML to GitHub Pages. Larger code changes may use pull requests.

Evaluation adapters remain in Harbor. This repository will hold catalog metadata,
selected examples, and result summaries with links to their evidence.
