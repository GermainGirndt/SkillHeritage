# SkillHeritage – Mobile App (Expo)

**Mobile frontend for the SkillHeritage project**, built with **Expo (React Native)**.  
The app focuses on **video recording and playback** and is designed to work with a NestJS backend.

---

## Features

- Video recording:
  - Android (real device)
  - Web (browser)
- Video upload to backend
- Video playback via streaming endpoint
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

- **Node.js** (v18 recommended)
- **npm**
- **Expo CLI** (via `npx`)
- **Expo Go** app on your Android phone
- **Backend running on port 3000**
- Android SDK (36.1)

---

## Setting Android SDK after Installation

Put into the .bashrc/.zshrc file:

```
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/emulator
```

## Installation

Install dependencies:

```bash
npm install
```

## Running the App

### Android

Start Expo with tunnel :

```bash
npx expo start -c --tunnel
```

#### Web (Browser)

```bash
npx expo start
```

### Issues:

- On Android, video recording works correctly

- Video upload from Android currently fails due to a network request issue

- Video upload works correctly on web (browser)
