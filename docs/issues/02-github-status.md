# Refresh linked GitHub issue and PR status into a static snapshot

Work happens in multiple repositories. Fetch metadata for explicitly linked
issues and PRs so the explorer shows current work without maintaining duplicate
owner and status fields in the catalog.

The public Open-Athena/bio-evals site is a catalog and coordination view; work
remains in its owning repository. Refresh metadata once daily, on catalog
deployments, and on manual dispatch through GitHub Actions. A static snapshot
keeps deployment simple and avoids visitor-side API rate limits or a separate
API service. The deployment workflow is covered by draft 4.

## Scope

- Consume public GitHub issue/PR URLs from catalog records, including links to
  Harbor, Evalchemy, Marin, and bio-evals work where applicable.
- Deduplicate requests and fetch titles, canonical URLs, state, assignees, and
  update timestamps. Distinguish draft/open/merged/closed-unmerged PRs.
- Write a small generated JSON snapshot with successful fetch timestamps and
  explicit errors for unavailable records. Keep it separate from authored data.
- Use GitHub Actions authentication at runtime; never put credentials in output.
  Visitors read the snapshot, with no browser-side GitHub API dependency.
- Handle pagination and API limits with bounded requests and useful errors.
  Fetch only linked work, not entire repositories.
- Show issue state and assignees in their issue context. Do not infer benchmark
  implementation from issue closure or merge, and do not invent a single owner
  when several linked items have different assignees.
- Present issue titles and links as the work summary. Do not automatically
  interpret arbitrary comment prose as a blocker or next action.
- Missing links mean no linked work. Failed fetches mean status unavailable,
  not closed or complete.
- On a refresh failure, preserve prior successful data where available and
  mark its original timestamp/staleness. If no valid snapshot can be produced,
  fail the update and retain the previously deployed site.

## Acceptance criteria

- A fixture containing linked items from multiple repositories renders issue
  and PR states, including merged versus closed-unmerged, accurately.
- Focused tests cover duplicate links, pagination, missing/inaccessible items,
  rate limiting, partial failure, and preservation of last-success timestamps.
- Refresh never edits catalog implementation or ID/OOD assignments.
- Output contains no credential or private-repository content.

Dependency: catalog record contract from draft 1. Scheduling is in draft 4.

Existing coordination reference:
[Marin tracking issue #9258](https://github.com/marin-community/marin/issues/9258).
Use concrete linked issues/PRs for each variant; do not assign the umbrella
issue's owner or state to every benchmark.
