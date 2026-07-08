# HomiAdmin - Firebase Configuration Guide

This guide explains how to configure Firebase for both the backend and frontend of the HomiAdmin application.

## Prerequisites
- A Google account
- A Firebase project created in the [Firebase Console](https://console.firebase.google.com/)

## 1. Firebase Project Setup
1. Go to the Firebase Console and create a new project (e.g., `homiadmin`).
2. Enable **Firestore Database** in test mode or production mode.
3. Enable **Firebase Storage**.
4. Enable **Firebase Authentication** (Email/Password).

## 2. Frontend Configuration
The frontend uses the Firebase Client SDK.

1. In the Firebase Console, go to **Project Settings** > **General**.
2. Scroll down to **Your apps** and click the Web `</>` icon to add a web app.
3. Register the app (e.g., `HomiAdmin Frontend`).
4. Copy the `firebaseConfig` object values.
5. In the `frontend` directory, copy `.env.example` to `.env` and fill in the values:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

## 3. Backend Configuration
The backend uses the Firebase Admin SDK to interact with Firebase securely.

1. In the Firebase Console, go to **Project Settings** > **Service accounts**.
2. Click **Generate new private key** and download the JSON file.
3. In the `backend` directory, copy `.env.example` to `.env`.
4. Open the downloaded JSON file and extract the following values to put into your `.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=your_client_email
   # IMPORTANT: The private key might contain \n characters. Make sure to paste it exactly as is,
   # or replace \n with actual newlines depending on your environment parser.
   FIREBASE_PRIVATE_KEY="your_private_key"
   FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   ```

## Running the Application
1. **Backend**: `cd backend && npm start`
2. **Frontend**: `cd frontend && npm run dev`
