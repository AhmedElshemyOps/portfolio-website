# Ahmed Quality Ops website

Source for the Ahmed Quality Ops portfolio, article library and operational demos at [ahmedqualityops.com](https://ahmedqualityops.com/).

## Local preview

Use Node.js 22 and Python 3.12, matching the existing prompt-validation workflow. From the repository root:

```sh
node scripts/preview-static.mjs --host 127.0.0.1 --port 4173
```

Open `http://127.0.0.1:4173/`. This serves the static files locally without a build step. Keep unpublished drafts outside the repository because the preview and public Pages site serve repository files.

## Content and maintenance

- `articles/` and the section directories contain published HTML pages.
- `content/article-registry.json` and `content/knowledge-taxonomy.json` define article metadata and classification. Edit these sources rather than derived catalogue JSON.
- `templates/`, `assets/` and `scripts/` provide shared rendering and maintenance tools.
- `content-sources/` preserves attributed prompt sources; `tests/` contains validation checks.
- [Article authoring](docs/authoring/README.md) explains preview, publication and stable URLs.
- [Prompt publishing](docs/prompt-content-publishing.md) explains source synchronization and validation.
- [Website maintenance](docs/website-maintenance.md) records maintenance and verification practices.

After an approved metadata change, run `python3 scripts/sync_catalogue.py`. Follow the authoring guide for article changes and review generated differences before committing.

## Checks

Run the checks relevant to your change:

```sh
python3 scripts/render_shared.py --check
python3 scripts/validate_site_links.py
python3 maintenance/validate-navigation.py
python3 scripts/sync_hotel_prompts.py --check
python3 -m unittest discover -s tests -p 'test_prompt_content.py'
node tests/test_prompt_copy.cjs
```

`npm run check:health` runs the broader release checks. Backend checks require the pinned development dependency from `package.json` and `pnpm-lock.yaml`; install it with `pnpm install --frozen-lockfile` before running those checks. Some authoring tools need additional dependencies documented in their guides.

## Publishing

`master` is the default branch. `CNAME` records the custom domain, and `.nojekyll` supports static GitHub Pages publishing. After separately approved changes reach the publishing branch, review the Pages deployment result in GitHub Actions and verify the deployed pages. Local preview and authoring commands do not deploy by themselves. The `.github/workflows/validate-prompts.yml` workflow runs the complete release checks on pushes, pull requests and manual runs. It uses Node.js 22, Python 3.12 and pnpm 9.15.9, installs the frozen lockfile, then runs `pnpm run check:health`: all Python and JavaScript tests (including quotation calculations, workspace and backend permissions), pinned prompt sources, shared templates and style bundles, local links/fragments, and article navigation. Any failed check makes the workflow fail; it does not deploy the site.

## Optional InfraQuote backend

The static site can run without a backend. [The InfraQuote backend guide](backend/infraquote/README.md) documents optional Supabase provisioning, configuration and verification. Keep service-role keys, credentials, private customer data and unpublished drafts out of this public repository. Do not apply the local test bootstrap to a hosted database.
