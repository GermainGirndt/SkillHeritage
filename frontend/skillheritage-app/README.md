# SkillHeritage – Mobile App (Expo Frontend)

**Mobile frontend for the SkillHeritage project**, built with **Expo (React Native)**.  
The app focuses on **video recording and playback** and is designed to work with a NestJS backend.

---

## Features

- Video recording:
  - Android (real device)
  - Web (browser)
- Interactive Tutorial Player:
  - Dynamic routing under `/Tutorial/[id]`.
  - Video Timeline with a progress bar with dummy data prepared for backend.
  - Tutorial Guide with dummy data for AI-generated text instructions.
- Text Search to filter tutorials by title or content.
  - Voice Search to find tutorials using the microphone not yet implemented.
- Dark Mode UI
- Prepared UI for future AI transcription & Tutorial search

---

## Tech Stack

- **Expo / React Native**
- **expo-router**
- **expo-camera**
- **expo-av**
- **NestJS backend**

---

## Requirements

Make sure you have installed:

- **Node.js** (v18 or newer)
- **npm**
- **Expo Go** app installed on your Android device
- **Backend server** running on port 3000

---

## Configuration

Before running on a real device, you **must** update the backend IP address to match your computer's local IP:

1. Open `app/index.tsx` and `app/Tutorial/[id].tsx`.
2. Update the `API_URL` / `API_BASE` constant:
   ```javascript
   const API_URL = "http://<YOUR_LOCAL_IP>:3000";
   ```

````

## Installation

Install dependencies:

```bash
npm install
````

## Running the App

### Android

Start Expo with tunnel :

```bash
npx expo start --tunnel
```

#### Web (Browser)

```bash
npx expo start --web
```
