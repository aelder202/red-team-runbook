"""Run lightweight, dependency-free quality checks for the MkDocs content."""

from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
MKDOCS_CONFIG = ROOT / "mkdocs.yml"

FENCE_RE = re.compile(r"```.*?```", re.DOTALL)
MARKDOWN_LINK_RE = re.compile(r"\[[^\]]+\]\(([^)]+)\)")
H1_RE = re.compile(r"^# (?!#)", re.MULTILINE)
HTML_H1_RE = re.compile(r"<h1\b", re.IGNORECASE)
HTML_HREF_RE = re.compile(r'href=["\']([^"\']+)["\']', re.IGNORECASE)
NAV_PATH_RE = re.compile(r"(?P<path>[A-Za-z0-9_./-]+\.md)\s*$", re.MULTILINE)

COMMON_MISTAKES = {
    r"\bacess\b": "access",
    r"\bpriviledge\b": "privilege",
    r"\brecieve\b": "receive",
    r"\bseperate\b": "separate",
    r"\bteh\b": "the",
}

MOJIBAKE_MARKERS = ("\ufffd", "â€", "Â", "Ã")


def relative(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def strip_code_fences(text: str) -> str:
    return FENCE_RE.sub("", text)


def target_exists(source: Path, target: str) -> bool:
    resolved = (source.parent / target).resolve()
    if resolved.exists():
        return True

    if target.endswith("/"):
        markdown_target = (source.parent / f"{target.rstrip('/')}.md").resolve()
        return markdown_target.exists()

    return False


def audit_markdown_file(path: Path) -> list[str]:
    errors: list[str] = []
    text = path.read_text(encoding="utf-8")
    prose = strip_code_fences(text)

    h1_count = len(H1_RE.findall(prose)) + len(HTML_H1_RE.findall(prose))
    if h1_count != 1:
        errors.append(f"{relative(path)}: expected exactly one H1, found {h1_count}")

    for marker in MOJIBAKE_MARKERS:
        if marker in text:
            errors.append(f"{relative(path)}: possible encoding corruption ({marker!r})")

    for pattern, replacement in COMMON_MISTAKES.items():
        match = re.search(pattern, prose, re.IGNORECASE)
        if match:
            line = prose.count("\n", 0, match.start()) + 1
            errors.append(
                f"{relative(path)}:{line}: '{match.group(0)}' should likely be '{replacement}'"
            )

    for match in MARKDOWN_LINK_RE.finditer(prose):
        raw_target = match.group(1).strip()
        target = raw_target.split("#", 1)[0].split("?", 1)[0]
        if not target or target.startswith(("http://", "https://", "mailto:", "#")):
            continue

        if not target_exists(path, target):
            line = prose.count("\n", 0, match.start()) + 1
            errors.append(f"{relative(path)}:{line}: broken relative link: {raw_target}")

    for match in HTML_HREF_RE.finditer(prose):
        raw_target = match.group(1).strip()
        target = raw_target.split("#", 1)[0].split("?", 1)[0]
        if not target or target.startswith(("http://", "https://", "mailto:", "#")):
            continue

        if not target_exists(path, target):
            line = prose.count("\n", 0, match.start()) + 1
            errors.append(f"{relative(path)}:{line}: broken relative href: {raw_target}")

    return errors


def audit_navigation(markdown_files: list[Path]) -> list[str]:
    errors: list[str] = []
    config = MKDOCS_CONFIG.read_text(encoding="utf-8")
    nav_paths = {match.group("path") for match in NAV_PATH_RE.finditer(config)}
    docs_paths = {path.relative_to(DOCS).as_posix() for path in markdown_files}

    for missing in sorted(docs_paths - nav_paths):
        errors.append(f"docs/{missing}: page is not present in mkdocs.yml navigation")

    for stale in sorted(nav_paths - docs_paths):
        errors.append(f"mkdocs.yml: navigation target does not exist: {stale}")

    return errors


def main() -> int:
    markdown_files = sorted(DOCS.rglob("*.md"))
    errors: list[str] = []

    for path in markdown_files:
        errors.extend(audit_markdown_file(path))

    errors.extend(audit_navigation(markdown_files))

    if errors:
        print("Content audit failed:\n")
        for error in errors:
            print(f"- {error}")
        return 1

    print(f"Content audit passed for {len(markdown_files)} Markdown files.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
