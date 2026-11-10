# Decision log

- Baseline: successful Pages deployment of `753c3a0cc6e2235201e939b840973911725dc00c` from `master`. Verify production assets against this commit.
- Working branch: `redesign-2026`, based directly on the published commit. Soft Clay PR #36 is a separate reference only.
- Architecture recommendation pending approval: retain static HTML and current Python/Node build and validation tools. Extend approved templates and the existing content registry. Preserve legacy HTML bodies byte-for-byte where a safe rendering boundary exists. Treat generated output as disposable, with controlled and tested regeneration.
- Recommend C for the managerial career objective. The design remains a proposal.
