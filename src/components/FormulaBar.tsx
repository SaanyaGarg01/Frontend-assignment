import React, { useState, useEffect } from "react";
import { FunctionSquare, HelpCircle } from "lucide-react";
import { CellData } from "@/types";

interface FormulaBarProps {
  activeCellData?: CellData;
  activeCellId: string;
  onUpdateFormula: (value: string) => void;
}

const FORMULA_HINTS = [
  { formula: 'SUM(A1:A5)', description: 'Add all numbers in range' },
  { formula: 'AVERAGE(A1:A5)', description: 'Calculate average of range' },
  { formula: 'MAX(A1:A5)', description: 'Find maximum value' },
  { formula: 'MIN(A1:A5)', description: 'Find minimum value' },
  { formula: 'COUNT(A1:A5)', description: 'Count non-empty cells' },
  { formula: 'A1+B1', description: 'Basic arithmetic' },
];

export const FormulaBar = ({ activeCellData, activeCellId, onUpdateFormula }: FormulaBarProps) => {
  const [value, setValue] = useState("");
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    setValue(activeCellData?.value || "");
  }, [activeCellData?.value, activeCellId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setShowHints(e.target.value.startsWith("=") && e.target.value.length > 1);
  };

  const handleBlur = () => {
    if (value !== (activeCellData?.value || "")) {
      onUpdateFormula(value);
    }
    setShowHints(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onUpdateFormula(value);
      (e.target as HTMLInputElement).blur();
      setShowHints(false);
    } else if (e.key === "Escape") {
      setShowHints(false);
    }
  };

  return (
    <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-1.5 shadow-[0_2px_4px_rgba(0,0,0,0.02)] relative"
    >
      <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-gray-500 border border-gray-200 shrink-0">
        <FunctionSquare className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 relative">
        <input
          type="text"
          className="w-full text-[13px] font-mono outline-none bg-transparent placeholder-gray-400 text-gray-800 focus:ring-1 focus:ring-indigo-500/20 rounded px-1 min-h-[24px]"
          placeholder="Enter a value or formula (e.g. =SUM(A1:B5))"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          spellCheck="false"
        />
        
        {/* Formula Hints Popup */}
        {showHints && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-64">
            <div className="p-2 border-b border-gray-100 flex items-center gap-2 text-xs font-semibold text-gray-600">
              <HelpCircle className="h-3.5 w-3.5" />
              Available Formulas
            </div>
            <div className="max-h-48 overflow-y-auto">
              {FORMULA_HINTS.map((hint, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setValue(`=${hint.formula.split('(')[1].split(')')[0]}')`);
                    setShowHints(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-indigo-50 transition-colors border-b border-gray-50 last:border-b-0"
                >
                  <div className="font-mono text-indigo-600 font-semibold">{hint.formula}</div>
                  <div className="text-gray-500 text-[11px]">{hint.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
