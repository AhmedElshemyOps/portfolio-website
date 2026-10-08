# InfraQuote: free shared-workspace preparation

The public website and local-first demo remain on GitHub Pages. No hosting purchase, payment card, paid plan, API key for AI, or external account was created in this update.

The browser demo already supports three stages, reviewed enquiry extraction, tour templates, company identity/defaults, dated supplier rates, Standard/Comfort/Premium comparisons, explicit cost confirmations, version snapshots/differences, approved InfraDispatch handovers, backups and local activity timestamps. Extraction is deterministic and local; it does not call an AI provider. Comparison prices are illustrative and use the current itinerary and selected vehicle. Standard and Comfort may cost the same when their inputs are the same.

## Optional free backend

Supabase Free can provide Postgres, authentication and a REST API while the website stays on GitHub Pages. Pricing and limits should be rechecked when activating: https://supabase.com/pricing . Free projects can pause after a week of low activity; do not describe this as guaranteed permanent hosting. https://supabase.com/docs/guides/platform/free-project-pausing

The SQL migration and frontend connector are prepared and the database permission rules are tested locally. A real Supabase project, authentication delivery and the complete hosted connection have not been provisioned or tested because the owner has no account yet.

1. Owner creates a Free Supabase account and project, accepting its terms personally. Stay on Free; do not add billing or upgrade.
2. Run `schema.sql` once in a new project SQL editor. It creates company workspaces, admin/sales/operations memberships, private supplier rates, templates, immutable quote versions, sanitized handovers and audit records.
3. Create the owner's authentication user in Supabase. Configure the site URL and permitted origins according to the Supabase Auth setup; keep email confirmation enabled when enabling self-registration later. The current demo only signs in existing users.
4. Put the project HTTPS URL and **publishable or legacy anon key** in `live-demos/assets/js/infraquote-cloud-config.js`. These keys are public identifiers protected by RLS. Never put a secret/service-role key in website files, GitHub, browser storage or an enquiry.
5. Publish the configuration to GitHub Pages. Open the demo's optional Shared company workspace panel, sign in, create a company and choose it. No local client/rate data is uploaded until a sharing action is clicked.
6. Use synthetic clients to test an owner, sales user, operations user and unrelated second-company user against the actual hosted project. Test sign-in, sign-out, version save, role restrictions, approved handover, backup and supplier-rate expiry before storing real client information.
7. Administrators can add an already-created auth user by UUID and assign a role. Operations users read sanitized approved service handovers; supplier rates, cost worksheets and margins are excluded. Users cannot overwrite or delete saved versions through this API.
8. Export a company backup regularly and keep it private. The demo also exports a device backup. Free infrastructure is not a substitute for an owner-managed backup routine.

## Scope and review semantics

Approval records the reviewer’s attestation and checks required details, unverified included costs and expiry. It does not book services or independently certify an attraction rate, tax treatment, vehicle licence or supplier promise. The prototype's sample rates and AED conversion assumptions remain explicitly labelled. Updating a rate book entry does not overwrite an existing quote or saved version; applying a rate is an explicit action.

Company settings and local tools can be uploaded manually. Uploading templates/rates creates copies; repeating the upload adds copies. Backend versions are numbered transactionally and cannot be overwritten. Sessions stay in memory, expire normally and are not saved in browser storage. The optional sign-in connection is disabled while its configuration is empty.

The operations import copies approved service details into the Abu Dhabi planner, preserves the version reference and asks the operator to assign actual vehicles/staff. It does not generate a live route or send messages. InfraQuote currently quotes Abu Dhabi sample tours; the existing Netherlands dispatch planner remains available separately.

The local activity export records action timestamps and session wall time, not claimed productivity savings. Field pilots should compare actual completion time and corrections across similar enquiries, with pauses accounted for.

## Verification

- `node tests/test_infraquote_workspace.cjs`
- `node tests/test_infraquote_calculations.cjs`
- `node tests/test_infraquote_pdf.cjs`
- Install the pinned dev dependency and run `node tests/test_infraquote_backend.mjs` (PGlite provides a disposable real PostgreSQL engine).
- The backend test bootstraps synthetic auth identities solely for local permission tests. `test-bootstrap.sql` must not be applied to a Supabase project.

Database tests cover company isolation, anonymous denial, admin/sales/operations access, immutable versions, approval rejection, expiry rejection and handovers without private financial fields. They do not replace hosted Supabase Auth and REST integration checks after activation.

## Amsterdam extension

Private rate records accept AED and EUR. The browser connector preserves each rate’s currency and blocks applying it to another currency’s quotation. Approved Amsterdam snapshots require native EUR and explicit tax review. Sanitized handovers carry country/city context into the Dutch planner. No hosted account is connected. See `../../docs/infraquote/amsterdam-maintenance.md` for the scope and tax-model limitations.
