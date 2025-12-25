# 🧠 Requirements Analysis — SkillHeritage

## 🎯 User Story

> **As a worker**,  
> I want a **app for my phone** that lets me **make video and audio recordings of my work process**,  
> so I can teach new workers more easily.

> 💬 _Why?_ It saves my time and enables independent learning for new workers.

---

## ✅ Must-Have Features

### MH-1 – Android App

- The app must provide a **graphic user interface** for user interaction.
- **Acceptance Criteria:**
  1. The app can be installed and executed on Android Smartphones.

> 💬 _Why?_ The app provides an convenient form of interacting with the app and it's easier to make video and audio recordings with an in-build camera and microphone. 

### MH-2 – Video Recording & Display

- The app must **make video and audio recordings** and **play them back**.
- **Acceptance Criteria:**
  1. The app can make video MP4 files stored locally on the phone.
  2. The app can display loaded video recordings directly.
  3. The app should support following formats: MP4.

> 💬 _Why?_ Making video recordings allows the worker to dokument his work process for enabling independent learning for new workers. 

---

### MH-3 – Transcription

- The app must **create a transcription** using the OpenAI API.
- **Acceptance Criteria:**
  1. The app uses the **OpenAI API** for transcription.
  2. The app extracts the MP3 audio track from the MP4 file and sends it to the API.

> 💬 _Why?_ The transcription enables SH-1 and increases the comprehension and searchability.

---

### MH-4 – Timestamps

- The app must **generate timestamps with visulaization**.
- **Acceptance Criteria:**
  1. The app uses the **OpenAI API** for timestamp generation.
  2. The app extracts the MP3 audio track from the MP4 file and sends it to the API.
  3. The app visualizes the timestamps. 

> 💬 _Why?_ Timestamps improve discoverability and make it easier for new workers to find relevant information.

---
### MH-5 – Semantic Search

- The app must offer a **Semantic Search**.
- **Acceptance Criteria:**
  1. The app uses the **OpenAI API** for semantic Search.
  2. The app uses the transcription and the search string for semantic search.
  3. The app displays the top 5 results

> 💬 _Why?_ Semantic search makes it easier for new workers to find relevant information.


---

## 💡 Should-Have Features
### SH-1 – Step-by-Step instructions

- The app should generate a **Step-by-Step instruction**.
- **Acceptance Criteria:**
  1. The app uses the **OpenAI API** to generate the instructions. 
  2. The app uses the transcription and sends it to the API.

> 💬 _Why?_ Step-by-step instructions present all relevant information clearly in one place and make it easier for new workers to get started.

---

### SH-2 – Maintainability

- The app should be **easy to maintain**.
- **Acceptance Criteria:**
  - Documentation lists:
    - Programming languages used and version
    - Dependency versions and configuration details

> 💬 _Why?_ Good documentation ensures future contributors or students can reproduce and extend the system without configuration issues.

---
### SH-3 – Usability

- The app should be **easy to use**.
- **Acceptance Criteria:**
  - Tutorials:
    - Show the Functionality

> 💬 _Why?_ Workers without extensive technological knowledge should be able to use the app without any problems.

---

## 💭 Could-Have Features

### CH-1 – Loading times

- The app could have quick **loading times**.
- **Acceptance Criteria:**
  - Preprocessed data loads in under 2 seconds. (OpenAI API Calls excluded)

> 💬 _Why?_ Quick loading times increases usability and causes less frustration. 

---

## 🚫 Won’t-Have (for Initial Release)

1. **iOS support**

   - No app for iPhones.
     > 💬 _Why?_ Simplifies the developement.
