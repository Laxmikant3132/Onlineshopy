"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  FilePlus, 
  User, 
  LogOut, 
  Menu, 
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Cookies from "js-cookie";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    // close mobile menu if open so UI doesn't block during redirect
    setIsSidebarOpen(false);
    await signOut(auth);
    await supabase.auth.signOut();
    Cookies.remove("session");
    Cookies.remove("role");
    // force full reload to login page
    window.location.href = "/login";
  };

  const navItems = [
    { label: { en: "Dashboard", kn: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್" }, icon: LayoutDashboard, href: "/dashboard" },
    { label: { en: "Apply Service", kn: "ಸೇವೆಯನ್ನು ಅನ್ವಯಿಸಿ" }, icon: FilePlus, href: "/dashboard/apply" },
    { label: { en: "Profile", kn: "ಪ್ರೊಫೈಲ್" }, icon: User, href: "/dashboard/profile" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 p-6 fixed h-full z-40">
        <div className="mb-10">
          <Link href="/dashboard" className="text-2xl font-bold tracking-tight">
            <span className="text-[#911A20]">Digital</span>
            <span className="text-[#1F295D]"> Seva</span>
          </Link>
        </div>

        <nav className="flex-grow space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? "bg-[#DA1515F3] text-white shadow-lg shadow-red-100 font-semibold" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-[#911A20]"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-white" : ""}`} />
                <span>{t(item.label)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4">
          {/* Language Toggle */}
          <div className="flex items-center justify-between bg-gray-50 p-2 rounded-xl border border-gray-100">
            <button 
              onClick={() => setLang("en")}
              className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition-all ${lang === "en" ? "bg-white text-[#DA1515F3] shadow-sm" : "text-gray-400"}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLang("kn")}
              className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition-all ${lang === "kn" ? "bg-white text-[#DA1515F3] shadow-sm" : "text-gray-400"}`}
            >
              KN
            </button>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>{lang === "en" ? "Logout" : "ನಿರ್ಗಮನ"}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-xl font-bold tracking-tight">
            <span className="text-[#911A20]">Digital</span>
            <span className="text-[#1F295D]"> Seva</span>
          </Link>
          {/* language toggle visible in header */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setLang("en")}
              className={`text-xs font-bold py-1 rounded-lg transition-all ${lang === "en" ? "text-[#DA1515F3]" : "text-gray-400"}`}
            >EN</button>
            <button 
              onClick={() => setLang("kn")}
              className={`text-xs font-bold py-1 rounded-lg transition-all ${lang === "kn" ? "text-[#DA1515F3]" : "text-gray-400"}`}
            >KN</button>
          </div>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 bg-white z-50 p-6 flex flex-col"
            >
              <div className="mb-10 flex justify-between items-center">
                <span className="text-xl font-bold tracking-tight">
                  <span className="text-[#911A20]">Digital</span>
                  <span className="text-[#1F295D]"> Seva</span>
                </span>
                <button onClick={() => setIsSidebarOpen(false)}>
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <nav className="flex-grow space-y-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link 
                      key={item.href} 
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`block w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                        isActive 
                          ? "bg-[#DA1515F3] text-white shadow-lg font-semibold" 
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{t(item.label)}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto space-y-4">
                {/* language toggle duplicated for mobile menu */}
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
                  <button 
                    onClick={() => setLang("en")}
                    className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition-all ${lang === "en" ? "bg-white text-[#DA1515F3] shadow-sm" : "text-gray-400"}`}
                  >
                    EN
                  </button>
                  <button 
                    onClick={() => setLang("kn")}
                    className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition-all ${lang === "kn" ? "bg-white text-[#DA1515F3] shadow-sm" : "text-gray-400"}`}
                  >
                    KN
                  </button>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-3 w-full text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span>{lang === "en" ? "Logout" : "ನಿರ್ಗಮನ"}</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-grow lg:ml-72 p-4 sm:p-8 pt-20 lg:pt-8 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
