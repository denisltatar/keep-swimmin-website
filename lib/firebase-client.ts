import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  projectId: "keepswimmin-ios",
  appId: "1:76251509001:web:6a955ae9d83db80859e3d8",
  storageBucket: "keepswimmin-ios.firebasestorage.app",
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "missing-firebase-api-key",
  authDomain: "keepswimmin-ios.firebaseapp.com",
  messagingSenderId: "76251509001",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);
export const firestore = getFirestore(app);
export const firebaseStorage = getStorage(app);
