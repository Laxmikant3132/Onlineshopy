"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Search, 
  Loader2, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function TrackPage() {
  const [appId, setAppId] = useState("");
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState<any>(null);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appId) return;

    setLoading(true);
    setError("");
    setApplication(null);

    try {
      const { data, error } = await supabase
        .from("applications")
        .select(`
          application_id,
          status,
          created_at,
          services (name)
        `)
        .eq("application_id", appId.trim())
        .single();

      if (error) throw new Error("Application not found. Please check the ID.");
      setApplication(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    pending: "bg-amber-50 text-amber-600 border-amber-100",
    processing: "bg-blue-50 text-blue-600 border-blue-100",
    completed: "bg-green-50 text-green-600 border-green-100",
    rejected: "bg-red-50 text-red-600 border-red-100"
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-8 sm:p-12"
      >
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-[#911A20] font-bold mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#1F295D] mb-4">Track Application</h1>
          <p className="text-gray-500">Enter your unique application ID to see its current progress.</p>
        </div>

        <form onSubmit={handleTrack} className="space-y-6">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input 
              type="text" 
              placeholder="e.g. DSC-123456"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              className="w-full pl-16 pr-6 py-5 bg-gray-50 border border-gray-200 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-red-50 focus:border-[#DA1515F3] text-xl font-bold text-gray-700 transition-all uppercase placeholder:normal-case"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full py-5 bg-[#DA1515F3] text-white rounded-[2rem] font-bold text-xl shadow-xl shadow-red-100 flex items-center justify-center space-x-3"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <span>Track Status</span>}
          </motion.button>
        </form>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-6 p-4 bg-red-50 text-red-600 rounded-2xl text-center font-bold border border-red-100 flex items-center justify-center space-x-2"
            >
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </motion.div>
          )}

          {application && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 p-8 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Service Type</p>
                  <h3 className="text-xl font-bold text-[#1F295D]">{application.services.name}</h3>
                </div>
                <div className={`px-4 py-2 rounded-xl text-sm font-bold border ${statusColors[application.status as keyof typeof statusColors]}`}>
                  {application.status.toUpperCase()}
                </div>
              </div>

              <div className="h-px bg-gray-200" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Applied On</p>
                  <p className="font-bold text-gray-700">{new Date(application.created_at).toLocaleDateString()}</p>
                </div>
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#DA1515F3] shadow-sm">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
