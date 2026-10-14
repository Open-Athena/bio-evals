# Curated task examples

Three public examples each for MMLU, BixBench, SciCode, ScienceAgentBench, and
GeneBench-Pro. These are presentation samples, not a random sample, model
attempts, or performance estimates. Each collection names its selection rule,
tracked version, attribution and license. Each task links a pinned source.
`source-receipts.json` records downloaded metadata URLs, byte sizes and SHA-256.
Input archives, model calls and benchmark execution are not part of this import.

Refresh with `uv run --no-project --with pyarrow python scripts/import-task-examples.py`
under the repository's local resource guard. The importer fetches only bounded
public metadata from pinned revisions. Generated HTML is produced at site build
time with raw HTML disabled and code highlighted. No remote task code is executed.

MMLU: MIT, see licenses/MMLU-MIT.txt. SciCode and BixBench: Apache-2.0,
see licenses/Apache-2.0.txt. GeneBench-Pro: MIT, see licenses/GeneBench-MIT.txt.
ScienceAgentBench selected annotations: CC-BY-4.0
(https://creativecommons.org/licenses/by/4.0/); OSU NLP Group and authors,
with underlying scientific software credited in each example. Original text
is preserved; presentation adds labels, extracted fields and grading summaries.
Full source references and creator attribution are retained in each JSON file.

The ScienceAgentBench annotations are from the original CSV rather than the
later verified split. SciCode source prompts are not the complete Harbor runner
prompt. MMLU examples omit five-shot demonstrations. These distinctions are
visible in the previews. External gold artifacts and unpublished SciCode solutions
are not bundled or invented.
