"use client";

import { FileSpreadsheet, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface AuthCardProps {
  onLogin: () => void;
  isLoading: boolean;
  authError?: string | null;
}

export const AuthCard = ({ onLogin, isLoading, authError }: AuthCardProps) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 relative overflow-hidden h-full min-h-screen lg:min-h-0">
      {/* Background accents behind the card */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-violet-400/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-400/20 blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] p-10 border border-slate-200/50"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="rounded-xl bg-indigo-50 p-3 mb-4 shadow-sm ring-1 ring-indigo-100">
            <FileSpreadsheet className="h-8 w-8 text-indigo-600" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">Sheetia</span>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome back</h2>
          <p className="text-slate-500 text-[15px]">Sign in to start collaborating</p>
        </div>

        {authError === 'auth/unauthorized-domain' && (
          <div className="mb-6 p-4 rounded-lg bg-amber-50 text-amber-800 text-sm flex items-start gap-3 border border-amber-200">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-semibold mb-1 text-amber-900">Domain not authorized</p>
              <p>Please add <b>localhost</b> or this preview URL to Firebase Console &gt; Authentication &gt; Settings &gt; Authorized Domains.</p>
            </div>
          </div>
        )}

        {authError && authError !== 'auth/unauthorized-domain' && (
          <div className="mb-6 p-3 rounded-lg bg-rose-50 text-rose-600 text-sm flex items-center gap-2 border border-rose-100">
            <AlertCircle className="h-4 w-4" />
            <span>Registration failed. Please try again.</span>
          </div>
        )}

        {isLoading ? (
          <div className="w-full flex flex-col items-center justify-center gap-4 py-8 bg-slate-50/50 rounded-xl border border-slate-100">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700">Signing you in...</p>
              <p className="text-xs text-slate-500 mt-0.5">Syncing your workspace</p>
            </div>
          </div>
        ) : (
          <button
            onClick={onLogin}
            className="group w-full flex items-center justify-center gap-3 bg-white border border-slate-300 rounded-lg px-6 py-3.5 hover:bg-slate-50 hover:border-slate-400 hover:shadow-sm transition-all shadow-[0_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-4 focus:ring-slate-100"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 flex-shrink-0" alt="Google" />
            <span className="font-semibold text-slate-700 text-sm tracking-wide">Continue with Google</span>
          </button>
        )}
      </motion.div>
    </div>
  );
};
