import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingSpinner from "./components/LoadingSpinner";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import CompanyListPage from "./pages/company/CompanyListPage";
import CompanyTokensPage from "./pages/company/CompanyTokensPage";
import SearchPage from "./pages/user/SearchPage";
import CompanyDetailPage from "./pages/user/CompanyDetailPage";
import MyTokensPage from "./pages/user/MyTokensPage";

export default function App() {
  const { loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/company" element={<ProtectedRoute><CompanyListPage /></ProtectedRoute>} />
      <Route path="/company/:companyId/tokens" element={<ProtectedRoute><CompanyTokensPage /></ProtectedRoute>} />
      <Route path="/user" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
      <Route path="/user/company/:companyId" element={<ProtectedRoute><CompanyDetailPage /></ProtectedRoute>} />
      <Route path="/user/my-tokens" element={<ProtectedRoute><MyTokensPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
