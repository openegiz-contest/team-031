# AURUM-31 — Gold Mine Digital Twin (prototype)

Team concept: fictional open-pit gold mine, chief engineer, improve fleet utilization and production. Synthetic assumptions only.

## Local demo

Python 3.9+; no dependencies:

```bash
python team/aurum31/server.py
```

Open http://localhost:8765 in your browser. Buttons trigger simulated truck breakdown, road closure, and rain. Export the current estimate as CSV.

## Model

Four 55-ton trucks; baseline 16-minute haul cycle; 85% utilization. Approximate tonnes/hour = available trucks × 55 × 60 / cycle_minutes × 0.85. Eight-hour shift estimate. This is an illustrative calculation, not a calibrated mining model.

## Known limitations

This is a standalone 2D prototype, **not yet connected** to Eclipse Ditto, MQTT, InfluxDB, Grafana, or the contest Stand. It does not qualify as a finished OpenEgiz submission. No live industrial data or machine-learning predictions. See root `SUBMISSION.md`.
