import { useState, useEffect, useCallback, useRef } from "react";
import { db } from "@/lib/firebase";
import { 
  doc, 
  onSnapshot, 
  updateDoc, 
  collection, 
  query, 
  where, 
  serverTimestamp,
  setDoc,
  writeBatch
} from "firebase/firestore";
import { CellsState, CellData, WriteState, SpreadsheetDocument } from "@/types";
import { evaluateFormula, coordToCellId } from "@/lib/formulaParser";
import debounce from "lodash/debounce";

export function useDocument(docId: string, userId: string) {
  const [document, setDocument] = useState<SpreadsheetDocument | null>(null);
  const [cells, setCells] = useState<CellsState>({});
  const [writeState, setWriteState] = useState<WriteState>("saved");
  const [loading, setLoading] = useState(true);
  
  // Local cache for optimistic updates
  const localCellsRef = useRef<CellsState>({});

  // Sync document metadata
  useEffect(() => {
    const timeout = setTimeout(() => {
      // If doc fetch hangs, fallback to a local mock so we don't trap user
      if (!document) {
        setDocument({
          id: docId,
          title: "Local Spreadsheet (Offline)",
          ownerId: userId,
          ownerName: "Local User",
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() }
        } as any);
      }
    }, 2000);

    const unsub = onSnapshot(doc(db, "documents", docId), (snap) => {
      clearTimeout(timeout);
      if (snap.exists()) {
        setDocument({ id: snap.id, ...snap.data() } as SpreadsheetDocument);
      }
    }, () => {
      clearTimeout(timeout);
      setDocument({
        id: docId,
        title: "Local Spreadsheet (Offline)",
        ownerId: userId,
        ownerName: "Local User",
        createdAt: { toDate: () => new Date() },
        updatedAt: { toDate: () => new Date() }
      } as any);
    });

    return () => {
      clearTimeout(timeout);
      unsub();
    };
  }, [docId, userId]);

  // Sync cells
  useEffect(() => {
    const q = query(collection(db, "cells"), where("docId", "==", docId));
    
    const timeout = setTimeout(() => setLoading(false), 2000);

    const unsub = onSnapshot(q, (snapshot) => {
      clearTimeout(timeout);
      const newCells: CellsState = {};
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const cellId = `${data.row}-${data.col}`;
        newCells[cellId] = {
          value: data.value,
          computedValue: data.computedValue,
          updatedBy: data.updatedBy,
          updatedAt: data.updatedAt,
          format: data.format,
        };
      });
      
      setCells(newCells);
      localCellsRef.current = newCells;
      setLoading(false);
    }, () => {
      clearTimeout(timeout);
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      unsub();
    };
  }, [docId]);

  // Handle offline/online state
  useEffect(() => {
    const handleOffline = () => setWriteState("offline");
    const handleOnline = () => setWriteState("saved");
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  const updateCell = useCallback(
    async (row: number, col: number, value: string, format?: any) => {
      const cellId = coordToCellId(row, col);
      setWriteState("saving");

      // Optimistic update
      const updatedCells = { ...localCellsRef.current };
      const computedValue = value.startsWith("=") 
        ? evaluateFormula(value, updatedCells) 
        : (isNaN(parseFloat(value)) ? value : parseFloat(value));

      // Merge with existing format if no new format is provided
      const finalFormat = format !== undefined ? format : updatedCells[cellId]?.format;

      const newCellData: CellData = {
        value,
        computedValue,
        updatedBy: userId,
        updatedAt: new Date(), // Local timestamp
        format: finalFormat
      };

      updatedCells[cellId] = newCellData;
      setCells(updatedCells);
      localCellsRef.current = updatedCells;

      // Persist to Firestore
      try {
        const cellDocRef = doc(db, "cells", `${docId}_${row}_${col}`);
        
        const dataToSave: any = {
          docId,
          row,
          col,
          ...newCellData,
          updatedAt: serverTimestamp(),
        };

        // Firestore does not allow undefined values, so we must clean them up
        Object.keys(dataToSave).forEach((key) => {
          if (dataToSave[key] === undefined) {
            delete dataToSave[key];
          }
        });

        await setDoc(cellDocRef, dataToSave, { merge: true });

        // Update document last modified
        await updateDoc(doc(db, "documents", docId), {
          updatedAt: serverTimestamp(),
        });

        setWriteState("saved");
      } catch (error) {
        console.error("Error updating cell:", error);
        setWriteState("error");
      }
    },
    [docId, userId]
  );

  const debouncedUpdateCell = useRef(
    debounce((row: number, col: number, value: string, format?: any) => {
      updateCell(row, col, value, format);
    }, 500)
  ).current;

  return {
    document,
    cells,
    writeState,
    loading,
    updateCell,
    debouncedUpdateCell
  };
}
