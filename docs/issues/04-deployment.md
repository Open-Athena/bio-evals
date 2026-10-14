# Validate, refresh daily, and deploy the explorer to GitHub Pages

Make catalog edits and linked GitHub work visible through an automated static
deployment, with a daily status refresh and a manual refresh option.

Source lives in the public Open-Athena/bio-evals repository, with main as the
authoritative branch. Contributors edit structured records rather than generated
HTML. Routine updates may be direct commits without mandatory PR approval;
larger renderer changes may use PRs. GitHub Pages has not yet been enabled and
there is no deployed site from this project.

## Scope

- Add a GitHub Actions workflow that validates records, fetches GitHub status,
  builds Observable Framework, and deploys to GitHub Pages on pushes to main,
  a daily schedule, and manual workflow_dispatch.
- Run validation and build checks for PRs without deploying them. Use fixtures
  or a retained snapshot so untrusted PR builds do not require secrets.
- Pin dependencies with a lockfile. Use the repository Pages base path so
  family navigation and assets work beneath /bio-evals/.
- Use least-required workflow permissions. Keep GitHub credentials in Actions,
  never in generated HTML/JSON or checked-in files.
- Serialize deployments so an older run cannot overwrite newer content.
- Keep the prior deployed site when validation/build fails. Apply draft 2's
  partial-refresh policy and display actual successful-fetch timestamps.
- Document local preview/build, source editing, adding work links, and manual
  refresh. Daily refresh is approximate, not a real-time status guarantee.
- Follow the VM's shared-node resource rules for local builds and checks. Use
  small static inputs; builds must not download benchmark datasets or execute
  evaluations.
- Check repository/organization settings for the intended direct-main workflow.
  Report inherited restrictions rather than changing organization policy.

## Acceptance criteria

- A representative source edit passes validation and produces a deployed page.
- The workflow declares daily and manual triggers; a manual run verifies the
  refresh-and-deploy path and displayed timestamp.
- Verify the actual Pages URL, nested page navigation, assets, and edit links.
- A failed validation does not replace the working deployment.
- No model calls, benchmark execution, backend service, or visitor GitHub
  credentials are required.
- The spreadsheet is unchanged. Its retirement is a separate cutover action
  after catalog coverage and the deployed replacement have been reviewed.

Dependencies: drafts 1–3. Reference:
[Observable deployment guide](https://observablehq.github.io/framework/deploying).
