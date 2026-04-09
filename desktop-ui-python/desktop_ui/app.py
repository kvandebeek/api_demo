from __future__ import annotations

import os
import requests
from PySide6.QtWidgets import QApplication, QGridLayout, QLabel, QPushButton, QVBoxLayout, QWidget

BUTTONS = [
    ["AC", "(", ")", "/"],
    ["7", "8", "9", "*"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
    ["0", ".", "="],
]


class CalculatorWidget(QWidget):
    def __init__(self) -> None:
        super().__init__()
        self.api_base = os.getenv("WEB_API_BASE_URL", "http://localhost:3001")
        self.bug_digit_9_disabled = os.getenv("BUG_DIGIT_9_DISABLED", "false") == "true"
        self.bug_double_equals = os.getenv("BUG_DOUBLE_EQUALS_SHOWS_ERROR", "false") == "true"
        self.display = "0"
        self.last_action = "input"
        self._setup_ui()

    def _setup_ui(self) -> None:
        self.setWindowTitle("QA Training Calculator")
        root = QVBoxLayout(self)
        self.display_label = QLabel(self.display)
        self.display_label.setObjectName("display")
        self.display_label.setStyleSheet("background:#7ebb8c;color:#0f2014;padding:8px;font-size:28px;border:2px inset #506f57;")
        root.addWidget(self.display_label)

        grid = QGridLayout()
        for row, row_vals in enumerate(BUTTONS):
            for col, label in enumerate(row_vals):
                button = QPushButton(label)
                button.clicked.connect(lambda checked=False, token=label: self.press(token))
                if label == "AC":
                    button.setStyleSheet("background:#ff8a3c;")
                elif label == "=":
                    button.setStyleSheet("background:#151515;color:#fff;")
                grid.addWidget(button, row, col)
        root.addLayout(grid)

    def press(self, token: str) -> None:
        if token == "AC":
            self.display = "0"
            self.last_action = "input"
            self._refresh()
            return

        if token == "=":
            if self.bug_double_equals and self.last_action == "equals":
                self.display = "ERROR"
                self.last_action = "input"
                self._refresh()
                return
            try:
                response = requests.post(
                    f"{self.api_base}/calculate", json={"expression": self.display}, timeout=3
                )
                payload = response.json()
                if not response.ok:
                    raise ValueError(payload.get("error", "API error"))
                self.display = str(payload["result"])
                self.last_action = "equals"
            except Exception:
                self.display = "ERROR"
            self._refresh()
            return

        if token == "9" and self.bug_digit_9_disabled:
            return

        self.display = token if self.display in {"0", "ERROR"} else f"{self.display}{token}"
        self.last_action = "input"
        self._refresh()

    def _refresh(self) -> None:
        self.display_label.setText(self.display)


def run() -> None:
    app = QApplication([])
    widget = CalculatorWidget()
    widget.show()
    app.exec()


if __name__ == "__main__":
    run()
