import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import { Building2, Ticket, ArrowRight } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-12 pb-24 sm:pb-12">
        {/* Greeting */}
        <div className="mb-12 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            Hello, {user?.displayName?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400 text-lg">
            How would you like to use Que today?
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid sm:grid-cols-2 gap-6 animate-fade-in-up">
          {/* Company Card */}
          <button
            onClick={() => navigate("/company")}
            className="group relative text-left p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-indigo-50 dark:from-indigo-950/30 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-6">
                <Building2 size={28} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Are you a Company?
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                Register your business, manage token queues, set daily limits, and serve your customers efficiently.
              </p>
              <div className="flex items-center gap-2 text-indigo-500 font-semibold text-sm group-hover:gap-3 transition-all">
                Manage Companies
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>

          {/* Normal User Card */}
          <button
            onClick={() => navigate("/user")}
            className="group relative text-left p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-emerald-50 dark:from-emerald-950/30 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-6">
                <Ticket size={28} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Finding / Waiting for Tokens?
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                Search for registered companies, buy tokens, track your queue position, and get notified when it's your turn.
              </p>
              <div className="flex items-center gap-2 text-emerald-500 font-semibold text-sm group-hover:gap-3 transition-all">
                Find Tokens
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
