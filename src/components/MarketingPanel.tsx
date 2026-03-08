"use client";

import { Zap, Activity, Users } from "lucide-react";
import { motion } from "framer-motion";

export const MarketingPanel = () => {
  return (
    <div className="flex-1 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 animate-gradient-x p-10 lg:p-20 relative overflow-hidden flex flex-col justify-center">
      {/* Decorative background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] opacity-30" />
      
      {/* Floating blurred accent blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/30 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/20 blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-xl"
      >
        <motion.h1 
          className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight tracking-tight"
        >
          Collaborative Spreadsheets Built for Teams
        </motion.h1>
        <p className="text-lg text-indigo-100 mb-12 leading-relaxed">
          Edit spreadsheets together in real time with formulas, presence, and instant syncing.
        </p>

        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-start gap-4 group hover:scale-105 hover:shadow-xl transition-all p-3 rounded-xl border border-transparent hover:border-white/10 hover:bg-white/5"
          >
            <div className="bg-white/10 p-3 rounded-lg group-hover:bg-white/20 transition-colors border border-white/5 shadow-sm">
              <Zap className="h-6 w-6 text-yellow-300" />
            </div>
            <div className="pt-0.5">
              <h3 className="text-white font-semibold text-xl mb-1 mt-0.5">Real-time collaboration</h3>
              <p className="text-indigo-200 text-sm">Every edit instantly syncs across all connected users without conflict.</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-start gap-4 group hover:scale-105 hover:shadow-xl transition-all p-3 rounded-xl border border-transparent hover:border-white/10 hover:bg-white/5"
          >
            <div className="bg-white/10 p-3 rounded-lg group-hover:bg-white/20 transition-colors border border-white/5 shadow-sm">
              <Activity className="h-6 w-6 text-blue-300" />
            </div>
            <div className="pt-0.5">
              <h3 className="text-white font-semibold text-xl mb-1 mt-0.5">Formula-powered cells</h3>
              <p className="text-indigo-200 text-sm">Evaluate complex functions dynamically exactly like Google Sheets.</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex items-start gap-4 group hover:scale-105 hover:shadow-xl transition-all p-3 rounded-xl border border-transparent hover:border-white/10 hover:bg-white/5"
          >
            <div className="bg-white/10 p-3 rounded-lg group-hover:bg-white/20 transition-colors border border-white/5 shadow-sm">
              <Users className="h-6 w-6 text-emerald-300" />
            </div>
            <div className="pt-0.5">
              <h3 className="text-white font-semibold text-xl mb-1 mt-0.5">Live presence indicators</h3>
              <p className="text-indigo-200 text-sm">See exactly who is editing what cell with live multi-player cursors.</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
