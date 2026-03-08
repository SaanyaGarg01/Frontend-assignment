"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { FileText, MoreVertical, Edit2 } from "lucide-react";
import { SpreadsheetDocument } from "@/types";
import { motion } from "framer-motion";

interface DocumentCardProps {
  document: SpreadsheetDocument;
  index: number;
}

export const DocumentCard = ({ document, index }: DocumentCardProps) => {
  const timestamp = document.updatedAt?.toDate?.() 
    ? formatDistanceToNow(document.updatedAt.toDate(), { addSuffix: true }) 
    : 'Just now';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
    >
      <Link
        href={`/doc/${document.id}`}
        className="group relative block h-48 rounded-2xl border border-indigo-50/80 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_12px_40px_-10px_rgba(99,102,241,0.15)] overflow-hidden"
      >
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex items-start justify-between">
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-sm">
              <FileText className="h-6 w-6" />
            </div>
            
            <div className="rounded-full bg-slate-50 p-1.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100 hover:text-slate-600" onClick={(e) => { e.preventDefault(); /* Future context menu */}}>
              <MoreVertical className="h-4 w-4" />
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="mb-2 truncate text-xl font-bold tracking-tight text-slate-800 group-hover:text-indigo-700 transition-colors duration-200">
              {document.title}
            </h3>
            
            <div className="flex items-center gap-2.5 text-sm font-medium text-slate-500">
              <span className="flex items-center gap-1.5 overflow-hidden">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] text-slate-600 border border-slate-200">
                  {document.ownerName ? document.ownerName[0].toUpperCase() : 'U'}
                </span>
                <span className="truncate max-w-[100px]">{document.ownerName}</span>
              </span>
              <span className="h-1 w-1 shrink-0 rounded-full bg-slate-300"></span>
              <span className="truncate text-xs text-slate-400 font-normal">
                {timestamp}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
