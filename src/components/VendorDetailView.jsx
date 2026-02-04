import React from 'react';
import { Store, User, CreditCard, FileText, CheckCircle, ShieldAlert, XCircle, MapPin, Mail, Calendar } from 'lucide-react';

const VendorDetailView = ({ vendor, actions, onClose }) => {
    
    if (!vendor) return null;

    const getKycStatusBadge = (status) => {
        switch(status) {
            case 'approved': return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Verified</span>;
            case 'rejected': return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 flex items-center gap-1"><XCircle className="w-3 h-3"/> Rejected</span>;
            case 'pending': return <span className="px-2 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 flex items-center gap-1"><ShieldAlert className="w-3 h-3"/> Pending Review</span>;
            default: return <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">Not Submitted</span>;
        }
    };

    return (
        <div className="bg-slate-50 relative">
            {/* Header */}
            <div className="bg-white px-8 py-6 border-b border-slate-200 flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                        <Store className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{vendor.storeName}</h2>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                             <span className="flex items-center gap-1"><User className="w-3 h-3" /> {vendor.user?.name || 'Unknown User'}</span>
                             <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                             <span className="font-mono">ID: {vendor._id}</span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                    <span className="text-2xl leading-none">&times;</span>
                </button>
            </div>

            {/* Content Grid */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* 1. Contact Information */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Contact Details
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">Email Address</label>
                            <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                                <Mail className="w-3 h-3 text-slate-400" /> {vendor.user?.email || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">Business Address</label>
                            <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                {vendor.address ? (
                                    <>
                                        <p>{vendor.address.street}</p>
                                        <p>{vendor.address.city}, {vendor.address.state} {vendor.address.zip}</p>
                                    </>
                                ) : <span className="italic text-slate-400">No address provided</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Business & Financials */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" /> Business Info
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-indigo-50 p-3 rounded-lg text-center">
                                <span className="block text-xs text-indigo-600 font-bold mb-1">Commission</span>
                                <span className="text-xl font-bold text-indigo-900">{vendor.commissionRate}%</span>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg text-center">
                                <span className="block text-xs text-green-600 font-bold mb-1">Available Balance</span>
                                <span className="text-xl font-bold text-green-900">₹{vendor.balance?.current || 0}</span>
                            </div>
                        </div>
                        
                        <div className="border-t border-slate-100 pt-4">
                            <label className="text-xs text-slate-500 block mb-2">Bank Account Details</label>
                            {vendor.bankDetails ? (
                                <div className="text-sm space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Bank:</span>
                                        <span className="font-medium">{vendor.bankDetails.bankName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Account:</span>
                                        <span className="font-medium font-mono">****{vendor.bankDetails.accountNumber?.slice(-4)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">IFSC:</span>
                                        <span className="font-medium font-mono">{vendor.bankDetails.ifscCode}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Holder:</span>
                                        <span className="font-medium">{vendor.bankDetails.accountName}</span>
                                    </div>
                                </div>
                            ) : <span className="text-sm italic text-slate-400">No bank details added.</span>}
                        </div>
                    </div>
                </div>

                {/* 3. KYC & Documents */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <FileText className="w-4 h-4" /> KYC Compliance
                        </h3>
                        {getKycStatusBadge(vendor.kycStatus)}
                    </div>

                    <div className="space-y-3">
                         {vendor.kycDocuments && vendor.kycDocuments.length > 0 ? (
                             vendor.kycDocuments.map((doc, idx) => (
                                 <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer group">
                                     <div className="flex items-center gap-3">
                                         <div className="bg-white p-2 rounded shadow-sm">
                                             <FileText className="w-4 h-4 text-indigo-500" />
                                         </div>
                                         <div>
                                             <p className="text-sm font-medium text-slate-800">{doc.docType}</p>
                                             <p className="text-xs text-slate-500 uppercase">{doc.status}</p>
                                         </div>
                                     </div>
                                     {doc.url && (
                                         <a 
                                            href={doc.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-xs bg-white border border-slate-200 px-2 py-1 rounded text-slate-600 hover:text-indigo-600 hover:border-indigo-300"
                                         >
                                             View
                                         </a>
                                     )}
                                 </div>
                             ))
                         ) : (
                             <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                 No Documents Submitted
                             </div>
                         )}
                    </div>
                    
                    {/* Timestamp */}
                    <div className="mt-6 flex items-center gap-2 text-xs text-slate-400 justify-center">
                        <Calendar className="w-3 h-3" /> Joined: {new Date(vendor.createdAt).toLocaleDateString()}
                    </div>
                </div>
            </div>

            {/* Actions Footer */}
            {actions && (
                <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0">
                    {actions}
                </div>
            )}
        </div>
    );
};

export default VendorDetailView;
