# Decision log

- Baseline: successful Pages deployment of `753c3a0cc6e2235201e939b840973911725dc00c` from `master`. Verify production assets against this commit.
- Working branch: `redesign-2026`, based directly on the published commit. Soft Clay PR #36 is a separate reference only.
- Architecture recommendation pending approval: retain static HTML and current Python/Node build and validation tools. Extend approved templates and the existing content registry. Preserve legacy HTML bodies byte-for-byte where a safe rendering boundary exists. Treat generated output as disposable, with controlled and tested regeneration.
- Recommend C for the managerial career objective. The design remains a proposal.

## 10 November 2026 · Phase 02 planning

- The owner conditionally selected the Knowledge Garden. This supersedes the prior recommendation of C. Use the Field Atlas pilot as the planning reference.
- Explore by Professional Goal is in the planning scope. The proposed journeys, placement, taxonomy migration and graph architecture are awaiting Gate 2 review.
- Continue from the protected published revision. Soft Clay remains isolated. [Decision](PHASE_01_DECISION.md) · [Gate 2 review](PHASE_02_REVIEW.md).

## Gate 2 conditional approval

- The owner approved the Field Atlas/static architecture, four professional goals, CV/employer route reuse, accessible metadata graph, derived backlinks, and five-to-ten transition approach for planning only.
- Homepage employer identity comes first. The public CV is the documentary reference and additional quantitative claims remain held. The completed crosswalk requires separate activation approval.
- Gate 3 is not ready. Full pinned-history CI reproduction and independent authorization remain open. [Decision report](GATE_02_DECISION_REPORT.md) · [Reproduction evidence](BASELINE_REPRODUCTION.md).
