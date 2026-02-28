"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Phone, 
  Save, 
  Loader2, 
  ShieldCheck,
  Calendar
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/context/AuthContext";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    created_at: ""
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user) {
      fetchProfile(user.uid);
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setUserData(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      if (!user) throw new Error("User not found");

      const { error } = await supabase
        .from("users")
        .update({
          name: userData.name,
          phone: userData.phone
        })
        .eq("id", user.uid);

      if (error) throw error;
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#DA1515F3] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#1F295D]">Account Settings</h1>
        <p className="text-gray-500">Manage your profile information and preferences.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden"
      >
        <div className="h-32 bg-gradient-to-r from-[#1F295D] to-[#911A20]" />
        
        <div className="px-8 pb-10">
          <div className="relative -mt-16 mb-8 flex items-end space-x-6">
            <div className="w-32 h-32 bg-white rounded-3xl p-2 shadow-lg border border-gray-100">
              <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center text-[#1F295D]">
                <User className="w-16 h-16" />
              </div>
            </div>
            <div className="pb-2">
              <h2 className="text-2xl font-bold text-[#1F295D]">{userData.name}</h2>
              <div className="flex items-center space-x-2 text-gray-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span className="capitalize">{userData.role} Account</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {message.text && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-2xl text-sm font-bold border ${
                  message.type === "success" 
                    ? "bg-green-50 text-green-600 border-green-100" 
                    : "bg-red-50 text-red-600 border-red-100"
                }`}
              >
                {message.text}
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#DA1515F3] font-medium"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 ml-1 uppercase tracking-wider">Email Address (Read-only)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                  <input
                    type="email"
                    value={userData.email}
                    disabled
                    className="w-full pl-12 pr-4 py-4 bg-gray-100 border border-gray-100 rounded-2xl text-gray-400 cursor-not-allowed font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={userData.phone}
                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#DA1515F3] font-medium"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 ml-1 uppercase tracking-wider">Member Since</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                  <input
                    type="text"
                    value={new Date(userData.created_at).toLocaleDateString()}
                    disabled
                    className="w-full pl-12 pr-4 py-4 bg-gray-100 border border-gray-100 rounded-2xl text-gray-400 cursor-not-allowed font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={saving}
                type="submit"
                className="w-full py-4 bg-[#DA1515F3] text-white rounded-2xl font-bold text-lg shadow-lg shadow-red-100 flex items-center justify-center space-x-2 transition-colors hover:bg-[#911A20] disabled:opacity-70"
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
          </form>
        </div>
      </motion.div>
    </div>
  );
}
