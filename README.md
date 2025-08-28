# AI-Powered Adaptive Learning Dashboard

An interactive educational dashboard (Node.js + Express backend, React + Vite + Tailwind frontend, Firebase Auth + Firestore) that:
- Generates subject-specific questions via OpenAI API
- Provides personalized feedback
- Tracks performance analytics and adapts content in real-time

## Features
- **Auth**: Firebase Email/Password (easy to extend to Google Sign-In)
- **Question Generation**: Server-side call to OpenAI (topic + difficulty-aware)
- **Personalized Feedback**: Hints & explanations per question
- **Adaptive Engine**: Adjusts difficulty based on rolling accuracy & time-to-answer
- **Analytics**: Per-subject accuracy, streaks, difficulty progression, time series
- **Vibrant UI**: Tailwind + React components, responsive and keyboard-friendly

## Quick Start

### 1) Clone & Install
```bash
# in terminal
cd backend
npm install
cd ../frontend
npm install
```

### 2) Env Setup
- Copy `.env.example` to two files:
  - `backend/.env` (keep `OPENAI_API_KEY`, `PORT`, optional Firebase Admin keys)
  - `frontend/.env` (prefix keys with VITE_ as provided)

### 3) Run Dev
```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

- Backend defaults to http://localhost:8080
- Frontend defaults to http://localhost:5173

### 4) Build & Deploy
- **Frontend**: Deploy `frontend/dist` to Netlify/Vercel.
- **Backend**: Deploy `backend` to Render/Fly/Heroku.
- Set the frontend ENV `VITE_API_BASE_URL` to your backend URL in production.

## Optional Enhancements
- Spaced repetition & mastery goals
- Instructor mode (create groups, share sets, track cohorts)
- CSV export & public share links
- Offline/low-data mode with local caching
- Accessibility audit + keyboard-only flows
