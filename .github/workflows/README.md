# 🚀 CI/CD für Hackathon Manager

Dieses Repository enthält zwei GitHub Actions Workflows für automatischen Build und manuellen Deployment von Docker-Images für das Projekt [`jenszech/hackathon-manager`](https://github.com/jenszech/hackathon-manager).

---

## ⚙️ Workflow 1: Build Images

**Pfad:** `.github/workflows/build.yml`\
**Trigger:**

- Automatisch bei Push auf `main` oder `develop`, **wenn Änderungen im **``** oder **``** Verzeichnis erfolgen**
- Manuell per GitHub UI (Button: "Run workflow")

### 🔧 Build-Prozess

1. Checkt das Projekt `jenszech/hackathon-manager` in das Verzeichnis `hackathon-manager/` aus.
2. Baut das Docker-Image für das **Frontend** und pushed es zu `ghcr.io`.
3. Baut anschließend das Docker-Image für das **Backend** und pushed es ebenfalls zu `ghcr.io`.

### 🔐 Voraussetzungen

- GitHub Container Registry (`ghcr.io`) ist aktiviert.
- Repository verfügt über das Secret `GITHUB_TOKEN` (automatisch gesetzt).

---

## 🚀 Workflow 2: Manual Deployment

**Pfad:** `.github/workflows/deploy.yml`\
**Trigger:**

- **Manuell** per Button über die GitHub Actions UI\
  Mit Eingabeparameter `ref_name` (z. B. `develop` oder `main`)

### ⚙️ Deployment-Prozess

1. Läuft per SSH auf dem Zielserver.
2. Stoppt ggf. bestehende Docker-Container.
3. Holt die neuesten Images (`frontend` und `backend`) von `ghcr.io`.
4. Passt bei `main` die Konfiguration für Production an.
5. Startet das System via `docker compose up`.

### 🔐 Voraussetzungen

Folgende Secrets müssen im Repository unter **Settings → Secrets and variables → Actions** gesetzt sein:

| Secret Name                     | Beschreibung                                                 |
| ------------------------------- | ------------------------------------------------------------ |
| `SSH_HOST`                      | IP oder Hostname des Zielservers                             |
| `SSH_USER`                      | Benutzername für SSH-Zugriff                                 |
| `LOCAL_ANSIBLE_SSH_PRIVATE_KEY` | Privater SSH-Key (ohne Passphrase oder mit separatem Secret) |

---

## 🔄 Docker Image Tags

Die Docker-Images werden mit dem aktuellen Git-Ref (`main`, `develop` etc.) getaggt und landen in:

- `ghcr.io/<owner>/hackathon-frontend:<branch>`
- `ghcr.io/<owner>/hackathon-backend:<branch>`

---

## 📦 Verzeichnisstruktur beim Build

```
hackathon-manager/
├── frontend/
│   ├── Dockerfile
│   └── ...
└── backend/
    ├── Dockerfile
    └── ...
```

---

## 🧪 Beispiel: Manuelles Deployment starten

1. Gehe auf den Reiter **"Actions"** in GitHub.
2. Wähle **"Manual Deployment"**.
3. Klicke **"Run workflow"**.
4. Gib z. B. `develop` oder `main` als `ref_name` ein.
5. Klicke auf **"Run workflow"**, um die Bereitstellung auszulösen.

---

## 👷 Autor & Lizenz

Maintainer: 
[odonzyk](https://github.com/odonzyk)\
[jzech](https://github.com/jenszech)


Lizenz: MIT
