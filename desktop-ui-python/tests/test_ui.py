import pytest
from desktop_ui.app import CalculatorWidget


class DummyResponse:
    def __init__(self, ok=True, result=4):
        self.ok = ok
        self._result = result

    def json(self):
        return {"result": self._result} if self.ok else {"error": "bad"}


@pytest.fixture
def widget(qtbot):
    w = CalculatorWidget()
    qtbot.addWidget(w)
    return w


def test_ac_reset(widget):
    widget.press("1")
    widget.press("AC")
    assert widget.display_label.text() == "0"


def test_double_equals_defect(widget, monkeypatch):
    monkeypatch.setattr(widget, "bug_double_equals", True)
    monkeypatch.setattr("desktop_ui.app.requests.post", lambda *args, **kwargs: DummyResponse(ok=True, result=4))
    widget.press("2")
    widget.press("+")
    widget.press("2")
    widget.press("=")
    widget.press("=")
    assert widget.display_label.text() == "ERROR"
