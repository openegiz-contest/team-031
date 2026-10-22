from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse
import os
import json
import requests

BASE = Path(__file__).resolve().parent
ENV = BASE.parents[1] / "deploy/compose/.env"

def get_auth():
    for line in ENV.read_text().splitlines():
        if line.startswith("DITTO_BASIC_AUTH="):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise RuntimeError("Ditto авторизациясы табылмады")

class Handler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/api/scenario":
            self.send_error(404)
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length > 1024:
                self.send_error(413)
                return

            data = json.loads(self.rfile.read(length))
            scenario = data.get("scenario")

            if scenario not in ("normal", "breakdown", "road", "rain"):
                self.send_error(400, "Invalid scenario")
                return

            (BASE / "scenario.txt").write_text(scenario)
            body = json.dumps({"scenario": scenario}).encode()

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        except (ValueError, TypeError, json.JSONDecodeError):
            self.send_error(400, "Invalid JSON")

    def do_GET(self):
        if urlparse(self.path).path != "/api/trucks":
            return super().do_GET()

        trucks = []
        try:
            for i in range(1, 5):
                thing_id = f"aurum31:truck-{i:02d}"
                response = requests.get(
                    f"http://localhost:8080/api/2/things/{thing_id}/features/telemetry/properties",
                    headers={"Authorization": f"Basic {get_auth()}"},
                    timeout=3
                )
                response.raise_for_status()
                trucks.append({
                    "id": f"TRUCK-{i:02d}",
                    **response.json()
                })

            body = json.dumps(trucks).encode("utf-8")
            self.send_response(200)
        except Exception as error:
            print("Ditto API қатесі:", error)
            body = json.dumps({"error": "Ditto деректерін алу мүмкін болмады"}).encode("utf-8")
            self.send_response(502)

        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

if __name__ == "__main__":
    os.chdir(BASE)
    print("AURUM-31: http://localhost:8765")
    ThreadingHTTPServer(("127.0.0.1", 8765), Handler).serve_forever()
