"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { SpreadsheetDocument } from "@/types";
import Link from "next/link";
import { Plus, FileSpreadsheet, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { DocumentCard } from "@/components/DocumentCard";
import { AuthCard } from "@/components/AuthCard";
import { MarketingPanel } from "@/components/MarketingPanel";
import { DashboardSkeleton } from "@/components/Skeletons";

export default function Dashboard() {
  const { user, loading: authLoading, isSigningIn, authError, loginWithGoogle, logout } = useAuth();
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

  if ((authLoading && !isSigningIn) || (user && loading)) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col lg:flex-row bg-slate-50 overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">
        <MarketingPanel />
        <div className="flex-1 flex flex-col relative w-full lg:max-w-xl xl:max-w-2xl bg-white lg:shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.1)] z-10 transition-all">
          <AuthCard 
            onLogin={loginWithGoogle}
            isLoading={isSigningIn}
            authError={authError}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen font-sans">
      <Navbar user={user!} onLogout={logout} />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              My Spreadsheets
            </h2>
            <p className="mt-2 text-gray-600">
              Create, organize, and collaborate on your spreadsheets in real time.
            </p>
          </div>
          <button
            onClick={createNewDoc}
            disabled={isCreating}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-5 py-2 shadow-md transition-all hover:scale-105 flex items-center gap-2 font-medium disabled:opacity-50 disabled:hover:scale-100"
          >
            {isCreating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
            New Spreadsheet
          </button>
        </div>

        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl bg-white border border-gray-200 py-24 px-6 text-center shadow-sm">
            <FileSpreadsheet className="h-16 w-16 text-gray-300 mb-4" strokeWidth={1.5} />
            <h3 className="text-xl font-semibold text-gray-900">No spreadsheets yet</h3>
            <p className="mt-2 mb-8 text-gray-600">
              Create your first spreadsheet to start collaborating.
            </p>
            <button
              onClick={createNewDoc}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-5 py-2 shadow-md transition-all font-medium"
            >
              Create Spreadsheet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc, index) => (
              <DocumentCard key={doc.id} document={doc} index={index} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
