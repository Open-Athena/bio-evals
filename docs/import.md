# Initial inventory reconciliation

Imported October 14, 2026 from the [biology evals spreadsheet](https://docs.google.com/spreadsheets/d/13wfLWv0dHw57_0_yf1p2h9u5z8yojaYM7I9BLFVhd3k/edit).

| Tab | Full read range | Populated evaluation rows |
| --- | --- | --- |
| Agentic (Harbor), gid 846608904 | A1:AE1000 | 2–49: 48 entries |
| Non-agentic (Evalchemy), gid 776831399 | A1:AD999 | 2–73: 72 entries |

All 120 entries map to 94 families and 120 distinct variant/protocol records.
No source evaluation row was dropped. No identical protocol rows required a
merge; deduplication groups related releases and protocols under their family.
Composite source rows such as BioProBench PQA/ERR remain composite until their
implementation work needs a finer split. These counts do not imply independent
datasets or successful execution.

## Grouping decisions

| Family | Variants grouped | Rationale / boundary |
| --- | --- | --- |
| BixBench | CLI v1.5, Verified-50, BixBench3, original notebook protocols | Shared benchmark lineage; subset curator and grading distinctions retained |
| LAB-Bench | LABBench2, retrieval, text MCQ, FigQA/TableQA | Related releases and tool conditions; version and creator distinctions retained |
| GeneBench | Original and Pro | Related named releases; original/public Pro scope remains distinct |
| scBench | Original and Long | Short versus study-scale tasks |
| SpatialBench | Original and Long | Different workflow lengths and public grading availability |
| TxBench | PP, Ab, OD | Separate therapeutic-discovery competencies within the named suite |
| BioSecBench | Surveillance, Function, Refusal direct/meta | Separate suite components and decision-versus-execution protocols |
| BioProBench | PQA/ERR, ORD, GEN, REA | Task families and reasoning conditions in the same corpus |
| BioASQ | Retrieval, supplied-snippet yes/no, factoid/list, ideal answers | Different answer types and retrieval conditions |
| GPQA | Diamond and Main/Extended biology | Overlapping subsets, not independent banks |
| MMLU | Original and Pro biology | Related releases; preserve different question sets and attribution |
| MMMU | Original and Pro | Related multimodal releases |
| SciKnowEval | Closed-choice and open-ended biology | Distinct task/grading families in v2 |
| MicroVQA | Original and announced ++ | Navigation grouping only; independent test protocol of ++ remains unverified |
| Terminal-Bench-Science | Life sciences and upcoming lite | Announced derivative retained as a candidate with unknown implementation |

All other source names remain separate families. In particular, BioAgent Bench,
Liu et al.'s single-cell agent benchmark, Bio-benchmark, Bioinfo-Bench,
BioinformaticsBench, BioLLMBench, and BioEval are not merged by name similarity.

## Evidence and gaps

Existing [Marin #9258](https://github.com/marin-community/marin/issues/9258) and
its linked result/port records were inspected during import. BixBench CLI and
Verified-50 have evidence of end-to-end execution and grading, with partial
grading coverage and protocol caveats retained. Their implementation flags do
not assert that every task passed or that all scientific references are valid.

The documented MMLU run covers 554 biology questions. The spreadsheet row also
names broader biomedical subjects, so its implementation flag remains unknown
with the narrower execution evidence attached. Remaining entries are unknown
where end-to-end validation has not been established for this catalog. This
is not a claim that their adapters do not exist.

ID/OOD values were initially imported from the spreadsheet unchanged. The frozen
snapshot retains those historical values. The editable catalog now defaults to
TBD, with ID/OOD exceptions requiring confirmation of inheritance from Marin's
evaluation policy for the stated variant.

Access, grading, and limitation notes are retained with source evidence dates;
they have not been independently refreshed for every evaluation. No examples,
model attempts, benchmark data downloads, or new evaluations were required.
The spreadsheet was not edited.
