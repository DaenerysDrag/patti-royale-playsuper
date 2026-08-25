#!/usr/bin/env python3
"""SUBMISSION.md -> a print-clean PDF.

markdown -> styled HTML -> Chrome headless --print-to-pdf. No pandoc, no LaTeX, no network:
fonts are system faces so a blocked CDN can't change the layout.

  python3 tools/md2pdf.py [input.md] [output.pdf]
"""
import html as _html
import re
import subprocess
import sys
from pathlib import Path

import markdown

ROOT = Path(__file__).resolve().parent.parent
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

CSS = """
@page { size: A4; margin: 15mm 14mm 16mm; }

* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body {
  margin: 0;
  font: 9.6pt/1.52 "Helvetica Neue", Helvetica, Arial, sans-serif;
  color: #16211D;
  background: #fff;
}

/* ── masthead ─────────────────────────────────────────────────────────── */
h1 {
  font-size: 21pt; line-height: 1.12; letter-spacing: -.4pt;
  margin: 0 0 2mm; color: #0B3A2B; font-weight: 800;
}
h1 + p { margin: 0 0 2mm; font-size: 9pt; color: #4A5A54; }
h1 + p + p { margin: 0 0 2mm; font-size: 9pt; }
h1 + p + p + p { margin: 0 0 4mm; font-size: 8.6pt; color: #4A5A54; }

h2 {
  font-size: 12.5pt; font-weight: 800; letter-spacing: -.2pt;
  margin: 5.6mm 0 2.2mm; padding-bottom: 1.2mm;
  border-bottom: .5pt solid #D3DDD8; color: #0B3A2B;
  break-after: avoid; page-break-after: avoid;
}
h3 {
  font-size: 10pt; font-weight: 700; margin: 4.5mm 0 1.8mm; color: #1B3B31;
  break-after: avoid; page-break-after: avoid;
}

p { margin: 0 0 2.1mm; }
strong { font-weight: 700; color: #0E1A16; }
em { color: #3A4A44; }
a { color: #0B5C42; text-decoration: none; border-bottom: .4pt solid #A8CCBD; }

ul, ol { margin: 0 0 2.6mm; padding-left: 5mm; }
li { margin-bottom: 1mm; break-inside: avoid; page-break-inside: avoid; }
/* A numbered set of questions reads as one unit — never split it across a page. */
ol { break-inside: avoid; page-break-inside: avoid; }

hr { border: 0; border-top: .5pt solid #DCE5E1; margin: 3.6mm 0; }

/* ── tables: the backbone of this document ────────────────────────────── */
table {
  width: 100%; border-collapse: collapse; margin: 0 0 2.9mm;
  font-size: 8.5pt; line-height: 1.4;
  break-inside: auto; page-break-inside: auto;
}
thead { display: table-header-group; }
th {
  text-align: left; font-weight: 700; font-size: 7.6pt;
  text-transform: uppercase; letter-spacing: .35pt; color: #0B3A2B;
  background: #EEF4F1; border-bottom: .7pt solid #BFD3CB;
  padding: 1.5mm 2.2mm;
}
td { padding: 1.5mm 2.2mm; border-bottom: .4pt solid #E4EBE8; vertical-align: top; }
tr { break-inside: avoid; page-break-inside: avoid; }
tbody tr:nth-child(even) td { background: #FAFCFB; }
td:first-child { color: #0E1A16; }

/* ── code ─────────────────────────────────────────────────────────────── */
code {
  font: 8.2pt/1.4 "SF Mono", Menlo, Consolas, monospace;
  background: #F1F5F3; padding: .3mm 1mm; border-radius: 1.2mm; color: #14402F;
}
pre {
  background: #F5F8F6; border: .5pt solid #DCE5E1; border-left: 2pt solid #0B5C42;
  border-radius: 1.5mm; padding: 2.8mm 3.2mm; margin: 0 0 3.2mm;
  overflow: hidden; break-inside: avoid; page-break-inside: avoid;
}
pre code {
  background: none; padding: 0; font-size: 7.9pt; line-height: 1.48;
  white-space: pre-wrap; word-break: break-word; color: #15302A;
}

/* ── pull quotes: the thesis lines ────────────────────────────────────── */
blockquote {
  margin: 0 0 3.2mm; padding: 2.6mm 3.4mm;
  background: #F2F8F4; border-left: 2.2pt solid #C9A227;
  border-radius: 0 1.5mm 1.5mm 0; break-inside: avoid;
}
blockquote p { margin: 0; font-size: 9.6pt; font-weight: 600; color: #0E2A20; }
blockquote p + p { margin-top: 1.6mm; font-weight: 400; }

/* keep a heading with the block that follows it */
h2 + p, h2 + table, h2 + ul, h2 + blockquote, h3 + p, h3 + table { break-before: avoid; }
"""


def build_html(md_text: str, title: str) -> str:
    body = markdown.markdown(
        md_text,
        extensions=["tables", "fenced_code", "sane_lists", "attr_list"],
        output_format="html5",
    )
    # A leading "# H1" already carries the title; drop the duplicate <hr> right after the masthead.
    body = re.sub(r"(</p>\s*)<hr\s*/?>", r"\1", body, count=1)
    return (
        "<!doctype html><html lang='en'><head><meta charset='utf-8'>"
        f"<title>{_html.escape(title)}</title><style>{CSS}</style></head>"
        f"<body>{body}</body></html>"
    )


def main() -> int:
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "SUBMISSION.md"
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT / (
        "Karan-Makol-PlaySuper-Product-Associate-Assignment.pdf")

    if not src.exists():
        print(f"missing input: {src}")
        return 1
    if not Path(CHROME).exists():
        print(f"Chrome not found at {CHROME}")
        return 1

    tmp = ROOT / "tools" / "_submission.print.html"
    tmp.write_text(build_html(src.read_text(encoding="utf-8"), src.stem), encoding="utf-8")

    cmd = [
        CHROME, "--headless=new", "--disable-gpu", "--no-sandbox",
        "--no-pdf-header-footer", "--virtual-time-budget=6000",
        f"--print-to-pdf={out}", tmp.as_uri(),
    ]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if not out.exists() or out.stat().st_size == 0:
        print("PDF not produced\n", r.stdout, r.stderr)
        return 1

    tmp.unlink(missing_ok=True)
    print(f"✓ {out.name}  ({out.stat().st_size / 1024:.0f} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
