"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Calendar,
  MessageSquare
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Application {
  id: string;
  application_id: string;
  status: "pending" | "processing" | "completed" | "rejected";
  remarks: string;
  created_at: string;
  services: {
    name: string;
    description: string;
  };
}

interface Document {
  id: string;
  file_name: string;
  file_url: string;
}

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const [application, setApplication] = useState<Application | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      const { data: appData, error: appError } = await supabase
        .from("applications")
        .select(`
          id,
          application_id,
          status,
          remarks,
          created_at,
          services (name, description)
        `)
        .eq("id", id)
        .single();

      if (appError) throw appError;
      setApplication(appData as any);

      const { data: docsData, error: docsError } = await supabase
        .from("documents")
        .select("*")
        .eq("application_id", id);

      if (docsError) throw docsError;
      setDocuments(docsData || []);
    } catch (error) {
      console.error("Error fetching application details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#DA1515F3] animate-spin" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800">Application not found</h2>
        <Link href="/dashboard" className="text-[#DA1515F3] hover:underline mt-4 inline-block">Back to Dashboard</Link>
      </div>
    );
  }

  const statusColors = {
    pending: "bg-amber-50 text-amber-600 border-amber-100",
    processing: "bg-blue-50 text-blue-600 border-blue-100",
    completed: "bg-green-50 text-green-600 border-green-100",
    rejected: "bg-red-50 text-red-600 border-red-100"
  };

  const statusIcons = {
    pending: Clock,
    processing: Loader2,
    completed: CheckCircle,
    rejected: AlertCircle
  };

  const StatusIcon = statusIcons[application.status];

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-gray-500 hover:text-[#911A20] transition-colors mb-6 font-semibold"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center bg-red-50 text-[#DA1515F3]`}>
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1F295D]">{application.services.name}</h1>
              <p className="text-gray-500 font-medium">Application ID: <span className="text-gray-800 font-bold">{application.application_id}</span></p>
            </div>
          </div>
          <div className={`flex items-center space-x-2 px-6 py-3 rounded-2xl border ${statusColors[application.status]}`}>
            <StatusIcon className={`w-6 h-6 ${application.status === 'processing' ? 'animate-spin' : ''}`} />
            <span className="font-bold text-lg">{application.status.toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm"
          >
            <h3 className="text-xl font-bold text-[#1F295D] mb-6 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-[#DA1515F3]" />
              Application Details
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Service Description</p>
                <p className="text-gray-700 font-medium">{application.services.description}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Submission Date</p>
                <div className="flex items-center text-gray-700 font-medium">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  {new Date(application.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Documents Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm"
          >
            <h3 className="text-xl font-bold text-[#1F295D] mb-6 flex items-center">
              <Download className="w-6 h-6 mr-2 text-[#DA1515F3]" />
              Submitted Documents
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documents.map((doc) => (
                <a 
                  key={doc.id} 
                  href={doc.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between hover:bg-gray-100 transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#DA1515F3] shadow-sm">
                      <FileText className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-gray-700">{doc.file_name}</p>
                  </div>
                  <Download className="w-5 h-5 text-gray-400 group-hover:text-[#DA1515F3] transition-colors" />
                </a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-6">
          {/* Admin Remarks Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm h-full"
          >
            <h3 className="text-xl font-bold text-[#1F295D] mb-4 flex items-center">
              <MessageSquare className="w-6 h-6 mr-2 text-[#DA1515F3]" />
              Admin Remarks
            </h3>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 min-h-[150px]">
              {application.remarks ? (
                <p className="text-gray-700 italic font-medium leading-relaxed">"{application.remarks}"</p>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                  <p className="text-sm font-medium">No remarks from administrator yet.</p>
                </div>
              )}
            </div>
            {application.status === 'completed' && (
              <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-2xl text-sm font-bold flex items-center space-x-2 border border-green-100">
                <CheckCircle className="w-5 h-5" />
                <span>Your service is completed!</span>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
