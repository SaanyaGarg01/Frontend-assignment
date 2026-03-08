"use client";

import { LogOut, FileText } from "lucide-react";
import { User } from "@/types";

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

export const Navbar = ({ user, onLogout }: NavbarProps) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-indigo-100/50 bg-white/80 backdrop-blur-xl px-4 sm:px-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 p-2 shadow-sm shadow-indigo-200">
          <FileText className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-800">Sheetia</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 pr-4 border-r border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-700">{user.name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
          {user.photoURL ? (
            <img src={user.photoURL} className="h-9 w-9 rounded-full ring-2 ring-white shadow-sm" alt={user.name} />
          ) : (
            <div 
              className="flex h-9 w-9 items-center justify-center rounded-full text-white font-bold shadow-sm ring-2 ring-white"
              style={{ backgroundColor: user.color || '#6366f1' }}
            >
              {user.name && user.name.length > 0 ? user.name[0].toUpperCase() : 'U'}
            </div>
          )}
        </div>
        <button 
          onClick={onLogout}
          className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          title="Sign out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};
