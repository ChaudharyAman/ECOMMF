import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Activity, ExternalLink, MapPin } from 'lucide-react';
import api from '../utils/api';
import { PageSkeleton } from '../components/Skeletons';

const AdminUsers = () => {
  const [activeTab, setActiveTab] = useState('registered'); // 'registered' or 'guests'
  const [users, setUsers] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersRes = await api.get('/users');
      setUsers(usersRes.data);
      
      const visitorsRes = await api.get('/visitors');
      setVisitors(visitorsRes.data);
    } catch (error) {
      console.error('Error fetching admin user data', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    setLoadingDetails(true);
    try {
      const { data } = await api.get(`/users/${userId}`);
      setSelectedUser(data);
    } catch (error) {
      console.error('Error fetching user details', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-600" />
          Users & Analytics
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        <button
          onClick={() => { setActiveTab('registered'); setSelectedUser(null); }}
          className={`py-3 px-6 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'registered' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Registered Users ({users.length})
        </button>
        <button
          onClick={() => { setActiveTab('guests'); setSelectedUser(null); }}
          className={`py-3 px-6 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'guests' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Guest Visitors ({visitors.length})
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side: List */}
        <div className={`w-full ${selectedUser ? 'lg:w-1/2' : ''} transition-all duration-300`}>
          {activeTab === 'registered' && (
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 text-sm">
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Contact</th>
                    <th className="p-4 font-medium">Role</th>
                    <th className="p-4 font-medium">Joined</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr 
                      key={user._id} 
                      className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors ${selectedUser?._id === user._id ? 'bg-blue-50/80 shadow-inner' : ''}`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs uppercase">
                             {user.name.charAt(0)}
                           </div>
                           <span className="font-medium text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        <div>{user.email || 'No email'}</div>
                        <div className="text-xs text-gray-400">{user.phone}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium uppercase ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => fetchUserDetails(user._id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center justify-end gap-1 w-full"
                        >
                          Details <ExternalLink className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                     <tr>
                        <td colSpan="5" className="p-8 text-center text-gray-500">No registered users found.</td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'guests' && (
             <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 text-sm">
                     <th className="p-4 font-medium">IP Address</th>
                     <th className="p-4 font-medium">User Agent</th>
                     <th className="p-4 font-medium">Total Visits</th>
                     <th className="p-4 font-medium">Last Visit</th>
                   </tr>
                 </thead>
                 <tbody>
                   {visitors.map(visitor => (
                     <tr key={visitor._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                       <td className="p-4 font-mono text-sm text-gray-900 border-l-[3px] border-l-orange-400">
                         {visitor.ipAddress}
                       </td>
                       <td className="p-4 text-xs text-gray-500 max-w-[250px] truncate" title={visitor.userAgent}>
                         {visitor.userAgent}
                       </td>
                       <td className="p-4 text-sm text-gray-900 font-medium">
                         {visitor.visitCount}
                       </td>
                       <td className="p-4 text-sm text-gray-500">
                         {new Date(visitor.lastVisit).toLocaleString()}
                       </td>
                     </tr>
                   ))}
                   {visitors.length === 0 && (
                     <tr>
                        <td colSpan="4" className="p-8 text-center text-gray-500">No visitor records found.</td>
                     </tr>
                  )}
                 </tbody>
               </table>
             </div>
          )}
        </div>

        {/* Right Side: Details Panel */}
        {selectedUser && activeTab === 'registered' && (
          <div className="w-full lg:w-1/2">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 sticky top-4 overflow-hidden">
              {loadingDetails ? (
                <div className="p-12 flex justify-center">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  <div className="bg-slate-900 p-6 flex items-center gap-6">
                    <img 
                      src={selectedUser.avatar || 'https://via.placeholder.com/150'} 
                      alt="Avatar" 
                      className="w-24 h-24 rounded-full border-4 border-slate-700 object-cover"
                    />
                    <div>
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        {selectedUser.name}
                        {selectedUser.role === 'admin' && <ShieldCheck className="w-5 h-5 text-amber-400" />}
                      </h2>
                      <p className="text-slate-400">{selectedUser.email || 'No email provided'}</p>
                      <span className="inline-block mt-2 px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-300 uppercase tracking-widest border border-slate-700">
                        ID: {selectedUser._id}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Complete Profile Details</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                       <div>
                         <span className="block text-xs text-gray-500 mb-1">Phone Number</span>
                         <span className="font-medium text-gray-900">{selectedUser.phone}</span>
                       </div>
                       <div>
                         <span className="block text-xs text-gray-500 mb-1">Role</span>
                         <span className="font-medium text-gray-900 capitalize">{selectedUser.role}</span>
                       </div>
                       <div>
                         <span className="block text-xs text-gray-500 mb-1">Gender</span>
                         <span className="font-medium text-gray-900 capitalize">{selectedUser.gender || 'Not specified'}</span>
                       </div>
                       <div>
                         <span className="block text-xs text-gray-500 mb-1">Date of Birth</span>
                         <span className="font-medium text-gray-900">
                           {selectedUser.dob ? new Date(selectedUser.dob).toLocaleDateString() : 'Not specified'}
                         </span>
                       </div>
                       <div>
                         <span className="block text-xs text-gray-500 mb-1">Account Created</span>
                         <span className="font-medium text-gray-900">
                           {new Date(selectedUser.createdAt).toLocaleDateString()}
                         </span>
                       </div>
                    </div>

                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      Saved Addresses
                    </h3>
                    
                    {selectedUser.addresses && selectedUser.addresses.length > 0 ? (
                      <div className="space-y-3">
                        {selectedUser.addresses.map((address, idx) => (
                           <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-start gap-4">
                             <div className="mt-1">
                                {address.isDefault ? (
                                   <div className="w-2 h-2 rounded-full bg-green-500 ring-4 ring-green-100"></div>
                                ) : (
                                   <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                )}
                             </div>
                             <div>
                                <p className="text-sm text-gray-900 font-medium">{address.street}, {address.city}</p>
                                <p className="text-sm text-gray-500">{address.state}, {address.zip}, {address.country}</p>
                             </div>
                           </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No addresses saved for this user.</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
