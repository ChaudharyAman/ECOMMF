import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Shield, Edit2, Save, X, MapPin, Plus } from 'lucide-react';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    password: '',
    avatar: '',
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressData, setAddressData] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    isDefault: false,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '',
        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
        password: '',
      });
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const { data } = await api.get('/users/addresses');
      setAddresses(data);
    } catch (error) {
      console.error('Failed to fetch addresses', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });
      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile);
      }

      const { data } = await api.put('/users/profile', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Profile updated successfully');
      setAvatarFile(null);
      setAvatarPreview(null);
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      gender: user.gender || '',
      dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
      password: '',
    });
    setIsEditing(false);
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/users/addresses', addressData);
      setAddresses(data);
      setShowAddressForm(false);
      setAddressData({
        street: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        isDefault: false,
      });
      toast.success('Address added successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add address');
    }
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
                <div className="w-full h-full rounded-full bg-gradient-to-br from-stone-600 to-stone-800 flex items-center justify-center overflow-hidden">
                  {user.avatar || avatarPreview ? (
                    <img src={avatarPreview || user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-white" />
                  )}
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
                    onClick={() => {
                      handleCancel();
                      setAvatarPreview(null);
                      setAvatarFile(null);
                    }}
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
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 outline-none transition-all text-stone-900"
                    placeholder="Enter your phone"
                  />
                ) : (
                  <div className="px-4 py-3 bg-stone-50 rounded-lg border-2 border-transparent">
                    <p className="text-stone-900 font-medium">{user.phone || 'Not provided'}</p>
                  </div>
                )}
              </div>

              {/* Gender */}
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-2">
                  <User className="w-4 h-4 text-stone-500" />
                  Gender
                </label>
                {isEditing ? (
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 outline-none transition-all text-stone-900 bg-white"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <div className="px-4 py-3 bg-stone-50 rounded-lg border-2 border-transparent">
                    <p className="text-stone-900 font-medium capitalize">{user.gender || 'Not provided'}</p>
                  </div>
                )}
              </div>

              {/* Date of Birth */}
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-2">
                  <User className="w-4 h-4 text-stone-500" />
                  Date of Birth
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 outline-none transition-all text-stone-900"
                  />
                ) : (
                  <div className="px-4 py-3 bg-stone-50 rounded-lg border-2 border-transparent">
                    <p className="text-stone-900 font-medium">{user.dob ? new Date(user.dob).toLocaleDateString() : 'Not provided'}</p>
                  </div>
                )}
              </div>

              {/* Password */}
              {isEditing && (
                <>
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-2">
                      <Plus className="w-4 h-4 text-stone-500" />
                      Profile Picture
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setAvatarFile(file);
                        setAvatarPreview(URL.createObjectURL(file));
                      }}
                      className="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-stone-900 file:text-white hover:file:bg-stone-800 transition-all"
                    />
                    {avatarPreview && (
                      <div className="mt-4 relative inline-block">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-stone-200">
                          <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setAvatarFile(null);
                            setAvatarPreview(null);
                          }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-2">
                      <Shield className="w-4 h-4 text-stone-500" />
                      New Password (leave blank to remain unchanged)
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 outline-none transition-all text-stone-900"
                      placeholder="Enter new password"
                    />
                  </div>
                </>
              )}

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

        {/* Addresses Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mt-6">
          <div className="px-8 py-6 border-b border-stone-100 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-stone-900">Address Book</h2>
              <p className="text-sm text-stone-500 mt-1">Manage your delivery addresses</p>
            </div>
            {!showAddressForm && (
              <button
                onClick={() => setShowAddressForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors shadow-md text-sm"
              >
                <Plus className="w-4 h-4" />
                Add New Address
              </button>
            )}
          </div>

          <div className="p-8">
            {showAddressForm ? (
              <form onSubmit={handleAddAddress} className="space-y-4 bg-stone-50 p-6 rounded-xl border border-stone-200">
                <h3 className="font-bold text-stone-900 mb-4">Add New Address</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-stone-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      value={addressData.street}
                      onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400 focus:border-stone-400 outline-none transition duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={addressData.city}
                      onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400 focus:border-stone-400 outline-none transition duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={addressData.state}
                      onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400 focus:border-stone-400 outline-none transition duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Zip / Postal Code</label>
                    <input
                      type="text"
                      required
                      value={addressData.zip}
                      onChange={(e) => setAddressData({ ...addressData, zip: e.target.value })}
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400 focus:border-stone-400 outline-none transition duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Country</label>
                    <input
                      type="text"
                      required
                      value={addressData.country}
                      onChange={(e) => setAddressData({ ...addressData, country: e.target.value })}
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400 focus:border-stone-400 outline-none transition duration-200"
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center mt-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={addressData.isDefault}
                      onChange={(e) => setAddressData({ ...addressData, isDefault: e.target.checked })}
                      className="w-4 h-4 text-stone-900 border-stone-300 rounded focus:ring-stone-900"
                    />
                    <label htmlFor="isDefault" className="ml-2 block text-sm text-stone-900">
                      Set as default address
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="px-4 py-2 bg-white border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.length === 0 ? (
                  <div className="col-span-1 md:col-span-2 text-center py-8 text-stone-500 bg-stone-50 rounded-lg">
                    No addresses found. Add one to speed up checkout.
                  </div>
                ) : (
                  addresses.map((address, index) => (
                    <div key={index} className="p-4 border border-stone-200 rounded-xl relative hover:border-stone-300 transition-colors">
                      {address.isDefault && (
                        <span className="absolute top-4 right-4 bg-stone-100 text-stone-800 text-[10px] uppercase font-bold px-2 py-1 rounded-full">
                          Default
                        </span>
                      )}
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-stone-900 font-medium mb-1">{address.street}</p>
                          <p className="text-stone-600 text-sm">{address.city}, {address.state} {address.zip}</p>
                          <p className="text-stone-600 text-sm">{address.country}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
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
