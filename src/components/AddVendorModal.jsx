import React, { useState } from 'react';
import { Save, X, User, Store, CreditCard, MapPin, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const AddVendorModal = ({ onSave, onClose }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', password: '', 
        storeName: '', commissionRate: 0,
        address: { street: '', city: '', state: '', zip: '' },
        bankDetails: { accountName: '', accountNumber: '', bankName: '', ifscCode: '' }
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e, section = null) => {
        // Clear error when user starts typing
        if (error) setError('');
        
        if (section) {
            setFormData({ ...formData, [section]: { ...formData[section], [e.target.name]: e.target.value } });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        setSaving(true);
        try {
            await onSave(formData);
            toast.success('Vendor created successfully!');
            onClose();
        } catch (err) {
            // Display error in modal instead of closing
            const errorMessage = err.response?.data?.message || 'Failed to create vendor';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Onboard New Vendor</h3>
                        <p className="text-xs text-slate-500">Create account and store profile.</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-red-900 mb-1">Unable to Create Vendor</h4>
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                        <button 
                            onClick={() => setError('')}
                            className="text-red-400 hover:text-red-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Form Body - Scrollable */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <form id="add-vendor-form" onSubmit={handleSubmit} className="space-y-8">
                        
                        {/* 1. Account Info */}
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-indigo-100 transition-colors">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <User className="w-16 h-16 text-indigo-500" />
                            </div>
                            <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="bg-indigo-100 text-indigo-600 w-6 h-6 rounded flex items-center justify-center text-xs font-bold">1</span>
                                Account Details
                            </h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Full Name</label>
                                    <input required name="name" type="text" placeholder="John Doe" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow text-sm" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Phone Number</label>
                                    <input required name="phone" type="tel" placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow text-sm" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Email Address</label>
                                    <input required name="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow text-sm" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Default Password</label>
                                    <input required name="password" type="password" placeholder="Min 6 characters" value={formData.password} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow text-sm" />
                                </div>
                            </div>
                        </div>

                        {/* 2. Store Info */}
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-emerald-100 transition-colors">
                             <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Store className="w-16 h-16 text-emerald-500" />
                            </div>
                            <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded flex items-center justify-center text-xs font-bold">2</span>
                                Business Profile
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Store Name</label>
                                    <input required name="storeName" type="text" placeholder="SuperMart Inc." value={formData.storeName} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow text-sm" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Commission Rate (%)</label>
                                    <input required name="commissionRate" type="number" min="0" max="100" placeholder="0" value={formData.commissionRate} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow text-sm" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Business Address</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input required name="street" type="text" placeholder="Street Address" value={formData.address.street} onChange={e => handleChange(e, 'address')} className="col-span-2 w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                                        <input required name="city" type="text" placeholder="City" value={formData.address.city} onChange={e => handleChange(e, 'address')} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                                        <input required name="state" type="text" placeholder="State" value={formData.address.state} onChange={e => handleChange(e, 'address')} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                                        <input required name="zip" type="text" placeholder="Zip Code" value={formData.address.zip} onChange={e => handleChange(e, 'address')} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Bank Details */}
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-blue-100 transition-colors">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <CreditCard className="w-16 h-16 text-blue-500" />
                            </div>
                            <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded flex items-center justify-center text-xs font-bold">3</span>
                                Banking Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Account Holder</label>
                                    <input required name="accountName" type="text" placeholder="Name on Passbook" value={formData.bankDetails.accountName} onChange={e => handleChange(e, 'bankDetails')} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow text-sm" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Bank Name</label>
                                    <input required name="bankName" type="text" placeholder="HDFC, SBI, etc." value={formData.bankDetails.bankName} onChange={e => handleChange(e, 'bankDetails')} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow text-sm" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Account Number</label>
                                    <input required name="accountNumber" type="text" placeholder="0000 0000 0000" value={formData.bankDetails.accountNumber} onChange={e => handleChange(e, 'bankDetails')} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow text-sm font-mono" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">IFSC Code</label>
                                    <input required name="ifscCode" type="text" placeholder="HDFC0001234" value={formData.bankDetails.ifscCode} onChange={e => handleChange(e, 'bankDetails')} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow text-sm font-mono uppercase" />
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 z-20">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        form="add-vendor-form"
                        disabled={saving}
                        className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-200 flex items-center gap-2 transform active:scale-95 transition-all"
                    >
                        {saving ? (
                            <>Creating Vendor...</>
                        ) : (
                            <>
                                <Save className="w-4 h-4" /> Create Vendor Account
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AddVendorModal;
