import { useState, useEffect, useRef, useCallback } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  setDoc, 
  doc, 
  deleteDoc,
  serverTimestamp 
} from "firebase/firestore";
import { Presence, User } from "@/types";

export function usePresence(docId: string, user: User | null) {
  const [presences, setPresences] = useState<Presence[]>([]);
  const cursorUpdateRef = useRef<NodeJS.Timeout | null>(null);
  const lastCursorRef = useRef<{ row: number; col: number } | null>(null);

  useEffect(() => {
    if (!user || !docId) return;

    const presenceRef = doc(db, "presence", `${docId}_${user.id}`);
    
    // Update presence on mount
    const updatePresence = async (cursor?: { row: number; col: number }) => {
      try {
        await setDoc(presenceRef, {
          userId: user.id,
          docId,
          name: user.name,
          color: user.color,
          photoURL: user.photoURL,
          lastSeen: serverTimestamp(),
          cursor: cursor || null,
        });
      } catch (err) {
        console.error("Presence update failed", err);
      }
    };

    updatePresence();
    const interval = setInterval(updatePresence, 30000); // Heartbeat every 30s

    // Listener for all presences in this doc
    const q = query(collection(db, "presence"), where("docId", "==", docId));
    const unsub = onSnapshot(q, (snapshot) => {
      const now = Date.now();
      const docs = snapshot.docs
        .map((d) => d.data() as Presence)
        .filter((p) => {
          // Filter out users who haven't been seen in 2 minutes (timeout)
          const lastSeen = p.lastSeen?.toMillis?.() || 0;
          return now - lastSeen < 120000;
        });
      setPresences(docs);
    });

    // Cleanup presence on unmount
    return () => {
      clearInterval(interval);
      if (cursorUpdateRef.current) clearTimeout(cursorUpdateRef.current);
      deleteDoc(presenceRef).catch(console.error);
      unsub();
    };
  }, [docId, user]);

  const updateCursor = useCallback(async (row: number, col: number) => {
    if (!user || !docId) return;
    
    // Only update if cursor actually changed
    if (lastCursorRef.current?.row === row && lastCursorRef.current?.col === col) {
      return;
    }
    
    lastCursorRef.current = { row, col };
    
    // Clear previous pending update
    if (cursorUpdateRef.current) clearTimeout(cursorUpdateRef.current);
    
    // Debounce cursor updates to avoid too many Firestore writes
    cursorUpdateRef.current = setTimeout(async () => {
      try {
        const presenceRef = doc(db, "presence", `${docId}_${user.id}`);
        await setDoc(presenceRef, {
          cursor: { row, col },
          lastSeen: serverTimestamp(),
        }, { merge: true });
      } catch (err) {
        console.error("Cursor update failed", err);
      }
    }, 100); // 100ms debounce
  }, [user, docId]);

  return { presences, updateCursor };
}
