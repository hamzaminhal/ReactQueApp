import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { LogOut, Sun, Moon, Home, Building2, Ticket, ArrowLeft, ClipboardList } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const showBack = location.pathname !== "/";

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
              <span className="text-white font-bold text-sm">Q</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              Que
            </span>
          </Link>
        </div>

        {/* Center nav links */}
        <div className="hidden sm:flex items-center gap-1">
          <NavLink to="/" icon={<Home size={16} />} label="Home" active={location.pathname === "/"} />
          <NavLink to="/company" icon={<Building2 size={16} />} label="Company" active={location.pathname.startsWith("/company")} />
          <NavLink to="/user" icon={<Ticket size={16} />} label="Tokens" active={location.pathname === "/user" || location.pathname.startsWith("/user/company")} />
          <NavLink to="/user/my-tokens" icon={<ClipboardList size={16} />} label="My Tokens" active={location.pathname === "/user/my-tokens"} />
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-all"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user && (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/20"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {user.displayName?.[0] || "U"}
                    </span>
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
                  {user.displayName}
                </span>
              </div>

              <button
                onClick={logout}
                className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-all"
                aria-label="Logout"
              >
                <LogOut size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-around h-16">
          <MobileNavLink to="/" icon={<Home size={20} />} label="Home" active={location.pathname === "/"} />
          <MobileNavLink to="/company" icon={<Building2 size={20} />} label="Company" active={location.pathname.startsWith("/company")} />
          <MobileNavLink to="/user" icon={<Ticket size={20} />} label="Search" active={location.pathname === "/user" || location.pathname.startsWith("/user/company")} />
          <MobileNavLink to="/user/my-tokens" icon={<ClipboardList size={20} />} label="My Tokens" active={location.pathname === "/user/my-tokens"} />
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, icon, label, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
        active
          ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function MobileNavLink({ to, icon, label, active }) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all ${
        active
          ? "text-indigo-600 dark:text-indigo-400"
          : "text-gray-400 dark:text-gray-500"
      }`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
