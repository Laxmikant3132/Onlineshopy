"use client";

import React, { useState, useMemo } from "react";
import { motion, useMotionValue, useTransform, useAnimationFrame } from "framer-motion";
import { 
  CreditCard, 
  FileText, 
  Car, 
  UserRound, 
  ShieldCheck, 
  Zap, 
  Users, 
  BarChart3, 
  Globe, 
  ArrowRight,
  MapPin, 
  Phone,
  Search,
  Mail,
  Linkedin,
  Instagram,
  Facebook
} from "lucide-react";
import Link from "next/link";

// Types for translations
type Language = "en" | "kn";

interface Translations {
  [key: string]: {
    en: string;
    kn: string;
  };
}

const translations: Translations = {
  siteName: { en: "Digital Seva Center", kn: "ಡಿಜಿಟಲ್ ಸೇವಾ ಕೇಂದ್ರ" },
  home: { en: "Home", kn: "ಮುಖಪುಟ" },
  getStarted: { en: "Get Started", kn: "ಪ್ರಾರಂಭಿಸಿ" },
  seeServices: { en: "See Services", kn: "ಸೇವೆಗಳನ್ನು ನೋಡಿ" },
  heroTitle: { 
    en: "Apply for Government Services Easily and Safely", 
    kn: "ಸುಲಭವಾಗಿ ಮತ್ತು ಸುರಕ್ಷಿತವಾಗಿ ಸರ್ಕಾರಿ ಸೇವೆಗಳಿಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ" 
  },
  heroSubtext: { 
    en: "Upload your documents online. We handle the process for you.", 
    kn: "ನಿಮ್ಮ ದಾಖಲೆಗಳನ್ನು ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ. ನಾವು ಪ್ರಕ್ರಿಯೆಯನ್ನು ನಿರ್ವಹಿಸುತ್ತೇವೆ." 
  },
  ourServices: { en: "Our Services", kn: "ನಮ್ಮ ಸೇವೆಗಳು" },
  serviceSubtext: { en: "Comprehensive government service solutions at your fingertips.", kn: "ನಿಮ್ಮ ಬೆರಳ ತುದಿಯಲ್ಲಿ ಸಮಗ್ರ ಸರ್ಕಾರಿ ಸೇವಾ ಪರಿಹಾರಗಳು." },
  howItWorks: { en: "How It Works", kn: "ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ" },
  whyChooseUs: { en: "Why Choose Us", kn: "ನಮ್ಮನ್ನು ಏಕೆ ಆಯ್ಕೆ ಮಾಡಿಕೊಳ್ಳಬೇಕು" },
  trackApplication: { en: "Track Application", kn: "ಅರ್ಜಿಯ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ" },
  enterAppId: { en: "Enter Application ID", kn: "ಅರ್ಜಿ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ" },
  trackNow: { en: "Track Now", kn: "ಟ್ರ್ಯಾಕ್ ಮಾಡಿ" },
  contactUs: { en: "Contact Us", kn: "ಸಂಪರ್ಕಿಸಿ" },
  apply: { en: "Apply", kn: "ಅರ್ಜಿ ಸಲ್ಲಿಸಿ" },
  
  // Service Names
  panCard: { en: "PAN Card", kn: "ಪ್ಯಾನ್ ಕಾರ್ಡ್" },
  passport: { en: "Passport Application", kn: "ಪಾಸ್‌ಪೋರ್ಟ್ ಅರ್ಜಿ" },
  drivingLicense: { en: "Driving License", kn: "ಚಾಲನಾ ಪರವಾನಗಿ" },
  incomeCert: { en: "Income Certificate", kn: "ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ" },
  aadhaarUpdate: { en: "Aadhaar Update", kn: "ಆಧಾರ್ ನವೀಕರಣ" },
  
  // Service Descriptions
  panDesc: { en: "Apply for new PAN or update existing", kn: "ಹೊಸ ಪ್ಯಾನ್ ಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ ಅಥವಾ ಅಸ್ತಿತ್ವದಲ್ಲಿರುವದನ್ನು ನವೀಕರಿಸಿ" },
  passportDesc: { en: "Fresh passport application assistance", kn: "ಹೊಸ ಪಾಸ್‌ಪೋರ್ಟ್ ಅರ್ಜಿ ಸಹಾಯ" },
  dlDesc: { en: "Apply for learner's or permanent license", kn: "ಲರ್ನರ್ ಅಥವಾ ಶಾಶ್ವತ ಪರವಾನಗಿಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ" },
  incomeDesc: { en: "Get your income certificate online", kn: "ನಿಮ್ಮ ಆದಾಯ ಪ್ರಮಾಣಪತ್ರವನ್ನು ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಪಡೆಯಿರಿ" },
  aadhaarDesc: { en: "Update Aadhaar details easily", kn: "ಆಧಾರ್ ವಿವರಗಳನ್ನು ಸುಲಭವಾಗಿ ನವೀಕರಿಸಿ" },
  
  // Footer
  readyToSecure: { en: "Ready to simplify your government services?", kn: "ನಿಮ್ಮ ಸರ್ಕಾರಿ ಸೇವೆಗಳನ್ನು ಸರಳಗೊಳಿಸಲು ಸಿದ್ಧರಿದ್ದೀರಾ?" },
  footerDesc: { 
    en: "Building a safer digital world with end-to-end government service solutions. From document processing to final certification.", 
    kn: "ಎಂಡ್-ಟು-ಎಂಡ್ ಸರ್ಕಾರಿ ಸೇವಾ ಪರಿಹಾರಗಳೊಂದಿಗೆ ಸುರಕ್ಷಿತ ಡಿಜಿಟಲ್ ಜಗತ್ತನ್ನು ನಿರ್ಮಿಸುವುದು." 
  },
  services: { en: "Services", kn: "ಸೇವೆಗಳು" },
  company: { en: "Company", kn: "ಕಂಪನಿ" },
  stayUpdated: { en: "Stay Updated", kn: "ನವೀಕೃತವಾಗಿರಿ" },
  newsletter: { en: "Subscribe to our newsletter for the latest updates.", kn: "ಇತ್ತೀಚಿನ ನವೀಕರಣಗಳಿಗಾಗಿ ನಮ್ಮ ಸುದ್ದಿಪತ್ರಕ್ಕೆ ಚಂದಾದಾರರಾಗಿ." },
  subscribe: { en: "Subscribe", kn: "ಚಂದಾದಾರರಾಗಿ" },
  aboutUs: { en: "About Us", kn: "ನಮ್ಮ ಬಗ್ಗೆ" },
  whyUs: { en: "Why Us", kn: "ನಾವೇಕೆ" },
  blogs: { en: "Blogs", kn: "ಬ್ಲಾಗ್‌ಗಳು" },
};

