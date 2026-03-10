import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, Layers, Image as ImageIcon, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const CategoryModal = ({ category, onClose, onSave, categories = [] }) => {
    const [formData, setFormData] = useState({
        name: '',
        parent: '',
        image: '',
        promoImage: '',
        isActive: true,
        isFeatured: false,
        isOccasion: false,
        isPromo: false
    });
    const [selectedFiles, setSelectedFiles] = useState({
        image: null,
        promoImage: null
    });
    const [previews, setPreviews] = useState({
        image: null,
        promoImage: null
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                parent: category.parent?._id || category.parent || '',
                image: category.image || '',
                promoImage: category.promoImage || '',
                isActive: category.isActive !== undefined ? category.isActive : true,
                isFeatured: category.isFeatured !== undefined ? category.isFeatured : false,
                isOccasion: category.isOccasion !== undefined ? category.isOccasion : false,
                isPromo: category.isPromo !== undefined ? category.isPromo : false
            });
            setPreviews({ image: null, promoImage: null });
            setSelectedFiles({ image: null, promoImage: null });
        }
    }, [category]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
        if (error) setError('');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const name = e.target.name; // 'image' or 'promoImage'
            setSelectedFiles(prev => ({ ...prev, [name]: file }));
            setPreviews(prev => ({ ...prev, [name]: URL.createObjectURL(file) }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            let submissionData;

            // If any files are selected, use FormData
            if (selectedFiles.image || selectedFiles.promoImage) {
                submissionData = new FormData();
                submissionData.append('name', formData.name);
                submissionData.append('parent', (formData.parent === '' || formData.parent === null) ? 'null' : formData.parent);
                submissionData.append('image', formData.image);
                submissionData.append('promoImage', formData.promoImage);
                submissionData.append('isActive', formData.isActive);
                submissionData.append('isFeatured', formData.isFeatured);
                submissionData.append('isOccasion', formData.isOccasion);
                submissionData.append('isPromo', formData.isPromo);

                if (selectedFiles.image) {
                    submissionData.append('imageFile', selectedFiles.image);
                }
                if (selectedFiles.promoImage) {
                    submissionData.append('promoImageFile', selectedFiles.promoImage);
                }
            } else {
                // Otherwise use plain object as before
                submissionData = {
                    ...formData,
                    parent: formData.parent === '' ? null : formData.parent
                };
            }

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
                <form id="category-form" onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">

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
                        <label className="text-xs font-semibold text-stone-500 uppercase mb-1 block">Category Image</label>
                        <div className="space-y-3">
                            {/* URL Input */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <ImageIcon className="h-4 w-4 text-stone-400" />
                                </div>
                                <input
                                    name="image"
                                    type="url"
                                    placeholder="Image URL (optional)"
                                    value={formData.image}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-stone-800 outline-none transition-shadow text-sm"
                                />
                            </div>

                            {/* File Upload */}
                            <div className="flex items-center gap-3">
                                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-stone-200 rounded-lg hover:border-stone-400 cursor-pointer transition-colors text-stone-500 hover:text-stone-700">
                                    <Upload className="w-4 h-4" />
                                    <span className="text-xs font-semibold">{selectedFiles.image ? selectedFiles.image.name : 'Upload Category Image'}</span>
                                    <input
                                        type="file"
                                        name="image"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </div>

                            {(previews.image || formData.image) && (
                                <div className="mt-2 text-center relative group">
                                    <img 
                                        src={previews.image || formData.image} 
                                        alt="Preview" 
                                        className="h-20 mx-auto rounded-lg object-cover border border-stone-100 shadow-sm" 
                                    />
                                    <p className="text-[10px] text-stone-400 mt-1 font-medium">{previews.image ? 'New upload preview' : 'Current image'}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {formData.isPromo && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300 p-4 bg-pink-50/50 rounded-xl border border-pink-100">
                            <label className="text-xs font-bold text-pink-600 uppercase mb-2 flex items-center gap-1">
                                <ImageIcon className="w-3 h-3" /> Spotlight Banner Image
                            </label>
                            
                            <div className="space-y-3">
                                {/* URL Input */}
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

                                {/* File Upload */}
                                <div className="flex items-center gap-3">
                                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-pink-200 rounded-lg hover:border-pink-400 cursor-pointer transition-colors text-pink-500 hover:text-pink-700 bg-white">
                                        <Upload className="w-4 h-4" />
                                        <span className="text-xs font-semibold">{selectedFiles.promoImage ? selectedFiles.promoImage.name : 'Upload Banner Image'}</span>
                                        <input
                                            type="file"
                                            name="promoImage"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                </div>

                                {(previews.promoImage || formData.promoImage) && (
                                    <div className="mt-2 text-center relative group">
                                        <img 
                                            src={previews.promoImage || formData.promoImage} 
                                            alt="Promo Preview" 
                                            className="h-28 w-full mx-auto rounded-xl object-cover border-2 border-pink-200 shadow-sm" 
                                        />
                                        <div className="absolute top-2 right-2 bg-pink-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg">Preview</div>
                                    </div>
                                )}
                            </div>
                            <p className="text-[10px] text-stone-400 mt-2">Recommended aspect ratio 4:3 or wider. This will be shown natively as the homepage banner.</p>
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
