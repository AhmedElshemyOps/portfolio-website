# Field Manual article system

Selected visual: third generated concept, October 7, 2026. Pilot article: tourism-quality-sop-ai-prompts.

## Tokens

Uses existing design-tokens.css; does not alter other pages. Navy #07182b, paper #fcfaf5, ink #10233f, muted #52647a, gold text #815f17, gold line #c79a43, gold button #e5c77f. Lora 600 headings, IBM Plex Sans 400/500/600 body/UI. Display 30–44px, section headings 25–32px, body18px/1.75 (17px on phones), UI12–14px. Full page surface without outer card. Maximum layout1200px, desktop rail290px, gap52px, body width fills remaining space. Fine dividers and no nested decorative cards.

## Template contract

1. Shared masthead with working site links.
2. Navy text-only header: full canonical title, exact standfirst, reading time only.
3. Desktop reading column left; sticky contents right. Each contents link targets a real heading or section and tracks current location.
4. Below900px, contents precedes content and collapses; no sticky rail. Phone margins20px.
5. Preserve original article text, prompt text, heading anchors, embedded educational diagrams and canonical metadata. Decorative hero image and duplicate generated summary are omitted from the pilot presentation.
6. Prompt component: use case, original inputs/outputs, labelled full text, copy action and accessible live feedback. No clipping or truncation.
7. Existing glossary and reading preferences remain available after the article. Series navigation and focused next actions retained.
8. Do not load article-pages.css or reader-experience.js/CSS with this template; they introduce legacy geometry and generated reading summaries. Existing reader, prompts, discovery, saved-reading and table scripts remain.
9. Opt-in through body.field-manual and article-field-manual.css; other articles are untouched.

## Rollout

Review the pilot, verify actual phone/tablet viewports, integrate this contract into the original article generator, then migrate articles by family. Compare content and all copy targets before each batch. This branch is a local design review, not a production release.

## Practical value at the opening

Every article and article-based learning path leads with three editorial elements:

1. The title-band introduction names a concrete operating problem.
2. The first body block identifies who the article helps.
3. The same block states what the reader can do with the method or toolkit.

Keep these statements specific to the article. Describe usable actions rather than promised business results. For AI toolkits, make verification and human review explicit where relevant. Do not imply that an AI draft establishes facts or authorises a decision.

Curated copy lives in `content/editorial/article-practical-value.tsv`. `scripts/apply_article_value.py` applies it consistently; catalogue synchronisation applies it before generating word counts and discovery records. A new article needs its own complete row. The script stops on missing or duplicate records rather than substituting a generic introduction.

The audience and outcome use a semantic definition list with a restrained bottom divider. Desktop labels sit beside the text; on narrow screens they stack above it. The block has an accessible label and follows the reader's font and colour settings. It does not add another title or table-of-contents section.

Step 2 updated 130 editorial pages (128 articles and two article-based learning paths). All existing article-body content was preserved byte for byte beneath the new opening. Opening coverage, escaping and idempotence checks pass, along with prompt-content and exact-copy checks. Browser visual review was unavailable because the required control-browser skill was not exposed in this session.

## Contents navigation

Main section links are always visible when the contents panel is open. Native `details` groups contain individual prompt links and h3/h4 subsections; groups start collapsed. Inline numbered prompt discussions appear as subsections, while the full prompt-template collection has its own expandable list. A long worked sales-email sequence is one expandable group. Duplicate imported contents panels are removed. Existing fragment IDs and article prose remain unchanged.

Contents now follow actual article headings instead of arbitrary groups of six links. The outline includes previously omitted prompt templates and closing sections. Utility blocks are excluded. Native summaries support keyboard expansion without JavaScript; phone layouts retain the existing collapsible outer panel.

Scroll tracking marks the current link with both a visible background/border and `aria-current="location"`. A collapsed group and its parent section are highlighted when they contain the current subsection. Direct fragment links open the appropriate group. Scrolling preserves the reader's choice to expand or collapse a group.

Step 3 checks cover all 130 outlines: valid unique targets, collapsed detailed groups, idempotent generation, preserved article bodies (apart from duplicate contents panels), and exact prompt content/copying. JavaScript syntax checks pass. Browser visual review remains pending.

## Heading hierarchy

Each article has one h1 page title. Main sections use h2; individual prompt sections and inline numbered-prompt discussions use h3. Supporting prompt headings such as inputs, expected output and copy-card labels use h4. Other subsections use h3/h4 without skipping levels. The page title, main section, subsection and supporting label have distinct typographic sizes, including narrow-screen rules.

Remove ordinal prefixes such as `1.` and `2.3` from heading labels. Keep meaningful quantities and identifiers such as “5 Whys”, “10 prompts”, email numbers and prompt reference numbers. Prompt badges provide their own sequence, so a heading does not need a second ordinal.

Curated concise labels live in `content/editorial/heading-labels.tsv`. Step 4 shortened 27 body headings exceeding 100 characters and nine long page titles. URLs and fragment IDs remain unchanged. Shortened page titles are reflected in browser titles, sharing metadata, structured-data titles and the regenerated catalogue. Heading permalink labels and contents labels use the revised wording.

Step 4 changed 2,714 headings across 83 pages; all 130 pages use the shared typography and pass hierarchy checks. Every existing paragraph, preformatted block and fragment ID is preserved. Heading, outline, prompt-content and exact-copy checks pass. Browser visual review remains pending.

## Practical-example standard

Every worked example follows this order: **Situation → Evidence → Decision → Action → Verification**. Narrative examples use a shared five-stage block. Existing setup figures, calculations, response steps and source subheadings are placed in the appropriate stage; missing decisions or verification checks use explicit instructions rather than invented results. Prompt examples appear in expandable blocks after the required-input/output grid and before the copyable template.

Examples have an explicit evidence classification. An **illustrative scenario** is an operational teaching example, not a documented incident; uncited figures and outcomes remain assumptions. A **documented case** requires a traceable case source and recorded verification of that source. A general reference to a method or framework does not document an operational incident. No example was promoted to documented status without supporting records. Misleading “real case” labels on the imagined DMC sales scenarios were corrected, including their catalogue description.

The editable example registry is `content/editorial/practical-examples.json`. Each entry stores its classification, provenance, stage guidance and original source fragment, so regeneration preserves the example facts and public anchors. `scripts/standardize_article_examples.py` applies the shared structure; catalogue sync applies it before regenerating statistics and contents navigation. A documented classification with missing or unverified provenance fails validation.

Step 5 standardised 358 existing examples across 96 pages: 238 narrative examples and 120 prompt scenarios. Generic hotel-control notes were retained as controls, not falsely treated as worked cases. All original preformatted blocks, source numbers and fragment IDs remain unchanged. Existing paragraph text is retained apart from the corrected claim that the imagined sales journey is a real case. Sixteen checks cover stage order, source-fact placement, classification requirements, hierarchy, contents, prompt copying and regeneration. Browser visual review remains pending.
