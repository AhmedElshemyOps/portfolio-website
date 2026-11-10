# D. Knowledge graph specification

Use a small, reviewed sidecar against the existing registry. No graph service or full-site visualization is required. The visual map and list render from the same eligible edge set.

## Records

| Record | Required fields and ownership |
| --- | --- |
| Node | Stable namespaced ID, kind, source key, display title, canonical URL if public, publication state. Derive known fields from the article registry, taxonomy, series, projects and video inventory. Support article, category, series, project, video, journey and profile/resource nodes. Category/journey nodes can be on-page anchors. |
| Edge | Source ID, target ID, relation type, status, evidence locator, concise rationale, reviewer and review date when approved. Explicit direction for cites, embeds, includes, applies, related and sequence. Add position on series/journey membership. |
| Journey | Stable ID, audience, objective, ordered steps, separate related series/projects, next resource and existing return target. Keep journey ordering independent of category, series and relevance. |
| Derived backlink | Reverse view of a public eligible directed edge, with originating source, type and evidence. Never write it back into canonical article teaching text. |

Use stable article registry IDs even when an existing route is exceptional. Never infer an existing path from its ID. For already published pages absent from the registry, validate against the pinned public URL inventory and register only through the approved metadata reconciliation.

## Evidence and visibility

- **Verified existing** needs an observed link, series membership or embedded inventory ID in an identified source at the pinned revision. Example: [ITIL 4 for Tourism Operations](https://ahmedqualityops.com/articles/itil-4-tourism-operations/index.html) links to the [Integrated SOP Creation Model](https://ahmedqualityops.com/articles/integrated-sop-creation-model/index.html). The SOP guide's three observed inbound citations and the embedded hotel check-in video are the pilot seed.
- **Editorial proposal** needs a clear rationale and reviewer. Example: the [MICE series](https://ahmedqualityops.com/articles/abu-dhabi-mice-operations-series/index.html) and [InfraDispatch](https://ahmedqualityops.com/projects/infradispatch/index.html) share a dispatch-readiness use case. It can appear dashed in a private review. If approved for public navigation, label it as a related application, with provenance distinct from an observed citation.
- **Automated suggestion** stays in a review queue. A shared tag or text match is candidate evidence only. No inferred backlink or public search boost before review.

## Validation and rendering

Reject unresolved or duplicate IDs, self-links, duplicate edge keys, invalid type pairs, external destination URLs outside approved links, missing public targets, dead fragments, invalid evidence, private/draft leakage and noncontiguous or cyclic ordered steps. Cross-topic references can form cycles. Walk only a bounded local neighborhood, with one record per destination per list. Confirm source evidence by checking exact link or embed target against baseline HTML or the registered source. Revalidate approved edges when their source changes. An invalid edge blocks generation for the affected surface, with actionable diagnostics.

Provide server-rendered static list links grouped by relationship type. HTML buttons select map nodes, announce changes and expose the same evidence as the list. Color and line style complement visible labels. Mobile reflows to ordered links and optional map details with no forced gestures. Support keyboard focus, escape/return behavior if needed, reduced motion and a stable reading order. Search inherits canonical targets and adds approved journey/topic facets from derived records. Keep metadata separate from visible article wording and generated outputs deterministic. Draft relationships and example searches stay in local preview.
