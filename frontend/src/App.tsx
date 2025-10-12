import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import { useAuth } from './hooks/useAuth';
import { ROUTES } from './utils/constants';
import GoogleOAuthProvider from './components/providers/GoogleOAuthProvider';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Lazy load pages for code splitting
const Login = lazy(() => import('./pages/auth/Login/Login'));
const Register = lazy(() => import('./pages/auth/Register/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to={ROUTES.LOGIN} replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public Routes */}
        <Route
          path={ROUTES.LOGIN}
          element={
            <PublicRoute>
              <Suspense fallback={<LoadingSpinner />}>
                <Login />
              </Suspense>
            </PublicRoute>
          }
        />
        <Route
          path={ROUTES.REGISTER}
          element={
            <PublicRoute>
              <Suspense fallback={<LoadingSpinner />}>
                <Register />
              </Suspense>
            </PublicRoute>
          }
        />
        <Route
          path={ROUTES.FORGOT_PASSWORD}
          element={
            <PublicRoute>
              <Suspense fallback={<LoadingSpinner />}>
                <ForgotPassword />
              </Suspense>
            </PublicRoute>
          }
        />
        <Route
          path={ROUTES.RESET_PASSWORD}
          element={
            <PublicRoute>
              <Suspense fallback={<LoadingSpinner />}>
                <ResetPassword />
              </Suspense>
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner />}>
                <Dashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />

        {/* Catch all route - redirect to login */}
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider>
        <Router>
          <div className="App">
            <AppRoutes />
            <Toaster 
              position="top-center"
              expand={true}
              richColors={true}
              closeButton={true}
              visibleToasts={3}
              toastOptions={{
                duration: 4000,
              }}
            />
          </div>
        </Router>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
};

export default App;
