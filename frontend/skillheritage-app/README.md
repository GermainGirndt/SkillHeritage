# SkillHeritage – Mobile App (Expo Frontend)

**Mobile frontend for the SkillHeritage project**, built with Expo (React Native).  
The app is specifically designed for workshop environments to record work processes and view AI-processed tutorials.

---

## Features

- **Dual-Platform Video Recording:**
  - Native Android support using `expo-camera`.
  - Web browser support for testing on laptops.
- **Interactive Tutorial Player:**
  - Dynamic routing implemented under `/Tutorial/[id]`.
  - **Video Timeline:** Synchronized progress bar with timestamped action steps.
  - **Tutorial Guide:** AI-generated structured manual in a dedicated tab.
- **Smart Tutorial Search:**
  - Search by title, description, or tutorial content.
  - Automatic filtering to show relevant results.
- **Auto-Refresh Logic:** Uses `useFocusEffect` to automatically update the tutorial list after a new recording is finished.
- **Tech Stack:** Uses `expo-video` and `expo-audio` for long-term compatibility.

---

## Tech Stack

- **Framework:** Expo (SDK 54) / React Native
- **Navigation:** Expo Router (Dynamic Routing)
- **Networking:** Axios & Fetch API with custom API clients
- **Media:** expo-camera, expo-video, expo-audio

---

## Requirements

- **Node.js** (v18 or newer)
- **npm**
- **Expo Go** app installed on your Android device
- **Backend server** running on port 3000

---

## Configuration (Mobile Connection)

To test the app on a real Android device, you must configure the backend IP address:

1. Open your terminal and run `ipconfig` (Windows) to find your **IPv4 Address**.
2. Update the `.env` file in the root of the frontend folder:

   ```env
   EXPO_PUBLIC_BACKEND_BASE_URL_ANDROID_PHONE=http://<YOUR_IP_HERE>:3000
   EXPO_PUBLIC_USE_DUMMY_API_CLIENT=false

    Ensure both the laptop and phone are on the same Wi-Fi network.
   ```

Install dependencies:

```bash
npm install
```

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
