"use client";

import React, { useState } from "react";
import { 
  Bold, 
  Italic, 
  Download, 
  Save, 
  CheckCircle,
  AlertCircle,
  Undo2,
  Redo2,
  FileSpreadsheet,
  Edit2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Strikethrough
} from "lucide-react";
import { WriteState, CellData } from "@/types";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { coordToExcelRef } from "@/lib/formulaParser";

interface ToolbarProps {
  docId: string;
  title: string;
  writeState: WriteState;
  onExport: () => void;
  activeCell: { row: number; col: number };
  activeCellData?: CellData;
  onFormatCell: (formatKey: string, value: any) => void;
}

export const Toolbar = ({ docId, title, writeState, onExport, activeCell, activeCellData, onFormatCell }: ToolbarProps) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(title);

  const handleTitleSubmit = async () => {
    if (localTitle.trim() === "" || localTitle === title) {
      setLocalTitle(title);
      setEditingTitle(false);
      return;
    }

    try {
      await updateDoc(doc(db, "documents", docId), {
        title: localTitle,
        updatedAt: serverTimestamp(),
      });
      setEditingTitle(false);
    } catch (err) {
      console.error("Failed to update title", err);
      setLocalTitle(title);
      setEditingTitle(false);
    }
  };

  return (
    <div className="flex flex-col bg-transparent flex-1">
      {/* Top Bar */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            {editingTitle ? (
              <input
                autoFocus
                className="text-lg font-bold outline-none ring-2 ring-indigo-500 rounded px-1.5 py-0.5 bg-white shadow-sm"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
              />
            ) : (
              <div 
                className="group flex items-center gap-2 cursor-pointer rounded px-1 -ml-1 hover:bg-slate-100 transition-colors"
                onClick={() => setEditingTitle(true)}
              >
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                  {title}
                </h1>
                <Edit2 className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
            
            <div className="flex items-center gap-3 text-[11px] text-gray-500">
              <div className="flex items-center gap-1">
                {writeState === "saving" && (
                  <><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500 shadow-[0_0_4px_rgba(99,102,241,0.5)]" /> Saving...</>
                )}
                {writeState === "saved" && (
                  <><CheckCircle className="h-3 w-3 text-emerald-500" /> Saved</>
                )}
                {writeState === "offline" && (
                  <><AlertCircle className="h-3 w-3 text-amber-500" /> Working Offline</>
                )}
                {writeState === "error" && (
                  <><AlertCircle className="h-3 w-3 text-red-500" /> Save Error</>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={onExport}
            className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 hover:shadow-sm transition-all border border-gray-200"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>
      {/* Tools Bar */}
      <div className="flex items-center gap-1 px-4 py-1.5 border-t border-slate-200 bg-white shadow-[0_4px_10px_-4px_rgba(0,0,0,0.05)] z-30">
        <div className="flex items-center gap-0.5 pr-2 border-r border-slate-200">
          <ToolbarButton icon={<Undo2 className="h-4 w-4" />} disabled />
          <ToolbarButton icon={<Redo2 className="h-4 w-4" />} disabled />
        </div>
        
        <div className="flex items-center gap-0.5 px-2 border-r border-slate-200">
          <ToolbarButton 
            icon={<Bold className="h-4 w-4" />} 
            active={activeCellData?.format?.bold} 
            onClick={() => onFormatCell("bold", !activeCellData?.format?.bold)} 
          />
          <ToolbarButton 
            icon={<Italic className="h-4 w-4" />} 
            active={activeCellData?.format?.italic} 
            onClick={() => onFormatCell("italic", !activeCellData?.format?.italic)}
          />
        </div>

        <div className="flex items-center gap-0.5 px-2">
          <ToolbarButton 
            icon={<AlignLeft className="h-4 w-4" />} 
            active={!activeCellData?.format?.textAlign || activeCellData?.format?.textAlign === "left"} 
            onClick={() => onFormatCell("textAlign", "left")}
          />
          <ToolbarButton 
            icon={<AlignCenter className="h-4 w-4" />} 
            active={activeCellData?.format?.textAlign === "center"} 
            onClick={() => onFormatCell("textAlign", "center")}
          />
          <ToolbarButton 
            icon={<AlignRight className="h-4 w-4" />} 
            active={activeCellData?.format?.textAlign === "right"} 
            onClick={() => onFormatCell("textAlign", "right")}
          />
        </div>

        <div className="hidden sm:flex items-center gap-2 px-4 text-xs font-bold text-gray-500 bg-gray-100 border border-gray-200 rounded-lg py-1.5 ml-4 shadow-inner">
          Cell: {coordToExcelRef(activeCell.row, activeCell.col)}
        </div>
      </div>
    </div>
  );
};

const ToolbarButton = ({ icon, active = false, disabled = false, onClick }: any) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={cn(
      "flex h-8 w-8 items-center justify-center rounded transition-colors",
      active ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200" : "text-gray-600 hover:bg-gray-100",
      disabled && "opacity-30 cursor-not-allowed"
    )}
  >
    {icon}
  </button>
);
