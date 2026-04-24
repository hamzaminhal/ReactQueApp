import { useState, useEffect, useRef } from "react";
import { collectionGroup, query, where, onSnapshot, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../../components/Navbar";
import { calculateEstimatedTime, formatWaitTime, requestNotificationPermission, sendTokenNotification } from "../../utils/tokenUtils";
import { Ticket, Clock, X, Building2, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MyTokensPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tokens, setTokens] = useState([]);
  const [companies, setCompanies] = useState({});
  const [loading, setLoading] = useState(true);
  const notifiedRef = useRef(new Set());

  useEffect(() => {
    if (!user) return;
    requestNotificationPermission();

    const q = query(
      collectionGroup(db, "tokens"),
      where("userId", "==", user.uid),
      where("status", "in", ["waiting", "current"])
    );

    const unsub = onSnapshot(q, async (snap) => {
      const tkns = snap.docs.map((d) => ({
        id: d.id,
        companyId: d.ref.parent.parent.id,
        ...d.data(),
      }));
      setTokens(tkns);

      // Load company data for each token
      const companyIds = [...new Set(tkns.map((t) => t.companyId))];
      const companyData = {};
      for (const cid of companyIds) {
        if (!companies[cid]) {
          const cSnap = await getDoc(doc(db, "companies", cid));
          if (cSnap.exists()) companyData[cid] = { id: cSnap.id, ...cSnap.data() };
        } else {
          companyData[cid] = companies[cid];
        }
      }
      setCompanies((prev) => ({ ...prev, ...companyData }));
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  // Notification polling
  useEffect(() => {
    const interval = setInterval(() => {
      tokens.forEach((token) => {
        const comp = companies[token.companyId];
        if (!comp) return;
        const est = calculateEstimatedTime(token.tokenNumber, comp.currentToken || 0, comp.estimatedTimePerToken || 5);
        if (est > 0 && est <= 10 && !notifiedRef.current.has(token.id)) {
          notifiedRef.current.add(token.id);
          sendTokenNotification(comp.name, est);
        }
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [tokens, companies]);

  async function cancelToken(token) {
    try {
      await updateDoc(doc(db, "companies", token.companyId, "tokens", token.id), { status: "cancelled" });
    } catch (err) {
      console.error("Cancel error:", err);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 pb-24 sm:pb-8">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">My Tokens</h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">Track your active tokens</p>
          </div>
          <button onClick={() => navigate("/user")} className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all">
            Find More
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && tokens.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
              <Ticket size={40} className="text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No active tokens</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Search for companies and buy tokens to get started</p>
          </div>
        )}

        {!loading && tokens.length > 0 && (
          <div className="space-y-4 animate-fade-in-up">
            {tokens.map((token) => {
              const comp = companies[token.companyId];
              const est = comp ? calculateEstimatedTime(token.tokenNumber, comp.currentToken || 0, comp.estimatedTimePerToken || 5) : 0;

              return (
                <div key={token.id} className={`p-6 rounded-2xl border transition-all ${token.status === "current" ? "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800" : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                        <Building2 size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{comp?.name || "..."}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{token.status}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">#{token.tokenNumber}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1"><Clock size={12} />Est. Wait</p>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{formatWaitTime(est)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1"><Bell size={12} />Notification</p>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{est <= 10 && est > 0 ? "🔔 Soon!" : est === 0 ? "Your turn!" : "Pending"}</p>
                    </div>
                  </div>

                  <button onClick={() => cancelToken(token)} className="w-full py-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 font-medium text-sm border border-red-200 dark:border-red-900 hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors">
                    Cancel Token
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
