import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import FeatureStubPage from './pages/FeatureStubPage';
import LoginPage from './pages/LoginPage';
import OfficerDashboard from './pages/OfficerDashboard';
import AlertsPage from './pages/AlertsPage';
import DrugSearchPage from './pages/DrugSearchPage';
import DrugDetailPage from './pages/DrugDetailPage';
import RegisterPage from './pages/RegisterPage';
import LeaderboardPage from './pages/LeaderboardPage';

const DoctorDash = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50">
    <div className="text-center">
      <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
      <p className="text-gray-600">Phase 6 coming soon</p>
    </div>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' },
          }}
        />
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/officer/dashboard"
            element={
              <ProtectedRoute allowedRole="officer">
                <OfficerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/leaderboard"
            element={
              <ProtectedRoute allowedRole="officer">
                <LeaderboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/search"
            element={
              <ProtectedRoute allowedRole="officer">
                <DrugSearchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/drug/:drugName"
            element={
              <ProtectedRoute allowedRole="officer">
                <DrugDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/alerts"
            element={
              <ProtectedRoute allowedRole="officer">
                <AlertsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/reports"
            element={
              <ProtectedRoute allowedRole="officer">
                <FeatureStubPage title="Reports" description="Officer reporting tools and exports are coming online next." />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/chatbot"
            element={
              <ProtectedRoute allowedRole="officer">
                <FeatureStubPage title="AI Chatbot" description="Conversational decision support is coming in the next phase." />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute allowedRole="doctor">
                <DoctorDash />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
