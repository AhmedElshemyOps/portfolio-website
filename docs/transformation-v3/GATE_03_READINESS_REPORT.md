# Gate 3 readiness decision

**BLOCKED · 10 November 2026.** Gate 2 planning is accepted. This verification closes the environment and representative project baseline gaps. The protected release baseline remains red and Gate 3 execution authorization remains separate.

| Area | Result |
| --- | --- |
| References | Protected `master` `753c3a0cc6e2235201e939b840973911725dc00c`, accepted planning parent `76b7df50b79db1cdb7a07cf779c96655a62ef928`, isolated `codex/soft-clay-refresh-2026-11-10` `6dc5d694b9d8f47e8f7870d517bfc78847cde463`. |
| Baseline | Full non-shallow CI-equivalent run reproduced 29/31 passing groups and all 38 failing Python test IDs/subtests. Content and search passed. Publishing, generated stylesheet and older-reference preservation checks failed. [Commands, exit codes and comparison](GATE_03_BASELINE_RUN.md). [Failure inventory](GATE_03_BASELINE_FAILURES.tsv). |
| Projects | InfraQuote, InfraDispatch, InfraSky and InfraCluster passed representative browser fixtures with a 390 px layout check. [Fixtures and coverage limits](GATE_03_PROJECT_EVIDENCE.md). |
| Taxonomy | All 130 article and five series-index rows, routes and canonicals checked. The 48 medium-confidence proposals are grouped for review. Heijunka and Yamazumi remain published outside the registry. Cruise has zero proposed primary assignments. [Exceptions](TAXONOMY_EXCEPTION_REPORT.md). |
| Employer identity | Retain **Travel & Tourism Professional** and direct employer, CV, projects and contact pathways. Keep the Garden as the signature educational experience. Use CV-supported scope, describe the four demos as prototypes, and hold unsupported volumes, managerial titles, unverified credentials and projected outcomes. [Claim register](EMPLOYER_CLAIM_EVIDENCE.md). |
| First slice | Phase 03 proposed scope remains `scripts/publish_article.py`, new `templates/finished-article-reader.html.in` and new `tests/test_managed_article_shell_parity.py`. Temporary baseline CLI smoke passed with approved series metadata. Candidate byte parity and one-commit rollback are acceptance requirements. [Exact scope and stop checklist](FIRST_IMPLEMENTATION_SLICE.md). |

## Decisions still open

1. Decide the disposition of the reproduced red baseline. Review historical fixture assumptions and confirmed renderer changes as separate work, or document a precise approved comparison boundary for the isolated Phase 03 slice. Existing release and preservation failures remain visible either way.
2. Give separate explicit Gate 3 authorization for the three-file slice after the baseline disposition is agreed.
3. Review the taxonomy exceptions before Phase 08 activation. Keep additional employer claims on hold unless documentary evidence and claim-level approval are supplied. These later decisions remain separate from the template-only slice.

[Updated Gate 3 checklist](GATE_03_PREREQUISITES.md) · [Gate 2 decision and Phase 00 references](GATE_02_DECISION_REPORT.md)

The verification stopped at the approval gate. The 18 V3.0 phases and their order remain in force.
