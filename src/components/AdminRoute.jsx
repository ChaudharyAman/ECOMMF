import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = () => {
    const { user, loading } = useSelector((state) => state.auth);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Give time for user to load from localStorage/API
        const timer = setTimeout(() => {
            setIsChecking(false);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Show loading while checking auth
    if (loading || isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-stone-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-stone-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Check if user is admin
    if (user && user.role === 'admin') {
        return <Outlet />;
    }

    // Redirect to login if not authenticated or not admin
    return <Navigate to="/login" replace />;
};

export default AdminRoute;
