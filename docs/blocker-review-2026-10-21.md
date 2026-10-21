# Benchmark blocker review — October 21, 2026

The catalog now records **22 Blocked, 64 To do, 8 Implemented and 1 In progress**
among 95 selected benchmark versions. This pass adds four blockers after the
BioinformaticsBench correction: BABE, Bio-benchmark, LifeSciBench and BioThreat-Eval.
The editable YAML records remain the source of truth; the October 14 import and
implementation-audit snapshots remain historical.

## Scope and evidence boundary

Screened the access/grading notes and assessments for all 95 selected versions,
then followed up release-discovery gaps, missing labels/scorers, example-only
releases and ambiguous data coverage using primary papers, author repositories,
dataset cards, release inventories and author-linked portals. Public task-example
source links helped recover releases missing from the older assessments.

This is a targeted source review, not a fresh execution audit of all 95 sources.
Unchanged entries retain their earlier assessment dates. No benchmark solver,
judge, native evaluator, gated-access request or hosted submission was run.
Large input/reproduction archives were not downloaded or unpacked. Small public
JSON files were inspected where needed to check labels and release coverage.

Blocked means a required prerequisite for evaluating the selected scope is
currently missing or its access remains unverified after checking the sources.
It does not assert that all unlocated data are private. An unimplemented adapter,
untested staging instructions or the need to write answer extraction is To do
when the necessary public data and reference contract are available. A gate
already accessed successfully does not by itself erase existing implementation
evidence. Historical, unselected variants do not set the current status.

## Additional blockers

