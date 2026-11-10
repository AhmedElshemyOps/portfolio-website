# 8. First proposed implementation slice

**Proposed only · Phase 03 reusable article publishing architecture · separate Gate 3 authorization required.**

## Scope and reason

Extract the existing managed article reader shell from the inline HTML in `page(meta, text)` into a small private template. Keep `body_html` as the existing teaching-body renderer and insert its rendered body exactly once. This creates an isolated seam for later sharing, mobile reader and relationship slots while proving byte-equivalent output. Keep the publishing transaction, CLI, public URLs, head data, HTML shape and approved defaults intact. The preview path alone is exercised for acceptance. No live file or catalogue refresh is required.

| File | Exact change |
| --- | --- |
| `scripts/publish_article.py` | Replace the inline shell with a call that reads the new local template and substitutes already escaped existing variables. Preserve public function signatures, escaping, marker, metadata and current transaction behavior. |
| `templates/finished-article-reader.html.in` (new) | Exact extracted static shell with explicit, bounded placeholders for current output fields. No design or navigation changes. |
| `tests/test_managed_article_shell_parity.py` (new) | Compare pinned publisher and candidate preview HTML and registry records using two fixed drafts, including unsafe markup, links, headings and a code block. Verify the single exact body insertion and unchanged anchors/canonical/social markup. |

No other files in the slice. Reject an unexpected diff to article HTML, generated artefacts, demos, workflows, settings or CV assets. This slice does not implement later-phase sharing, mobile, taxonomy, video or relationship features.

## Commands and verification

In clean baseline and candidate worktrees, use pinned Node 22, Python 3.12 and pnpm 9.15.9. Use the frozen lockfile and full Git history for release checks. A future parity fixture may read the pinned source with `git show`, execute it in temporary isolation and compare its output to the candidate for identical inputs. Keep generated preview files in the temp directory.

```sh
git diff --check
python3 -m unittest discover -s tests -p test_managed_article_shell_parity.py
python3 -m unittest discover -s tests -p test_article_publishing.py
pnpm run check:content
pnpm run check:search
pnpm run check:redesign
pnpm run check:health
```

Compare failures by test ID and signature against the reproduced pinned baseline. Historical defects remain tracked. Stop for any new failure or protected delta. Full acceptance requires the approved release baseline treatment and applicable checks, with no waived preservation assertion.

## Acceptance and rollback

Require byte-identical generated preview HTML and identical registry record for fixed fixtures, same escaped content and anchor targets, and same failure behavior for unsupported markup. Require zero existing content, project or SEO output changes and no preview file under the public root. Limit the diff to the three declared paths. Review the single reversible commit and retain test evidence. If an issue appears, revert that commit in the feature worktree, remove its temporary files, rerun the focused preview check, and confirm the protected content and outputs match the pre-slice SHA. No release or production rollback is part of this slice.

## Readiness verification and stop checklist

The protected source confirms one existing path and two new paths in the scope above. The extraction remains a proposal. Candidate byte parity and rollback cannot be proven until a separately authorized candidate exists. The original CLI preview **writes generated stylesheet files under its repository root** via `write_generated(root=ROOT)`, even when the HTML preview path is outside the root. A disposable protected archive confirmed exit 0, escaped script-like input and distinct `inputs` and `inputs-2` IDs with matching TOC links. It also emitted two generated stylesheet files in that archive. A missing approved series ID was correctly rejected with exit 1. Run baseline and candidate previews in separate disposable full source copies and store preview artifacts outside both roots. Keep the existing CLI semantics.

Before the first edit, record both pinned SHAs and capture clean status. Use fixed metadata and two synthetic drafts in an approved existing banner series with its next consecutive number. One should exercise ordinary Unicode, headings, links and lists. The other should include repeated headings, HTML-like metadata and body text, code fences, and an approved local or HTTPS link. Reject unsafe schemes, unclosed fences and invalid series metadata identically. Capture raw `page()` HTML and registry data plus rendered CLI output. Use `cmp` or exact byte equality including final newline, UTF-8 and whitespace. Verify the same registry fields, one body insertion, ordered heading IDs, TOC fragments, canonical, description, Open Graph values, Article JSON-LD, asset references and managed marker. Existing custom social cards remain byte-identical as protected public assets. No new social metadata belongs in the slice.

Run `pnpm install --frozen-lockfile` and `pnpm run check` in addition to the commands above. Baseline health is red. Compare failed IDs and assertion families as recorded in [baseline evidence](GATE_03_BASELINE_RUN.md). A prior failure is evidence to investigate, never a passing check. The older-reference preservation failure must remain visible. Compare the candidate directly with protected master for all public pages, article bodies, headings, anchors, links, images, custom social cards, canonical metadata and project assets. Check staged and unstaged diffs and untracked output. Repeat the four-project fixture checks on the candidate.

Stop if authorization or approved baseline disposition is missing, a fixture cannot be rendered, any byte comparison differs, a strict preservation check is weakened, a regression is introduced, or anything outside the three paths changes. Keep the pre-slice and candidate SHAs plus logs. For an already committed slice, use `git revert <slice-sha>` on the candidate branch only. For uncommitted work, discard the disposable candidate worktree after saving diagnostics. Remove both temporary preview roots. After an isolated revert with no intervening changes, require `git diff --exit-code <pre-slice-sha> HEAD --` and a clean worktree. Re-run the existing publisher check and compare a fresh disposable preview to the saved protected bytes. Keep the gate blocked if any restoration check differs.
