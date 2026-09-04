# ChronoSync ⚡ Local-First Collaborative Canvas & Git Time Machine

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![CRDT](https://img.shields.io/badge/CRDT-Yjs_v13-FF6B6B?style=for-the-badge)
![P2P](https://img.shields.io/badge/Networking-WebRTC_Mesh-4ECDC4?style=for-the-badge)
![Storage](https://img.shields.io/badge/Offline-IndexedDB-FFE66D?style=for-the-badge)

A production-grade, local-first real-time collaborative infinite canvas and whiteboard application. Built entirely with **CRDTs (Yjs)**, **IndexedDB offline persistence**, and **Peer-to-Peer WebRTC mesh sync** — requiring **zero central servers or backend databases** for real-time collaboration.

Featuring a groundbreaking **Git-Style Time-Travel Scrubber** that lets you scrub through document history, auto-replay changes like a video, inspect commits, and restore past versions.

---

## ✨ Standout Features

### 1. 🛡️ Local-First & 100% Offline-Ready
- Powered by `y-indexeddb`: all edits, cards, drawings, and commits persist locally inside the browser's IndexedDB.
- Instant 0ms read/write latency. Works flawlessly offline on trains, planes, or unreliable Wi-Fi.

### 2. 🌐 Zero-Server P2P Mesh Collaboration
- Powered by `y-webrtc`: direct browser-to-browser WebRTC DataChannels.
- Multi-tab synchronization works instantaneously even when completely offline via `BroadcastChannel`.
- Live peer awareness: see collaborators' smoothly animated cursors, active tools, selection bounding boxes, and customized names/colors.

### 3. 🕰️ Unique Git-Style Time-Travel Scrubber ("Time Machine")
- **Interactive Timeline**: Scrub slider spanning across all session checkpoints with author badges and commit messages.
- **Auto-Replay Playback**: Watch the canvas build itself from scratch at `1x`, `2x`, or `4x` speed!
- **Historical Snapshot Preview**: Renders the historical document in a read-only blueprint HUD with timestamp banners.
- **One-Click Version Restore**: Revert the live canvas to any historical checkpoint with celebratory confetti.
- **Commit Log Inspector**: Full Git-like tree log displaying commit hashes, authors, and object counts.

### 4. 🎨 Infinite Canvas Tool Suite
- **Sticky Notes**: Color-coded notes with rich inline text formatting, timestamps, author tags, and resize handles.
- **Geometric Shapes**: Rectangles, rounded cards, circles, diamonds, stars, and callout bubbles with text labels.
- **Freehand Vector Pen & Highlighter**: Smooth Bezier paths with neon glow or semi-transparent highlighter strokes.
- **Curved Connectors & Arrows**: Dynamic vector lines with auto-orienting arrowheads.
- **Image Support**: Paste images directly from clipboard (`Ctrl+V`) or drag & drop image files onto the canvas.
- **Interactive Mini-Map Radar**: Draggable birds-eye view camera navigator in the bottom corner.

### 5. 🔊 Native Web Audio Synthesizer
- Built-in tactile sound effects (mechanical clicks, pops on element drop, chord chimes on version restore, and deletion snaps) created entirely via the native Web Audio API (zero external sound files needed).
- One-click mute/unmute toggle.

### 6. 📸 High-Resolution Retina Export
- Export the entire canvas to 2x retina **PNG images** (with dark theme or transparent backgrounds).
- Export & import full document state as **JSON backups**.

### 7. 🚀 Interactive Starter Boards
- One-click templates:
  - **Distributed Cloud Architecture** (Web clients, edge cache, P2P mesh, databases)
  - **Agile Sprint Retrospective** (What went well, what to polish, action items)

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript + Vite 8 |
| **CRDT Engine** | Yjs (`Y.Doc`, `Y.Map`, `Y.Array`, `Y.snapshot`) |
| **Local Storage** | `y-indexeddb` (IndexedDB persistence) |
| **P2P Networking** | `y-webrtc` (WebRTC DataChannels + BroadcastChannel) |
| **Iconography** | `lucide-react` |
| **Audio Synthesis** | Native Web Audio API (`AudioContext`, `OscillatorNode`) |
| **Animations** | `canvas-confetti`, CSS3 glassmorphism & keyframes |

```mermaid
graph TD
    subgraph Browser Tab 1 (Peer A)
        UI_A[Interactive Canvas UI] --> Doc_A[Yjs CRDT Doc]
        Doc_A <--> IDB_A[(IndexedDB Persistence)]
        Doc_A <--> Aware_A[Awareness Protocol: Live Cursors]
        Doc_A --> TimeTravel_A[Time Machine Snapshots & Git Log]
    end

    subgraph Browser Tab 2 / Remote Peer (Peer B)
        UI_B[Interactive Canvas UI] --> Doc_B[Yjs CRDT Doc]
        Doc_B <--> IDB_B[(IndexedDB Persistence)]
        Doc_B <--> Aware_B[Awareness Protocol: Live Cursors]
        Doc_B --> TimeTravel_B[Time Machine Snapshots & Git Log]
    end

    Doc_A <== P2P WebRTC DataChannel & BroadcastChannel ==> Doc_B
    Aware_A <== Peer Cursors ==> Aware_B
```

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start Vite dev server
npm run dev

# 3. Open in browser
http://localhost:5173/
```

To test real-time collaboration:
1. Copy the room URL or click **Share**.
2. Open the URL in a second browser window or tab.
3. Move your cursor and watch both windows sync in real time!

---

## 📦 Production Build & Deployment

```bash
npm run build
```
The optimized production bundle will be generated in `dist/`.

### Embedding on Your Portfolio Website:
You can host this repository on Vercel, Netlify, or GitHub Pages, and embed it directly into your portfolio website using an `<iframe>`:

```html
<iframe
  src="https://your-chronosync-domain.com/?room=portfolio-demo"
  width="100%"
  height="750px"
  style="border: none; border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.5);"
  allow="clipboard-read; clipboard-write"
></iframe>
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| `V` | Select & Move tool |
| `H` | Hand / Pan tool |
| `Space + Drag` | Pan canvas |
| `S` | Sticky Note |
| `P` | Freehand Pen |
| `Shift + P` | Neon Highlighter |
| `R` | Shapes (Rectangle, Circle, Diamond, etc.) |
| `A` | Arrow Connector |
| `T` | Text Block |
| `E` | Eraser |
| `Delete` / `Backspace` | Delete selected elements |
| `[` / `]` | Step Backward / Forward in Time Travel |
| `Ctrl + V` | Paste image from clipboard |
| `F` | Zen / Fullscreen Presentation Mode |
| `?` | Shortcuts cheat sheet |

---

## 📄 License
MIT License. Created for high-impact showcase & portfolio demonstration.
