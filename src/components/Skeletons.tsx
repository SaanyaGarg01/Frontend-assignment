import React from "react";
import { motion } from "framer-motion";

export const DashboardSkeleton = () => {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen font-sans">
      <div className="h-16 border-b bg-white/80 px-6 flex items-center justify-between">
        <div className="h-8 w-32 bg-gray-200 rounded-md animate-pulse" />
        <div className="flex items-center gap-4">
          <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded flex items-center mb-3 animate-pulse" />
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl border p-5 shadow-sm">
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-xl bg-gray-100 animate-pulse shrink-0" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse" />
                    <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export const DocSkeleton = () => {
  return (
    <div className="flex h-screen flex-col bg-[#fafafa] overflow-hidden font-sans">
      <div className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>
      <div className="h-8 border-b border-gray-200 bg-white px-4 flex items-center gap-2">
        <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
        <div className="h-5 flex-1 bg-gray-100 rounded animate-pulse" />
      </div>
      <div className="flex-1 flex px-4 pt-4 gap-4">
        <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="h-8 bg-gray-50 border-b border-gray-200 w-full animate-pulse" />
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="flex border-b border-gray-100">
              <div className="w-10 h-8 bg-gray-50 border-r border-gray-200 shrink-0" />
              {Array.from({ length: 8 }).map((_, j) => (
                <div key={j} className="flex-1 h-8 border-r border-gray-100" />
              ))}
            </div>
          ))}
        </div>
        <div className="w-64 bg-white rounded-xl border border-gray-200 animate-pulse hidden md:block" />
      </div>
    </div>
  );
};
