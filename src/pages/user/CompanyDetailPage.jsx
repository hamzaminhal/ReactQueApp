import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, addDoc, query, where, getDocs, updateDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../../components/Navbar";
import MapView from "../../components/MapView";
import ImageUpload from "../../components/ImageUpload";
import { calculateEstimatedTime, formatWaitTime } from "../../utils/tokenUtils";
import { Building2, Clock, MapPin, Shield, Ticket, Image, X, AlertCircle, CheckCircle } from "lucide-react";

export default function CompanyDetailPage() {
  const { companyId } = useParams();
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myToken, setMyToken] = useState(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [patientImage, setPatientImage] = useState("");
  const [buying, setBuying] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    const unsub = onSnapshot(doc(db, "companies", companyId), (snap) => {
      if (snap.exists()) setCompany({ id: snap.id, ...snap.data() });
      setLoading(false);
    });
    return () => unsub();
  }, [companyId]);

  useEffect(() => {
    if (!companyId || !user) return;
    const q = query(
      collection(db, "companies", companyId, "tokens"),
      where("userId", "==", user.uid),
      where("status", "in", ["waiting", "current"])
    );
    const unsub = onSnapshot(q, (snap) => {
      setMyToken(snap.docs.length > 0 ? { id: snap.docs[0].id, ...snap.docs[0].data() } : null);
    });
    return () => unsub();
  }, [companyId, user]);

  async function buyToken() {
    if (!patientImage) return;
    setBuying(true);
    try {
      const tokensSnap = await getDocs(collection(db, "companies", companyId, "tokens"));
      const tokenNumber = tokensSnap.size + 1;
      await addDoc(collection(db, "companies", companyId, "tokens"), {
        userId: user.uid,
        userName: user.displayName,
        userEmail: user.email,
        userPhoto: user.photoURL,
        patientImage,
        tokenNumber,
        status: tokenNumber === 1 ? "current" : "waiting",
        createdAt: serverTimestamp(),
      });
      setShowBuyModal(false);
      setPatientImage("");
    } catch (err) {
      console.error("Buy token error:", err);
    } finally {
      setBuying(false);
    }
  }

  async function cancelToken() {
    if (!myToken) return;
    setCancelling(true);
    try {
      await updateDoc(doc(db, "companies", companyId, "tokens", myToken.id), { status: "cancelled" });
      setMyToken(null);
    } catch (err) {
      console.error("Cancel error:", err);
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950"><Navbar />
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950"><Navbar />
        <div className="text-center py-20"><AlertCircle size={40} className="mx-auto text-red-400 mb-4" /><p className="text-gray-500">Company not found</p></div>
      </div>
    );
  }

  const estimatedTime = myToken ? calculateEstimatedTime(myToken.tokenNumber, company.currentToken || 0, company.estimatedTimePerToken || 5) : 0;
  const totalBought = company.totalTokens || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8 pb-24 sm:pb-8">
        {/* Company header */}
        <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm mb-6 animate-fade-in">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              <Building2 size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{company.name}</h1>
              <div className="flex flex-wrap gap-3 mt-2">
                {company.since && <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><Shield size={12} />Since {company.since}</span>}
                {company.timings && <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><Clock size={12} />{company.timings}</span>}
              </div>
            </div>
          </div>

          {/* Certificates */}
          {company.certificates?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Certificates</h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {company.certificates.map((url, i) => (
                  <img key={i} src={url} alt={`Certificate ${i+1}`} className="w-32 h-24 object-cover rounded-xl border border-gray-200 dark:border-gray-700 shrink-0" />
                ))}
              </div>
            </div>
          )}

          {/* Address & Map */}
          {company.address?.label && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1"><MapPin size={14} />Address</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{company.address.label}</p>
              {company.address.lat && company.address.lng && <MapView lat={company.address.lat} lng={company.address.lng} className="h-48" />}
            </div>
          )}
        </div>

        {/* Token status */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6 animate-fade-in-up">
          <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-center">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Tokens</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{company.totalTokens || 0}</p>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-center">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Current Token</p>
            <p className="text-3xl font-bold text-indigo-500">{company.currentToken || 0}</p>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-center">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Est. Per Token</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{company.estimatedTimePerToken || 5}<span className="text-sm text-gray-400 ml-1">min</span></p>
          </div>
        </div>

        {/* My token or Buy button */}
        {myToken ? (
          <div className="p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={18} className="text-indigo-500" />
              <h3 className="font-bold text-gray-900 dark:text-white">Your Token</h3>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Token Number</p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">#{myToken.tokenNumber}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{myToken.status}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Estimated Wait</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatWaitTime(estimatedTime)}</p>
              </div>
            </div>
            <button onClick={cancelToken} disabled={cancelling} className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-colors disabled:opacity-50">
              {cancelling ? "Cancelling..." : "Cancel Token"}
            </button>
          </div>
        ) : (
          <div className="animate-fade-in-up">
            {company.tokensAllowed ? (
              <button onClick={() => setShowBuyModal(true)} className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all active:scale-[0.98]">
                <span className="flex items-center justify-center gap-2"><Ticket size={18} />Buy Token</span>
              </button>
            ) : (
              <div className="p-6 rounded-2xl bg-gray-100 dark:bg-gray-800 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Tokens are not available right now</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Buy Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowBuyModal(false)}></div>
          <div className="relative z-10 w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Buy Token</h3>
              <button onClick={() => setShowBuyModal(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><X size={18} /></button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Upload a patient image to proceed</p>
            <ImageUpload value={patientImage ? [patientImage] : []} onChange={(val) => setPatientImage(Array.isArray(val) ? val[0] || "" : val)} max={1} label="Upload Patient Image" folder="patients" />
            <button onClick={buyToken} disabled={buying || !patientImage} className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50">
              {buying ? "Processing..." : "Confirm Purchase"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
