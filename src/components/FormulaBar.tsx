import React, { useState, useEffect } from "react";
import { FunctionSquare } from "lucide-react";
import { CellData } from "@/types";

interface FormulaBarProps {
  activeCellData?: CellData;
  activeCellId: string;
  onUpdateFormula: (value: string) => void;
}

export const FormulaBar = ({ activeCellData, activeCellId, onUpdateFormula }: FormulaBarProps) => {
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(activeCellData?.value || "");
  }, [activeCellData?.value, activeCellId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleBlur = () => {
    if (value !== (activeCellData?.value || "")) {
      onUpdateFormula(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onUpdateFormula(value);
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-1.5 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
      <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-gray-500 border border-gray-200 shrink-0">
        <FunctionSquare className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1">
        <input
          type="text"
          className="w-full text-[13px] font-mono outline-none bg-transparent placeholder-gray-400 text-gray-800 focus:ring-1 focus:ring-indigo-500/20 rounded px-1 min-h-[24px]"
          placeholder="Enter a value or formula (e.g. =SUM(A1:B5))"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
};