// Spotlight Card component with Image Hover effect
const ServiceCard = ({ service, t }: { service: any, t: any }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div 
      onMouseMove={onMouseMove}
      whileHover={{ 
        scale: 1.05, 
        y: -10,
        zIndex: 50,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
      }}
      className="group relative min-w-[350px] bg-white p-10 rounded-3xl border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.04)] flex flex-col items-start text-left h-[300px] overflow-hidden transition-all duration-300 hover:border-[#DA1515F3]"
    >
      {/* Spotlight Effect */}
      <motion.div 
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useTransform(
            [mouseX, mouseY],
            ([x, y]: any) => `radial-gradient(400px circle at ${x}px ${y}px, rgba(218, 21, 21, 0.05), transparent 80%)`
          )
        }}
      />
      
      {/* Icon Container - Changes to solid red on hover */}
      <div className="w-16 h-16 bg-[#F0F7FF] text-[#DA1515F3] rounded-2xl flex items-center justify-center mb-8 relative z-10 transition-colors duration-300 group-hover:bg-[#DA1515F3] group-hover:text-white">
        <service.icon className="w-8 h-8" />
      </div>
      
      <h3 className="text-2xl font-bold mb-4 text-[#334155] relative z-10">{t(service.title)}</h3>
      <p className="text-[#334155]/70 text-base leading-relaxed relative z-10">
        {t(service.desc)}
      </p>
    </motion.div>
  );
};

