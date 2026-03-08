"use client";

import React from "react";
import { Presence, User } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";
import { coordToExcelRef } from "@/lib/formulaParser";

interface PresenceBarProps {
  presences: Presence[];
  currentUser: User | null;
}

export const PresenceBar = ({ presences, currentUser }: PresenceBarProps) => {
  // Filter out current user and sort for stable display
  const others = presences
    .filter((p) => p.userId !== currentUser?.id)
    .sort((a, b) => a.userId.localeCompare(b.userId));

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
        <Users className="h-3.5 w-3.5" />
        <span className="font-semibold">{others.length + (currentUser ? 1 : 0)} active</span>
      </div>
      
      <div className="flex -space-x-2 overflow-hidden items-center bg-gray-50 rounded-full px-3 py-1.5 border border-gray-200">
        <AnimatePresence mode="popLayout">
          {others.map((presence) => (
            <motion.div
              key={presence.userId}
              initial={{ opacity: 0, scale: 0.5, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.5, x: 20 }}
              className="group relative"
            >
              {presence.photoURL ? (
                <img
                  src={presence.photoURL}
                  alt={presence.name}
                  className="h-6 w-6 rounded-full border-2 border-white ring-1 ring-gray-200 hover:ring-2 hover:ring-offset-1 transition-all"
                  style={{ borderColor: presence.color }}
                />
              ) : (
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold text-white shadow-sm hover:shadow-md transition-all"
                  style={{ backgroundColor: presence.color, borderColor: presence.color }}
                >
                  {presence.name[0].toUpperCase()}
                </div>
              )}
              
              {/* Enhanced Tooltip with Cell Reference */}
              <div className="absolute bottom-full left-1/2 mb-3 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2.5 text-xs text-white group-hover:block z-50 shadow-xl pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold">{presence.name}</span>
                </div>
                {presence.cursor && (
                  <div className="text-gray-300 text-[11px] mt-1.5 font-mono">
                    Editing: <span className="text-white font-bold">{coordToExcelRef(presence.cursor.row, presence.cursor.col)}</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                  <div className="border-4 border-transparent border-t-slate-900" />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {others.length > 3 && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-[9px] font-bold text-gray-600 shadow-sm">
            +{others.length - 3}
          </div>
        )}

        {others.length === 0 && (
          <p className="px-2 text-[11px] text-gray-400 italic whitespace-nowrap">You are alone</p>
        )}
      </div>
    </div>
  );
};
