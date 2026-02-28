"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileUp, 
  Check, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  ArrowLeft,
  UploadCloud,
  X,
  FileText
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/context/AuthContext";
import { useLanguage } from "@/lib/context/LanguageContext";
import { useRouter } from "next/navigation";

interface Service {
  id: string;
  name: string;
  description: string;
  required_documents: string[];
}

export default function ApplyPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<{ [key: string]: File }>({});
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase.from("services").select("*");
      if (error) throw error;
      setServices(data || []);
    } catch (err) {
      console.error("Error fetching services:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (docName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [docName]: e.target.files![0] }));
    }
  };

  const removeFile = (docName: string) => {
    setFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[docName];
      return newFiles;
    });
  };

  const handleSubmit = async () => {
    if (!selectedService) return;
    
    // Validate all documents are uploaded
    const missingDocs = selectedService.required_documents.filter(doc => !files[doc]);
    if (missingDocs.length > 0) {
      setError(`Please upload all required documents: ${missingDocs.join(", ")}`);
      return;
    }

    setUploading(true);
    setError("");

    try {
      if (!user) throw new Error("User not found");

      // 1. Generate Application ID
      const appId = `DSC-${Math.floor(100000 + Math.random() * 900000)}`;

      // 2. Insert Application
      const { data: appData, error: appError } = await supabase
        .from("applications")
        .insert([
          {
            user_id: user.uid,
            service_id: selectedService.id,
            application_id: appId,
            status: "pending"
          }
        ])
        .select()
        .single();

      if (appError) throw appError;

      // 3. Upload Documents
      for (const docName of selectedService.required_documents) {
        const file = files[docName];
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.uid}/${appData.id}/${docName}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("documents")
          .getPublicUrl(filePath);

        // 4. Save document record
        const { error: docError } = await supabase
          .from("documents")
          .insert([
            {
              application_id: appData.id,
              file_name: docName,
              file_url: publicUrl
            }
          ]);

        if (docError) throw docError;
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "An error occurred during application");
    } finally {
      setUploading(false);
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
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1F295D]">{t({ en: "Apply for Service", kn: "ಸೇವೆಗಾಗಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ" })}</h1>
          <p className="text-gray-500">{t({ en: "Complete the form below to submit your application.", kn: "ನಿಮ್ಮ ಅರ್ಜಿಯನ್ನು ಸಲ್ಲಿಸಲು ಕೆಳಗಿನ ಫಾರ್ಮ್ ಅನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ." })}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 1 ? 'bg-[#DA1515F3] text-white' : 'bg-green-100 text-green-600'}`}>
            {step > 1 ? <Check className="w-4 h-4" /> : "1"}
          </div>
          <div className="w-12 h-1 bg-gray-200 rounded-full" />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 2 ? 'bg-[#DA1515F3] text-white' : 'bg-gray-100 text-gray-400'}`}>
            2
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-bold text-[#1F295D]">{t({ en: "Step 1: Choose a Service", kn: "ಹಂತ 1: ಸೇವೆಯನ್ನು ಆರಿಸಿ" })}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`p-6 rounded-[2rem] border-2 text-left transition-all ${
                    selectedService?.id === service.id 
                      ? "border-[#DA1515F3] bg-red-50" 
                      : "border-gray-100 bg-white hover:border-[#DA1515F3] hover:shadow-lg"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${selectedService?.id === service.id ? 'bg-[#DA1515F3] text-white' : 'bg-red-50 text-[#DA1515F3]'}`}>
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1F295D] mb-1">{service.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{service.description}</p>
                </button>
              ))}
            </div>

            <div className="pt-6 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!selectedService}
                onClick={() => setStep(2)}
                className="bg-[#DA1515F3] text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-red-100 disabled:opacity-50 flex items-center space-x-2"
              >
                <span>{t({ en: "Continue", kn: "ಮುಂದುವರಿಸಿ" })}</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex items-center space-x-4 mb-6">
              <button 
                onClick={() => setStep(1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-500" />
              </button>
              <h2 className="text-xl font-bold text-[#1F295D]">{t({ en: "Step 2: Upload Documents for", kn: "ಹಂತ 2: ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ" })} {selectedService?.name}</h2>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-start space-x-2 border border-red-100 animate-shake">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {selectedService?.required_documents.map((doc) => (
                <div key={doc} className="space-y-2">
                  <p className="text-sm font-bold text-[#1F295D] ml-2">{doc}</p>
                  <div className={`relative h-48 rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 text-center ${
                    files[doc] ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-[#DA1515F3] group'
                  }`}>
                    {files[doc] ? (
                      <motion.div 
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="space-y-2"
                      >
                        <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                          <Check className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-green-700 truncate max-w-[150px]">{files[doc].name}</p>
                        <button 
                          onClick={() => removeFile(doc)}
                          className="text-xs text-red-500 font-bold hover:underline"
                        >
                          {t({ en: "Change File", kn: "ಫೈಲ್ ಬದಲಾಯಿಸಿ" })}
                        </button>
                      </motion.div>
                    ) : (
                      <>
                        <UploadCloud className="w-10 h-10 text-gray-300 mb-3 group-hover:text-[#DA1515F3] group-hover:scale-110 transition-all" />
                        <p className="text-sm text-gray-500 font-medium">{t({ en: "Click or drag to upload", kn: "ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ ಅಥವಾ ಎಳೆಯಿರಿ" })}</p>
                        <p className="text-xs text-gray-400 mt-1">{t({ en: "PDF, JPG, PNG (Max 5MB)", kn: "PDF, JPG, PNG (ಗರಿಷ್ಠ 5MB)" })}</p>
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(doc, e)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-10">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={uploading}
                onClick={handleSubmit}
                className="w-full py-5 bg-[#DA1515F3] text-white rounded-[2rem] font-bold text-xl shadow-xl shadow-red-100 flex items-center justify-center space-x-3 disabled:opacity-70"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>{t({ en: "Uploading Documents...", kn: "ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ..." })}</span>
                  </>
                ) : (
                  <>
                    <span>{t({ en: "Submit Application", kn: "ಅರ್ಜಿಯನ್ನು ಸಲ್ಲಿಸಿ" })}</span>
                    <FileUp className="w-6 h-6" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
