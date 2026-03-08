"use client";

import { Zap, Activity, Users } from "lucide-react";

export const MarketingPanel = () => {
  return (
    <div className="flex-1 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 p-10 lg:p-20 relative overflow-hidden flex flex-col justify-center">
      {/* Decorative background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] opacity-30" />
      
      {/* Floating blurred accent blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/30 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/20 blur-[120px]" />

      <div className="relative z-10 max-w-xl">
        <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
          Collaborative Spreadsheets Built for Teams
        </h1>
        <p className="text-lg text-indigo-100 mb-12 leading-relaxed">
          Edit spreadsheets together in real-time with presence, formulas, and instant syncing. Experience high-performance tabular computation in your browser.
        </p>

        <div className="space-y-6">
          <div className="flex items-start gap-4 group">
            <div className="bg-white/10 p-3 rounded-lg group-hover:bg-white/20 transition-colors border border-white/5 shadow-sm">
              <Zap className="h-6 w-6 text-yellow-300" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-xl mb-1 mt-0.5">Real-time collaboration</h3>
              <p className="text-indigo-200 text-sm">Every edit instantly syncs across all connected users without conflict.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 group">
            <div className="bg-white/10 p-3 rounded-lg group-hover:bg-white/20 transition-colors border border-white/5 shadow-sm">
              <Activity className="h-6 w-6 text-blue-300" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-xl mb-1 mt-0.5">Formula powered cells</h3>
              <p className="text-indigo-200 text-sm">Evaluate complex functions dynamically exactly like Google Sheets.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 group">
            <div className="bg-white/10 p-3 rounded-lg group-hover:bg-white/20 transition-colors border border-white/5 shadow-sm">
              <Users className="h-6 w-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-xl mb-1 mt-0.5">Live presence indicators</h3>
              <p className="text-indigo-200 text-sm">See exactly who is editing what cell with live multi-player cursors.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
