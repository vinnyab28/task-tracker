# Day Tracker

A personal time-tracking app built around how your day actually flows — from the moment you wake up to when you sleep.

## What it does

Log your day as a sequential timeline. Set your wake time, then add back-to-back time blocks for each task. Each entry's start time auto-fills from the previous entry's end, so the timeline stays consistent. Wrap up your day with a sleep time.

**Record Tasks**
- Enter wake time to start your day
- Add time blocks sequentially — task + until time + optional note
- Insert forgotten entries anywhere in the day, even after wrapping up
- Wrap up with a sleep time

**Dashboard**
- **Daily** — stat cards (woke up, slept, awake, tracked) + task time breakdown
- **Weekly / Monthly** — per-task line chart over the period + wake/sleep pattern chart with averages

## Stack

- React 19 + TypeScript, Vite
- Chakra UI v3
- Firebase Firestore (auth + data)
- Recharts via `@chakra-ui/charts`
- Day.js

## Getting started

```bash
npm install
npm run dev
```

Requires a Firebase project. Create a `.env` file at the root:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```
