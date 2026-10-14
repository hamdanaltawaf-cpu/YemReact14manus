import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut, 
  User,
  Auth
} from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import firebaseConfigImport from "../../firebase-applet-config.json";

// Safe ESM alignment for JSON default import
const firebaseConfig = (firebaseConfigImport as any).default || firebaseConfigImport;

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

// Robust verification to prevent top-level client crashes
const hasValidConfig = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== "";

if (hasValidConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    // Initialize Firestore safely with database ID from dynamic configuration
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    
    // Initialize standard Authentication engine safely
    auth = getAuth(app);
  } catch (error) {
    console.error("Firebase Initialization Exception:", error);
  }
} else {
  console.warn("Firebase configuration is missing or incomplete. Authentication is disabled.");
}

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});

/**
 * Initiates signing in with Google via popup window.
 */
export const signInWithGoogle = async (): Promise<User> => {
  if (!auth) {
    throw new Error("خدمة تسجيل الدخول بـ Google غير مفعّلة حالياً بسبب عدم تفعيل إعدادات Firebase.");
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Firebase Sign In Error:", error);
    throw error;
  }
};

/**
 * Terminate current user session.
 */
export const signOut = async (): Promise<void> => {
  if (!auth) {
    throw new Error("خدمة تسجيل الخروج غير مفعّلة حالياً بسبب عدم تفعيل إعدادات Firebase.");
  }
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Firebase Sign Out Error:", error);
    throw error;
  }
};

/**
 * Retrieve current active user.
 */
export const getCurrentUser = (): User | null => {
  if (!auth) return null;
  return auth.currentUser;
};

export { app, db, auth };
