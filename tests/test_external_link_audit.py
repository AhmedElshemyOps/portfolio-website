import sys, unittest
from unittest.mock import patch
from urllib.error import HTTPError
sys.path.insert(0,'scripts')
from audit_external_links import Links, check
class ExternalAuditTests(unittest.TestCase):
    def test_public_addresses_are_deduplicated_without_fragments(self):
        parser=Links();parser.feed('<a href="https://example.org/a#one">A</a><a href="https://example.org/a#two">B</a><a href="/profile/">Local</a><a href="https://ahmedqualityops.com/">Home</a><a href="mailto:hello@example.org">Email</a>')
        self.assertEqual(parser.urls,{'https://example.org/a'})
    def test_denial_is_not_a_broken_link(self):
        with patch('audit_external_links.urlopen',side_effect=HTTPError('https://example.org',403,'Blocked',{},None)):
            result=check(('https://example.org',['articles/example/index.html']))
        self.assertEqual(result['result'],'restricted_or_unverified')
        self.assertEqual(result['pages'],['articles/example/index.html'])
    def test_not_found_requires_review(self):
        with patch('audit_external_links.urlopen',side_effect=HTTPError('https://example.org',404,'Missing',{},None)):
            self.assertEqual(check(('https://example.org',[]))['result'],'not_found_review')
