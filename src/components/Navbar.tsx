"use client";

import { LogOut, FileSpreadsheet } from "lucide-react";
import { User as UserType } from "@/types";

interface NavbarProps {
  user: UserType;
  onLogout: () => void;
}

export const Navbar = ({ user, onLogout }: NavbarProps) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur px-6">
      <div className="flex items-center gap-2">
        <FileSpreadsheet className="h-6 w-6 text-indigo-600" />
        <span className="text-xl font-bold tracking-tight text-gray-900">Sheetia</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 pr-4 border-r border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-700">{user.name}</p>
          </div>
          {user.photoURL ? (
            <img src={user.photoURL} className="h-8 w-8 rounded-full ring-2 ring-gray-100" alt={user.name} />
          ) : (
            <div 
              className="flex h-8 w-8 items-center justify-center rounded-full text-white font-bold text-sm"
              style={{ backgroundColor: user.color || '#4f46e5' }}
            >
              {user.name && user.name.length > 0 ? user.name[0].toUpperCase() : 'U'}
            </div>
          )}
        </div>
        <button 
          onClick={onLogout}
          className="text-gray-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
          title="Sign out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};
