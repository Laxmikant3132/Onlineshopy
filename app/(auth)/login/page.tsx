"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Firebase Login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();

      // 2. Set session cookie
      Cookies.set("session", token, { expires: 7 });

      // 3. Fetch profile from Supabase using Firebase UID
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.uid)
        .maybeSingle();

      if (userError) throw userError;

      let role = userData?.role;

      // Special case: Ensure specific user is Admin
      const adminEmail = "laxmikanttalli303@gmail.com";
      if (email.toLowerCase() === adminEmail.toLowerCase()) {
        role = "admin";
        
        // Update role in DB if it's currently customer or missing
        if (userData?.role !== "admin") {
          await supabase
            .from("users")
            .upsert({
              id: user.uid,
              name: user.displayName || "Admin User",
              email: email,
              role: "admin"
            });
        }
      } else if (!userData) {
        // 4. Handle case where user exists in Firebase but not in Supabase
        const { error: insertError } = await supabase.from("users").insert([
          {
            id: user.uid,
            name: user.displayName || email.split("@")[0],
            email: user.email || email,
            role: "customer",
          },
        ]);

        if (insertError) throw insertError;
        role = "customer";
      }

      // 5. Set role cookie for middleware
      Cookies.set("role", role, { expires: 7 });

      // 6. Redirect based on role
      if (role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
      Cookies.remove("session");
      Cookies.remove("role");
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
          <p className="text-gray-500">Welcome back! Sign in with Firebase.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#DA1515F3] transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#DA1515F3] transition-all"
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
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500">
            Don't have an account?{" "}
            <Link href="/register" className="text-[#DA1515F3] font-bold hover:underline">
              Sign up for free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
