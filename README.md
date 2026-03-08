# Sheetia - Collaborative Spreadsheet

Sheetia is a premium, real-time collaborative spreadsheet application built for the Trademarkia frontend engineering assignment. It mimics the core functionality of Google Sheets with a focus on high-performance architecture, real-time synchronization, and a polished user experience.

## 🚀 Key Features

- **Real-time Collaboration**: Multiple users can edit the same document simultaneously with instant synchronization via Firestore.
- **Formula Engine**: Support for basic arithmetic (`+`, `-`, `*`, `/`) and functions like `SUM(A1:A5)`.
- **User Presence**: Live indicators showing who's currently editing the document and which cell they are focused on.
- **Optimistic UI**: Instant local updates with background synchronization for a lag-free experience.
- **Column Resizing**: Interactive drag handles to adjust column widths.
- **Export to CSV**: Download your data for use in other applications.
- **Modern UI/UX**: Built with Tailwind CSS and Framer Motion for smooth transitions and a premium feel.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS
- **State Management**: React Hooks + Firestore Real-time Listeners
- **Backend/Auth**: Firebase (Firestore + Firebase Auth)
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 🏗️ Architecture Explanation

### State Management & Syncing Strategy
The application uses a hybrid state management approach:
1. **Global State**: Managed directly by Firestore's `onSnapshot` listeners. This ensures all clients are eventually consistent.
2. **Local State (Optimistic)**: When a user edits a cell, the `useDocument` hook immediately updates the local React state before sending the data to Firestore. This provides an "instant" feel.
3. **Write States**: A explicit state machine (`saving` -> `saved` -> `offline`) tracks the status of background writes, providing feedback to the user via the Toolbar.

### Formula Parsing Strategy
Formulas are parsed using a custom utility in `src/lib/formulaParser.ts`. 
- It uses regex to identify cell references (e.g., `A1`) and function calls (e.g., `SUM(A1:B5)`).
- References are recursively resolved with circular dependency detection (using a `Visited` Set).
- Simple arithmetic is evaluated using a safe `Function` constructor approach, restricted to numeric and operator characters.

### Presence Detection
Presence is implemented using a dedicated `presence` collection in Firestore:
- Each user maintains a "heartbeat" document that includes their current focused cell and a `lastSeen` timestamp.
- A `usePresence` hook listens to all active presence documents and filters out users who haven't been seen in over 2 minutes.
- On unmount (or tab close), the presence document is deleted to provide immediate feedback to others.

## 📋 Firebase Schema

### Collection: `documents`
```json
{
  "title": "string",
  "ownerId": "string",
  "ownerName": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Collection: `cells` (Document ID = `${docId}_${row}_${col}`)
```json
{
  "docId": "string",
  "row": "number",
  "col": "number",
  "value": "string (raw input)",
  "computedValue": "string | number",
  "updatedBy": "string (userId)",
  "updatedAt": "timestamp"
}
```

### Collection: `presence` (Document ID = `${docId}_${userId}`)
```json
{
  "userId": "string",
  "docId": "string",
  "name": "string",
  "color": "string",
  "lastSeen": "timestamp",
  "cursor": { "row": "number", "col": "number" }
}
```

## 🚀 Deployment Instructions

1. **Clone the repository.**
2. **Create a Firebase Project** at [console.firebase.google.com](https://console.firebase.google.com).
3. **Enable Firestore and Firebase Auth** (Google Provider).
4. **Configure Environment Variables**:
   Create a `.env.local` file with:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```
5. **Install Dependencies**: `npm install`
6. **Run Locally**: `npm run dev`
7. **Deploy to Vercel**: Push to GitHub and connect to Vercel, adding the same environment variables.

---
Built with ♥ by Antigravity AI for Trademarkia.
