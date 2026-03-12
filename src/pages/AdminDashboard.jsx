import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Product Moderation</h2>
          <p className="text-gray-600 mb-4">Review and approve pending products from vendors.</p>
          <Link to="/admin/moderation" className="text-blue-600 hover:text-blue-800 font-medium">
            Go to Moderation Queue &rarr;
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Vendor Management</h2>
          <p className="text-gray-600 mb-4">Manage vendor accounts and approvals.</p>
          <Link to="/admin/vendors" className="text-blue-600 hover:text-blue-800 font-medium">
            Manage Vendors &rarr;
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Category Management</h2>
          <p className="text-gray-600 mb-4">Manage categories and select featured categories.</p>
          <Link to="/admin/categories" className="text-blue-600 hover:text-blue-800 font-medium">
            Manage Categories &rarr;
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Users & Analytics</h2>
          <p className="text-gray-600 mb-4">View registered users, guests, and their complete details.</p>
          <Link to="/admin/users" className="text-blue-600 hover:text-blue-800 font-medium">
            Manage Users &rarr;
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Financials</h2>
          <p className="text-gray-600 mb-4">View settlements and platform revenue.</p>
          <span className="text-gray-400 cursor-not-allowed">Coming Soon</span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
