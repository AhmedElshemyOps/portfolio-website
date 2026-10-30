"""Protect additive career evidence and all original homepage content."""
import hashlib,json,sys,unittest
from pathlib import Path
from unittest.mock import patch
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts'))
from audit_seo import DOM
from render_career_routes import entries,homepage_section,strip_homepage_addition,render
from render_shared import render as shared

class CareerRoutes(unittest.TestCase):
    def test_routes_use_confirmed_facts_and_existing_projects(self):
        rows,profile,projects,companies=entries(ROOT)
        self.assertEqual([r['title'] for r in rows],['Travel & Tourism Operations','MICE & Event Coordination','Tourism Product Support'])
        for row in rows:
            source=(ROOT/'careers'/row['slug']/'index.html').read_text();dom=DOM(source).root
            self.assertEqual([n.text().strip() for n in dom.all('h1')],[row['title']])
            for fact in row['experience']:
                c=companies[fact['company']]
                for i in fact['contributions']:self.assertIn(c['contributions'][i],dom.text())
            self.assertIn('Portfolio demonstration',dom.text())
            self.assertIn('Production results have not been established.',dom.text())
            self.assertNotIn('Licensed Tour Guide',dom.text())
            self.assertIn(profile['work_authorisation'],dom.text())

    def test_homepage_preservation_baseline_is_unchanged(self):
        source=(ROOT/'index.html').read_text();old=json.loads((ROOT/'maintenance/measurement/preservation-contract.json').read_text())['pages']['index.html']
        dom=DOM(strip_homepage_addition(source,ROOT)).root
        self.assertEqual(hashlib.sha256(dom.text().encode()).hexdigest(),old['visibleTextSha256'])
        self.assertEqual([n.attrs.get('href','') for n in dom.all('a')],old['allLinkHrefs'])
        self.assertEqual([n.attrs['id'] for n in dom.all() if 'id' in n.attrs],old['allIds'])

    def test_exception_cannot_hide_changed_original_text(self):
        source=(ROOT/'index.html').read_text().replace('Travel &amp; Tourism Operations</h1>','Invented Job Title</h1>',1)
        old=json.loads((ROOT/'maintenance/measurement/preservation-contract.json').read_text())['pages']['index.html']
        self.assertNotEqual(hashlib.sha256(DOM(strip_homepage_addition(source,ROOT)).root.text().encode()).hexdigest(),old['visibleTextSha256'])

    def test_changed_duplicate_or_missing_addition_is_rejected(self):
        source=(ROOT/'index.html').read_text();block=homepage_section(ROOT)
        for s in [source.replace(block,''),source+block,source.replace('Experience for the work you need.','Invented guarantee')]:
            with self.assertRaises(ValueError):strip_homepage_addition(s,ROOT)

    def test_new_pages_and_homepage_are_idempotent(self):
        for rel in ['index.html']+['careers/'+r['slug']+'/index.html' for r in entries(ROOT)[0]]:
            p=ROOT/rel;s=p.read_text();self.assertEqual(shared(s,p,ROOT),s,rel)

    def test_invalid_fact_reference_is_rejected(self):
        original=Path.read_text
        def changed(path,*a,**kw):
            text=original(path,*a,**kw)
            if path==ROOT/'content/career-routes.json':
                rows=json.loads(text);rows[0]['experience'][0]['contributions']=[-1];return json.dumps(rows)
            return text
        with patch.object(Path,'read_text',changed):
            with self.assertRaises(ValueError):entries(ROOT)

if __name__=='__main__':unittest.main()
