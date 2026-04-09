# QA Training Calculator

A compact, production-structured training platform for development, QA, debugging, CI/CD, reporting, and defect triage exercises.

## Architecture

```mermaid
flowchart LR
  Web[Web UI (React)] --> API[API Service (Express + Zod)]
  Desktop[Desktop UI (PySide6)] --> API
  API --> Engine[Calc Engine (TS package)]
  API --> Router[Event Router]
  Router --> Rabbit[RabbitMQ (default)]
  Router --> MQTT[MQTT adapter]
  Router --> ActiveMQ[ActiveMQ adapter]
  Tests[Test Suites] --> Report[Report Service (ReportLab)]
```

## Components

- `packages/calc-engine`: Shared parsing/evaluation logic and session state machine.
- `services/api-service`: REST orchestration layer + event publication.
- `apps/web-ui`: Retro calculator UI + telemetry pane.
- `desktop-ui-python`: PySide6 desktop UI with similar UX to web app.
- `services/report-service`: Aggregates outputs and generates PDF reports.

## Local Setup

1. Copy environment values:
   ```bash
   cp .env.example .env
   ```
2. Install JavaScript dependencies:
   ```bash
   npm install
   ```
3. Install Python dependencies:
   ```bash
   pip install -r desktop-ui-python/requirements.txt
   ```
4. Start services and brokers:
   ```bash
   docker compose up
   ```

## Run Without Docker

```bash
npm run dev:api
npm run dev:web
python desktop-ui-python/desktop_ui/app.py
```

## Defect Flags

- `BUG_DIGIT_9_DISABLED=true`: key `9` is ignored.
- `BUG_DIVISION_ALWAYS_RETURNS_2=true`: all division operations return `2`.
- `BUG_DOUBLE_EQUALS_SHOWS_ERROR=true`: pressing `=` twice yields `ERROR`.

Set them in `.env` to create deterministic training scenarios.

## Testing

```bash
npm test
npm run test:web:e2e
pytest desktop-ui-python/tests -q
python services/report-service/generate_report.py
```

## Known Training Defects

This project intentionally includes deterministic defects behind feature flags:

1. Digit 9 disabled
2. Division always returns 2
3. Double equals shows ERROR

## How to Extend This Project for Additional QA Exercises

- Add seeded defect profiles (`profile-basic`, `profile-regression`, `profile-chaos-lite`).
- Add offline-mode desktop state divergence checks.
- Add contract tests that enforce strict event schema versioning.
- Add fault-injected broker outages for recovery drills.

## Artifacts

- Playwright report and screenshots (on failure)
- Pytest results
- Generated PDF summary in `artifacts/`
