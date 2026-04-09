from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[2]
ARTIFACTS = ROOT / "artifacts"
ARTIFACTS.mkdir(exist_ok=True)


def load_json(path: Path, fallback: dict) -> dict:
    if not path.exists():
        return fallback
    return json.loads(path.read_text())


def generate() -> Path:
    api = load_json(ROOT / "artifacts" / "api-results.json", {"passed": 0, "failed": 0, "skipped": 0})
    web = load_json(ROOT / "artifacts" / "web-results.json", {"passed": 0, "failed": 0, "skipped": 0})
    desktop = load_json(ROOT / "artifacts" / "desktop-results.json", {"passed": 0, "failed": 0, "skipped": 0})

    output = ARTIFACTS / f"qa-training-report-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}.pdf"
    c = canvas.Canvas(str(output), pagesize=A4)
    y = 800
    lines = [
        "QA Training Calculator - Test Summary",
        f"Generated (UTC): {datetime.now(timezone.utc).isoformat()}",
        "Environment: local/ci",
        "",
        f"API tests: passed={api['passed']} failed={api['failed']} skipped={api['skipped']}",
        f"Web tests: passed={web['passed']} failed={web['failed']} skipped={web['skipped']}",
        f"Desktop tests: passed={desktop['passed']} failed={desktop['failed']} skipped={desktop['skipped']}",
        "",
        "Defect matrix:",
        "- BUG_DIGIT_9_DISABLED",
        "- BUG_DIVISION_ALWAYS_RETURNS_2",
        "- BUG_DOUBLE_EQUALS_SHOWS_ERROR",
        "",
        "Conclusion: Use this report to drive defect triage and regression tracking."
    ]

    for line in lines:
        c.drawString(50, y, line)
        y -= 20

    c.showPage()
    c.save()
    return output


if __name__ == "__main__":
    report_path = generate()
    print(report_path)
