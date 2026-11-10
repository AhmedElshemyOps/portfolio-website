# Risk register

| Risk | Priority | Evidence / handling |
| --- | --- | --- |
| Pages can deploy with release checks failing | High | Same master SHA: successful Pages and failed independent release validation. Require approval and green release evidence before any controlled deployment. |
| Article preservation and links | High | Soft Clay guard flags three article bodies and link order/destinations. Compare against pinned current HTML and the older baseline before cherry-picking. |
| Social card regression | High | Two custom 1200 × 630 PNGs replaced by a shared WebP on the draft. Preserve custom metadata and test actual platform cards. |
| Registry mismatch | High | Two published pages absent from registry. Reconcile content coverage through approved metadata work. |
| Project regressions | High | Four demo HTML shells changed on draft. Run representative calculations, scenarios, exports and saved state tests before reuse. |
| Consent/measurement uncertainty | High | Live analytics prompt and source config present; live consent network behavior and private dashboards need verification. |
| Mobile/performance and accessibility | Medium | Need real viewport, keyboard, screen-reader and field data evidence. |
| CV provenance | Medium | Public and managerial PDFs are byte-identical. Verify owner-approved source and claims. |
| Optional cloud configuration and cached releases | Medium | Review Supabase policy, third-party frames and offline behavior before functional or release changes. |

## Phase 02 additions

| Risk | Priority | Evidence / handling |
| --- | --- | --- |
| Five live categories versus ten V3.0 target categories | High | Approve a reviewed crosswalk and zero-URL-change transition before taxonomy activation. |
| Invented or stale graph relationships | Medium | Require source evidence, status, reviewer and failing checks for unresolved references and draft leakage. |
| Mobile map and journey density | Medium | Use a bounded map with equivalent text links. Test small widths, keyboard and assistive technology. |
| Unsupported pilot metrics as employer headlines | High | Published CV and profile broadly align, but the CV reviewed lacks the pilot counts. Record claim-level provenance and confirm before promotion. |

See [batch rollback controls](PHASE_02_RISK_ROLLBACK.md).

## Gate 2 review update

- **High — baseline reproducibility.** Targeted checks ran against a pinned fixture. Full checkout/history and the CI-equivalent toolchain are still needed before classifying historical failures and candidate regressions. [Reproduction](BASELINE_REPRODUCTION.md).
- **High — taxonomy activation.** Crosswalk prepared, 135 proposed rows awaiting owner review. Preserve live assignments until separate approval and Phase 08. [Crosswalk review](TAXONOMY_CROSSWALK_REVIEW.md).
- **High — employer claims.** Public CV approved as reference. Hold profile-only metrics and distinguish prototypes, projected opportunities and verified outcomes. [Evidence table](EMPLOYER_CLAIM_EVIDENCE.md).
