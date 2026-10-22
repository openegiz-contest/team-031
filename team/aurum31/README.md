# AURUM-31 — Gold Mine Digital Twin

Interactive digital twin prototype for a fictional gold mine.

## Requirements
- Docker and Docker Compose
- Python 3.9+
- Python packages: requests, paho-mqtt

## Run from repository root

1. Start OpenEgiz:
   make up

2. Create Python environment:
   python3 -m venv .venv
   .venv/bin/pip install requests paho-mqtt

3. Start telemetry in one terminal:
   .venv/bin/python team/aurum31/telemetry.py

4. Start the web server in another terminal:
   .venv/bin/python team/aurum31/server.py

5. Open http://localhost:8765

## Scenarios
- Normal operation
- Truck breakdown
- Road closure
- Rain

## Architecture
Python simulator -> MQTT -> Eclipse Ditto
Web application -> Python HTTP server -> Eclipse Ditto API

## Limitations
Synthetic data, four simulated trucks. Grafana and InfluxDB integration requires additional validation.
