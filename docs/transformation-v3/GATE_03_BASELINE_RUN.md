# Gate 3 protected-baseline run

Run on 10 November 2026 against detached `753c3a0cc6e2235201e939b840973911725dc00c` using a non-shallow checkout with 338 reachable commits. Linux 6.18.57 x86_64, Node 22.23.4, Python 3.12.14, pnpm 9.15.9. The pinned lockfile SHA-256 was `bcbda211ccc71644cd85523c89eb8ee2dd0d276df3d3f40a14ee391552941786`. Frozen install resolved PGlite 0.5.8. The tracked checkout was clean before and after the run.

| Command | Exit | Local output |
| --- | ---: | --- |
| `pnpm install --frozen-lockfile` | 0 | Lockfile current. Installed the pinned dependency. |
| `pnpm run check` | 1 | `ValueError: Generated stylesheet drift: assets/css/generated/page-b6ecfc925443.css` (absolute path normalized here). Short-circuited before links/navigation. Both ran separately inside health. |
| `pnpm run check:content` | 0 | 133 registered destinations, 11 reviewed search descriptions, no files changed. |
| `pnpm run check:search` | 0 | 202 public pages, 178 canonical search pages, 18 historical aliases, six noindex utilities and zero errors. |
| `pnpm run check:redesign` | 1 | 178 pages, 130 articles, 9,900 anchors and 437 downloads checked. Seven discrepancies against its older reference `3f5507fb6be29482eacd1cec29fb473f3ff8b9ef`. |
| `python3 -m unittest discover -s tests -p test_article_publishing.py` | 1 | Four tests in 6.143 s, one failure. Temporary publishing rewrites an existing Amsterdam series article's iframe markup. The first shown video is `MS1rVkMbTK4`. |
| `pnpm run check:health` | 1 | 29/31 groups passed. Python ran 197 tests in 102.022 s and reported 32 failures and six errors. Failed groups were Article and website tests and Shared templates and bundles. All 21 JavaScript test files passed. Local links reported 203 pages with no missing targets, fragments or duplicate IDs. Navigation reported 206 HTML pages and 4,400 TOC links with no missing destinations. The checks count different scopes. |

The preservation command found wording/order/punctuation and link-destination/order differences in `article-abu-dhabi-mice-movement-control-room`, `hotel-lean-six-sigma-ai-toolkit` and `tourism-operational-excellence-management-system`, plus a protected `sitemap.xml` file mismatch. These are discrepancies between the pinned master and the check's **older** reference. Review the intended historical changes separately and protect the current pinned production bytes in candidate comparisons.

## Historical comparison and classification

The [historical master job](https://github.com/AhmedElshemyOps/portfolio-website/actions/runs/42690328221/job/129408066664) ran 197 Python tests in 122.386 s with 32 failures and six errors and ended at 29/31 groups with the same stylesheet drift path. The [failure inventory](GATE_03_BASELINE_FAILURES.tsv) has all 38 local IDs and first exception lines. All IDs, including four page subtests, match. Twenty-nine first exception lines match after normalizing absolute paths. Six historical `git show` errors named Heijunka while this run reached Yamazumi first. Both paths are absent from all four historical commits and the commits themselves are present locally. Three rendering assertions reported different first diffs for the article selected during enumeration. Preserve both logs when investigating. Test identities and failure families agree.

- **Outdated assumptions.** Historical comparison loops apply current inventory to older trees. Fixed totals and historical route-set assertions also omit later entries. Preserve meaningful equality checks when proposing an eventual historical fixture repair.
- **Confirmed pre-existing source or renderer mismatches.** The clean tree lacks the generated stylesheet expected by the bundler. The publishing transaction changes existing iframe markup in a temporary copy. Homepage and article renderer parity tests reproduce committed-versus-rendered differences. These require a separately scoped resolution or an explicit decision on the approval boundary.
- **Pre-existing, cause review pending.** Historical preservation contract drift, TOC and reading coverage, video placement or permissions, series coverage and related assertions remain in the inventory. For example, `29 != 30` does not by itself show which video is misplaced. A discrepancy against an older reference does not determine whether the historical change was approved.
- **Environment.** The first clone attempt timed out. The successful non-shallow retry and frozen install supersede that attempt. Node's experimental proxy warning had no observed effect on test outcomes. No candidate implementation was present in this run.

## Reproduction

Use Node 22, Python 3.12 and pnpm 9.15.9 on PATH. The workspace invoked the toolchain with `npm exec --yes --package=node@22 --package=pnpm@9.15.9 -- bash /tmp/aq-gate3-ci.sh`, where the script ran the commands below independently and captured stdout, stderr and exit codes.

```sh
git clone --single-branch --branch master --no-checkout https://github.com/AhmedElshemyOps/portfolio-website.git gate3-master
cd gate3-master
git checkout --detach 753c3a0cc6e2235201e939b840973911725dc00c
git rev-parse --is-shallow-repository
git rev-list --count HEAD
git status --porcelain
node -v
python3 -V
pnpm -v
pnpm install --frozen-lockfile
pnpm run check
pnpm run check:content
pnpm run check:search
pnpm run check:redesign
python3 -m unittest discover -s tests -p test_article_publishing.py
pnpm run check:health
git status --porcelain
```

The [release harness](https://github.com/AhmedElshemyOps/portfolio-website/blob/753c3a0cc6e2235201e939b840973911725dc00c/scripts/check_health.mjs) checks committed video placement records locally. Scheduled online video availability and Pages deployment are separate workflows outside this verification.
