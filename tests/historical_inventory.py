"""Keep historical comparisons scoped to the immutable inventory they describe."""
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]


def historical_articles(revision):
    paths = subprocess.check_output(
        ["git", "ls-tree", "-r", "--name-only", revision, "--", "articles"],
        cwd=ROOT, text=True,
    ).splitlines()
    articles = [ROOT / name for name in paths if name.endswith(".html")]
    if not articles:
        raise ValueError(f"No historical article fixtures at {revision}")
    return articles


LATER_ARTICLES = {
    "articles/heijunka-tourism-operations/index.html",
    "articles/yamazumi-chart-tourism-operations/index.html",
}
