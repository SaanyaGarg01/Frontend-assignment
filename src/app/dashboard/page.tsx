"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { SpreadsheetDocument } from "@/types";
import Link from "next/link";
import { Plus, FileText, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { DocumentCard } from "@/components/DocumentCard";

export default function Dashboard() {
  const { user, loading: authLoading, loginWithGoogle, logout } = useAuth();
  const [documents, setDocuments] = useState<SpreadsheetDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "documents"),
      where("ownerId", "==", user.id),
      orderBy("updatedAt", "desc")
    );

    // Fallback timeout to stop loading spinner if Firestore hangs silently
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      clearTimeout(timeout);
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SpreadsheetDocument[];
      setDocuments(docs);
      setLoading(false);
    }, (error) => {
      clearTimeout(timeout);
      // Ensure we don't trap the user in a loading screen if db is missing or permission denied
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [user, authLoading]);

  const createNewDoc = async () => {
    if (!user) return;
    setIsCreating(true);
    try {
      const docRef = await addDoc(collection(db, "documents"), {
        title: "Untitled Spreadsheet",
        ownerId: user.id,
        ownerName: user.name,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      router.push(`/doc/${docRef.id}`);
    } catch (error) {
      console.error("Error creating document:", error);
      setIsCreating(false);
    }
  };

  if (authLoading || (user && loading)) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <motion.div 
          animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.5, 1, 0.5] }} 
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-4"
        >
          <div className="rounded-2xl bg-blue-600 p-4 shadow-lg shadow-blue-500/30">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Loading Workspace</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-white to-slate-50 p-4 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/10 blur-[100px]" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[420px] rounded-3xl bg-white/70 backdrop-blur-xl p-10 border border-slate-200/50 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] text-center relative z-10"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="mb-8 flex justify-center"
          >
            <div className="rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-5 shadow-lg shadow-blue-500/30">
              <FileText className="h-10 w-10 text-white" />
            </div>
          </motion.div>
          
          <h1 className="mb-3 text-4xl font-extrabold bg-gradient-to-r from-slate-900 via-indigo-900 to-violet-800 bg-clip-text text-transparent tracking-tight">Sheetia Workspace</h1>
          <p className="mb-10 text-slate-500 leading-relaxed text-[15px] font-medium max-w-sm mx-auto">
            Experience real-time tabular collaboration built for modern engineering and product teams.
          </p>
          
          <button
            onClick={loginWithGoogle}
            className="group flex w-full items-center justify-center gap-3 rounded-full bg-white border border-slate-200 px-6 py-4 font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:shadow-lg hover:-translate-y-0.5 transition-all relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 relative z-10" alt="Google" />
            <span className="relative z-10 text-sm tracking-wide">Continue with Google</span>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar user={user!} onLogout={logout} />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-1 relative">
            <h2 className="text-[32px] font-extrabold tracking-tight text-slate-900 relative inline-block">
              My Spreadsheets
              <div className="absolute -right-6 top-1">
                <Sparkles className="h-5 w-5 text-indigo-400" />
              </div>
            </h2>
            <p className="text-slate-500 font-medium">Create, organize, and share your collaborative datasets.</p>
          </div>
          <button
            onClick={createNewDoc}
            disabled={isCreating}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-3 font-semibold text-white shadow-md shadow-indigo-600/20 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-600/30"
          >
            {isCreating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5 stroke-[2.5px]" />}
            New Spreadsheet
          </button>
        </div>

        {documents.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="relative flex flex-col items-center justify-center rounded-3xl border border-dashed border-indigo-200 bg-indigo-50/30 py-32 px-6 text-center shadow-sm"
          >
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-30 mask-image-radial rounded-3xl" />
            <div className="relative z-10 mb-6 rounded-3xl bg-white p-5 shadow-xl shadow-indigo-100/50 ring-1 ring-indigo-50">
              <FileText className="h-12 w-12 text-indigo-400" strokeWidth={1.5} />
            </div>
            <h3 className="relative z-10 text-2xl font-extrabold tracking-tight text-slate-800">Your workspace is empty</h3>
            <p className="relative z-10 mb-8 mt-3 max-w-sm text-base text-slate-500 leading-relaxed font-medium">
              Create your very first high-performance spreadsheet and invite your team.
            </p>
            <button
              onClick={createNewDoc}
              className="relative z-10 font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 group bg-white px-6 py-3 rounded-full shadow-sm hover:shadow-md transition-all ring-1 ring-indigo-100"
            >
              Start Building 
              <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {documents.map((doc, index) => (
              <DocumentCard key={doc.id} document={doc} index={index} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
