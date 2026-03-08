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

// Helper to extract range values
const extractRangeValues = (range: string, cells: CellsState, visited: Set<string>): number[] => {
  const values: number[] = [];
  if (range.includes(":")) {
    const [start, end] = range.split(":");
    const startCoord = excelRefToCoord(start);
    const endCoord = excelRefToCoord(end);

    if (startCoord && endCoord) {
      for (let r = Math.min(startCoord.row, endCoord.row); r <= Math.max(startCoord.row, endCoord.row); r++) {
        for (let c = Math.min(startCoord.col, endCoord.col); c <= Math.max(startCoord.col, endCoord.col); c++) {
          const cellId = coordToCellId(r, c);
          const value = getCellValue(cellId, cells, visited);
          const numValue = typeof value === "number" ? value : parseFloat(value as string) || 0;
          values.push(numValue);
        }
      }
    }
  }
  return values;
};

export const evaluateFormula = (
  formula: string,
  cells: CellsState,
  visited: Set<string> = new Set()
): string | number => {
  if (!formula.startsWith("=")) return formula;

  let expression = formula.substring(1).toUpperCase();

  // SUM function: SUM(A1:A5)
  const sumMatch = expression.match(/SUM\(([A-Z0-9:]+)\)/);
  if (sumMatch) {
    const values = extractRangeValues(sumMatch[1], cells, visited);
    const sum = values.reduce((a, b) => a + b, 0);
    expression = expression.replace(/SUM\([A-Z0-9:]+\)/, sum.toString());
  }

  // AVERAGE/AVG function: AVERAGE(A1:A5) or AVG(A1:A5)
  const avgMatch = expression.match(/(?:AVERAGE|AVG)\(([A-Z0-9:]+)\)/);
  if (avgMatch) {
    const values = extractRangeValues(avgMatch[1], cells, visited);
    const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    expression = expression.replace(/(?:AVERAGE|AVG)\([A-Z0-9:]+\)/, avg.toString());
  }

  // COUNT function: COUNT(A1:A5)
  const countMatch = expression.match(/COUNT\(([A-Z0-9:]+)\)/);
  if (countMatch) {
    const values = extractRangeValues(countMatch[1], cells, visited);
    expression = expression.replace(/COUNT\([A-Z0-9:]+\)/, values.length.toString());
  }

  // MIN function: MIN(A1:A5)
  const minMatch = expression.match(/MIN\(([A-Z0-9:]+)\)/);
  if (minMatch) {
    const values = extractRangeValues(minMatch[1], cells, visited);
    const min = values.length > 0 ? Math.min(...values) : 0;
    expression = expression.replace(/MIN\([A-Z0-9:]+\)/, min.toString());
  }

  // MAX function: MAX(A1:A5)
  const maxMatch = expression.match(/MAX\(([A-Z0-9:]+)\)/);
  if (maxMatch) {
    const values = extractRangeValues(maxMatch[1], cells, visited);
    const max = values.length > 0 ? Math.max(...values) : 0;
    expression = expression.replace(/MAX\([A-Z0-9:]+\)/, max.toString());
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
      const numValue = typeof value === "number" ? value : parseFloat(value as string) || 0;
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
