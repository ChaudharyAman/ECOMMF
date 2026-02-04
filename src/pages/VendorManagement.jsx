import { useState, useEffect } from 'react';
import { fetchVendors, approveVendor, restrictVendor, updateVendor, createVendor } from '../api/adminApi';
import { ShieldCheck, UserX, AlertTriangle, CheckCircle, Store, Mail, MapPin, Eye, Pencil, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import VendorDetailView from '../components/VendorDetailView';
import EditVendorModal from '../components/EditVendorModal';
import AddVendorModal from '../components/AddVendorModal';

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionProcessing, setActionProcessing] = useState(null);

  const [viewingVendor, setViewingVendor] = useState(null);
  const [editingVendor, setEditingVendor] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const data = await fetchVendors();
      setVendors(data);
    } catch (err) {
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const handleCreate = async (vendorData) => {
      try {
          await createVendor(vendorData);
          setIsAdding(false);
          loadVendors();
      } catch (err) {
          // Error is handled and displayed in the modal
          throw err; // Re-throw so modal can catch it
      }
  };

  const handleUpdate = async (id, data) => {
      try {
          await updateVendor(id, data);
          toast.success('Vendor Updated');
          setEditingVendor(null);
          loadVendors();
      } catch (err) {
          toast.error(err.response?.data?.message || 'Update failed');
      }
  };

  const handleApprove = async (id) => {
      if (!window.confirm('Approve this vendor? This will enable their storefront.')) return;
      try {
          setActionProcessing(id);
          await approveVendor(id);
          toast.success('Vendor Approved');
          if (viewingVendor && viewingVendor._id === id) setViewingVendor(null);
          loadVendors();
      } catch (err) {
          toast.error(err.response?.data?.message || 'Approval failed');
      } finally {
          setActionProcessing(null);
      }
  };

  const handleRestrict = async (id) => {
      const reason = window.prompt('Enter reason for restriction/rejection:');
      if (!reason) return;

      try {
          setActionProcessing(id);
          await restrictVendor(id, reason);
          toast.success('Vendor Restricted');
          if (viewingVendor && viewingVendor._id === id) setViewingVendor(null);
          loadVendors();
      } catch (err) {
          toast.error(err.response?.data?.message || 'Action failed');
      } finally {
          setActionProcessing(null);
      }
  };

  const getStatusBadge = (vendor) => {
      if (vendor.isApproved) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1"/> Active</span>;
      if (vendor.kycStatus === 'pending') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1"/> Pending Approval</span>;
      if (vendor.kycStatus === 'rejected') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><UserX className="w-3 h-3 mr-1"/> Restricted</span>;
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Draft</span>;
  };

  // Render Actions for Detail View
  const renderActions = (vendor) => (
      <div className="flex justify-end space-x-3 w-full">
            <button 
                onClick={() => { setViewingVendor(null); setEditingVendor(vendor); }}
                className="text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors text-sm font-semibold flex items-center"
            >
                <Pencil className="w-4 h-4 mr-2" /> Edit Details
            </button>
            {vendor.isApproved ? (
                <button 
                    onClick={() => handleRestrict(vendor._id)}
                    disabled={actionProcessing === vendor._id}
                    className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors text-sm font-semibold flex items-center shadow-md shadow-red-200"
                >
                    <UserX className="w-4 h-4 mr-2" /> Restrict Access
                </button>
            ) : (
                <>
                    <button 
                        onClick={() => handleRestrict(vendor._id)}
                        disabled={actionProcessing === vendor._id}
                        className="text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors text-sm font-semibold shadow-sm"
                    >
                        Reject Application
                    </button>
                    <button 
                        onClick={() => handleApprove(vendor._id)}
                        disabled={actionProcessing === vendor._id}
                        className="text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors text-sm font-semibold flex items-center shadow-md shadow-green-200"
                    >
                        <ShieldCheck className="w-4 h-4 mr-2" /> Approve & Enable
                    </button>
                </>
            )}
      </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl relative">
      {/* Edit Modal */}
      {editingVendor && (
          <EditVendorModal 
              vendor={editingVendor} 
              onSave={handleUpdate}
              onClose={() => setEditingVendor(null)}
          />
      )}

      {/* Add Modal */}
      {isAdding && (
          <AddVendorModal 
              onSave={handleCreate}
              onClose={() => setIsAdding(false)}
          />
      )}

      {/* View Modal Overlay */}
      {viewingVendor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setViewingVendor(null)}>
              <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
                  <VendorDetailView 
                      vendor={viewingVendor} 
                      onClose={() => setViewingVendor(null)}
                      actions={renderActions(viewingVendor)}
                  />
              </div>
          </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Vendor Management</h1>
            <p className="text-slate-500 mt-1">Oversee vendor accounts, approvals, and compliance.</p>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setIsAdding(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center shadow-md shadow-indigo-200 transition-all hover:scale-105"
            >
                <Plus className="w-4 h-4 mr-2" /> Onboard Vendor
            </button>
            <div className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium">
                Total Vendors: <span className="font-bold text-slate-900">{vendors.length}</span>
            </div>
        </div>
      </div>

      <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Vendor Entity</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Performance</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                    {loading ? (
                        <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">Loading vendors...</td></tr>
                    ) : vendors.length === 0 ? (
                        <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">No vendors found.</td></tr>
                    ) : (
                        vendors.map(vendor => (
                            <tr key={vendor._id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                                            <Store className="w-5 h-5" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-bold text-slate-900">{vendor.storeName}</div>
                                            <div className="text-xs text-slate-500 flex items-center mt-0.5">
                                                ID: {vendor._id.substring(0, 8)}...
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-slate-700 flex items-center mb-1">
                                        <Mail className="w-3 h-3 mr-1.5 text-slate-400" /> 
                                        {vendor.user?.email || 'No Email'}
                                    </div>
                                    {vendor.address && (
                                        <div className="text-xs text-slate-500 flex items-center" title={`${vendor.address.city}, ${vendor.address.state}`}>
                                            <MapPin className="w-3 h-3 mr-1.5 text-slate-400" />
                                            {vendor.address.city || 'Unknown City'}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(vendor)}
                                    {vendor.kycStatus === 'pending' && <div className="text-[10px] text-orange-600 font-medium mt-1">Needs Review</div>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-slate-600">
                                        <span className="font-bold">₹{vendor.balance?.current || 0}</span> <span className="text-xs text-slate-400">Balance</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end items-center gap-2">
                                        <button 
                                            onClick={() => setViewingVendor(vendor)}
                                            className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-md transition-colors"
                                            title="View Details"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => setEditingVendor(vendor)}
                                            className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-md transition-colors"
                                            title="Edit Vendor"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <div className="h-4 w-px bg-slate-200 mx-1"></div>
                                        {vendor.isApproved ? (
                                            <button 
                                                onClick={() => handleRestrict(vendor._id)}
                                                className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors text-xs font-semibold"
                                            >
                                                Restrict
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleApprove(vendor._id)}
                                                className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-md transition-colors text-xs font-semibold"
                                            >
                                                Approve
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
          </div>
      </div>
    </div>
  );
};

export default VendorManagement;
