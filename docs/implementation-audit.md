# Implementation audit — October 14, 2026

The catalog now uses Implemented, In progress, To do, and Blocked for its 94
tracked versions. This review found 4 implemented benchmarks, 3 active ports,
71 with implementation or validation work remaining, and 16 with specific
access/release prerequisites. The dated [audit snapshot](../data/implementation-audit.json)
records every decision and the repository inventories; the editable YAML
assessment is the current source of truth.

## What was checked

- The complete, non-truncated public Git trees of the Marin Harbor and Evalchemy
  forks at the revisions recorded in the snapshot.
- Evalchemy's pinned lm-eval v0.4.12 dependency, including task definitions that
  are not under Evalchemy's custom chat benchmark directory.
- All open issues and PRs in both forks: 15 issues / 7 PRs in Harbor, and
  8 issues / 3 PRs in Evalchemy. These lists were below the 200-item query cap.
- Public execution reports and Harbor parity artifacts, plus author release
  and access statements for concrete blockers and release-discovery gaps.

No models, benchmark tasks, gated downloads, or paid compute were run. A
missing integration is a finding about these framework inventories, not proof
that no implementation exists elsewhere. To do includes validating an existing
adapter, configuring the selected biology slice, or locating a release; it
must not be read as a claim that every upstream benchmark lacks code.

## Scope-sensitive findings

- MMLU now tracks the demonstrated three-subject, 554-question biology scope.
  The optional biomedical subjects are described in notes and are not silently
  included in the implementation claim.
- SciCode and ScienceAgentBench have graded Harbor parity reports covering the
  source suites that include biology. Their evidence is not a separate
  biology-only score, and resource/grading caveats remain explicit.
- BiomniBench-DA, BioMysteryBench, and GeneBench-Pro have open implementation
  PRs with graded execution evidence. They remain In progress because their
  integration work is unfinished. Gated sources were accessed in those runs;
  a public access gate alone is therefore not used to mark them Blocked.
- GeneBench selects the public-10 Pro version now that its implementation
  evidence has been verified, following the agreed evidence-first rule.
- The GPQADiamond limited-run bug in Evalchemy #201 concerns an alternate
  version, not the selected Main/Extended lm-eval path. It is recorded in notes.
- Shared-grading PRs Harbor #228 and Evalchemy #198 were checked, including their
  changed-file lists. Generic infrastructure work is not treated as evidence
  that every biology benchmark is actively being ported.
- Open BixBench correction work is linked without downgrading its established
  CLI implementation. Public sample releases are not substituted for a withheld
  full suite without an explicit scope choice.

Each active implementation has a dated reason and source links. Blocked reasons
state the missing prerequisite; In progress requires concrete issue/PR links.
Unselected records retain historical import metadata, including old status
values, but do not drive status filters, counters, or GitHub refreshes.
