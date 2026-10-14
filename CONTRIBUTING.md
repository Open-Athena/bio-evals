# Updating the catalog

Edit a file in `benchmarks/`, or follow **Edit this entry** from a benchmark page.
Each YAML file represents one benchmark. Only one version is tracked; other
variant/protocol records are retained as historical context for the notes. Routine updates may go directly to `main`; larger code
changes may use a PR. GitHub Actions validates and deploys changes.

## Fields

- Benchmark: stable `id`, `name`, free-text `description` (what it measures),
  `creators`, `sources` (label and URL), `notes`, and `variants`.
- `selected_variant` identifies the sole tracked version when multiple records
  exist. A single-record benchmark selects that record automatically. Prefer
  verified end-to-end evidence, otherwise the main/original version; flag
  ambiguous choices in `notes`. Only the selected record supplies table status,
  filters, counters, and refreshed GitHub work. Other records are historical
  context, rendered in the notes without separate implementation tracking.
- Variant: stable `id`, `name`, `description`, `creators`, internal `assignment`,
  `sources`, `notes`, `work`, `implementations`, and `provenance`.
- Each implementation pairs a `framework` with `status`: `yes` (Implemented), `no` (To do),
  `in_progress`, or `blocked`. `evidence` is a list of URL, tested `scope`, and `checked_at` date.
  A yes requires end-to-end execution including grading. An adapter or merged
  PR is insufficient. Keep incomplete/modified protocol coverage explicit.
  Active records require `assessment` with `checked_at`, `reason`, and `sources`.
  In-progress records require an issue/PR in `work`; blocked records explain the
  concrete prerequisite and how to unblock it. To do includes validation of
  existing code, not only writing a new adapter. Historical unselected records
  may retain `unknown`, but it is not a permitted tracked status.
  Open port PRs remain in progress until the remaining integration work is done;
  pilot execution evidence can coexist with that stage. Maintenance issues do
  not erase a benchmark's established implementation.
- ID/OOD is the editable `assignment`. Use ID or OOD, or null when unknown. Existing TBD assignments were changed to ID on October 14, 2026.
  It is our internal assignment, not a contamination claim. Updating it does
  not require rewriting the historical import snapshot.
- `work` contains canonical public GitHub issue/PR URLs, for example
  `https://github.com/marin-community/harbor/pull/180`. No comment anchors or
  repository-only URLs. The daily refresh fetches state and assignees from
  these links; leave the list empty when there is no linked work.
- Source dates live in `provenance`. Imported notes are historical evidence,
  not a claim of current access or validation. Refresh them as evidence arrives.

The schema intentionally has no domain taxonomy, benchmark owner field, or
result scores. Creators may differ between original releases and subset
curators. A family grouping does not imply interchangeable questions or scores.

## Import and reconciliation

`data/source-inventory.json` is the selected-field projection of the complete
October 14, 2026 read of both spreadsheet tabs. It retains source descriptions,
assignments, source URLs, caveats, and historical readiness for provenance.
It is not a second live catalog. `data/import-map.json` maps every source row to
its family and variant. `benchmarks/` is the editable source of truth.

The initial grouping rationale is in [import notes](docs/import.md). Keep source
row references when reorganizing imported entries. Do not infer current state
from the sheet's old support/readiness columns. Run `scripts/import.mjs` only in
an empty `benchmarks/` directory; it refuses to overwrite edited records.

For a new entry with no spreadsheet row, use provenance containing a source
`url`, `imported_at` date (YYYY-MM-DD), and optional `evidence_date`. Do not
invent a spreadsheet row or modify the frozen import snapshot. The validator
checks that all original rows remain accounted for while allowing new entries.

## Development

Use Node.js 22 or later:

```sh
npm ci
npm run validate
npm test
npm run build
npm run dev
```

`npm run build` generates benchmark Markdown pages and browser JSON from the YAML,
then compiles Observable Framework. Generated `src/benchmarks/`, `src/data/`,
`src/github-status.json`, and `dist/` are ignored; do not edit them.

To refresh status locally with your existing GitHub CLI login:

```sh
node scripts/github.mjs --gh
```

In Actions, `npm run refresh` uses the provided `GITHUB_TOKEN`. No token is
published. Only explicitly linked public work is fetched, using single-item
endpoints; there are no repository-wide listings or pagination to traverse.
Partial fetch failures preserve verified-public last-known items and their
original timestamps. A completely unusable refresh fails without replacing the
previous deployment. The successful snapshot is cached between Actions runs.

On the shared exe.dev VM, use the required resource guard for tests, installs,
builds, and browser checks. Supply a realistic peak working-set estimate no
larger than 500 MiB. It acquires the nonblocking shared lock, checks node load
and memory, limits threads, lowers priority, monitors the worker, and records
timing/peak RSS under ignored `artifacts/local-checks/`.

```sh
python scripts/local-check.py --estimate-mib 180 -- node --test --test-concurrency=1
```

The initial direct Observable build measured about 440 MiB; npm wrapper
processes pushed a build over the limit. To build locally, generate the small
inputs with `node scripts/generate.mjs`, then run the direct CLI under the guard:

```sh
python scripts/local-check.py --estimate-mib 450 -- node node_modules/@observablehq/framework/dist/bin/observable.js build
python scripts/local-check.py --estimate-mib 450 -- node scripts/browser-check.mjs
```

Browser checks use the existing Chromium executable. Set `CHROMIUM_PATH` if it
is not `/home/exedev/.local/bin/chromium`. No browser download is required on the
VM. Tests capture desktop/mobile screenshots under `artifacts/browser/` and
stop the local server and browser on completion.

Use GitHub Actions for builds that exceed the local memory limit. Do not run
benchmark evaluations, download benchmark datasets, or start paid compute to
build this website.

## Deployment and refresh

`.github/workflows/pages.yml` runs on main pushes, daily at 10:23 UTC, and manual
dispatch. Use **Actions → Validate and deploy catalog → Run workflow** to
refresh manually. Scheduled runs may be delayed by GitHub. PRs validate and
build against the saved snapshot without deployment or GitHub credentials.

The workflow deploys the static output to GitHub Pages and serializes production
runs. Invalid records or a failed build retain the previous deployed site. The
spreadsheet remains unchanged; its retirement is a separate reviewed cutover.
