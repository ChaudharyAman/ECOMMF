import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, Layers, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const CategoryModal = ({ category, onClose, onSave, categories = [] }) => {
    const [formData, setFormData] = useState({
        name: '',
        parent: '',
        image: '',
        isActive: true,
        isFeatured: false,
        isOccasion: false
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                parent: category.parent?._id || category.parent || '',
                image: category.image || '',
                isActive: category.isActive !== undefined ? category.isActive : true,
                isFeatured: category.isFeatured !== undefined ? category.isFeatured : false,
                isOccasion: category.isOccasion !== undefined ? category.isOccasion : false,
                isPromo: category.isPromo !== undefined ? category.isPromo : false
            });
        }
    }, [category]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Convert empty string parent to null for backend
            const submissionData = {
                ...formData,
                parent: formData.parent === '' ? null : formData.parent
            };
            await onSave(submissionData);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save category');
            toast.error('Failed to save category');
        } finally {
            setSaving(false);
        }
    };

    // Filter out the category itself from parent options (to avoid circular dependency)
    const parentOptions = categories.filter(c => !category || c._id !== category._id);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                    <div>
                        <h3 className="text-lg font-bold text-stone-800">
                            {category ? 'Edit Category' : 'Add New Category'}
                        </h3>
                        <p className="text-xs text-stone-500">Organize your products effectively.</p>
                    </div>
                    <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-2 rounded-full hover:bg-stone-200 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-red-900 mb-1">Error</h4>
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form id="category-form" onSubmit={handleSubmit} className="p-6 space-y-6">

                    <div>
                        <label className="text-xs font-semibold text-stone-500 uppercase mb-1 block">Category Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Layers className="h-4 w-4 text-stone-400" />
                            </div>
                            <input
                                required
                                name="name"
                                type="text"
                                placeholder="e.g. Electronics, Gift Cards"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full pl-10 pr-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-stone-800 outline-none transition-shadow text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-stone-500 uppercase mb-1 block">Parent Category (Optional)</label>
                        <select
                            name="parent"
                            value={formData.parent}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-stone-800 outline-none transition-shadow text-sm bg-white"
                        >
                            <option value="">None (Top Level)</option>
                            {parentOptions.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-stone-500 uppercase mb-1 block">Image URL</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <ImageIcon className="h-4 w-4 text-stone-400" />
                            </div>
                            <input
                                name="image"
                                type="url"
                                placeholder="https://example.com/image.jpg"
                                value={formData.image}
                                onChange={handleChange}
                                className="w-full pl-10 pr-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-stone-800 outline-none transition-shadow text-sm"
                            />
                        </div>
                        {formData.image && (
                            <div className="mt-2 text-center">
                                <img src={formData.image} alt="Preview" className="h-20 mx-auto rounded-lg object-cover border border-stone-200" />
                            </div>
                        )}
                    </div>

                    {formData.isPromo && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="text-xs font-bold text-pink-600 uppercase mb-1 flex items-center gap-1">
                                <ImageIcon className="w-3 h-3" /> Spotlight Banner Image URL (Optional)
                            </label>
                            <div className="relative">
                                <input
                                    name="promoImage"
                                    type="url"
                                    placeholder="High-res wide banner URL"
                                    value={formData.promoImage || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-shadow text-sm"
                                />
                            </div>
                            {formData.promoImage && (
                                <div className="mt-2 text-center">
                                    <img src={formData.promoImage} alt="Promo Preview" className="h-20 w-fit mx-auto rounded-lg object-cover border border-pink-200 shadow-sm" />
                                </div>
                            )}
                            <p className="text-[10px] text-stone-400 mt-1">Recommended aspect ratio 4:3 or wider. This will be shown natively as the homepage banner.</p>
                        </div>
                    )}

                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="w-4 h-4 text-stone-800 rounded focus:ring-stone-800 border-gray-300"
                            />
                            <span className="text-sm font-medium text-stone-700">Active</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="isFeatured"
                                checked={formData.isFeatured}
                                onChange={handleChange}
                                className="w-4 h-4 text-stone-800 rounded focus:ring-stone-800 border-gray-300"
                            />
                            <span className="text-sm font-medium text-stone-700">Explore Collection</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="isOccasion"
                                checked={formData.isOccasion}
                                onChange={handleChange}
                                className="w-4 h-4 text-stone-800 rounded focus:ring-stone-800 border-gray-300"
                            />
                            <span className="text-sm font-medium text-stone-700">Shop By Occasion</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="isPromo"
                                checked={formData.isPromo}
                                onChange={handleChange}
                                className="w-4 h-4 text-stone-800 rounded focus:ring-stone-800 border-gray-300"
                            />
                            <span className="text-sm font-medium text-stone-700">Promote on Homepage</span>
                        </label>
                    </div>

                </form>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-stone-100 bg-stone-50 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-stone-600 font-medium hover:bg-stone-200 rounded-lg transition-colors text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="category-form"
                        disabled={saving}
                        className="px-6 py-2.5 bg-stone-900 text-white font-bold rounded-lg hover:bg-stone-700 shadow-md shadow-stone-200 flex items-center gap-2 transform active:scale-95 transition-all text-sm"
                    >
                        {saving ? 'Saving...' : (
                            <>
                                <Save className="w-4 h-4" /> Save Category
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CategoryModal;
