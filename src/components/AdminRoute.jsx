import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { Shield } from 'lucide-react';

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
            <div className="flex h-screen bg-[#FDFBF7]">
                {/* Sidebar Skeleton */}
                <div className="w-64 border-r border-stone-200 bg-white hidden md:flex flex-col">
                    <div className="h-16 flex items-center px-6 border-b border-stone-100">
                        <div className="w-24 h-6 bg-stone-200 rounded animate-pulse"></div>
                    </div>
                    <div className="p-4 space-y-4 flex-1">
                        <div className="w-full h-10 bg-stone-100 rounded-lg animate-pulse"></div>
                        <div className="w-3/4 h-10 bg-stone-100 rounded-lg animate-pulse"></div>
                        <div className="w-5/6 h-10 bg-stone-100 rounded-lg animate-pulse"></div>
                        <div className="w-full h-10 bg-stone-100 rounded-lg animate-pulse"></div>
                    </div>
                </div>

                {/* Main Content Skeleton */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Header Skeleton */}
                    <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-4 sm:px-6 lg:px-8">
                        <div className="w-32 h-6 bg-stone-100 rounded animate-pulse"></div>
                        <div className="w-8 h-8 bg-stone-200 rounded-full animate-pulse"></div>
                    </header>

                    {/* Content Area Skeleton */}
                    <main className="flex-1 p-6 lg:p-8 space-y-6">
                        {/* Page Title & Actions */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="w-48 h-8 bg-stone-200 rounded-md animate-pulse"></div>
                            <div className="w-32 h-10 bg-stone-800/10 rounded-lg animate-pulse"></div>
                        </div>

                        {/* Top Config/Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                                    <div className="w-10 h-10 bg-stone-100 rounded-full animate-pulse mb-4"></div>
                                    <div className="w-2/3 h-5 bg-stone-200 rounded animate-pulse mb-2"></div>
                                    <div className="w-1/3 h-8 bg-stone-100 rounded animate-pulse"></div>
                                </div>
                            ))}
                        </div>

                        {/* Data Table/List Area */}
                        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden flex-1">
                            {/* Table Header mock */}
                            <div className="h-14 border-b border-stone-100 bg-stone-50/50 flex items-center px-6 gap-6">
                                <div className="w-1/4 h-4 bg-stone-200 rounded animate-pulse"></div>
                                <div className="w-1/4 h-4 bg-stone-200 rounded animate-pulse"></div>
                                <div className="w-1/4 h-4 bg-stone-200 rounded animate-pulse"></div>
                                <div className="w-1/4 h-4 bg-stone-200 rounded animate-pulse"></div>
                            </div>
                            {/* Table rows mock */}
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-16 border-b border-stone-50 flex flex-col justify-center px-6">
                                    <div className="w-full h-4 bg-stone-100 rounded animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    </main>
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
