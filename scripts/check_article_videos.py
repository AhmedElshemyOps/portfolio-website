"""Check local placements and optionally check public YouTube player availability."""
import argparse
from datetime import datetime, timezone
from html import unescape
import json
from pathlib import Path
import re
import urllib.request
from apply_field_manual import parse

ROOT = Path(__file__).resolve().parents[1]
PLAYER_BASE = "https://www.youtube-nocookie.com/embed/"


def availability(video_id, fetch=None):
    def request(url):
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=20) as response:
            return response.read().decode()

    try:
        source = (fetch or request)("https://www.youtube.com/watch?v=" + video_id + "&hl=en")
        match = re.search(r"var ytInitialPlayerResponse\s*=\s*(.*?);(?:var |</script>)", source)
        if not match:
            return "unknown", "YouTube did not return readable player metadata."
        data = json.loads(match[1])
        status = data.get("playabilityStatus", {})
        reason = status.get("reason", "")
        if status.get("status") == "LOGIN_REQUIRED" or re.search(r"bot|sign in|confirm your age", reason, re.I):
            return "unknown", reason or "Sign-in required."
        if status.get("playableInEmbed") is True:
            return "available", "Embedding allowed in public player metadata."
        if status.get("playableInEmbed") is False:
            return "unavailable", reason or "YouTube reports embedding disabled."
        if status.get("status") in {"ERROR", "UNPLAYABLE"} and reason:
            return "unavailable", reason
        return "unknown", reason or "No definitive embed status returned."
    except Exception as error:
        return "unknown", str(error)


def clean_text(markup):
    plain = re.sub(r"<[^>]+>", "", markup)
    return " ".join(unescape(plain).replace("#", "").split())


