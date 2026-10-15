# Curated task examples

Every catalog benchmark has an example collection or a documented availability gap.
As of 2026-10-15: 79 have inline previews (89 tasks total), four link to published
examples/templates, and 12 have a documented access or extraction gap. See
[COVERAGE.md](COVERAGE.md) for the complete inventory and remaining work.

These are curated presentation samples, not random samples, model attempts, or
performance estimates. A preview may be a full question, task context, an excerpt,
or a prompt template. The selection note identifies these distinctions. Agent
previews generally require external inputs and environments that are not bundled.
Source-specific paths are preserved, not executed. Reference answers stay collapsed.
Source grading summaries describe the benchmark protocol; they do not indicate that
we ran the grader on the preview.

Each JSON file is the editable source for its benchmark page, with tracked version,
creator attribution, source revision, selection scope, and check date. GitHub/raw
file sources are pinned where available. Hugging Face viewer samples are frozen in
the JSON: their separately checked dataset revisions are linked, and `retrieval`
explicitly records that the viewer request itself was not revision-pinned. Do not
present the live viewer link as an immutable copy. `source_record_sha256`, where
present, hashes the selected source record, not a downloaded archive. The original
five imports retain their byte-level receipts in `source-receipts.json`.

The expanded import was curated by source format: JSON/JSONL/CSV question fields,
Python AST literals (BioEval; no execution), Word XML task paragraphs (BioLLMBench),
Excel cell values (Biology-Instructions), and original archive records (SciFact).
Only the initial prompt and model input are extracted from SciGym's public
trajectory; solver thoughts and outputs are excluded. ScienceQA explanatory answers,
SciCUEval full-paper contexts, and unrelated records are not bundled. Public canary
markers are preserved in source JSON and must not be removed for training use.

Image inputs for MicroVQA, MMMU, and BioReasonBench are stored under
`src/assets/task-examples/`; image source URLs and byte hashes are recorded alongside
them. Observable FileAttachment copies and fingerprints them for deployment, so
previews do not depend on temporary signed URLs. Figure credit remains in the
collection and source links. License descriptions apply only where confirmed;
“See source terms” is not a claim of an open license. Underlying documents, figures,
software, and datasets may have separate terms.

To add or refresh a preview, inspect the official source, select a suitable task
from the tracked version, preserve question/choice order, keep references separate,
and update its provenance and availability. Do not turn a task description into a
made-up prompt or treat an unavailable input as absent from the native task.
Run `npm test` and `npm run build` using the local resource guard. Browser checks
exercise multiple-choice, code, images, long sequences, templates, and gap notices.

The original five collections can be refreshed with
`uv run --no-project --with pyarrow python scripts/import-task-examples.py` under
the local resource guard. This importer does not refresh the later curated entries.

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
