import { Navigate, Route, Routes } from 'react-router-dom';
import { isAuthenticated, setToken } from './api/client.js';
import DashboardPage from './pages/DashboardPage.jsx';
import LawyerDetailPage from './pages/LawyerDetailPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import UserDetailPage from './pages/UserDetailPage.jsx';
import AppointmentsPage from './pages/AppointmentsPage.jsx';
import AppointmentDetailPage from './pages/AppointmentDetailPage.jsx';
import ConsultationsPage from './pages/ConsultationsPage.jsx';
import ConsultationDetailPage from './pages/ConsultationDetailPage.jsx';
import PaymentsPage from './pages/PaymentsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated() ? (
            <Navigate to="/" replace />
          ) : (
            <LoginPage onLogin={(token) => setToken(token)} />
          )
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage onLogout={() => setToken(null)} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lawyers/:id"
        element={
          <ProtectedRoute>
            <LawyerDetailPage onLogout={() => setToken(null)} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <UsersPage onLogout={() => setToken(null)} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/:id"
        element={
          <ProtectedRoute>
            <UserDetailPage onLogout={() => setToken(null)} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <AppointmentsPage onLogout={() => setToken(null)} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments/:id"
        element={
          <ProtectedRoute>
            <AppointmentDetailPage onLogout={() => setToken(null)} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/consultations"
        element={
          <ProtectedRoute>
            <ConsultationsPage onLogout={() => setToken(null)} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/consultations/:id"
        element={
          <ProtectedRoute>
            <ConsultationDetailPage onLogout={() => setToken(null)} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedRoute>
            <PaymentsPage onLogout={() => setToken(null)} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage onLogout={() => setToken(null)} />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
