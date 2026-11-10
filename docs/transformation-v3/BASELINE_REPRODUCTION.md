# Protected master baseline reproduction

Pinned commit `753c3a0cc6e2235201e939b840973911725dc00c`. Direct Git access and the source archive timed out in this workspace. The GitHub connector could retrieve individual pinned files and the full tree. I assembled a scratch fixture from those files and 211 prior HTTP captures that match the pinned Git blob hashes. No Git history, full asset checkout or Node 22 toolchain was available in that fixture. Local checks used Python 3.12.14 and Node 24.22.1, so the JavaScript results are supplementary and the complete CI run remains a prerequisite.

| Check run against pinned fixture | Observed result |
| --- | --- |
| `python3 scripts/validate_content_registry.py` | Exit 0. 133 registry destinations and 11 reviewed search descriptions. |
| `python3 scripts/validate_search_release.py` | Exit 0. 202 public pages, 178 canonical search pages, 18 historical aliases and six noindex utilities. No reported errors. |
| `python3 scripts/check_article_videos.py` | Exit 0, offline validation. 33 inventory records, two supplemental unknowns, 30 placements, no reported issues. Playback and live availability remain open. |
| `python3 -m unittest discover -s tests -p test_search_release.py` | Eight tests passed. |
| `python3 -m unittest discover -s tests -p test_article_financial_examples.py` | One test passed after adding its exact pinned CSV fixture. |
| `node tests/test_infraquote_calculations.cjs` | Passed pricing, break-even, vehicle capacity, draft and required-field checks. |
| `node tests/test_infraquote_amsterdam.cjs` | Passed four Amsterdam template scenarios and evidence/currency/age-band checks. |

Initial import and missing-fixture errors during reconstruction were resolved for the checks above. Those setup errors are separate from site defects. The full content-registry unit test module, historical preservation suite, remaining JavaScript suites and other project browser smoke tests were not reproduced. There was no implementation candidate to compare.

## Historical evidence kept separate

- [Protected master CI job](https://github.com/AhmedElshemyOps/portfolio-website/actions/runs/42690328221/job/129408066664) recorded 32 failures and six errors across 197 Python tests. Historical missing-file lookups and protected snapshot mismatches are tracked in the [Phase 00 diagnosis](RELEASE_CHECK_DIAGNOSIS.md).
- [Soft Clay CI job](https://github.com/AhmedElshemyOps/portfolio-website/actions/runs/42808085230/job/129802299301) recorded 15 failures on its isolated draft. Keep separate from master.
- Full reproduction requires a clean pinned checkout with complete history, Node 22, Python 3.12, pnpm 9.15.9, the frozen lockfile and full assets. Run `pnpm run check:health` and `pnpm run check:redesign`, retain raw logs and compare failures by exact ID, input and signature. Reproduce all four demo scenarios under matching conditions. No waiver or test assertion relaxation is authorized.