| Benchmark | Evidence and missing prerequisite | Unblock condition |
| --- | --- | --- |
| [BABE](../benchmarks/babe-biology-arena-benchmark.yaml) | The [paper](https://arxiv.org/html/2602.05857v1) publishes visual examples and methodology. A complete author-linked task/figure/reference/grading deposit was not located after paper and repository/dataset searches. | Verify a complete release or authorized evaluation package for the question triplets. |
| [Bio-benchmark](../benchmarks/bio-benchmark.yaml) | The [paper](https://arxiv.org/html/2503.04013v1) describes source datasets, 30 tasks, templates and BioFinder. Exact evaluation instances/splits and the consolidated extraction/scoring package remain unlocated. Underlying public source datasets are not proof of the exact evaluated release. | Verify the consolidated release or authorized access, then pin the biology protocol and metrics. |
| [LifeSciBench](../benchmarks/lifescibench.yaml) | Public [author page](https://openai.com/index/introducing-life-sci-bench/) and [paper](https://cdn.openai.com/pdf/b4299379-0a97-4ffa-8b9b-c3fbb299caa9/lifescibench_preprint.pdf#page=16); full tasks, artifacts and rubrics not located. Appendix A.5 describes possible release restrictions. | Verify full task/artifact/rubric access or an authorized evaluation service. |
| [BioThreat-Eval](../benchmarks/biothreat-eval.yaml) | The [author policy](https://github.com/jang1563/biothreat-eval/blob/243ba9793af0a10dae942610807e392998e3232f/RESPONSIBLE_DISCLOSURE.md) withholds the curated 93-query bank and requires a justified access request. The [HF card](https://huggingface.co/datasets/jang1563/biothreat-eval) explicitly contains aggregate results only. The runner falls back to six illustrative examples. | Confirm authorized access to the curated bank. Six-example runs cannot substitute for its results. |

BioinformaticsBench remains Blocked for the full 602-question scope; its author
repository contains one example. Each new blocker has an October 21 assessment,
primary source links and an explicit reopening condition in its YAML entry.

## Releases and scope checks that remain To do

| Benchmark | Verified source evidence | Remaining boundary |
| --- | --- | --- |
| [GenomeQA](../benchmarks/genomeqa.yaml) | [Author release](https://github.com/ai4nucleome/GenomeQA/tree/7ccc230e734fc11a365fd1963b593b5fd11e834d) includes binary/MCQ data across six families and accuracy/F1 code. | Port and validate its protocol; source inspection is not graded execution. |
| [BioLLMBench](../benchmarks/biollmbench.yaml) | [Author release](https://github.com/Mangul-Lab-USC/BioLLMBench/tree/6b7e685c7bb88919ba5c1686f6b4f72977c74892) contains task/response documents, reference materials, scoring CSVs and analysis notebooks. | Several categories use expert grading. A reproducible workflow for new responses still needs implementation and validation; no additional access restriction was established. |
| [ScienceArena](../benchmarks/sciencearena.yaml) | The author demo's linked public manifest identifies the [code repository](https://github.com/stallone0000/Science-Arena-code/tree/da6c14d7922edbfea2c72bad1d0c020b7b215b0d) and [release](https://github.com/stallone0000/Science-Arena-code/releases/tag/cr-final-2026-08-31). Release metadata lists archived IBO data/code/results and checksums. | Stage and inspect archives before execution. Biology uses objective-key scoring; physics/chemistry rubric judging is a different protocol. |
| [LiveProteinBench](../benchmarks/liveproteinbench.yaml) | All 12 public task JSONs contain choices and nonempty `Answer` fields for all 1,797 records at the [checked revision](https://github.com/Rongdingyi/LiveProteinBench/tree/8b9710932511f816651fc1a7e8a1bc85c3c77767). | Text-only extraction/scoring needs implementation. Referenced image files and PDB inputs are absent from that tree, so multimodal asset availability remains unresolved. |
| [SC-Arena](../benchmarks/sc-arena.yaml) | [Released data](https://github.com/SUAT-AIRI/SC-Arena/tree/f4480a220fa4872c4c747f52f8fc784401c592fc/data) contain 608 cell profiles, 138 perturbation cases and 254 QA pairs nested under 100 articles, matching paper Table 2. Evaluators and knowledge resources are present. | Native scoring, judge setup and the documented prompt-filename fix remain unvalidated. |
| [BioXArena](../benchmarks/bioxarena.yaml) | The [current author README](https://github.com/mbzuai-ai4bio/BioXArena/blob/ab2c691fd5bade09af336fcf39779c5ad4b77417/README.md) documents official CodaBench scoring while withholding test labels. | Competition access and supported task-level score readback for Harbor remain unverified. Browser/HTTP failures are insufficient evidence that scoring is unavailable. |
| [sc-HeurekaBench](../benchmarks/sc-heurekabench.yaml) | [Author instructions](https://github.com/mlbio-epfl/HeurekaBench/blob/c2a2b2fcdc5244220ff60f65483bc084c72a8cf1/README.md) link questions/answers, evaluator, and [HF input archive](https://huggingface.co/datasets/sibasmarakp/sc-HeurekaBench/tree/main). | Archive extraction (~44 GB per authors) requires appropriately sized compute. The HF viewer error does not establish missing archive files. |
| [Liu et al. single-cell benchmark](../benchmarks/liu-et-al-single-cell-agent-benchmark.yaml) | [Author README](https://github.com/lyyang01/bioagent-benchmark/blob/1605e6e38bd69307e2f7b68a4367de21043c89b6/README.md) and [Zenodo deposit](https://zenodo.org/records/17291196) identify inputs, prompts, tool docs, reference code and outputs. | Download/extraction and native evaluation remain untested. |

Additional public-release comparators checked without changing their status:
[BAISBench](https://github.com/EperLuo/BaisBench) links task notebooks and its HF
dataset; [BioML-bench](https://github.com/science-machine/biomlbench) documents
prepare/run/grade commands; [DBench-Bio](https://github.com/transcend-0/DBench-Bio)
documents its dynamic dataset-construction pipeline; and
[FrontierScience](https://huggingface.co/datasets/openai/frontierscience) exposes a
public question/answer subset. These sources do not establish a graded framework
integration or full-suite parity. C-Eval's existing selected assessment already
specifies public labeled evaluation and distinguishes hosted held-out scoring;
that split boundary remains unchanged.

## Validation and independent review

Catalog schema validation, the existing general tests and page generation passed.
The production build validated 192 links. Focused browser checks passed for chart
counts/order, assignment and combined filters, plain category cells, neutral
category colors, implementation colors, and desktop/tablet/mobile in light/dark
themes. The full Playwright suite exceeded the VM's 500 MiB cap and was stopped
by the resource guard; the focused Chrome-protocol check peaked below 350 MiB.
No owned browser workers were left running. No tests pin mutable benchmark
statuses or counts. These are local edits; publication remains separate.

An independent agent reviewed the metadata, primary source distinctions, UI and
test changes and reported no must-fix defects. Its suggestions led to removal of
a stale SC-Arena caveat, a wider responsive stacking breakpoint and a stronger
combined-filter table check. Visual inspection also caught an undefined theme
variable; the neutral fill now uses existing foreground/background tokens, with
a regression assertion that the resolved color is nonempty.
