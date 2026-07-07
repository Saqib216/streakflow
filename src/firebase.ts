/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// Always set custom parameters to optimize user experience
googleProvider.setCustomParameters({
  prompt: "select_account"
});

export const db = getFirestore(app, "ai-studio-streakflow-1dc3b81f-717f-4735-b124-ff4d0dcdf48a");

export { signInWithPopup, signOut, onAuthStateChanged };
export type { User };
