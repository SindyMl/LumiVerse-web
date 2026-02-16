<div align="center">

# ✨ LumiVerse

**A Personalized Bible Study App with an Illuminated, Sacred Aesthetic**

[![Expo](https://img.shields.io/badge/Expo-54-000020?logo=expo&logoColor=white)](https://expo.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3.x-3776AB?logo=python&logoColor=white)](https://www.python.org)

</div>

---

LumiVerse brings the entire KJV Bible (66 books, 8 sections, 1,189 chapters) to life through an immersive reading experience with gold-glow animations, personalized reading paths, verse highlighting, note-taking, and a distraction-free solo study mode. It supports **dark** ("Bioluminescent Sanctuary") and **light** ("Illuminated Manuscript") themes.

<br>

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Design System](#design-system)
- [Testing](#testing)
- [Future Enhancements](#future-enhancements)
- [License](#license)

<br>

## Features

| Feature | Description |
|---|---|
| **Verse Hub (Home)** | Daily verse card with animated golden glow, quick-action buttons, section preview cards, pull-to-refresh |
| **Bible Navigation** | 8 color-coded sections → 66 books → chapter grid → immersive verse reader |
| **Verse Highlighting** | Long-press any verse to choose from 6 highlight colors (gold, red, teal, purple, orange, green) |
| **Notes** | Add and manage notes on any verse with full CRUD support |
| **Custom Reading Paths** | Create personalized reading journeys by selecting books; track and resume progress |
| **Solo Study Session** | Full-screen distraction-free mode with random verse display, session timer (play/pause), and "Lumi Moment" mindfulness prompts |
| **Dark / Light Themes** | Toggle between "Bioluminescent Sanctuary" (dark) and "Illuminated Manuscript" (light parchment) themes |
| **Font Size Control** | Adjustable reading font size (12–24 px) with live preview |
| **Bible Search** | Full-text regex search across all verse content |
| **AI Insight (Placeholder)** | Sparkles button in the reader, ready for future AI-powered verse insights |

<br>

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Expo 54, React Native 0.81, Expo Router, TypeScript |
| **Backend** | FastAPI 0.110, Python, Uvicorn |
| **Database** | MongoDB (Motor async driver) |
| **State / Storage** | React Context, AsyncStorage |
| **Animations** | React Native Reanimated, Animated API |
| **Auth** | Anonymous UUID-based users (JWT-ready architecture) |

<br>

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                   Expo React Native                  │
│              (TypeScript + Expo Router)               │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │  Tabs    │  │ Screens  │  │  Components       │  │
│  │ Home     │  │ Sections │  │ ThemeContext       │  │
│  │ Notes    │  │ Reader   │  │ ApiService         │  │
│  │ Settings │  │ Paths    │  │                    │  │
│  └──────────┘  └──────────┘  └───────────────────┘  │
│                      │                               │
│                      ▼                               │
│               ApiService.ts                          │
│            (REST fetch wrapper)                      │
└──────────────────┬───────────────────────────────────┘
                   │  HTTP / JSON
                   ▼
┌──────────────────────────────────────────────────────┐
│                FastAPI Backend                       │
│             (Python + Uvicorn)                       │
│                                                      │
│  17 REST endpoints under /api                        │
│  Bible · Auth · Paths · Notes · Highlights           │
└──────────────────┬───────────────────────────────────┘
                   │  Motor (async)
                   ▼
┌──────────────────────────────────────────────────────┐
│                   MongoDB                            │
│                                                      │
│  sections (8) · books (66) · chapters (1189)         │
│  users · paths · notes · highlights                  │
└──────────────────────────────────────────────────────┘
```

**Navigation Flow:**

```
Home ─┬─→ Sections → Section Books → Chapters → Reader
      ├─→ My Paths → Create Path
      └─→ Study Session

Tabs: Home | Notes & Highlights | Settings
```

<br>

## Getting Started

### Prerequisites

- **Node.js** ≥ 18 & **Yarn** (or npm)
- **Python** ≥ 3.10
- **MongoDB** instance (local or Atlas)
- **Expo CLI** (`npx expo`)

### Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Create & activate virtual environment
python -m venv venv
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
#    Create a .env file with:
#    MONGO_URL=mongodb+srv://<user>:<pass>@<cluster>/<db>
#    DB_NAME=lumiverse

# 5. Seed the KJV Bible into MongoDB
python seed_bible.py

# 6. Start the API server
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

The API will be available at `http://localhost:8001`. Verify with `GET http://localhost:8001/`.

### Frontend Setup

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
yarn install

# 3. Configure environment
#    Create a .env file with:
#    EXPO_PUBLIC_BACKEND_URL=http://localhost:8001

# 4. Start Expo development server
npx expo start

# 5. Open on desired platform
#    Press 'w' for web, 'a' for Android, 'i' for iOS
```

<br>

## API Reference

All endpoints are prefixed with `/api`.

### Bible Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/sections` | List all 8 Bible sections |
| `GET` | `/books?section_id=` | List 66 books (optionally filter by section) |
| `GET` | `/books/{abbrev}` | Get a single book by abbreviation |
| `GET` | `/chapters/{book_abbrev}/{chapter_number}` | Get chapter with all verses |
| `GET` | `/verse/daily` | Get a random daily verse |
| `GET` | `/search?q={query}` | Regex search across verse text |

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/anonymous` | Create an anonymous user (returns UUID) |

### Reading Paths

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/paths?user_id=` | List user's reading paths |
| `POST` | `/paths` | Create a new reading path |
| `PUT` | `/paths/{path_id}` | Update a path |
| `DELETE` | `/paths/{path_id}` | Delete a path |

### Notes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/notes?user_id=` | List user's notes |
| `POST` | `/notes` | Create a note |
| `PUT` | `/notes/{note_id}` | Update a note |
| `DELETE` | `/notes/{note_id}` | Delete a note |

### Highlights

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/highlights?user_id=` | List user's highlights |
| `POST` | `/highlights` | Create/upsert a highlight |
| `DELETE` | `/highlights/{highlight_id}` | Delete a highlight |

<br>

## Project Structure

```
LumiVerse-web/
├── backend/
│   ├── server.py              # FastAPI application (17 endpoints)
│   ├── seed_bible.py          # MongoDB seed script (KJV Bible data)
│   ├── bible_kjv.json         # Complete KJV Bible source data
│   ├── requirements.txt       # Python dependencies
│   └── tests/
│       └── test_lumiverse_api.py  # Integration tests (16 tests, 5 classes)
│
├── frontend/
│   ├── app/
│   │   ├── _layout.tsx        # Root layout (ThemeProvider, user init)
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx    # Bottom tab bar (Home, Notes, Settings)
│   │   │   ├── index.tsx      # Home screen (daily verse, quick actions)
│   │   │   ├── notes.tsx      # Notes & Highlights manager
│   │   │   └── settings.tsx   # Theme toggle, font size control
│   │   ├── sections.tsx       # 8 Bible sections (expandable cards)
│   │   ├── section-books.tsx  # Books within a section
│   │   ├── chapters.tsx       # Chapter selection grid
│   │   ├── reader.tsx         # Verse reader (highlights, notes, nav)
│   │   ├── paths.tsx          # Reading paths list & progress
│   │   ├── create-path.tsx    # Create custom reading path (modal)
│   │   └── study-session.tsx  # Solo study mode (timer, random verse)
│   ├── components/
│   │   ├── ApiService.ts      # Centralized API client
│   │   └── ThemeContext.tsx    # Theme + user state (Context + AsyncStorage)
│   ├── assets/                # Fonts and images
│   ├── package.json
│   └── tsconfig.json
│
├── design_guidelines.json     # Complete design system specification
├── memory/
│   └── PRD.md                 # Product Requirements Document
└── tests/                     # Top-level test infrastructure
```

<br>

## Design System

LumiVerse follows a curated design system defined in `design_guidelines.json`.

### Typography

| Role | Font | Usage |
|------|------|-------|
| Headings | **Cinzel** (serif) | H1–H3, sacred manuscript feel |
| Body | **Lato** (sans-serif) | Bible text, UI labels, long-form reading |
| Accent | **Cormorant Garamond** (serif) | Verse numbers, pull quotes, section intros |

### Color Palette

**Dark Theme** — *Bioluminescent Sanctuary*
| Token | Color | Hex |
|-------|-------|-----|
| Background | Near-black | `#02040A` |
| Primary | Gold | `#FFD700` |
| Accent | Dodger Blue | `#1E90FF` |

**Light Theme** — *Illuminated Manuscript*
| Token | Color | Hex |
|-------|-------|-----|
| Background | Parchment | `#F5F2E9` |
| Primary | Antique Gold | `#C5A059` |
| Accent | Blue | `#3B82F6` |

### Bible Section Colors

| Section | Color |
|---------|-------|
| Law & Foundations | `#8B4513` |
| History | `#A0522D` |
| Wisdom & Poetry | `#C71585` |
| Prophets | `#4B0082` |
| Gospels | `#FFD700` |
| Early Church (Acts) | `#FF4500` |
| Letters (Epistles) | `#2E8B57` |
| Revelation | `#1E90FF` |

### Visual Effects

- **Golden glow animations** on daily verse and selected verses
- **Parchment texture** backgrounds in light mode
- **Stardust particle** backgrounds in dark mode
- **Fade-in transitions** on screen navigation
- Cards use `rounded-xl` with generous padding (`p-6` / `p-8`)

<br>

## Testing

The project includes an integration test suite covering all API endpoints.

```bash
# Run backend tests
cd backend
pytest tests/test_lumiverse_api.py -v
```

**Test Coverage** — 5 test classes, 16 tests:
- `TestBibleEndpoints` (8 tests) — sections, books, chapters, daily verse, search
- `TestAuthEndpoints` (1 test) — anonymous user creation
- `TestPathsEndpoints` (3 tests) — CRUD operations on reading paths
- `TestNotesEndpoints` (3 tests) — CRUD operations on notes
- `TestHighlightsEndpoints` (2 tests) — create/delete highlights

All tests create dedicated test users and clean up after themselves.

<br>

## Future Enhancements

- 🤖 **AI Verse Insights** — Integrate LLM-powered contextual analysis and reflections
- 🔐 **Email Authentication** — Full JWT auth flow beyond anonymous users
- 🔥 **Reading Streaks** — Daily streak tracking and gamification
- 🌐 **Community Features** — Share reading paths and notes with other users
- 🔔 **Push Notifications** — Daily verse reminders and study session nudges
- 🗺️ **Constellation Paths** — Visual journey-map style reading path UI

<br>

## License

This project is private. All rights reserved.

---

<div align="center">

*Built with light and intention* ✨

</div>
