"use client";

import React, { useState, useEffect, useRef } from "react";
import { CellData } from "@/types";
import { cn } from "@/lib/utils";

interface CellProps {
  row: number;
  col: number;
  data: CellData | undefined;
  isSelected: boolean;
  isActive: boolean;
  onSelect: (row: number, col: number) => void;
  onUpdate: (row: number, col: number, value: string) => void;
  onNavigate: (direction: string) => void;
}

export const Cell = React.memo(({
  row,
  col,
  data,
  isSelected,
  isActive,
  onSelect,
  onUpdate,
  onNavigate,
}: CellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data?.value || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isActive && isEditing) {
      inputRef.current?.focus();
    }
  }, [isActive, isEditing]);

  useEffect(() => {
    setEditValue(data?.value || "");
  }, [data?.value]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isEditing) {
      if (e.key === "Enter") {
        onUpdate(row, col, editValue);
        setIsEditing(false);
        onNavigate("down");
      } else if (e.key === "Escape") {
        setEditValue(data?.value || "");
        setIsEditing(false);
      }
      return;
    }

    if (isActive) {
      if (e.key === "Enter") {
        setIsEditing(true);
        e.preventDefault();
      } else if (e.key === "ArrowUp") {
        onNavigate("up");
        e.preventDefault();
      } else if (e.key === "ArrowDown") {
        onNavigate("down");
        e.preventDefault();
      } else if (e.key === "ArrowLeft") {
        onNavigate("left");
        e.preventDefault();
      } else if (e.key === "ArrowRight") {
        onNavigate("right");
        e.preventDefault();
      } else if (e.key === "Tab") {
        onNavigate(e.shiftKey ? "left" : "right");
        e.preventDefault();
      } else if (e.key === "Backspace" || e.key === "Delete") {
        onUpdate(row, col, "");
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        setEditValue(e.key);
        setIsEditing(true);
      }
    }
  };

  const handleBlur = () => {
    if (isEditing) {
      onUpdate(row, col, editValue);
      setIsEditing(false);
    }
  };

  const displayValue = data?.computedValue !== undefined ? data.computedValue : "";
  const isFormula = data?.value?.startsWith("=");

  return (
    <div
      onClick={() => onSelect(row, col)}
      onDoubleClick={handleDoubleClick}
      className={cn(
        "cell group relative flex items-center overflow-hidden min-h-[30px] px-2 text-[13px] font-[500] text-slate-700 transition-all cursor-cell",
        isSelected && !isActive && "bg-blue-50/60",
        isActive && !isEditing && "active-cell ring-inset",
        isEditing && "editing-cell",
        data?.format?.bold && "font-bold",
        data?.format?.italic && "italic",
        data?.format?.textAlign === "center" && "justify-center",
        data?.format?.textAlign === "right" && "justify-end",
      )}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          className="absolute inset-0 w-full h-full border-none outline-none px-2 z-20 text-[13px] bg-transparent text-blue-900 font-semibold selection:bg-blue-200"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          autoFocus
        />
      ) : (
        <span className={cn(
          "truncate w-full select-none",
          typeof displayValue === 'number' ? "text-right font-mono" : "text-left",
          displayValue === "#ERROR" && "text-red-500 font-bold",
          !displayValue && "text-transparent"
        )}>
          {displayValue || "空"}
        </span>
      )}
      
      {/* Formula indicator */}
      {isFormula && !isEditing && (
        <div className="absolute top-0 right-0 w-0 h-0 border-t-[6px] border-l-[6px] border-t-purple-500 border-l-transparent drop-shadow-sm" />
      )}
    </div>
  );
});

Cell.displayName = "Cell";
