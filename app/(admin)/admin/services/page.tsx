"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  FileText,
  Loader2,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Service {
  id: string;
  name: string;
  description: string;
  required_documents: string[];
}

export default function ServicesSettingsPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    required_documents: ""
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingId(service.id);
    setFormData({
      name: service.name,
      description: service.description,
      required_documents: service.required_documents.join(", ")
    });
  };

  const handleSave = async (id?: string) => {
    setSaving(true);
    const docs = formData.required_documents.split(",").map(d => d.trim()).filter(d => d !== "");
    
    try {
      if (id) {
        // Update
        const { error } = await supabase
          .from("services")
          .update({
            name: formData.name,
            description: formData.description,
            required_documents: docs
          })
          .eq("id", id);
        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase
          .from("services")
          .insert([{
            name: formData.name,
            description: formData.description,
            required_documents: docs
          }]);
        if (error) throw error;
      }
      
      setEditingId(null);
      setShowAddForm(false);
      setFormData({ name: "", description: "", required_documents: "" });
      fetchServices();
    } catch (error) {
      console.error("Error saving service:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    
    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", id);
      if (error) throw error;
      fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#911A20] animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading services configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1F295D]">Services Settings</h1>
          <p className="text-gray-500">Configure the government services available for application.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-[#911A20] text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-red-100 transition-all hover:bg-[#1F295D]"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Service</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence>
          {showAddForm && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-8 rounded-[2.5rem] border-2 border-dashed border-[#911A20]/30 shadow-sm"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#1F295D]">Create New Service</h3>
                <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Service Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#911A20]"
                    placeholder="e.g. Passport Application"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Required Documents (Comma separated)</label>
                  <input 
                    type="text" 
                    value={formData.required_documents}
                    onChange={(e) => setFormData({...formData, required_documents: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#911A20]"
                    placeholder="e.g. Aadhaar, Photo, Signature"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#911A20] min-h-[100px]"
                    placeholder="Briefly describe the service..."
                  />
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-4">
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="px-8 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="px-8 py-3 bg-[#1F295D] text-white rounded-xl font-bold hover:bg-[#911A20] transition-all flex items-center space-x-2"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> <span>Save Service</span></>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {services.map((service) => (
          <motion.div 
            key={service.id} 
            layout
            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-lg transition-all"
          >
            {editingId === service.id ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Service Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#911A20]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Documents (Comma separated)</label>
                    <input 
                      type="text" 
                      value={formData.required_documents}
                      onChange={(e) => setFormData({...formData, required_documents: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#911A20]"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Description</label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#911A20] min-h-[100px]"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4">
                  <button onClick={() => setEditingId(null)} className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold">Cancel</button>
                  <button onClick={() => handleSave(service.id)} disabled={saving} className="px-6 py-2 bg-[#1F295D] text-white rounded-lg font-bold flex items-center space-x-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> <span>Update</span></>}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start space-x-6">
                  <div className="w-16 h-16 bg-red-50 text-[#911A20] rounded-[1.5rem] flex items-center justify-center shrink-0">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-[#1F295D]">{service.name}</h3>
                    <p className="text-gray-500 font-medium leading-relaxed">{service.description}</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {service.required_documents.map((doc, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-50 text-gray-500 rounded-lg text-xs font-bold border border-gray-100">
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 shrink-0">
                  <button 
                    onClick={() => handleEdit(service)}
                    className="p-4 text-[#1F295D] hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100"
                  >
                    <Edit3 className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={() => handleDelete(service.id)}
                    className="p-4 text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
