# Slide – Deine KI-kuratierte News App

> Täglich frische News: schnell greifbar, tief wenn nötig.
> Betrieben von Claude AI. Kein Lärm, nur Substanz.

## Setup

### 1. Abhängigkeiten installieren

```bash
npm run install:all
```

### 2. API-Key konfigurieren

```bash
cp backend/.env.example backend/.env
# Trage deinen Anthropic API Key ein:
# ANTHROPIC_API_KEY=sk-ant-...
```

Du bekommst einen API Key unter: https://console.anthropic.com

### 3. Starten

```bash
# Backend (Port 3001) und Frontend (Port 5173) gleichzeitig:
npm run dev

# Oder einzeln:
npm run backend
npm run frontend
```

Öffne [http://localhost:5173](http://localhost:5173)

---

## Wie es funktioniert

```
RSS Feeds → Claude AI → Kuratierte News → Slide UI
```

1. **Backend** holt beim Start automatisch aktuelle RSS-Feeds (BBC, DW, Spiegel, The Verge, Ars Technica, HN, etc.)
2. **Claude Sonnet** filtert die besten 10 Stories pro Kategorie, schreibt deutsche Headlines und Zusammenfassungen, erklärt "Warum das wichtig ist"
3. **Täglich um 6:00 und 18:00** automatischer Refresh
4. **Manueller Refresh** über den ↻ Button in der App

## UI Bedienung

| Geste | Aktion |
|-------|--------|
| **Wischen nach oben** | Nächste Story |
| **Wischen nach unten** | Vorherige Story |
| **Tippen** | Zusammenfassung & "Warum wichtig" anzeigen |
| **Nochmal tippen** | Zusammenfassung ausblenden |
| **↗ Link** | Originalartikel öffnen |
| **↑↓ Pfeiltasten** | Navigation (Desktop) |
| **Mausrad** | Navigation (Desktop) |

## Kategorien

- 🔵 **Politik** – Globale Politik, Wahlen, Konflikte
- 🟢 **Wirtschaft** – Märkte, Unternehmen, Handel
- 🟣 **Tech & AI** – Technologie, KI, Startups
- 🟠 **Faszinierend** – Wissenschaft, Natur, Entdeckungen
- 🟡 **Fun** – Kurioses, Überraschendes

## Als PWA installieren

Die App kann wie eine native App auf dem Homescreen installiert werden:

- **iOS Safari**: Teilen → "Zum Home-Bildschirm"
- **Android Chrome**: Menü → "App installieren"
- **Desktop Chrome**: Adressleiste → Installieren-Icon

## Deployment

Für den Produktiveinsatz:

```bash
# Frontend bauen
npm run build

# Backend mit PM2 dauerhaft laufen lassen
npm install -g pm2
pm2 start backend/src/server.js --name slide-backend

# Oder Docker (kommt bald)
```

---

*Powered by Claude Sonnet · Built with React + Vite · RSS from BBC, DW, Spiegel, The Verge, Ars Technica, Hacker News*
