# 🚀 Hackathon Manager – Docker Setup

Diese Umgebung dient der lokalen Entwicklung und dem Testen des Hackathon-Manager-Projekts (Frontend + Backend + API-Dienste).

## 📁 Projektstruktur

```
.
├── backend
│   └── volumes
│       ├── config
│       │   ├── .env.dev
│       │   ├── .env.prod
│       │   └── .env.stage
│       ├── data
│       │   ├── Projects.js
│       │   ├── Teams.js
│       │   └── User.js
│       └── database
│           ├── hackathon.dev.db
│           ├── hackathon.prod.db
│           └── hackathon.stg.db
├── docker-compose.yaml
└── frontend
    ├── config
    │   ├── .env.dev
    │   ├── .env.prod
    │   └── .env.stage
    └── nginx
        └── default.conf

```

## 🧱 Docker-Container

### 🔹 Dozzle – Log Viewer

- **Image:** `amir20/dozzle:latest`
- **Zugriff:** [http://localhost:8081](http://localhost:8081)
- **Zweck:** Webinterface für Container-Logs

```yaml
dozzle:
  image: amir20/dozzle:latest
  container_name: dozzle
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock
  ports:
    - "8081:8080"
```

### 🔹 Backend – Hackathon API

- **Image:** `ghcr.io/jenszech/hackathon-backend:develop`
- **Zugriff:** [http://localhost:3005](http://localhost:3005)
- **Umgebung:** `NODE_ENV=develop`

```yaml
hackathon-api:
  image: ghcr.io/jenszech/hackathon-backend:develop
  container_name: hackathon-backend
  environment:
    - NODE_ENV=develop
  volumes:
    - ./backend/volumes/config:/usr/src/app/volumes/config
    - ./backend/volumes/database:/usr/src/app/volumes/database
  working_dir: /usr/src/app
  ports:
    - "3005:3005"
```

### 🔹 Frontend – Vue + NGINX

- **Image:** `ghcr.io/jenszech/hackathon-frontend:develop`
- **Zugriff:** [http://localhost](http://localhost)
- **Routing via NGINX:** konfiguriert in `frontend/nginx/default.conf`

```yaml
hackathon-frontend:
  image: ghcr.io/jenszech/hackathon-frontend:develop
  container_name: hackathon-frontend
  environment:
    - NODE_ENV=develop
  ports:
    - "80:80"
  volumes:
    - ./frontend/nginx/default.conf:/etc/nginx/conf.d/default.conf
  depends_on:
    - hackathon-api
```

---

## 🌐 API-Proxy über NGINX

NGINX leitet die API-Endpunkte vom Frontend an das Backend weiter.

```nginx
location /api/ {
    proxy_pass http://hackathon-api:3005;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### Verfügbare Endpunkte

| Pfad            | Funktion                       |
| --------------- | ------------------------------ |
| `/api/`         | Haupt-REST-API                 |
| `/api-docs/`    | API-Dokumentation (Swagger)    |
| `/api/health/`  | Gesundheitsprüfung             |
| `/api/metrics/` | Prometheus-kompatible Metriken |

---

## ▶️ Starten der Umgebung

```bash
docker compose up --build
```

## 👎 Stoppen der Umgebung

```bash
docker compose down
```

---

## 📋 Hinweise

- Stelle sicher, dass die Ports `80`, `3005` und `8081` auf deinem System frei sind.
- Dozzle ist optional – kann entfernt werden, falls nicht benötigt.

---

## 👷 Autor & Lizenz

Maintainer:  
 [odonzyk](https://github.com/odonzyk)\
 [jzech](https://github.com/jenszech)

📄 Lizenz: MIT\
© Hackathon Team, 2025
