import { useState } from "react";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { Search, Building2, Clock, MapPin, Shield, Ticket } from "lucide-react";

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e) {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const q = query(collection(db, "companies"), orderBy("name"));
      const snap = await getDocs(q);
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const filtered = all.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 pb-24 sm:pb-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Find Companies</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">Search for registered companies and buy tokens</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8 animate-fade-in">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by company name..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm shadow-sm"
              />
            </div>
            <button type="submit" disabled={loading} className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all active:scale-[0.97]">
              {loading ? "..." : "Search"}
            </button>
          </div>
        </form>

        {/* Results */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <Building2 size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No companies found for "{searchQuery}"</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid gap-4 animate-fade-in-up">
            {results.map((company) => (
              <button
                key={company.id}
                onClick={() => navigate(`/user/company/${company.id}`)}
                className="group w-full text-left p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                    <Building2 size={24} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{company.name}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      {company.since && (
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><Shield size={12} />Since {company.since}</span>
                      )}
                      {company.timings && (
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><Clock size={12} />{company.timings}</span>
                      )}
                      {company.address?.label && (
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><MapPin size={12} />{company.address.label.substring(0, 50)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${company.tokensAllowed ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${company.tokensAllowed ? "bg-emerald-500" : "bg-gray-400"}`}></div>
                        {company.tokensAllowed ? "Accepting Tokens" : "Closed"}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400"><Ticket size={12} />{company.currentToken || 0}/{company.totalTokens || 0}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
