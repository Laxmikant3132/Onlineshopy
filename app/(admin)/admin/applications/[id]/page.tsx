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
  User,
  Mail,
  Phone,
  Save,
  ChevronDown
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Application {
  id: string;
  application_id: string;
  status: string;
  remarks: string;
  created_at: string;
  user_id: string;
  users: {
    name: string;
    email: string;
    phone: string;
  };
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

export default function AdminApplicationDetailPage() {
  const { id } = useParams();
  const [application, setApplication] = useState<Application | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
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
          user_id,
          users (name, email, phone),
          services (name, description)
        `)
        .eq("id", id)
        .single();

      if (appError) throw appError;
      setApplication(appData as any);
      setStatus(appData.status);
      setRemarks(appData.remarks || "");

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

  const handleUpdate = async () => {
    setSaving(true);
    setError("");
    try {
      const { error: updateError } = await supabase
        .from("applications")
        .update({ status, remarks })
        .eq("id", id);

      if (updateError) throw updateError;
      router.refresh();
      fetchApplicationDetails();
    } catch (err: any) {
      setError(err.message || "Failed to update application");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#911A20] animate-spin" />
      </div>
    );
  }

  if (!application) return null;

  const statusColors = {
    pending: "bg-amber-50 text-amber-600 border-amber-100",
    processing: "bg-blue-50 text-blue-600 border-blue-100",
    completed: "bg-green-50 text-green-600 border-green-100",
    rejected: "bg-red-50 text-red-600 border-red-100"
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-gray-500 hover:text-[#911A20] transition-colors mb-6 font-semibold"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Admin Dashboard
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center bg-red-50 text-[#911A20]">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1F295D]">{application.services.name}</h1>
              <p className="text-gray-500 font-medium">Application ID: <span className="text-gray-800 font-bold">{application.application_id}</span></p>
            </div>
          </div>
          <div className={`flex items-center space-x-2 px-6 py-3 rounded-2xl border ${statusColors[application.status as keyof typeof statusColors]}`}>
            <span className="font-bold text-lg">{application.status.toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Customer Info Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm"
          >
            <h3 className="text-xl font-bold text-[#1F295D] mb-6 flex items-center">
              <User className="w-6 h-6 mr-2 text-[#911A20]" />
              Customer Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-700">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</p>
                    <p className="font-bold">{application.users.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</p>
                    <p className="font-bold">{application.users.email}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-700">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</p>
                    <p className="font-bold">{application.users.phone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Applied Date</p>
                    <p className="font-bold">{new Date(application.created_at).toLocaleDateString()}</p>
                  </div>
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
              <Download className="w-6 h-6 mr-2 text-[#911A20]" />
              Uploaded Documents
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
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#911A20] shadow-sm">
                      <FileText className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-gray-700">{doc.file_name}</p>
                  </div>
                  <Download className="w-5 h-5 text-gray-400 group-hover:text-[#911A20] transition-colors" />
                </a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Action Panel Sidebar */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm sticky top-24"
          >
            <h3 className="text-xl font-bold text-[#1F295D] mb-6">Manage Status</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Update Status</label>
                <div className="relative">
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#911A20] appearance-none font-bold text-gray-700 transition-all"
                  >
                    <option value="pending">PENDING</option>
                    <option value="processing">PROCESSING</option>
                    <option value="completed">COMPLETED</option>
                    <option value="rejected">REJECTED</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Admin Remarks</label>
                <textarea 
                  value={remarks} 
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add a remark for the customer..."
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#911A20] min-h-[120px] font-medium text-gray-700 transition-all"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100">
                  {error}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={saving}
                onClick={handleUpdate}
                className="w-full py-4 bg-[#911A20] text-white rounded-[1.5rem] font-bold text-lg shadow-lg shadow-red-100 flex items-center justify-center space-x-2 disabled:opacity-70 transition-all"
              >
                {saving ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
