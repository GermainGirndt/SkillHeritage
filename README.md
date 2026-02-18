# SkillHeritage

    SkillHeritage is an industrial documentation platform that allows experienced workers to record video tutorials, which are then automatically processed by AI into structured, searchable step-by-step guides for new employees.

### Important Links

GitHub:
https://github.com/GermainGirndt/SkillHeritage

Trello – Project Management:
https://trello.com/b/nBguKruK/industrial-ux-engineering-skillheritage

Trello – Empathie-Karte / Empathy Map:
https://trello.com/b/OCDUJtJ7/industrial-ux-engineering-persona

## Project Architecture & Workflow

### High-Level System Flow

Use case 1: Record Video Tutorial

```mermaid
sequenceDiagram
    participant M as Mechanic
    participant F as Frontend (Expo)
    participant B as Backend (NestJS)
    participant DB as MongoDB (GridFS)
    participant AI as OpenAI API

    M->>F: Start & Finish Recording
    F->>B: POST /tutorials (Upload MP4)
    B->>DB: Store Video Chunks (GridFS)
    B-->>F: Return 201 Created (ID)

    Note over B, AI: Background Processing (Cron Job)
    B->>AI: Send extracted Audio (Whisper)
    AI-->>B: Return Transcript & Timestamps
    B->>AI: Send Transcript (GPT-4o)
    AI-->>B: Return Structured Manual (JSON)
    B->>DB: Update Tutorial Document (Status: Completed)
```

Use Case 2: Find Tutorial (Semantic Search)

```mermaid
sequenceDiagram
    participant W as Worker
    participant F as Frontend (Expo)
    participant B as Backend (NestJS)
    participant VS as OpenAI Vector Store
    participant DB as MongoDB

    W->>F: Enter Search Query (e.g., "tire")
    F->>B: GET /tutorials/search?q=query
    B->>VS: Request Semantic Match
    VS-->>B: Return matching IDs & Scores
    B->>DB: Fetch Metadata for IDs
    B-->>F: Return top 5 Tutorials
    F->>W: Display Search Results
```

Use Case 3: View Tutorial

```mermaid
sequenceDiagram
    participant W as Worker
    participant F as Frontend (Expo)
    participant B as Backend (NestJS)
    participant DB as MongoDB (GridFS)

    W->>F: Tap on Tutorial Card
    F->>B: GET /tutorials/:id
    B->>DB: Fetch Metadata & AI Instructions
    DB-->>B: Tutorial Data
    B-->>F: Return Tutorial JSON
    F->>B: GET /tutorials/:id/video/stream (Range Request)
    B->>DB: Stream Video from GridFS
    DB-->>B: Video Data
    B-->>F: Video Stream
    F->>W: Render Video Player with AI Timestamps
```

### Uberspace

##### Access Server using SSH

```
ssh -i ./uberspace-tutorial-htw tutorial@alphard.uberspace.de
```

##### Transfering a file from the local machine to the remote server

```
scp -i ./uberspace-tutorial-htw localfile.txt tutorial@alphard.uberspace.de:/home/tutorial/
```

### Skill Heritage Directory in the Remote Server

```
/home/tutorial/source/SkillHeritage

[tutorial@alphard ~]$ tree . -L 3
.
|-- bin
|-- etc
| |-- certificates -> /readonly/tutorial/certificates
| |-- php.d
| |-- services.d
| `-- userfacts -> /opt/uberspace/userfacts/tutorial
|-- html -> /var/www/virtual/tutorial/html
|-- logs
|   |-- supervisord.log
|   `-- webserver -> /readonly/tutorial/logs
|-- Maildir
| |-- cur
| |-- new
| `-- tmp
|-- source
|   `-- SkillHeritage
| |-- backend
| |-- documentation
| |-- frontend
| `-- README.md
|-- tmp
|-- uberspace-tutorial-htw
|-- uberspace-tutorial-htw.pub
`-- users

20 directories, 4 files
```

##### Account Data

```
Username tutorial
E-Mail dial.58-scars@icloud.com
Hostname alphard.uberspace.de.
Username + Hostname: tutorial@alphard.uberspace.de
Backend Port: 3000
Backend Endpoint (Configured by me): https://tutorial.uber.space/
```

##### Free Backend Port

```
uberspace web backend set / --http --port 3000
```

##### Verify Ports

```
uberspace web backend list
```

#### Backend Management (Supervisor)

```
supervisorctl reread
supervisorctl update
supervisorctl status
```

### Using MongoDB

```
uberspace tools version use mongodb 4.2
```

### Using Git

```
eval "$(ssh-agent -s)"
ssh-add uberspace-tutorial-htw
```
