"use client";

import React from "react";
import { Presence, User } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
    <div className="flex -space-x-2 overflow-hidden items-center">
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
                className="h-8 w-8 rounded-full border-2 border-white ring-1 ring-gray-200"
                style={{ borderColor: presence.color }}
              />
            ) : (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white shadow-sm"
                style={{ backgroundColor: presence.color, borderColor: presence.color }}
              >
                {presence.name[0].toUpperCase()}
              </div>
            )}
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block z-50">
              {presence.name}
              {presence.cursor && ` (Cell ${String.fromCharCode(65 + presence.cursor.col)}${presence.cursor.row + 1})`}
              <div className="absolute top-full left-1/2 -ml-1 border-4 border-transparent border-t-gray-900" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {others.length > 5 && (
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[10px] font-medium text-gray-600 shadow-sm z-10">
          +{others.length - 5}
        </div>
      )}

      {others.length === 0 && (
        <p className="pl-4 text-xs text-gray-400 italic">Editing alone</p>
      )}
    </div>
  );
};
