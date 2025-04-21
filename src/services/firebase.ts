// src/services/firebase.ts
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAXw9kIiYSqriU-xaK8wVyxvj8cd_neUZM",
  authDomain: "equipa-diferente.firebaseapp.com",
  projectId: "equipa-diferente",
  storageBucket: "equipa-diferente.firebasestorage.app",
  messagingSenderId: "478976697670",
  appId: "1:478976697670:web:f147f16371483d173ab147",
  measurementId: "G-H6ENY6889N",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const suggestionsCol = collection(db, "suggestions");
const userSettingsCol = collection(db, "userSettings");

/**
 * Returns an array of suggestion strings for the given field,
 * optionally filtered by a prefix (case‑insensitive).
 */
export async function fetchSuggestions(
  field: string,
  prefix: string
): Promise<string[]> {
  // fetch all for that field
  const q = query(suggestionsCol, where("field", "==", field));
  const snap = await getDocs(q);
  const all = snap.docs.map((d) => d.data().value as string);
  if (!prefix) return Array.from(new Set(all));
  const lower = prefix.toLowerCase();
  return Array.from(
    new Set(all.filter((v) => v.toLowerCase().includes(lower)))
  );
}

/**
 * Adds a new suggestion document ONLY if an identical one
 * (same field AND same value) doesn't already exist.
 */
export async function addSuggestion(field: string, value: string) {
  const trimmed = value.trim();
  if (!trimmed) return;
  // check for existing
  const q = query(
    suggestionsCol,
    where("field", "==", field),
    where("value", "==", trimmed)
  );
  const snap = await getDocs(q);
  if (snap.empty) {
    await addDoc(suggestionsCol, { field, value: trimmed });
  }
}

interface UserSettings {
  darkMode: boolean;
}

export async function getUserSettings(
  userId: string
): Promise<UserSettings | null> {
  const docRef = doc(userSettingsCol, userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserSettings;
  }
  return null;
}

export async function updateUserSettings(
  userId: string,
  settings: UserSettings
): Promise<void> {
  const docRef = doc(userSettingsCol, userId);
  await setDoc(docRef, settings, { merge: true });
}
