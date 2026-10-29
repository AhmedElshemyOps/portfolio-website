# External reference review

Run `python3 scripts/audit_external_links.py --output /tmp/reference-audit.json` from the repository root. The audit reads public HTML anchor destinations, groups duplicate external URLs without fragments, and records every referring page. It does not modify pages or follow publication workflows.

A reachable HTTP response is not claim verification. A 403, 429, bot challenge or connection error is not evidence that a citation is dead. A 404/410 is a review candidate, not permission to remove the source. Check the publisher's own page before replacing any citation. External fragment targets and soft error pages need separate review.

The 29 October 2026 report covers 246 unique destinations across 179 public pages: 157 direct successes, 83 restricted results, six connection failures later retrieved through public web browsing, and no confirmed 404/410. Supplemental retrieval is recorded separately, preserving the original HTTP outcomes. Editorial flags identify the EHL banking citation and KNMI regional redirect. No speculative source substitution was made, and source styles, article text and dates remain unchanged.
