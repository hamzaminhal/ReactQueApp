import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc, collection, query, where, orderBy, onSnapshot, getDocs, writeBatch } from "firebase/firestore";
import { db } from "../../config/firebase";
import Navbar from "../../components/Navbar";
import { shouldResetTokens, getTodayString } from "../../utils/tokenUtils";
import { Hash, Clock, ToggleLeft, ToggleRight, CheckCircle2, Users, AlertCircle } from "lucide-react";

export default function CompanyTokensPage() {
  const { companyId } = useParams();
  const [company, setCompany] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalInput, setTotalInput] = useState("");
  const [timeInput, setTimeInput] = useState("");

  useEffect(() => {
    loadCompany();
  }, [companyId]);

  useEffect(() => {
    if (!companyId) return;
    const q = query(collection(db, "companies", companyId, "tokens"), orderBy("tokenNumber", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setTokens(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [companyId]);

  async function loadCompany() {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, "companies", companyId));
      if (!snap.exists()) return;
      const data = { id: snap.id, ...snap.data() };

      // Lazy daily reset
      if (shouldResetTokens(data.tokenDate)) {
        const batch = writeBatch(db);
        batch.update(doc(db, "companies", companyId), {
          tokenDate: getTodayString(),
          currentToken: 0,
          totalTokens: 0,
          tokensAllowed: false,
        });
        // Delete old tokens
        const oldTokens = await getDocs(collection(db, "companies", companyId, "tokens"));
        oldTokens.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
        data.tokenDate = getTodayString();
        data.currentToken = 0;
        data.totalTokens = 0;
        data.tokensAllowed = false;
      }

      setCompany(data);
      setTotalInput(data.totalTokens?.toString() || "");
      setTimeInput(data.estimatedTimePerToken?.toString() || "5");
    } catch (err) {
      console.error("Error loading company:", err);
    } finally {
      setLoading(false);
    }
  }

  async function updateTotalTokens() {
    const val = parseInt(totalInput);
    if (isNaN(val) || val < 0) return;
    await updateDoc(doc(db, "companies", companyId), { totalTokens: val, tokenDate: getTodayString() });
    setCompany((p) => ({ ...p, totalTokens: val }));
  }

  async function updateEstimatedTime() {
    const val = parseInt(timeInput);
    if (isNaN(val) || val < 1) return;
    await updateDoc(doc(db, "companies", companyId), { estimatedTimePerToken: val });
    setCompany((p) => ({ ...p, estimatedTimePerToken: val }));
  }

  async function toggleTokens() {
    const newVal = !company.tokensAllowed;
    await updateDoc(doc(db, "companies", companyId), { tokensAllowed: newVal });
    setCompany((p) => ({ ...p, tokensAllowed: newVal }));
  }

  async function markCurrentDone() {
    const next = (company.currentToken || 0) + 1;
    await updateDoc(doc(db, "companies", companyId), { currentToken: next });

    // Update token status
    const currentTokenDoc = tokens.find((t) => t.tokenNumber === company.currentToken);
    if (currentTokenDoc) {
      await updateDoc(doc(db, "companies", companyId, "tokens", currentTokenDoc.id), { status: "done" });
    }
    const nextTokenDoc = tokens.find((t) => t.tokenNumber === next);
    if (nextTokenDoc) {
      await updateDoc(doc(db, "companies", companyId, "tokens", nextTokenDoc.id), { status: "current" });
    }

    setCompany((p) => ({ ...p, currentToken: next }));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <div className="text-center py-20">
          <AlertCircle size={40} className="mx-auto text-red-400 mb-4" />
          <p className="text-gray-500">Company not found</p>
        </div>
      </div>
    );
  }

  const activeTokens = tokens.filter((t) => t.status === "waiting" || t.status === "current");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 pb-24 sm:pb-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{company.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Token Management — {getTodayString()}</p>
        </div>

        {/* Controls grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in-up">
          {/* Total Tokens */}
          <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <Hash size={16} className="text-indigo-500" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Tokens</span>
            </div>
            <div className="flex gap-2">
              <input type="number" min="0" value={totalInput} onChange={(e) => setTotalInput(e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
              <button onClick={updateTotalTokens} className="px-4 py-2 rounded-xl bg-indigo-500 text-white text-xs font-medium hover:bg-indigo-600 transition-colors">Set</button>
            </div>
          </div>

          {/* Time per token */}
          <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-violet-500" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Min/Token</span>
            </div>
            <div className="flex gap-2">
              <input type="number" min="1" value={timeInput} onChange={(e) => setTimeInput(e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
              <button onClick={updateEstimatedTime} className="px-4 py-2 rounded-xl bg-violet-500 text-white text-xs font-medium hover:bg-violet-600 transition-colors">Set</button>
            </div>
          </div>

          {/* Current Token */}
          <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <Users size={16} className="text-emerald-500" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Token</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{company.currentToken || 0}</span>
              <button onClick={markCurrentDone} disabled={company.currentToken >= company.totalTokens} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50">
                <CheckCircle2 size={14} />
                Done
              </button>
            </div>
          </div>

          {/* Toggle Tokens */}
          <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              {company.tokensAllowed ? <ToggleRight size={16} className="text-emerald-500" /> : <ToggleLeft size={16} className="text-gray-400" />}
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</span>
            </div>
            <button onClick={toggleTokens} className={`w-full py-3 rounded-xl font-medium text-sm transition-all ${company.tokensAllowed ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700"}`}>
              {company.tokensAllowed ? "✓ Tokens Allowed" : "Tokens Disallowed"}
            </button>
          </div>
        </div>

        {/* Token Queue */}
        <div className="animate-fade-in-up">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Token Queue ({activeTokens.length})</h2>
          {activeTokens.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
              <Users size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">No tokens purchased yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeTokens.map((token) => (
                <div key={token.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${token.status === "current" ? "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800" : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${token.status === "current" ? "bg-indigo-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>
                    #{token.tokenNumber}
                  </div>
                  {token.userPhoto ? (
                    <img src={token.userPhoto} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-500">{token.userName?.[0]}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{token.userName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{token.userEmail}</p>
                  </div>
                  {token.status === "current" && (
                    <span className="px-3 py-1 rounded-full bg-indigo-500 text-white text-xs font-medium">Current</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
