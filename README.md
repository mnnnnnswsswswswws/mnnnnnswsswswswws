# 📸 Fotobuch App

Eine schöne Web-App zum Erstellen und Teilen von Fotobüchern.

## Features

- 📚 Fotobücher erstellen mit Titel und Beschreibung
- 🖼️ Fotos hochladen per Klick oder Drag & Drop (bis zu 10 MB)
- ✏️ Beschriftungen zu jedem Foto hinzufügen
- 🔗 Fotobücher mit einem Link teilen (Ansicht für andere)
- 🔒 Eigentümer-Bearbeitung via lokalem Edit-Token
- 📱 Responsives Design mit Masonry-Layout
- 🔍 Lightbox für Vollbild-Ansicht

## Tech Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + Multer
- **Datenspeicherung:** JSON-Datei (kein Datenbankserver nötig)

## Setup

### Voraussetzungen
- Node.js 18+

### Installation

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### Starten

```bash
# Terminal 1 – Backend (Port 3001)
cd backend && npm run dev

# Terminal 2 – Frontend (Port 5173)
cd frontend && npm run dev
```

Dann öffne http://localhost:5173 im Browser.

### Umgebungsvariablen

Frontend `.env` (optional, Standard ist `http://localhost:3001`):
```
VITE_API_URL=http://localhost:3001
```

## Nutzung

1. **Fotobuch erstellen** – Klicke auf "+ Neues Fotobuch" und gib einen Titel ein.
2. **Fotos hochladen** – Ziehe Bilder in den Upload-Bereich oder klicke darauf.
3. **Beschriftungen** – Klicke unter jedem Foto auf das Textfeld.
4. **Teilen** – Klicke auf "Teilen" und kopiere den Link. Empfänger sehen eine schöne Ansicht.
