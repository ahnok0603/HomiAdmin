import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut as fbSignOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

let app;
let auth;
let isFirebaseConfigured = false;

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    isFirebaseConfigured = true;
    console.log("Firebase client initialized successfully.");
  } catch (error) {
    console.error("Firebase client initialization failed:", error);
  }
} else {
  console.log("Firebase config variables empty. Frontend is running in Local Mock Authentication Mode.");
}

// Mock auth helper functions if real Firebase is not set up
const loginMock = async (email, password) => {
  if (email === 'admin@homi.com' && password === 'admin123') {
    return {
      user: {
        uid: 'mock_admin',
        email: 'admin@homi.com',
        displayName: 'Homi Admin',
        getIdToken: async () => 'mock-admin-token'
      }
    };
  }
  throw new Error("Invalid admin credentials");
};

export const signInAdmin = async (email, password) => {
  if (isFirebaseConfigured) {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      // If user isn't found in real firebase, check if they want to login via mock fallback
      if (email === 'admin@homi.com' && password === 'admin123') {
        return await loginMock(email, password);
      }
      throw e;
    }
  } else {
    return await loginMock(email, password);
  }
};

export const signOutAdmin = async () => {
  if (isFirebaseConfigured && auth.currentUser) {
    await fbSignOut(auth);
  }
  localStorage.removeItem('homi_admin_token');
};

export { auth, isFirebaseConfigured };
