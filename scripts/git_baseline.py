"""Read an immutable Git baseline, falling back to the PR base for newer routes."""
import subprocess
import re


def show_file(commit, path, fallback='origin/master', cwd=None, text=True):
    """Use the requested historical file, or the PR base when that route is newer."""
    candidate = f'{commit}:{path}'
    present = subprocess.run(
        ['git', 'cat-file', '-e', candidate], cwd=cwd,
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    ).returncode == 0
    if not present:
        candidate = f'{fallback}:{path}'
    return subprocess.check_output(['git', 'show', candidate], cwd=cwd, text=text)


def preserves_article_words(before, after):
    """Require prior article-body tokens to remain in order while allowing UI additions."""
    from audit_seo import DOM

    def tokens(source):
        dom=DOM(source).root
        body=next((n for n in dom.all() if 'article-body' in n.attrs.get('class','').split()),None)
        if body is None:return None
        return [x.casefold().replace('’',"'") for x in re.findall(r"\w+(?:['’]\w+)*|[^\w\s]",body.text())]

    old=tokens(before);new=tokens(after)
    if old is None:return True
    if new is None:return False
    cursor=iter(new)
    return all(any(candidate==token for candidate in cursor) for token in old)
