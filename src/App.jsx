import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import './App.css';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './services/Auth.jsx';
import HomePage from '@/pages/HomePage';
import SignInPage from '@/pages/SignInPage';
import SignOutPage from '@/pages/SignOutPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" />;
    }

    return children;
};

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-out" element={<SignOutPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
                path="/admin/dashboard"
                element={
                    <ProtectedRoute>
                        <AdminDashboardPage />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="app-container">
                    <AppRoutes />
                    <ErrorBoundary>
                        <ToastContainer position="top-right" autoClose={3000} />
                    </ErrorBoundary>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;