"""Fail publication if an article copy control has missing or empty content."""
from html.parser import HTMLParser
from pathlib import Path


class PromptParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.targets = []
        self.ids = {}
        self.active = []
        self.errors = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'data-copy-target' in attrs:
            self.targets.append(attrs['data-copy-target'])
        if tag == 'pre' or tag == 'code':
            identifier = attrs.get('id')
            if identifier:
                if identifier in self.ids:
                    self.errors.append(f'Duplicate template id: {identifier}')
                self.ids[identifier] = ''
            self.active.append((tag, identifier))

    def handle_endtag(self, tag):
        if self.active and self.active[-1][0] == tag:
            self.active.pop()

    def handle_data(self, data):
        for tag, identifier in self.active:
            if identifier:
                self.ids[identifier] += data

    def validate(self):
        for target in self.targets:
            if not target or target not in self.ids:
                self.errors.append(f'Missing copy template: {target!r}')
            elif not self.ids[target].strip():
                self.errors.append(f'Empty copy template: {target}')
        if self.errors:
            raise ValueError('; '.join(self.errors))


def validate(root):
    count = 0
    errors = []
    for article in sorted((Path(root) / 'articles').glob('*/index.html')):
        parser = PromptParser()
        parser.feed(article.read_text())
        count += len(parser.targets)
        try:
            parser.validate()
        except ValueError as error:
            errors.append(f'{article.relative_to(root)}: {error}')
    if errors:
        raise ValueError('\n'.join(errors))
    return count


if __name__ == '__main__':
    root = Path(__file__).resolve().parents[1]
    print(f'Validated {validate(root)} article copy targets.')
