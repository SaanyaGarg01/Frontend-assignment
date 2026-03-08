import { useState, useEffect } from "react";
import { auth, googleProvider, db } from "@/lib/firebase";
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { User } from "@/types";

const COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#10b981", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#d946ef", "#f43f5e"
];

let isLoggingIn = false;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Check if user exists in DB or create new profile
          const userDoc = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(userDoc);
          
          let userData: User;
          
          if (snap.exists()) {
            userData = snap.data() as User;
          } else {
            const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
            userData = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || "Anonymous User",
              color: randomColor,
            };
            if (firebaseUser.email) userData.email = firebaseUser.email;
            if (firebaseUser.photoURL) userData.photoURL = firebaseUser.photoURL;

            await setDoc(userDoc, {
              ...userData,
              createdAt: serverTimestamp(),
            });
          }
          setUser(userData);
        } catch (error: any) {
          if (error.code !== "unavailable" && !error.message?.includes("offline")) {
            console.error("Error fetching or creating user profile in Firestore:", error);
          }
          // Fallback to basic user data without Firestore if db fails
          const fallbackData: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || "Anonymous User",
            color: COLORS[0],
          };
          if (firebaseUser.email) fallbackData.email = firebaseUser.email;
          if (firebaseUser.photoURL) fallbackData.photoURL = firebaseUser.photoURL;
          setUser(fallbackData);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    if (isLoggingIn) return;
    isLoggingIn = true;
    setIsSigningIn(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === "auth/unauthorized-domain") {
        setAuthError(error.code);
      }
      const ignoredErrors = [
        "auth/cancelled-popup-request",
        "auth/popup-closed-by-user",
        "auth/popup-blocked",
        "auth/internal-error",
        "auth/configuration-not-found"
      ];
      if (!ignoredErrors.includes(error.code) && error.code !== "auth/unauthorized-domain") {
        console.error("Login failed", error);
        setAuthError(error.message || "Failed to sign in");
      }
    } finally {
      isLoggingIn = false;
      setIsSigningIn(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const setDisplayName = async (name: string) => {
    if (!user) return;
    const userDoc = doc(db, "users", user.id);
    await setDoc(userDoc, { name }, { merge: true });
    setUser({ ...user, name });
  };

  return { user, loading, isSigningIn, authError, loginWithGoogle, logout, setDisplayName };
}
