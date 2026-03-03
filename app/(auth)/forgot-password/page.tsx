"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("If an account exists, a password reset link has been sent to your email.");
    } catch (err: any) {
      setError(err.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 sm:p-12"
      >
        <div className="text-center mb-10">
          <Link href="/">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              <span className="text-[#911A20]">Digital</span>
              <span className="text-[#1F295D]"> Seva</span>
            </h1>
          </Link>
          <p className="text-gray-500">Enter your email to reset your password.</p>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-green-50 text-green-600 rounded-xl text-sm font-medium border border-green-100 mb-4"
          >
            {message}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 mb-4"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleReset} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-4 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#DA1515F3] transition-all"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit"
            className="w-full py-4 bg-[#DA1515F3] text-white rounded-2xl font-bold text-lg shadow-lg shadow-red-100 flex items-center justify-center space-x-2 transition-colors hover:bg-[#911A20] disabled:opacity-70"
          >
            {loading ? (
              <span>Sending…</span>
            ) : (
              <span>Send Reset Link</span>
            )}
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500">
            <Link href="/login" className="text-[#DA1515F3] font-bold hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