export default function LandingPage() {
  const [lang, setLang] = useState<Language>("en");
  const [isPaused, setIsPaused] = useState(false);
  const x = useMotionValue(0);

  const t = (key: string) => translations[key] ? translations[key][lang] : key;

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const services = useMemo(() => [
    { icon: CreditCard, title: "panCard", desc: "panDesc" },
    { icon: FileText, title: "passport", desc: "passportDesc" },
    { icon: Car, title: "drivingLicense", desc: "dlDesc" },
    { icon: UserRound, title: "incomeCert", desc: "incomeDesc" },
    { icon: Search, title: "aadhaarUpdate", desc: "aadhaarDesc" },
    { icon: ShieldCheck, title: "secureData", desc: "secureDesc" },
    { icon: Zap, title: "fastProcess", desc: "fastDesc" },
  ], []);

  // Marquee logic
  const cardWidth = 350;
  const gap = 32; // gap-8
  const totalWidth = (cardWidth + gap) * services.length;

  useAnimationFrame((time, delta) => {
    if (isPaused) return;
    
    // Smooth speed independent of frame rate
    const frameDelta = Math.min(delta, 32); // Cap delta to prevent jumps
    const moveBy = -1.2 * (frameDelta / 16); 
    const currentX = x.get() + moveBy;
    
    if (currentX <= -totalWidth) {
      x.set(0);
    } else {
      x.set(currentX);
    }
  });

  const scrollingServices = useMemo(() => [...services, ...services, ...services], [services]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#334155] font-montserrat overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center"
            >
              <span className="text-xl sm:text-2xl font-bold tracking-tight">
                <span className="text-[#911A20]">{lang === "en" ? "Digital" : "ಡಿಜಿಟಲ್"}</span>
                <span className="text-[#1F295D]"> {lang === "en" ? "Seva Center" : "ಸೇವಾ ಕೇಂದ್ರ"}</span>
              </span>
            </motion.div>
            
            <nav className="hidden md:flex space-x-8 items-center">
              <Link href="/" className="text-[#334155] hover:text-[#911A20] font-medium transition-colors">
                {t("home")}
              </Link>
              <Link href="/track" className="text-[#334155] hover:text-[#911A20] font-medium transition-colors">
                {t("trackApplication")}
              </Link>
              <Link href="/login">
                <motion.button 
                  whileHover={{ scale: 1.05, backgroundColor: "#DA1515" }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#DA1515F3] text-white px-6 py-2 rounded-full font-semibold shadow-md"
                >
                  {t("getStarted")}
                </motion.button>
              </Link>
              <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-1.5 border border-gray-200">
                <button 
                  onClick={() => setLang("en")} 
                  className={`text-sm font-medium px-2 py-0.5 rounded-full transition-all ${lang === "en" ? "bg-white text-[#DA1515F3] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  English
                </button>
                <span className="text-gray-300">|</span>
                <button 
                  onClick={() => setLang("kn")} 
                  className={`text-sm font-medium px-2 py-0.5 rounded-full transition-all ${lang === "kn" ? "bg-white text-[#DA1515F3] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  ಕನ್ನಡ
                </button>
              </div>
            </nav>

            <div className="md:hidden flex items-center space-x-4">
              <button 
                onClick={() => setLang(lang === "en" ? "kn" : "en")} 
                className="text-xs font-bold text-[#DA1515F3] bg-gray-100 px-3 py-1 rounded-full border border-gray-200"
              >
                {lang === "en" ? "ಕನ್ನಡ" : "EN"}
              </button>
              <button className="p-2 text-gray-600">
                <Globe className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-[#911A20] leading-[1.1] mb-6"
          >
            {t("heroTitle")}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-lg sm:text-xl text-[#334155] mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            {t("heroSubtext")}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <Link href="/register" className="w-full sm:w-auto">
              <motion.button 
                whileHover={{ scale: 1.05, backgroundColor: "#DA1515" }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-8 py-4 bg-[#DA1515F3] text-white rounded-xl font-bold text-lg shadow-lg shadow-red-100"
              >
                {t("getStarted")}
              </motion.button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <motion.button 
                whileHover={{ scale: 1.05, borderColor: "#DA1515F3", color: "#DA1515F3" }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-8 py-4 bg-white text-[#DA1515F3] border-2 border-[#DA1515F3] rounded-xl font-bold text-lg"
              >
                {t("seeServices")}
              </motion.button>
            </Link>
          </motion.div>
        </section>

        {/* Updated Service Section - Our Services with Auto Scroll and Cursor Effect */}
        <section className="py-20 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
            <motion.h2 
              {...fadeIn}
              className="text-4xl sm:text-6xl font-bold text-[#911A20] mb-4"
            >
              {t("ourServices")}
            </motion.h2>
            <motion.p 
              {...fadeIn}
              transition={{ delay: 0.2 }}
              className="text-[#334155] text-lg"
            >
              {t("serviceSubtext")}
            </motion.p>
          </div>

          {/* Marquee Container */}
          <div 
            className="relative w-full overflow-visible"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <motion.div 
              className="flex gap-8 px-4"
              style={{ x }}
            >
              {scrollingServices.map((service, index) => (
                <ServiceCard key={index} service={service} t={t} />
              ))}
            </motion.div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2 
              {...fadeIn}
              className="text-3xl sm:text-5xl font-bold text-[#911A20] mb-16"
            >
              {t("whyChooseUs")}
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: ShieldCheck, title: "secureData", desc: "secureDesc" },
                { icon: Zap, title: "fastProcess", desc: "fastDesc" },
                { icon: Users, title: "experienced", desc: "expDesc" },
                { icon: BarChart3, title: "transparent", desc: "transDesc" }
              ].map((feature, index) => (
                <motion.div 
                  key={index}
                  {...fadeIn}
                  transition={{ delay: index * 0.1 }}
                  className="p-8 rounded-2xl border border-gray-100 shadow-lg hover:shadow-2xl transition-shadow bg-white"
                >
                  <div className="w-14 h-14 bg-red-50 text-[#911A20] rounded-xl flex items-center justify-center mb-6 mx-auto">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-[#911A20] mb-4">{t(feature.title)}</h3>
                  <p className="text-[#334155] leading-relaxed">
                    {t(feature.desc)}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Track Application Section */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.div 
              {...fadeIn}
              className="bg-white p-8 sm:p-16 rounded-[3rem] shadow-2xl border border-gray-100"
            >
              <h2 className="text-3xl sm:text-5xl font-bold text-[#911A20] mb-6">
                {t("trackApplication")}
              </h2>
              <p className="text-[#334155] mb-12 text-lg">
                Check the current status of your submitted application.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                <input 
                  type="text" 
                  placeholder={t("enterAppId")} 
                  className="flex-grow px-8 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#DA1515F3] text-lg"
                />
                <Link href="/track" className="contents">
                  <motion.button 
                    whileHover={{ scale: 1.05, backgroundColor: "#DA1515" }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-4 bg-[#DA1515F3] text-white rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center"
                  >
                    {t("trackNow")}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer Implementation based on image */}
      <footer className="bg-[#0A0F1C] text-white overflow-hidden">
        {/* Call to Action Red Bar */}
        <div className="bg-[#DA1515F3] py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <h2 className="text-2xl sm:text-4xl font-bold !text-white text-center md:text-left">
              {t("readyToSecure")}
            </h2>
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: "white", color: "#DA1515F3" }}
              className="bg-white text-[#DA1515F3] px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors"
            >
              {t("getStarted")} <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Logo and Info */}
            <div className="space-y-8">
              <div className="flex flex-col">
                <span className="text-3xl font-black tracking-tighter">
                  <span className="text-[#911A20]">DIGI</span>
                  <span className="text-[#1F295D]">SEVA</span>
                </span>
                <span className="text-xs font-bold tracking-[0.3em] text-gray-400 mt-1 uppercase">A Digital Future Secured</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                {t("footerDesc")}
              </p>
              <div className="space-y-4">
                <a href="mailto:info@digiseva.com" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                  <Mail className="w-5 h-5 text-[#DA1515F3]" />
                  <span className="text-sm">info@digiseva.com</span>
                </a>
                <div className="flex items-center gap-3 text-gray-400">
                  <Phone className="w-5 h-5 text-[#DA1515F3]" />
                  <span className="text-sm">+91 98765 43210</span>
                </div>
                <div className="flex items-start gap-3 text-gray-400">
                  <MapPin className="w-5 h-5 text-[#DA1515F3] mt-1" />
                  <span className="text-sm">Bengaluru, Karnataka - 560001</span>
                </div>
              </div>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-[#DA1515F3] transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-[#DA1515F3] transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-[#DA1515F3] transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Services Links */}
            <div>
              <h4 className="text-lg font-bold mb-8">{t("services")}</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">{t("panCard")}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t("passport")}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t("drivingLicense")}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t("incomeCert")}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t("aadhaarUpdate")}</a></li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-lg font-bold mb-8">{t("company")}</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">{t("aboutUs")}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t("whyUs")}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t("blogs")}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t("contactUs")}</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-lg font-bold mb-8">{t("stayUpdated")}</h4>
              <p className="text-gray-400 text-sm mb-6">{t("newsletter")}</p>
              <div className="space-y-3">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#DA1515F3]"
                />
                <button className="w-full bg-[#DA1515F3] hover:bg-[#DA1515] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors">
                  {t("subscribe")} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
