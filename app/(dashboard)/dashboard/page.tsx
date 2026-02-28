"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight,
  Plus,
  Loader2,
  ExternalLink,
  Trash2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useLanguage } from "@/lib/context/LanguageContext";
import Link from "next/link";

interface Application {
  id: string;
  application_id: string;
  status: "pending" | "processing" | "completed" | "rejected";
  created_at: string;
  services: {
    name: string;
  };
}

export default function CustomerDashboard() {
  const { t } = useLanguage();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchApplications(user.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchApplications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select(`
          id,
          application_id,
          status,
          created_at,
          services (name)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const apps = data as any[];
      setApplications(apps);
      
      setStats({
        total: apps.length,
        pending: apps.filter(a => a.status === 'pending' || a.status === 'processing').length,
        completed: apps.filter(a => a.status === 'completed').length
      });
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmMsg = t({ 
      en: "Are you sure you want to delete this application?", 
      kn: "ಈ ಅರ್ಜಿಯನ್ನು ಅಳಿಸಲು ನೀವು ಖಚಿತವಾಗಿ ಬಯಸುವಿರಾ?" 
    });
    
    if (!window.confirm(confirmMsg)) return;

    try {
      const { error } = await supabase
        .from("applications")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      const user = auth.currentUser;
      if (user) fetchApplications(user.uid);
    } catch (error) {
      console.error("Error deleting application:", error);
      alert(t({ en: "Failed to delete application", kn: "ಅರ್ಜಿಯನ್ನು ಅಳಿಸಲು ವಿಫಲವಾಗಿದೆ" }));
    }
  };

  const statusColors = {
    pending: "bg-amber-50 text-amber-600 border-amber-100",
    processing: "bg-blue-50 text-blue-600 border-blue-100",
    completed: "bg-green-50 text-green-600 border-green-100",
    rejected: "bg-red-50 text-red-600 border-red-100"
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#DA1515F3] animate-spin mb-4" />
        <p className="text-gray-500 font-medium">{t({ en: "Loading your applications...", kn: "ನಿಮ್ಮ ಅರ್ಜಿಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ..." })}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1F295D]">{t({ en: "My Dashboard", kn: "ನನ್ನ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್" })}</h1>
          <p className="text-gray-500">{t({ en: "Track and manage your government service applications.", kn: "ನಿಮ್ಮ ಸರ್ಕಾರಿ ಸೇವಾ ಅರ್ಜಿಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ ಮತ್ತು ನಿರ್ವಹಿಸಿ." })}</p>
        </div>
        <Link href="/dashboard/apply">
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#DA1515" }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 bg-[#DA1515F3] text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-red-100 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>{t({ en: "Apply New Service", kn: "ಹೊಸ ಸೇವೆಗಾಗಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ" })}</span>
          </motion.button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: { en: "Total Applications", kn: "ಒಟ್ಟು ಅರ್ಜಿಗಳು" }, value: stats.total, icon: FileText, color: "text-[#1F295D]", bg: "bg-[#F0F7FF]" },
          { label: { en: "Pending / Processing", kn: "ಬಾಕಿ ಇದೆ / ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ" }, value: stats.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: { en: "Completed", kn: "ಪೂರ್ಣಗೊಂಡಿದೆ" }, value: stats.completed, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center space-x-4"
          >
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">{t(stat.label)}</p>
              <h3 className={`text-2xl font-bold ${stat.color}`}>{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Applications List */}
      <div>
        <h2 className="text-2xl font-bold text-[#1F295D] mb-6">{t({ en: "Recent Applications", kn: "ಇತ್ತೀಚಿನ ಅರ್ಜಿಗಳು" })}</h2>
        
        {applications.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white border-2 border-dashed border-gray-200 rounded-[2rem] p-12 text-center"
          >
            <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">{t({ en: "No applications yet", kn: "ಇನ್ನೂ ಯಾವುದೇ ಅರ್ಜಿಗಳಿಲ್ಲ" })}</h3>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">{t({ en: "Start your first application by choosing a government service.", kn: "ಸರ್ಕಾರಿ ಸೇವೆಯನ್ನು ಆರಿಸುವ ಮೂಲಕ ನಿಮ್ಮ ಮೊದಲ ಅರ್ಜಿಯನ್ನು ಪ್ರಾರಂಭಿಸಿ." })}</p>
            <Link href="/dashboard/apply">
              <button className="text-[#DA1515F3] font-bold hover:underline flex items-center justify-center mx-auto">
                {t({ en: "Browse Services", kn: "ಸೇವೆಗಳನ್ನು ಹುಡುಕಿ" })} <ChevronRight className="ml-1 w-5 h-5" />
              </button>
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {applications.map((app) => (
              <motion.div
                key={app.id}
                variants={item}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[app.status]}`}>
                    {app.status.toUpperCase()}
                  </div>
                  <span className="text-xs text-gray-400 font-medium">
                    {new Date(app.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#1F295D] mb-2 group-hover:text-[#DA1515F3] transition-colors">
                  {app.services.name}
                </h3>
                <p className="text-sm text-gray-500 font-medium mb-6">
                  {t({ en: "ID:", kn: "ಗುರುತು:" })} <span className="text-gray-700">{app.application_id}</span>
                </p>

                <div className="flex space-x-3">
                  <Link href={`/dashboard/applications/${app.id}`} className="flex-grow">
                    <motion.button
                      whileHover={{ x: 5 }}
                      className="w-full py-3 bg-gray-50 group-hover:bg-[#DA1515F3] group-hover:text-white text-[#1F295D] rounded-xl font-bold flex items-center justify-center transition-all"
                    >
                      <span>{t({ en: "View Details", kn: "ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ" })}</span>
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </motion.button>
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(app.id)}
                    className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center"
                    title={t({ en: "Delete Application", kn: "ಅರ್ಜಿಯನ್ನು ಅಳಿಸಿ" })}
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
