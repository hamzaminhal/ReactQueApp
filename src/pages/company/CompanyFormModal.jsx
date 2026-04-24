import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";
import AddressSearch from "../../components/AddressSearch";
import ImageUpload from "../../components/ImageUpload";
import { X, Building2 } from "lucide-react";

export default function CompanyFormModal({ onClose, onCreated }) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    since: "",
    certificates: [],
    timings: "",
    address: null,
  });

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "companies"), {
        name: form.name.trim(),
        since: form.since,
        certificates: form.certificates,
        timings: form.timings,
        address: form.address,
        ownerId: user.uid,
        ownerName: user.displayName,
        createdAt: serverTimestamp(),
        tokensAllowed: false,
        totalTokens: 0,
        currentToken: 0,
        estimatedTimePerToken: 5,
        tokenDate: "",
      });
      onCreated();
    } catch (error) {
      console.error("Error creating company:", error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl animate-slide-up">
        <div className="sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Building2 size={18} className="text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add Company</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Name *</label>
            <input type="text" required value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Enter company name" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Established Since</label>
            <input type="text" value={form.since} onChange={(e) => updateField("since", e.target.value)} placeholder="e.g. 2015" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Certificates (Max 3)</label>
            <ImageUpload value={form.certificates} onChange={(val) => updateField("certificates", val)} max={3} label="Upload Certificates" folder="certificates" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timings</label>
            <input type="text" value={form.timings} onChange={(e) => updateField("timings", e.target.value)} placeholder="e.g. Mon-Sat 9:00 AM - 5:00 PM" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
            <AddressSearch value={form.address} onChange={(val) => updateField("address", val)} />
          </div>
          <button type="submit" disabled={saving || !form.name.trim()} className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all disabled:opacity-50 active:scale-[0.98]">
            {saving ? "Creating..." : "Create Company"}
          </button>
        </form>
      </div>
    </div>
  );
}
