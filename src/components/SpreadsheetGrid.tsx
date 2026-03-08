"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Cell } from "./Cell";
import { CellsState, CellData, Presence } from "@/types";
import { coordToCellId, coordToExcelRef } from "@/lib/formulaParser";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SpreadsheetGridProps {
  cells: CellsState;
  presences: Presence[];
  onUpdateCell: (row: number, col: number, value: string) => void;
  onCursorMove: (row: number, col: number) => void;
  activeCell: { row: number; col: number };
  setActiveCell: React.Dispatch<React.SetStateAction<{ row: number; col: number }>>;
}

const DEFAULT_ROWS = 50;
const DEFAULT_COLS = 26; // A to Z
const DEFAULT_ROW_HEIGHT = 32;
const DEFAULT_COL_WIDTH = 120;

export const SpreadsheetGrid = ({ cells, presences, onUpdateCell, onCursorMove, activeCell, setActiveCell }: SpreadsheetGridProps) => {
  const [colWidths, setColWidths] = useState<number[]>(new Array(DEFAULT_COLS).fill(DEFAULT_COL_WIDTH));
  const [rowHeights, setRowHeights] = useState<number[]>(new Array(DEFAULT_ROWS).fill(DEFAULT_ROW_HEIGHT));
  const [colOrder, setColOrder] = useState<number[]>(Array.from({ length: DEFAULT_COLS }, (_, i) => i));
  const [rowOrder, setRowOrder] = useState<number[]>(Array.from({ length: DEFAULT_ROWS }, (_, i) => i));
  const [draggedCol, setDraggedCol] = useState<number | null>(null);
  const [draggedRow, setDraggedRow] = useState<number | null>(null);
  const [dragOverCol, setDragOverCol] = useState<number | null>(null);
  const [dragOverRow, setDragOverRow] = useState<number | null>(null);
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
  const [colResizing, setColResizing] = useState<{ index: number; startX: number; startWidth: number } | null>(null);
  
  // Row resizing logic
  const [rowResizing, setRowResizing] = useState<{ index: number; startY: number; startHeight: number } | null>(null);

  const onColResizeStart = (e: React.MouseEvent, index: number) => {
    setColResizing({
      index,
      startX: e.clientX,
      startWidth: colWidths[index],
    });
    e.preventDefault();
  };

  const onRowResizeStart = (e: React.MouseEvent, index: number) => {
    setRowResizing({
      index,
      startY: e.clientY,
      startHeight: rowHeights[index],
    });
    e.preventDefault();
  };

  // Column reordering handlers
  const handleColDragStart = (e: React.DragEvent, colIdx: number) => {
    setDraggedCol(colIdx);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleColDragOver = (e: React.DragEvent, colIdx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCol(colIdx);
  };

  const handleColDrop = (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault();
    if (draggedCol !== null && draggedCol !== dropIdx) {
      const newOrder = [...colOrder];
      const draggedColIdx = newOrder.indexOf(draggedCol);
      const dropColIdx = newOrder.indexOf(dropIdx);
      
      // Swap
      [newOrder[draggedColIdx], newOrder[dropColIdx]] = [newOrder[dropColIdx], newOrder[draggedColIdx]];
      setColOrder(newOrder);
    }
    setDraggedCol(null);
    setDragOverCol(null);
  };

  // Row reordering handlers
  const handleRowDragStart = (e: React.DragEvent, rowIdx: number) => {
    setDraggedRow(rowIdx);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleRowDragOver = (e: React.DragEvent, rowIdx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverRow(rowIdx);
  };

  const handleRowDrop = (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault();
    if (draggedRow !== null && draggedRow !== dropIdx) {
      const newOrder = [...rowOrder];
      const draggedRowIdx = newOrder.indexOf(draggedRow);
      const dropRowIdx = newOrder.indexOf(dropIdx);
      
      // Swap
      [newOrder[draggedRowIdx], newOrder[dropRowIdx]] = [newOrder[dropRowIdx], newOrder[draggedRowIdx]];
      setRowOrder(newOrder);
    }
    setDraggedRow(null);
    setDragOverRow(null);
  };

  useEffect(() => {
    if (!colResizing && !rowResizing) return;

    const onMouseMove = (e: MouseEvent) => {
      if (colResizing) {
        const delta = e.clientX - colResizing.startX;
        const newWidths = [...colWidths];
        newWidths[colResizing.index] = Math.max(50, colResizing.startWidth + delta);
        setColWidths(newWidths);
      }
      
      if (rowResizing) {
        const delta = e.clientY - rowResizing.startY;
        const newHeights = [...rowHeights];
        newHeights[rowResizing.index] = Math.max(24, rowResizing.startHeight + delta);
        setRowHeights(newHeights);
      }
    };

    const onMouseUp = () => {
      setColResizing(null);
      setRowResizing(null);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [colResizing, rowResizing, colWidths, rowHeights]);

  const gridTemplateColumns = `40px ${colWidths.map(w => `${w}px`).join(" ")}`;
  const gridTemplateRows = `32px ${rowHeights.map(h => `${h}px`).join(" ")}`;

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
        style={{ gridTemplateColumns, gridTemplateRows, borderSpacing: 0 }}
      >
        {/* Top-left corner */}
        <div className="sticky top-0 left-0 z-30 flex h-8 items-center justify-center border-r border-b border-gray-300 bg-gray-50 shadow-[2px_2px_0px_rgba(0,0,0,0.02)]" />

        {/* Column Headers */}
        {colOrder.map((colIdx, displayIdx) => (
          <div 
            key={`col-${colIdx}`} 
            className={cn(
              "sticky top-0 z-20 flex h-8 items-center justify-center border-r border-b border-gray-300 bg-gray-50 text-xs font-semibold text-gray-500 shadow-[0px_2px_0px_rgba(0,0,0,0.02)] select-none group cursor-move",
              dragOverCol === colIdx && "bg-indigo-100 border-indigo-400"
            )}
            style={{ width: colWidths[colIdx] }}
            draggable
            onDragStart={(e) => handleColDragStart(e, colIdx)}
            onDragOver={(e) => handleColDragOver(e, colIdx)}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={(e) => handleColDrop(e, colIdx)}
          >
            {String.fromCharCode(65 + colIdx)}
            <div 
              className="absolute right-0 top-0 h-full w-[4px] cursor-col-resize hover:bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity z-30"
              onMouseDown={(e) => onColResizeStart(e, colIdx)}
            />
          </div>
        ))}

        {/* Rows */}
        {rowOrder.map((rowIdx, displayRowIdx) => (
          <React.Fragment key={`row-${rowIdx}`}>
            {/* Row Header */}
            <div 
              className={cn(
                "sticky left-0 z-10 flex items-center justify-center border-r border-b border-gray-300 bg-gray-50 text-[10px] font-bold text-gray-400 select-none shadow-[2px_0px_0px_rgba(0,0,0,0.02)] group relative cursor-move",
                dragOverRow === rowIdx && "bg-indigo-100 border-indigo-400"
              )}
              style={{ height: rowHeights[rowIdx] }}
              draggable
              onDragStart={(e) => handleRowDragStart(e, rowIdx)}
              onDragOver={(e) => handleRowDragOver(e, rowIdx)}
              onDragLeave={() => setDragOverRow(null)}
              onDrop={(e) => handleRowDrop(e, rowIdx)}
            >
              {rowIdx + 1}
              <div 
                className="absolute bottom-0 left-0 w-full h-[4px] cursor-row-resize hover:bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity z-30"
                onMouseDown={(e) => onRowResizeStart(e, rowIdx)}
              />
            </div>

            {/* Cells */}
            {colOrder.map((colIdx) => {
              const cellId = coordToCellId(rowIdx, colIdx);
              const activePresences = presences.filter(p => p.cursor?.row === rowIdx && p.cursor?.col === colIdx);
              
              return (
                <Cell
                  key={cellId}
                  row={rowIdx}
                  col={colIdx}
                  data={cells[cellId]}
                  isSelected={activeCell.row === rowIdx || activeCell.col === colIdx}
                  isActive={activeCell.row === rowIdx && activeCell.col === colIdx}
                  foreignPresences={activePresences}
                  onSelect={handleSelect}
                  onUpdate={onUpdateCell}
                  onNavigate={handleNavigate}
                  height={rowHeights[rowIdx]}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </motion.div>
  );
};
