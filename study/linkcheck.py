#!/usr/bin/env python3
"""Link check for the plaidcat site.

Scans every .html file in the bd/ site folder, extracts href/src values,
and verifies that repository-local targets exist. External URLs (http, https,
mailto) are skipped; fragments are checked against id attributes in the
target page. Usage: linkcheck.py [report-file]. Writes one
"page -> missing-target" line per defect to the report file (stdout when
omitted) and exits 1 when any defect exists, 0 otherwise.
"""
import re
import sys
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent / "bd"
ATTR = re.compile(r"""(?:href|src)\s*=\s*["']([^"']+)["']""", re.I)
IDS = re.compile(r"""id\s*=\s*["']([^"']+)["']""", re.I)


def main() -> int:
    report = open(sys.argv[1], "w") if len(sys.argv) > 1 else sys.stdout
    pages = sorted(SITE.glob("*.html"))
    ids = {p.name: set(IDS.findall(p.read_text(encoding="utf-8"))) for p in pages}
    defects = []
    for page in pages:
        for target in ATTR.findall(page.read_text(encoding="utf-8")):
            if target.startswith(("http://", "https://", "mailto:", "data:")):
                continue
            resource, _, frag = target.partition("#")
            path, _, _query = resource.partition("?")
            if path:
                resolved = (SITE / path).resolve()
                if not resolved.exists():
                    defects.append(f"{page.name} -> {target}")
                    continue
                if frag and resolved.suffix == ".html":
                    if frag not in ids.get(resolved.name, set()):
                        defects.append(f"{page.name} -> {target}")
            elif frag and frag not in ids[page.name]:
                defects.append(f"{page.name} -> {target}")
    for line in defects:
        print(line, file=report)
    if report is not sys.stdout:
        report.close()
    return 1 if defects else 0


if __name__ == "__main__":
    sys.exit(main())
