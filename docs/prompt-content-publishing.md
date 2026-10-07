# Publishing complete prompt templates

The Hotel Operations Manager chapter refers to separate prompt-library files
011–020. Chapter headings and summaries do not contain the full templates.
Importing only the chapter left ten empty copy targets on the published page.

`content-sources/hotel-operations-manager/` preserves the original Markdown
files from the source repository. `source.json` records the exact commit,
attribution, license and file checksums. Full prompt text, use cases, input and
output lists, and human verification notes are rendered from these files;
the surrounding article wording and public section IDs stay intact.

After an intentional source update, record the new commit and checksums, then:

```sh
python3 scripts/sync_hotel_prompts.py
python3 scripts/sync_catalogue.py
python3 scripts/sync_hotel_prompts.py --check
python3 -m unittest discover -s tests -p 'test_prompt_content.py'
```

Catalogue generation validates prompt content before writing outputs. The
GitHub workflow validates source fidelity and all article copy targets on every
push and pull request. The preview publishing checks must run the same
validation. Make the workflow a required branch check if repository settings
permit it; this change does not configure repository branch protection.

The browser disables unavailable prompts instead of copying an empty string or
claiming success. Prompt text is also embedded in HTML, so it remains readable
without JavaScript.
