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
