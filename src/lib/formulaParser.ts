import { CellsState } from "@/types";

export const cellIdToCoord = (cellId: string): { row: number; col: number } => {
  const [row, col] = cellId.split("-").map(Number);
  return { row, col };
};

export const coordToCellId = (row: number, col: number): string => {
  return `${row}-${col}`;
};

export const excelRefToCoord = (ref: string): { row: number; col: number } | null => {
  const match = ref.match(/^([A-Z]+)([0-9]+)$/);
  if (!match) return null;

  const colStr = match[1];
  const rowStr = match[2];

  let col = 0;
  for (let i = 0; i < colStr.length; i++) {
    col = col * 26 + (colStr.charCodeAt(i) - 64);
  }

  return {
    row: parseInt(rowStr) - 1,
    col: col - 1,
  };
};

export const coordToExcelRef = (row: number, col: number): string => {
  let colStr = "";
  let c = col + 1;
  while (c > 0) {
    let remainder = (c - 1) % 26;
    colStr = String.fromCharCode(65 + remainder) + colStr;
    c = Math.floor((c - remainder) / 26);
  }
  return `${colStr}${row + 1}`;
};

export const evaluateFormula = (
  formula: string,
  cells: CellsState,
  visited: Set<string> = new Set()
): string | number => {
  if (!formula.startsWith("=")) return formula;

  const expression = formula.substring(1).toUpperCase();

  // Basic SUM function support: SUM(A1:A5)
  const sumMatch = expression.match(/SUM\(([A-Z0-9:]+)\)/);
  if (sumMatch) {
    const range = sumMatch[1];
    if (range.includes(":")) {
      const [start, end] = range.split(":");
      const startCoord = excelRefToCoord(start);
      const endCoord = excelRefToCoord(end);

      if (startCoord && endCoord) {
        let sum = 0;
        for (let r = Math.min(startCoord.row, endCoord.row); r <= Math.max(startCoord.row, endCoord.row); r++) {
          for (let c = Math.min(startCoord.col, endCoord.col); c <= Math.max(startCoord.col, endCoord.col); c++) {
            const cellId = coordToCellId(r, c);
            const value = getCellValue(cellId, cells, visited);
            sum += typeof value === "number" ? value : parseFloat(value) || 0;
          }
        }
        return sum;
      }
    }
  }

  // Replace cell references with their values
  let evaluatedExpr = expression;
  const cellRefs = expression.match(/[A-Z]+[0-9]+/g) || [];
  
  // Sort by length descending to avoid partial replacement (e.g., A10 replacing A1)
  const sortedRefs = [...new Set(cellRefs)].sort((a, b) => b.length - a.length);

  for (const ref of sortedRefs) {
    const coord = excelRefToCoord(ref);
    if (coord) {
      const cellId = coordToCellId(coord.row, coord.col);
      const value = getCellValue(cellId, cells, visited);
      const numValue = typeof value === "number" ? value : parseFloat(value) || 0;
      evaluatedExpr = evaluatedExpr.split(ref).join(numValue.toString());
    }
  }

  try {
    // Simple math evaluator - for a real production app, use a safer math library like mathjs
    // but for an assignment, we can implement a basic one or use a limited Function constructor
    // Avoid eval() directly; Function is slightly safer but still needs cleanup
    // We'll only allow simple arithmetic characters
    if (/^[0-9+\-*/().\s]+$/.test(evaluatedExpr)) {
      // eslint-disable-next-line no-new-func
      return new Function(`return ${evaluatedExpr}`)();
    }
    return "#ERROR";
  } catch (e) {
    return "#ERROR";
  }
};

const getCellValue = (cellId: string, cells: CellsState, visited: Set<string>): string | number => {
  if (visited.has(cellId)) return 0; // Circular dependency
  
  const cell = cells[cellId];
  if (!cell) return 0;

  if (cell.value.startsWith("=")) {
    visited.add(cellId);
    const result = evaluateFormula(cell.value, cells, visited);
    visited.delete(cellId);
    return result;
  }

  const num = parseFloat(cell.value);
  return isNaN(num) ? cell.value : num;
};
