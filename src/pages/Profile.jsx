import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Shield, Edit2, Save, X } from 'lucide-react';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/users/profile', formData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <User className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-600 text-lg">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="relative h-32 bg-gradient-to-r from-stone-800 via-stone-700 to-stone-800">
            <div className="absolute -bottom-16 left-8">
              <div className="w-32 h-32 rounded-full bg-white p-2 shadow-xl">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-stone-600 to-stone-800 flex items-center justify-center">
                  <User className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-20 pb-6 px-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-stone-900 mb-1">{user.name}</h1>
                <p className="text-stone-500 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
              </div>
              
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors shadow-md"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-6 border-b border-stone-100">
            <h2 className="text-xl font-bold text-stone-900">Profile Information</h2>
            <p className="text-sm text-stone-500 mt-1">Manage your personal details and account settings</p>
          </div>

          <div className="p-8">
            <div className="space-y-6">
              {/* Full Name */}
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-2">
                  <User className="w-4 h-4 text-stone-500" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 outline-none transition-all text-stone-900"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="px-4 py-3 bg-stone-50 rounded-lg border-2 border-transparent">
                    <p className="text-stone-900 font-medium">{user.name}</p>
                  </div>
                )}
              </div>

              {/* Email Address */}
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-2">
                  <Mail className="w-4 h-4 text-stone-500" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 outline-none transition-all text-stone-900"
                    placeholder="Enter your email"
                  />
                ) : (
                  <div className="px-4 py-3 bg-stone-50 rounded-lg border-2 border-transparent">
                    <p className="text-stone-900 font-medium">{user.email || 'Not provided'}</p>
                  </div>
                )}
              </div>

              {/* Phone Number */}
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-2">
                  <Phone className="w-4 h-4 text-stone-500" />
                  Phone Number
                </label>
                <div className="px-4 py-3 bg-stone-50 rounded-lg border-2 border-transparent">
                  <p className="text-stone-900 font-medium">{user.phone || 'Not provided'}</p>
                </div>
              </div>

              {/* Role */}
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-2">
                  <Shield className="w-4 h-4 text-stone-500" />
                  Account Role
                </label>
                <div className="px-4 py-3 bg-gradient-to-r from-stone-900 to-stone-800 rounded-lg border-2 border-transparent">
                  <p className="text-white font-bold capitalize flex items-center gap-2">
                    {user.role}
                    <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded-full">
                      {user.role === 'admin' ? 'Full Access' : user.role === 'vendor' ? 'Seller' : 'Customer'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-stone-500">
            Member since {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
