"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { FileSpreadsheet, MoreVertical, User } from "lucide-react";
import { SpreadsheetDocument } from "@/types";

interface DocumentCardProps {
  document: SpreadsheetDocument;
  index: number;
}

export const DocumentCard = ({ document, index }: DocumentCardProps) => {
  const timestamp = document.updatedAt?.toDate?.() 
    ? `Updated ${formatDistanceToNow(document.updatedAt.toDate(), { addSuffix: true })}` 
    : 'Updated just now';

  return (
    <Link
      href={`/doc/${document.id}`}
      className="block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 p-5 cursor-pointer group"
    >
      <div className="flex flex-col h-full justify-between">
        <div className="flex items-start justify-between mb-4">
          <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors" onClick={(e) => { e.preventDefault(); }}>
            <MoreVertical className="h-5 w-5" />
          </div>
        </div>
        
        <h3 className="mb-4 truncate text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
          {document.title}
        </h3>
        
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 border border-gray-200">
            <User className="h-4 w-4" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-medium text-gray-700">{document.ownerName}</span>
            <span className="truncate text-xs text-gray-500">{timestamp}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
