import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CellsState } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Export utilities
export const exportToCSV = (cells: CellsState, filename: string) => {
  let csvContent = "";
  const maxRow = 50;
  const maxCol = 26;

  for (let r = 0; r < maxRow; r++) {
    const rowData = [];
    for (let c = 0; c < maxCol; c++) {
      const cellData = cells[`${r}-${c}`];
      const value = (cellData?.computedValue ?? "").toString().replace(/"/g, '""');
      rowData.push(`"${value}"`);
    }
    csvContent += rowData.join(",") + "\n";
  }

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  downloadFile(blob, `${filename}.csv`);
};

export const exportToJSON = (cells: CellsState, filename: string) => {
  const data: any = {};
  const maxRow = 50;
  const maxCol = 26;

  for (let r = 0; r < maxRow; r++) {
    for (let c = 0; c < maxCol; c++) {
      const cellData = cells[`${r}-${c}`];
      if (cellData && cellData.value) {
        const cellRef = `${String.fromCharCode(65 + c)}${r + 1}`;
        data[cellRef] = {
          value: cellData.value,
          computedValue: cellData.computedValue,
          format: cellData.format,
        };
      }
    }
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  downloadFile(blob, `${filename}.json`);
};

export const exportToExcel = (cells: CellsState, filename: string) => {
  const maxRow = 50;
  const maxCol = 26;

  // Generate basic XLSX structure (simplified - just creates CSV-like data within Excel)
  // For a real solution, use a library like xlsx
  let excelContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
  excelContent += '<?mso-application progid="Excel.Sheet"?>\n';
  excelContent += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40">\n';
  excelContent += '<Worksheet ss:Name="Sheet1">\n';
  excelContent += '<Table>\n';

  for (let r = 0; r < maxRow; r++) {
    excelContent += '<Row>\n';
    for (let c = 0; c < maxCol; c++) {
      const cellData = cells[`${r}-${c}`];
      const value = cellData?.computedValue ?? "";
      const cellType = typeof value === "number" ? "Number" : "String";
      excelContent += `<Cell ss:Type="${cellType}"><Data ss:Type="${cellType}">${value}</Data></Cell>\n`;
    }
    excelContent += '</Row>\n';
  }

  excelContent += '</Table>\n';
  excelContent += '</Worksheet>\n';
  excelContent += '</Workbook>';

  const blob = new Blob([excelContent], { type: "application/vnd.ms-excel" });
  downloadFile(blob, `${filename}.xls`);
};

// For HTML export
export const exportToHTML = (cells: CellsState, filename: string) => {
  const maxRow = 50;
  const maxCol = 26;

  let htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${filename}</title>
  <style>
    table { border-collapse: collapse; font-family: Arial, sans-serif; }
    td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; font-weight: bold; }
    .bold { font-weight: bold; }
    .italic { font-style: italic; }
  </style>
</head>
<body>
<table>
`;

  // Header row
  htmlContent += '<tr><th></th>';
  for (let c = 0; c < maxCol; c++) {
    htmlContent += `<th>${String.fromCharCode(65 + c)}</th>`;
  }
  htmlContent += '</tr>\n';

  // Data rows
  for (let r = 0; r < maxRow; r++) {
    htmlContent += `<tr><th>${r + 1}</th>`;
    for (let c = 0; c < maxCol; c++) {
      const cellData = cells[`${r}-${c}`];
      const value = cellData?.computedValue ?? "";
      const format = cellData?.format || {};
      const classes = [
        format.bold && "bold",
        format.italic && "italic",
      ].filter(Boolean).join(" ");
      const style = format.color ? `color: ${format.color};` : "";
      const bgStyle = format.backgroundColor ? `background-color: ${format.backgroundColor};` : "";

      htmlContent += `<td class="${classes}" style="${style}${bgStyle}">${value}</td>`;
    }
    htmlContent += '</tr>\n';
  }

  htmlContent += '</table>\n</body>\n</html>';

  const blob = new Blob([htmlContent], { type: "text/html" });
  downloadFile(blob, `${filename}.html`);
};

const downloadFile = (blob: Blob, filename: string) => {
  const link = window.document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
