# 5. Knowledge graph implementation contract

This extends the approved [graph specification](KNOWLEDGE_GRAPH_SPEC.md). Scope and code await Gate 3 and the applicable V3.0 phase.

**Input ownership.** Resolve stable namespaced IDs from the public registry, existing series, taxonomy, project, video and reviewed journey sources. Sidecar relationships carry source and target IDs, type, direction, status, source locator, revision or date, rationale, reviewer and applicable sequence position. Preserve original route spelling and canonical ownership. Heijunka and Yamazumi can be reviewed by verified public route while their registry reconciliation is pending. Draft destinations remain private.

| Relationship state | Required evidence | Output eligibility |
| --- | --- | --- |
| Verified existing | Exact source link or embed, registered membership or equivalent documentary evidence at an identified revision | Render contextual links and labeled backlinks where semantics support reversal. |
| Reviewed editorial proposal | Explicit rationale, reviewer and approval for the destination and placement | Render as related application or journey recommendation. Its reverse view retains that label. |
| Automated suggestion | Candidate similarity/tag evidence and review queue | Private review only. Excluded from public links, counts, discovery and rankings. |

**Validation.** Require supported node/type pairs, resolvable safe destinations, stable identifiers, unique edges and series/goal positions, extant fragments, truthful status and an approved evidence locator for public edges. Reject draft leakage, external destination ambiguity and self-links. Permit cross-topic cycles but bound neighborhood traversal and deduplicate nodes. Ordered membership must be contiguous and acyclic. Error messages identify source, rule and offending ID. Preserve strict validation of existing link destinations, structure and article snapshots.

**Output contract.** Derive backlinks deterministically from eligible directed edges without writing any teaching text. Observed citations and editorial associations stay distinct. Generate a bounded map, equivalent static HTML list and search facets from the same eligible source. Add approved relationship navigation in shell slots outside the protected article body. Sort by editorial position where relevant and stable ID as fallback. Run two builds with identical inputs and compare outputs. Publish transaction and indexing work remain in their approved phases. No browser graph dependency or required backend.

**Browser acceptance.** Identical map/list destinations, visible link type, keyboard and touch operation, readable focus and status announcements, optional motion, no required gesture, and no JavaScript dependency for basic navigation. Validate empty/invalid input and confirm zero preserved article-body, link or canonical changes.
