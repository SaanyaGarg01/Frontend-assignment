import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, limit } from "firebase/firestore";
import { ActivityEvent } from "@/types";

export function useActivity(docId: string | undefined) {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    if (!docId) return;

    const q = query(
      collection(db, "activity"),
      where("docId", "==", docId),
      orderBy("timestamp", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ActivityEvent[];
      setActivities(docs);
    });

    return () => unsubscribe();
  }, [docId]);

  const logActivity = async (
    userName: string | undefined, 
    userColor: string | undefined, 
    action: string, 
    cellId?: string
  ) => {
    if (!docId || !userName || !userColor) return;
    
    try {
      await addDoc(collection(db, "activity"), {
        docId,
        userName,
        userColor,
        action,
        cellId: cellId || null,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  };

  return { activities, logActivity };
}