def check(root=ROOT, online=False, lookup=None):
    matches = json.loads((root / "content/article-video-matches.json").read_text())
    inventory = json.loads((root / "content/youtube-videos.json").read_text())["videos"]
    issues, results, seen = [], [], set()
    tracked, public = {}, {}

    for video in inventory:
        video_id = video["videoId"]
        if not re.fullmatch(r"[A-Za-z0-9_-]{11}", video_id):
            issues.append("Invalid inventory video ID")
            continue
        if video.get("privacyStatus") not in {"public", "unknown"}:
            continue
        if video_id in tracked:
            label = (
                "duplicate public inventory record"
                if video.get("privacyStatus") == "public"
                and tracked[video_id].get("privacyStatus") == "public"
                else "duplicate inventory record"
            )
            issues.append(video_id + ": " + label)
        tracked[video_id] = video
        if video.get("privacyStatus") == "public":
            public[video_id] = video
        if video.get("embedStatus") not in {"available", "unavailable", "unknown"}:
            issues.append(video_id + ": invalid recorded embed status")

    for match in matches:
        video_id, relative = match["videoId"], match["article"]
        article = root / relative
        if not re.fullmatch(r"articles/[A-Za-z0-9_-]+/index\.html", relative):
            issues.append(video_id + ": unsafe article path")
            continue
        record = tracked.get(video_id)
        if record is None:
            issues.append(video_id + ": placement has no inventory record")
        elif record.get("privacyStatus") == "private" or record.get("embedStatus") == "unavailable":
            issues.append(video_id + ": placement lacks confirmed embedding permission")
        pair = (video_id, relative)
        if pair in seen:
            issues.append(video_id + ": duplicate manifest placement in " + relative)
        seen.add(pair)
        if not article.is_file():
            issues.append(video_id + ": article missing")
            continue

        source = article.read_text()
        nodes = parse(source).nodes
        frames = [
            node for node in nodes
            if node["tag"] == "iframe"
            and node["attrs"].get("src", "").split("?")[0] == PLAYER_BASE + video_id
        ]
        if len(frames) != 1:
            issues.append(video_id + ": expected exactly one embed in " + relative)
            continue

        frame = frames[0]
        marker = False
        ancestor = frame
        while ancestor:
            if (
                ancestor["attrs"].get("id") == "video-" + video_id
                and ancestor["attrs"].get("data-youtube-id") == video_id
            ):
                marker = True
                break
            ancestor = ancestor["parent"]
        if not marker:
            preceding = source[:frame["parent"]["start"]]
            paragraphs = re.findall(r"<p\b[^>]*>(.*?)</p>", preceding, re.I | re.S)
            actual = clean_text(paragraphs[-1]) if paragraphs else ""
            if actual != match.get("afterParagraph", ""):
                issues.append(video_id + ": paragraph changed; editorial review required")

    placements = {}
    for article in (root / "articles").glob("*/index.html"):
        for node in parse(article.read_text()).nodes:
            src = node["attrs"].get("src", "")
            if node["tag"] != "iframe" or "youtube" not in src:
                continue
            video_id = src.rsplit("/", 1)[-1].split("?")[0]
            relative = article.relative_to(root).as_posix()
            placements.setdefault(video_id, []).append(relative)
            if (video_id, relative) not in seen:
                issues.append(relative + ": unmapped YouTube embed")
    for video_id, paths in placements.items():
        duplicates = [path for path in set(paths) if paths.count(path) > 1]
        if duplicates:
            issues.append(video_id + ": duplicate embeds within article: " + ", ".join(duplicates))

    library = root / "learn/videos/index.html"
    library_nodes = parse(library.read_text()).nodes if library.is_file() else []
    library_frames = [
        node["attrs"].get("src", "").split("?")[0].rsplit("/", 1)[-1]
        for node in library_nodes
        if node["tag"] == "iframe" and "youtube" in node["attrs"].get("src", "")
    ]
    article_ids = {match["videoId"] for match in matches}
    by_id = {match["videoId"]: match for match in matches}

    for video_id, video in tracked.items():
        expected = video["embedStatus"]
        library_count = library_frames.count(video_id)
        required = 0 if video_id in article_ids or expected != "available" else 1
        if library_count != required:
            issues.append(video_id + ": incorrect library player coverage")
        direct = "https://www.youtube.com/watch?v=" + video_id
        if video.get("privacyStatus") == "public" and not any(
            node["tag"] == "a" and node["attrs"].get("href") == direct for node in library_nodes
        ):
            issues.append(video_id + ": library direct video link missing")
        status, reason = (
            (lookup or availability)(video_id)
            if online else ("not_checked", "Run with --online to check public YouTube availability.")
        )
        results.append({
            "videoId": video_id,
            "article": by_id.get(video_id, {}).get("article"),
            "destination": "article" if video_id in article_ids else "library" if required else "direct-link",
            "privacyStatus": video.get("privacyStatus"),
            "recordedEmbedStatus": expected,
            "status": status,
            "reason": reason,
            "embeddingRegression": online and expected == "available" and status == "unavailable",
            "embeddingUnavailable": online and video_id in article_ids and status == "unavailable",
            "embeddingRecovery": online and expected != "available" and status == "available",
        })

    for video_id in library_frames:
        if video_id not in public:
            issues.append(video_id + ": unmapped library player")
    return {
        "checkedAt": datetime.now(timezone.utc).isoformat(),
        "online": online,
        "issues": issues,
        "inventoryCount": len(public),
        "supplementalUnknownCount": sum(
            1 for video in tracked.values() if video.get("privacyStatus") == "unknown"
        ),
        "articlePlacementCount": len(matches),
        "videos": results,
    }


def exit_code(result):
    if result["issues"] or any(
        video["embeddingRegression"] or video["embeddingUnavailable"]
        for video in result["videos"]
    ):
        return 1
    if result["online"] and any(video["status"] == "unknown" for video in result["videos"]):
        return 2
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--online", action="store_true")
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()
    result = check(online=args.online)
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(result, indent=2))
    return exit_code(result)


if __name__ == "__main__":
    raise SystemExit(main())
