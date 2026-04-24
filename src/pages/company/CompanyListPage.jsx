import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import CompanyFormModal from "./CompanyFormModal";
import { Plus, Building2, Clock, MapPin, Shield, ChevronRight } from "lucide-react";

export default function CompanyListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, [user]);

  async function loadCompanies() {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "companies"),
        where("ownerId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      setCompanies(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error loading companies:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 pb-24 sm:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              My Companies
            </h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
              Manage your registered businesses
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all active:scale-[0.97]"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Company</span>
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Empty state */}
        {!loading && companies.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
              <Building2 size={40} className="text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No companies yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
              Click the + button to register your first company
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
            >
              <Plus size={18} />
              Add Your First Company
            </button>
          </div>
        )}

        {/* Company list */}
        {!loading && companies.length > 0 && (
          <div className="grid gap-4 animate-fade-in-up">
            {companies.map((company) => (
              <button
                key={company.id}
                onClick={() => navigate(`/company/${company.id}/tokens`)}
                className="group w-full text-left p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                      <Building2 size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {company.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        {company.since && (
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Shield size={12} />
                            Since {company.since}
                          </span>
                        )}
                        {company.timings && (
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock size={12} />
                            {company.timings}
                          </span>
                        )}
                        {company.address?.label && (
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <MapPin size={12} />
                            {company.address.label.substring(0, 40)}...
                          </span>
                        )}
                      </div>
                      {/* Token status */}
                      <div className="flex items-center gap-3 mt-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          company.tokensAllowed
                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${company.tokensAllowed ? "bg-emerald-500" : "bg-gray-400"}`}></div>
                          {company.tokensAllowed ? "Tokens Active" : "Tokens Inactive"}
                        </span>
                        {company.totalTokens > 0 && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {company.currentToken || 0}/{company.totalTokens} tokens
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 transition-colors shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Add Company Modal */}
      {showModal && (
        <CompanyFormModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            loadCompanies();
          }}
        />
      )}
    </div>
  );
}
