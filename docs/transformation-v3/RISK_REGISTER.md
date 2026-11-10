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
