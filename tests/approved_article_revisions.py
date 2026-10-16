"""Replay the narrowly approved 8 October article presentation revisions.

Historical SEO/evidence tests keep their original frozen sources and recorded
claim corrections. Later user-approved changes are applied explicitly:
2e8b7f7 and 4c8b49f: accommodation scope, connected reading paths and table semantics;
current quotation review: validity/tax examples, guide evidence wording and current source links.
The resulting teaching body is still compared exactly, including copy prompts.
"""
import json
import re
from pathlib import Path

from accommodation_baseline import approved_baseline, SCOPED
from apply_field_manual import parse
from improve_article_visuals import migrate
from link_article_library import render

ROOT = Path(__file__).resolve().parents[1]
ROWS = json.loads((ROOT / 'content/article-registry.json').read_text())
BY_ID = {row['id']: row for row in ROWS}
SCOPE_NOTE = '<aside class="accommodation-scope" id="accommodation-scope"><strong>Scope of this guide</strong><p>Research and applied frameworks for hotel apartments, extended stays and staycations. Illustrative models and proposed workflows should be validated against approved property procedures; projected benefits are not measured results.</p></aside>'


def _replace_approved(source, old, new):
    if old in source:
        return source.replace(old, new, 1)
    if new in source:
        return source
    raise AssertionError('Approved article text was not found')

def approved_revisions(source, slug):
    source = approved_baseline(source, slug)
    row = BY_ID[slug]
    if slug in SCOPED and row['type'] == 'Article' and 'id="accommodation-scope"' not in source:
        purpose = next(node for node in parse(source).nodes
                       if 'article-purpose' in node['attrs'].get('class', '').split())
        source = source[:purpose['end']] + SCOPE_NOTE + source[purpose['end']:]
    if slug == 'hotel-reservations-ai-toolkit':
        source = migrate(source).replace('<p>---</p>', '<hr/>')
    if slug == 'hotel-housekeeping-management-ai-toolkit':
        source = source.replace('When the website edition is published, reciprocal links should also be added from older relevant articles back to this chapter.', 'Use the related reading links and series navigation to connect this chapter with the wider operations library.')

    if slug == 'article-professional-client-tour-quotation':
        edits = [
            ('<p>A professional quotation should include validity. Prices should not remain open forever because supplier rates, ticket policies, vehicle availability and guide availability can change.</p>\n<p>Example:</p>\n<pre class="quotation-example"><code>Quotation validity: 7 days from the date of issue.</code></pre>\n<p>Or:</p>\n<pre class="quotation-example"><code>This quotation is valid until 15 March 2026 and is subject to availability at the time of confirmation.</code></pre>\n<p>VAT or tax wording should follow company policy. The quotation should be clear enough to prevent invoice disputes.</p>\n<p>Examples:</p>\n<pre class="quotation-example"><code>Prices are quoted according to the company’s VAT/tax policy.</code></pre>\n<p>Or, where approved:</p>\n<pre class="quotation-example"><code>Price is inclusive of VAT where applicable.</code></pre>',
             '<p>Set validity from the actual supplier holds, ticket conditions, operating capacity and the company’s approved terms. A seven-day period is an example only, not a recommended default; show a specific expiry date, time and time zone, and state any material availability condition.</p>\n<p>Example wording (replace with the approved offer terms):</p>\n<pre class="quotation-example"><code>Offer valid until [date, time and time zone]. Services and tickets remain subject to the confirmed supplier terms stated in this offer.</code></pre>\n<p>Tax wording must match the transaction, customer type and applicable jurisdiction. Company policy cannot override tax or consumer-pricing rules. For a Dutch consumer offer, the ACM says the displayed sales price includes VAT and unavoidable additional costs. For UAE VAT obligations, use current Federal Tax Authority guidance and have the treatment reviewed by the responsible tax professional.</p>\n<p>Examples for adaptation only:</p>\n<pre class="quotation-example"><code>Total price: [amount and currency], including applicable VAT and unavoidable charges.</code></pre>\n<p>Use different wording only when the applicable rules permit it and finance has approved the treatment. The UAE FTA publishes its <a href="https://tax.gov.ae/en/taxes/vat/guides.references.aspx">current VAT guides and references</a>; the Dutch ACM explains <a href="https://www.acm.nl/nl/verkoop-aan-consumenten/consumenten-informeren/prijzen-vermelden">consumer price display requirements</a>. These sources do not decide the tax treatment of an individual cross-border transaction.</p>'),
            ('<p>Below is a simple example of how the client-facing quotation may look.</p>\n<p><strong>Educational Visual 1 — Client Quotation Layout</strong></p>',
             '<p><strong>Training example only:</strong> the itinerary, AED 3,250 amount, ticket inclusions, guide status, seven-day validity and availability wording below are illustrative, not a live offer or verified supplier commitment. Before sending a real quote, verify each item against current supplier evidence, the applicable guide-licensing rules and approved company terms.</p>\n<p><strong>Educational Visual 1 — Client Quotation Layout</strong></p>'),
            ('Private Abu Dhabi Cultural City Tour with Licensed Guide','Private Abu Dhabi Cultural City Tour with an English-speaking tourist guide whose current licence is verified for the operating jurisdiction'),
            ('- Licensed English-speaking guide','- English-speaking tourist guide; verify current licence for the operating jurisdiction'),
            ('This quotation is valid for 7 days and subject to availability at the time of confirmation.','Offer valid until [date, time and time zone], subject to the approved terms and confirmed supplier availability.'),
            ('Guests are requested to follow cultural site guidelines and dress-code requirements where applicable.','Check current visitor guidance and dress requirements directly with each cultural site before travel.'),
            ('<p>This example is clear, professional and easy for the client to understand.</p>',
             '<p>The example shows a clear information sequence. Its commercial terms and factual inputs must be replaced with verified, current details before issue. DCT Abu Dhabi explains its <a href="https://dct.gov.ae/en/what.we.do/tourism/industry.initiatives.emiratisation/tourist.guide.training.and.licensing.programme.aspx">tourist-guide training and licensing programme</a>; verify the individual guide’s current licence rather than relying on a generic sample line.</p>'),
            ('This depends on company policy and supplier conditions. Many quotations use a limited validity period, such as 7 days, to protect against changes in availability, ticket policy or supplier rates.',
             'There is no universal validity period. Set it from the actual supplier hold, ticket conditions and approved company terms, then show a clear expiry date and any material availability conditions.')
        ]
        for old, new in edits:
            source = _replace_approved(source, old, new)
    if slug == 'article-transport-tickets-vat-gratuities':
        source = re.sub(r'<p>VAT wording must follow.*?</p>', lambda _m: "<p>VAT wording must follow applicable tax and consumer-pricing rules, with finance approval for the specific transaction; company policy cannot override the law. Consumer-facing advertised prices generally need to include applicable VAT. See <a href=\"https://tax.gov.ae/en/taxes/vat/guides.references.aspx\">UAE Federal Tax Authority guidance</a> and <a href=\"https://www.acm.nl/nl/verkoop-aan-consumenten/consumenten-informeren/prijzen-vermelden\">Dutch ACM price-display guidance</a>. The FTA’s <a href=\"https://tax.gov.ae/DataFolder/Files/Pdf/2022/Get%20to%20know%20your%20Tax%20Obligations.pdf\">2022 Tax Obligations guide</a> remains available as archived background; it is not a substitute for current guidance. The wording examples below are illustrative; use an exclusive-price version only where permitted for that customer and transaction.</p>", source, count=1, flags=re.S)
    return render(source, row, ROWS)
