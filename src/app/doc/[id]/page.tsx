"use client";

import { useAuth } from "@/hooks/useAuth";
import { useDocument } from "@/hooks/useDocument";
import { usePresence } from "@/hooks/usePresence";
import { SpreadsheetGrid } from "@/components/SpreadsheetGrid";
import { Toolbar } from "@/components/Toolbar";
import { PresenceBar } from "@/components/PresenceBar";
import { DocSkeleton } from "@/components/Skeletons";
import { FormulaBar } from "@/components/FormulaBar";
import { ActivityPanel } from "@/components/ActivityPanel";
import { useActivity } from "@/hooks/useActivity";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { coordToExcelRef } from "@/lib/formulaParser";
import { motion } from "framer-motion";

export default function DocPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { document, cells, writeState, loading: docLoading, updateCell } = useDocument(id, user?.id || "");
  const { presences, updateCursor } = usePresence(id, user);
  const { activities, logActivity } = useActivity(id);

  const [activeCell, setActiveCell] = useState<{ row: number; col: number }>({ row: 0, col: 0 });

  const handleUpdateCellWrapper = async (row: number, col: number, value: string) => {
    await updateCell(row, col, value);
    if (user && value !== cells[`${row}-${col}`]?.value) {
      logActivity(user.name, user.color, `updated cell`, coordToExcelRef(row, col));
    }
  };

  const handleFormatCell = (formatKey: string, value: any) => {
    if (!cells) return;
    const cellId = `${activeCell.row}-${activeCell.col}`;
    const currentCell = cells[cellId];
    const newFormat = {
      ...(currentCell?.format || {}),
      [formatKey]: value,
    };
    updateCell(activeCell.row, activeCell.col, currentCell?.value || "", newFormat);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/dashboard");
    }
  }, [authLoading, user, router]);

  const exportToCSV = () => {
    if (!cells) return;

    let csvContent = "";
    const maxRow = 50;
    const maxCol = 26;

    for (let r = 0; r < maxRow; r++) {
      const rowData = [];
      for (let c = 0; c < maxCol; c++) {
        const cellData = cells[`${r}-${c}`];
        rowData.push(`"${(cellData?.computedValue ?? "").toString().replace(/"/g, '""')}"`);
      }
      csvContent += rowData.join(",") + "\n";
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = window.document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${document?.title || "spreadsheet"}.csv`);
    link.style.visibility = "hidden";
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  if (authLoading || docLoading) {
    return <DocSkeleton />;
  }

  if (!document) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Document not found</h1>
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#fafafa] overflow-hidden font-sans">
      {/* Document Navbar */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex h-16 items-center justify-between border-b border-gray-200 bg-white/90 backdrop-blur-md px-4 shadow-sm z-40 relative"
      >
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="rounded-full p-2 hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="h-8 w-[1px] bg-gray-200" />
          <Toolbar 
            docId={id} 
            title={document.title} 
            writeState={writeState}
            onExport={exportToCSV}
            activeCell={activeCell}
            activeCellData={cells[`${activeCell.row}-${activeCell.col}`]}
            onFormatCell={handleFormatCell}
          />
        </div>
        
        <div className="flex items-center gap-6">
          <PresenceBar presences={presences} currentUser={user} />
          {user && (
            <div 
              className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm ring-2 ring-blue-50"
              style={{ backgroundColor: user.color }}
              title={user.name}
            >
              {user.name[0].toUpperCase()}
            </div>
          )}
        </div>
      </motion.div>

      {/* Formula Bar */}
      <FormulaBar 
        activeCellData={cells[`${activeCell.row}-${activeCell.col}`]} 
        activeCellId={`${activeCell.row}-${activeCell.col}`}
        onUpdateFormula={(val) => handleUpdateCellWrapper(activeCell.row, activeCell.col, val)}
      />

      {/* Editor Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Spreadsheet Grid container */}
        <div className="flex-1 overflow-hidden">
          <SpreadsheetGrid 
            cells={cells}
            presences={presences}
            onUpdateCell={handleUpdateCellWrapper}
            onCursorMove={updateCursor}
            activeCell={activeCell}
            setActiveCell={setActiveCell}
          />
        </div>
        
        {/* Activity Panel Sidebar */}
        <ActivityPanel activities={activities} />
      </div>

      {/* Footer / Status Bar */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex h-8 items-center justify-between border-t border-gray-200 bg-white px-4 text-[11px] font-semibold text-gray-500 z-40 relative shadow-[0_-2px_4px_rgba(0,0,0,0.02)]"
      >
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]"></span>
            Ready
          </span>
          <div className="h-3 w-[1px] bg-slate-200" />
          <span>{50 * 26} cells</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>{writeState === 'saved' ? 'All changes saved to cloud' : 'Syncing...'}</span>
        </div>
      </motion.div>
    </div>
  );
}
