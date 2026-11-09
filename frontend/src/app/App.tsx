import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { ToastProvider } from '../hooks/useToast';
import { AppLayout } from '../components/layout/AppLayout';
import { LoadingState } from '../components/ui/LoadingState';

// Feature Pages
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { MemoriesPage } from '../features/memories/MemoriesPage';
import { BorrowedPage } from '../features/borrowed/BorrowedPage';
import { RemindersPage } from '../features/reminders/RemindersPage';
import { PeoplePage } from '../features/people/PeoplePage';
import { CarryListPage } from '../features/carry-list/CarryListPage';
import { BeforeYouLeavePage } from '../features/before-you-leave/BeforeYouLeavePage';
import { InsightsPage } from '../features/insights/InsightsPage';
import { AssistantPage } from '../features/assistant/AssistantPage';
import { SettingsPage } from '../features/settings/SettingsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FC]">
        <LoadingState message="Checking authentication..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FC]">
        <LoadingState message="Loading..." />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <RegisterPage />
                </PublicOnlyRoute>
              }
            />

            {/* Protected Application Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="memories" element={<MemoriesPage />} />
              <Route path="borrowed" element={<BorrowedPage />} />
              <Route path="reminders" element={<RemindersPage />} />
              <Route path="people" element={<PeoplePage />} />
              <Route path="carry" element={<CarryListPage />} />
              <Route path="before-you-leave" element={<BeforeYouLeavePage />} />
              <Route path="insights" element={<InsightsPage />} />
              <Route path="assistant" element={<AssistantPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

