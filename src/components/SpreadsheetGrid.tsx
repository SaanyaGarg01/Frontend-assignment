"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Cell } from "./Cell";
import { CellsState, CellData } from "@/types";
import { coordToCellId, coordToExcelRef } from "@/lib/formulaParser";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SpreadsheetGridProps {
  cells: CellsState;
  onUpdateCell: (row: number, col: number, value: string) => void;
  onCursorMove: (row: number, col: number) => void;
  activeCell: { row: number; col: number };
  setActiveCell: React.Dispatch<React.SetStateAction<{ row: number; col: number }>>;
}

const DEFAULT_ROWS = 50;
const DEFAULT_COLS = 26; // A to Z

export const SpreadsheetGrid = ({ cells, onUpdateCell, onCursorMove, activeCell, setActiveCell }: SpreadsheetGridProps) => {
  const [colWidths, setColWidths] = useState<number[]>(new Array(DEFAULT_COLS).fill(120));
  const gridRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback((row: number, col: number) => {
    setActiveCell({ row, col });
    onCursorMove(row, col);
  }, [onCursorMove, setActiveCell]);

  const handleNavigate = useCallback((direction: string) => {
    setActiveCell(prev => {
      let next = { ...prev };
      if (direction === "up") next.row = Math.max(0, prev.row - 1);
      if (direction === "down") next.row = Math.min(DEFAULT_ROWS - 1, prev.row + 1);
      if (direction === "left") next.col = Math.max(0, prev.col - 1);
      if (direction === "right") next.col = Math.min(DEFAULT_COLS - 1, prev.col + 1);
      
      onCursorMove(next.row, next.col);
      return next;
    });
  }, [onCursorMove, setActiveCell]);

  // Column resizing logic
  const [resizing, setResizing] = useState<{ index: number; startX: number; startWidth: number } | null>(null);

  const onResizeStart = (e: React.MouseEvent, index: number) => {
    setResizing({
      index,
      startX: e.clientX,
      startWidth: colWidths[index],
    });
    e.preventDefault();
  };

  useEffect(() => {
    if (!resizing) return;

    const onMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - resizing.startX;
      const newWidths = [...colWidths];
      newWidths[resizing.index] = Math.max(50, resizing.startWidth + delta);
      setColWidths(newWidths);
    };

    const onMouseUp = () => {
      setResizing(null);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [resizing, colWidths]);

  const gridTemplateColumns = `40px ${colWidths.map(w => `${w}px`).join(" ")}`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative h-full overflow-auto bg-slate-50/50" 
      ref={gridRef}
    >
      <div 
        className="grid border-separate" 
        style={{ gridTemplateColumns, borderSpacing: 0 }}
      >
        {/* Top-left corner */}
        <div className="sticky top-0 left-0 z-30 flex h-8 items-center justify-center border-r border-b border-gray-300 bg-gray-50 shadow-[2px_2px_0px_rgba(0,0,0,0.02)]" />

        {/* Column Headers */}
        {Array.from({ length: DEFAULT_COLS }).map((_, i) => (
          <div 
            key={`col-${i}`} 
            className="sticky top-0 z-20 flex h-8 items-center justify-center border-r border-b border-gray-300 bg-gray-50 text-xs font-semibold text-gray-500 shadow-[0px_2px_0px_rgba(0,0,0,0.02)] select-none group"
            style={{ width: colWidths[i] }}
          >
            {String.fromCharCode(65 + i)}
            <div 
              className="absolute right-0 top-0 h-full w-[4px] cursor-col-resize hover:bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity z-30"
              onMouseDown={(e) => onResizeStart(e, i)}
            />
          </div>
        ))}

        {/* Rows */}
        {Array.from({ length: DEFAULT_ROWS }).map((_, r) => (
          <React.Fragment key={`row-${r}`}>
            {/* Row Header */}
            <div className="sticky left-0 z-10 flex h-[32px] items-center justify-center border-r border-b border-gray-300 bg-gray-50 text-[10px] font-bold text-gray-400 select-none shadow-[2px_0px_0px_rgba(0,0,0,0.02)]">
              {r + 1}
            </div>

            {/* Cells */}
            {Array.from({ length: DEFAULT_COLS }).map((_, c) => {
              const cellId = coordToCellId(r, c);
              return (
                <Cell
                  key={cellId}
                  row={r}
                  col={c}
                  data={cells[cellId]}
                  isSelected={activeCell.row === r || activeCell.col === c}
                  isActive={activeCell.row === r && activeCell.col === c}
                  onSelect={handleSelect}
                  onUpdate={onUpdateCell}
                  onNavigate={handleNavigate}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </motion.div>
  );
};
