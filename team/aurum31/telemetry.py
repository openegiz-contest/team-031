import json
import random
import time
import base64
from pathlib import Path

import requests
import paho.mqtt.client as mqtt

ROOT = Path(__file__).resolve().parents[2]
ENV_FILE = ROOT / "deploy/compose/.env"

auth_value = None

for line in ENV_FILE.read_text().splitlines():
    if line.startswith("DITTO_BASIC_AUTH="):
        auth_value = line.split("=", 1)[1].strip().strip('"').strip("'")
        break

if not auth_value:
    raise RuntimeError("DITTO_BASIC_AUTH табылмады")

session = requests.Session()
session.headers.update({
    "Authorization": f"Basic {auth_value}",
    "Content-Type": "application/json"
})

client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
client.connect("localhost", 1883, 60)
client.loop_start()

trucks = ["TRUCK-01", "TRUCK-02", "TRUCK-03", "TRUCK-04"]

SCENARIO_FILE = Path(__file__).resolve().parent / "scenario.txt"

def get_scenario():
    if SCENARIO_FILE.exists():
        value = SCENARIO_FILE.read_text().strip()
        if value in ("normal", "breakdown", "road", "rain"):
            return value
    return "normal"


try:
    while True:
        for truck in trucks:
            scenario = get_scenario()

            speed = round(random.uniform(10, 35), 1)

            if scenario == "breakdown" and truck == "TRUCK-04":
                speed = 0
            elif scenario == "road":
                speed = round(speed * 0.6, 1)
            elif scenario == "rain":
                speed = round(speed * 0.7, 1)

            properties = {
                "speed_kmh": speed,
                "load_tons": round(random.uniform(50, 95), 1),
                "fuel_percent": round(random.uniform(40, 100), 1)
            }

            thing_id = f"aurum31:{truck.lower()}"

            data = {
                "extra": {
                    "thingId": thing_id
                },
                "value": {
                    "features": {
                        "telemetry": {
                            "properties": properties
                        }
                    }
                }
            }

            # 1. MQTT -> Telegraf -> InfluxDB -> Grafana
            result = client.publish(
                f"opentwins/aurum31/{truck.lower()}",
                json.dumps(data),
                qos=1
            )
            result.wait_for_publish()

            # 2. Eclipse Ditto цифрлық егізін жаңарту
            try:
                response = session.put(
                    f"http://localhost:8080/api/2/things/{thing_id}/features/telemetry/properties",
                    json=properties,
                    timeout=5
                )
                print(
                    f"{truck}: MQTT жіберілді, Ditto HTTP {response.status_code}",
                    flush=True
                )
            except requests.RequestException as error:
                print(f"{truck}: Ditto қатесі: {error}", flush=True)

        time.sleep(5)

except KeyboardInterrupt:
    print("Симулятор тоқтатылды")

finally:
    client.loop_stop()
    client.disconnect()
    session.close()
