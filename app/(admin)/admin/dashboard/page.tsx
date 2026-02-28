"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Loader2, 
  Search,
  Eye,
  Filter,
  MoreVertical,
  Zap
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Application {
  id: string;
  application_id: string;
  status: string;
  created_at: string;
  users: {
    name: string;
    email: string;
  };
  services: {
    name: string;
  };
}

export default function AdminDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0
  });

  useEffect(() => {
    fetchAllApplications();
  }, []);

  const fetchAllApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select(`
          id,
          application_id,
          status,
          created_at,
          users (name, email),
          services (name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const apps = data as any[];
      setApplications(apps);
      
      setStats({
        total: apps.length,
        pending: apps.filter(a => a.status === 'pending').length,
        processing: apps.filter(a => a.status === 'processing').length,
        completed: apps.filter(a => a.status === 'completed').length
      });
    } catch (error) {
      console.error("Error fetching applications:", error);
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

  const filteredApps = applications.filter(app => 
    app.application_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.users?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.services?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#911A20] animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading applications database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1F295D]">Admin Dashboard</h1>
          <p className="text-gray-500">Overview of all service applications.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Applications", value: stats.total, icon: FileText, color: "text-[#1F295D]", bg: "bg-[#F0F7FF]" },
          { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Processing", value: stats.processing, icon: Zap, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Completed", value: stats.completed, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
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
              <p className="text-sm font-semibold text-gray-500">{stat.label}</p>
              <h3 className={`text-2xl font-bold ${stat.color}`}>{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-[#1F295D]">Recent Applications</h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search application ID, name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DA1515F3] w-full sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-sm font-semibold">
                <th className="px-6 py-4">Application ID</th>
                <th className="px-6 py-4">Customer Name</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredApps.map((app) => (
                <motion.tr 
                  key={app.id} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="font-bold text-[#1F295D]">{app.application_id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">{app.users?.name}</span>
                      <span className="text-xs text-gray-400">{app.users?.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">
                    {app.services?.name}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(app.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[app.status as keyof typeof statusColors]}`}>
                      {app.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/applications/${app.id}`}>
                      <button className="p-2 text-[#DA1515F3] hover:bg-red-50 rounded-lg transition-colors">
                        <Eye className="w-5 h-5" />
                      </button>
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredApps.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No applications found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
