import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../lib/api';

/**
 * ProtectedRoute – redirects unauthenticated users to /login.
 * Shows a loading spinner while the session check is in progress.
 */
export function ProtectedRoute({ children }) {
    const [status, setStatus] = useState('loading'); // 'loading' | 'auth' | 'unauth'

    useEffect(() => {
        api.getMe().then((data) => {
            setStatus(data.user ? 'auth' : 'unauth');
        }).catch(() => setStatus('unauth'));
    }, []);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white">Loading...</p>
                </div>
            </div>
        );
    }

    return status === 'auth' ? children : <Navigate to="/login" replace />;
}

/**
 * AdminRoute – redirects non-admins to /admin login.
 * Checks auth token and verifies isAdmin flag via admin/login validation.
 * Since we use the same JWT cookie, we check by trying to hit a protected admin endpoint.
 */
export function AdminRoute({ children }) {
    const [status, setStatus] = useState('loading'); // 'loading' | 'auth' | 'unauth'

    useEffect(() => {
        // Try to fetch admin-only data — 401/403 means not admin
        api.getCurrentBets().then((data) => {
            if (data.error) {
                setStatus('unauth');
            } else {
                setStatus('auth');
            }
        }).catch(() => setStatus('unauth'));
    }, []);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-300">Verifying admin access...</p>
                </div>
            </div>
        );
    }

    return status === 'auth' ? children : <Navigate to="/admin" replace />;
}
