# AURUM-31 — Gold Mine Digital Twin

## OpenEgiz цифрлық шахта жобасы

AURUM-31 — алтын кенішінің цифрлық егізі.

Жоба 4 самосвалдың жұмысын модельдейді және
Eclipse Ditto, MQTT, InfluxDB технологияларын қолданады.

## Жобаны іске қосу

1. OpenEgiz платформасын іске қосу:
   make up

2. Python ортасын дайындау:
   python3 -m venv .venv
   .venv/bin/pip install requests paho-mqtt

3. Телеметрияны іске қосу:
   .venv/bin/python team/aurum31/telemetry.py

4. Жаңа терминалда веб-серверді іске қосу:
   .venv/bin/python team/aurum31/server.py

5. Браузерден ашу:
   http://localhost:8765

## Сценарийлер

- Қалыпты жұмыс
- Самосвалдың бұзылуы
- Жолдың жабылуы
- Жаңбыр

## Жоба файлдары

- team/aurum31/
- SUBMISSION.md
- presentation.pdf

## Тексеру

make smoke

## OpenEgiz платформасының бастапқы нұсқаулығы

README-original.md
