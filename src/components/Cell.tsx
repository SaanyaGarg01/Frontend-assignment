"use client";

import React, { useState, useEffect, useRef } from "react";
import { CellData, Presence } from "@/types";
import { cn } from "@/lib/utils";
import { coordToExcelRef } from "@/lib/formulaParser";

interface CellProps {
  row: number;
  col: number;
  data: CellData | undefined;
  isSelected: boolean;
  isActive: boolean;
  foreignPresences?: Presence[];
  onSelect: (row: number, col: number) => void;
  onUpdate: (row: number, col: number, value: string) => void;
  onNavigate: (direction: string) => void;
  height?: number;
}

export const Cell = React.memo(({
  row,
  col,
  data,
  isSelected,
  isActive,
  foreignPresences = [],
  onSelect,
  onUpdate,
  onNavigate,
  height = 32,
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

  // Get alignment for both container and span
  const getAlignmentClass = () => {
    switch(data?.format?.textAlign) {
      case "center": return "text-center justify-center";
      case "right": return "text-right justify-end";
      default: return "text-left justify-start";
    }
  };

  return (
    <div
      onClick={() => onSelect(row, col)}
      onDoubleClick={handleDoubleClick}
      className={cn(
        "cell group relative flex items-center overflow-hidden text-[13px] font-[500] text-gray-800 cursor-cell",
        isSelected && !isActive && "bg-indigo-50/80",
        isActive && !isEditing && "active-cell",
        isEditing && "editing-cell",
        data?.format?.bold && "font-bold",
        data?.format?.italic && "italic",
        getAlignmentClass(),
        "px-[7px]"
      )}
      style={{
        color: data?.format?.color || undefined,
        backgroundColor: data?.format?.backgroundColor ? `${data.format.backgroundColor}40` : undefined,
      }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          className={cn(
            "absolute inset-0 w-full h-full border-none outline-none font-[500] px-[7px] z-20 text-[13px] bg-transparent text-indigo-900 selection:bg-indigo-200",
            data?.format?.bold && "font-bold",
            data?.format?.italic && "italic",
            getAlignmentClass()
          )}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          autoFocus
        />
      ) : (
        <span className={cn(
          "truncate w-full select-none",
          typeof displayValue === 'number' ? "font-mono" : "",
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

      {/* Real-Time Collaboration Visuals */}
      {foreignPresences.length > 0 && (
        <>
          {/* Solid colored border for each collaborator */}
          {foreignPresences.map((p, idx) => (
            <div
              key={`border-${p.userId}`}
              className="absolute inset-0 pointer-events-none z-[5] animate-pulse"
              style={{
                border: `3px solid ${p.color}`,
                borderRadius: '2px',
              }}
            />
          ))}

          {/* Tooltip showing who is editing */}
          <div className="absolute -top-8 left-0 right-0 flex gap-1 justify-start pointer-events-none z-20">
            {foreignPresences.map((p) => (
              <div
                key={`tooltip-${p.userId}`}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md shadow-lg text-xs font-semibold text-white whitespace-nowrap"
                style={{ backgroundColor: p.color }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                <span>{p.name.split(' ')[0]} is editing</span>
              </div>
            ))}
          </div>

          {/* Alternative: Show as background badge on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[3]">
            <div className="flex h-full items-end justify-end p-1">
              <div className="flex -space-x-1">
                {foreignPresences.map((p) => (
                  <div
                    key={`avatar-${p.userId}`}
                    className="h-5 w-5 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white shadow-md"
                    style={{ backgroundColor: p.color }}
                    title={`${p.name} is editing this cell`}
                  >
                    {p.name[0].toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

Cell.displayName = "Cell";
