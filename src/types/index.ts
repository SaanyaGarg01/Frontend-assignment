export interface User {
  id: string;
  name: string;
  email?: string;
  photoURL?: string;
  color: string;
}

export interface SpreadsheetDocument {
  id: string;
  title: string;
  ownerId: string;
  ownerName: string;
  createdAt: any;
  updatedAt: any;
}

export interface CellData {
  value: string; // The raw input (e.g., "=A1+B1")
  computedValue: string | number | null;
  format?: {
    bold?: boolean;
    italic?: boolean;
    textAlign?: "left" | "center" | "right";
  };
  updatedBy: string;
  updatedAt: any;
}

export interface CellsState {
  [cellId: string]: CellData; // cellId is "row-col"
}

export interface Presence {
  userId: string;
  name: string;
  color: string;
  photoURL?: string;
  lastSeen: any;
  cursor?: {
    row: number;
    col: number;
  };
}

export type WriteState = "saving" | "saved" | "offline" | "error";
