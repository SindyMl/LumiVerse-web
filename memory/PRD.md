# LumiVerse - Personalized Bible Study App

## Overview
LumiVerse is a personalized Bible study app with an illuminated, sacred aesthetic. Built with Expo React Native + FastAPI + MongoDB.

## Tech Stack
- **Frontend**: Expo Router (React Native), AsyncStorage for caching
- **Backend**: FastAPI (Python), Motor (async MongoDB)
- **Database**: MongoDB (66 books, 8 sections, 1189 chapters - KJV Bible)
- **Auth**: Anonymous user creation (JWT-ready)

## Features Implemented
1. **Home Screen (Verse Hub)** - Daily verse with golden glow animation, quick actions, section preview cards
2. **Bible Sections** - 8 color-coded sections with expandable descriptions
3. **Book Navigation** - Section → Books → Chapter Grid → Verse Reader
4. **Verse Reader** - Scrollable verses with highlights, notes, prev/next chapter
5. **Notes & Highlights** - Long-press verse to highlight (6 colors) or add notes
6. **Custom Reading Paths** - Create paths by selecting books, resume progress
7. **Solo Study Session** - Full-screen reader with timer, random verses
8. **Settings** - Dark/Light mode toggle, font size controls
9. **AI Insight Placeholder** - Static sparkles button ready for future AI integration

## API Endpoints
- `GET /api/sections` - 8 Bible sections
- `GET /api/books` - 66 books (filterable by section_id)
- `GET /api/chapters/{abbrev}/{num}` - Chapter verses
- `GET /api/verse/daily` - Random daily verse
- `GET /api/search?q=` - Bible text search
- `POST /api/auth/anonymous` - User creation
- CRUD: `/api/paths`, `/api/notes`, `/api/highlights`

## Color Palette
- Dark: #02040A bg, #FFD700 gold primary, #1E90FF accent
- Light: #F5F2E9 parchment bg, #C5A059 gold primary

## Future Enhancements
- Real AI verse insights integration
- Email authentication
- Reading streak tracking / gamification
- Community sharing of paths and notes
- Push notifications for daily reminders
