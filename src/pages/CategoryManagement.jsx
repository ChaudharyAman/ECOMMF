import React, { useEffect, useState, useCallback } from 'react';
import { fetchCategories, updateCategory } from '../api/adminApi';
import { Star, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProductSelectionModal = ({ isOpen, onClose, onSelect, currentProduct }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedId, setSelectedId] = useState(currentProduct?._id || null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchTerm.trim()) {
                setLoading(true);
                try {
                    // Assuming fetchAllProducts can take a keyword param
                    // You might need to adjust the API function if it expects different params
                    // Based on analysis, fetchAllProducts takes params object
                    const result = await import('../api/adminApi').then(mod => mod.fetchAllProducts({ keyword: searchTerm }));
                    setProducts(result.products || []);
                } catch (error) {
                    console.error("Search failed", error);
                    toast.error("Failed to search products");
                } finally {
                    setLoading(false);
                }
            } else {
                setProducts([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-900">Select Featured Product</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <span className="sr-only">Close</span>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="p-6 space-y-4 flex-1 overflow-hidden flex flex-col">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search product by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700 placeholder-slate-400"
                            autoFocus
                        />
                         <svg className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-[300px] space-y-2 pr-2 custom-scrollbar">
                        {loading ? (
                             <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-1 gap-2">
                                {products.map(product => (
                                    <div 
                                        key={product._id}
                                        onClick={() => {
                                            setSelectedId(product._id);
                                            onSelect(product);
                                        }}
                                        className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                                            selectedId === product._id 
                                                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                                                : 'border-slate-100 bg-white hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                                            {product.images?.[0]?.url ? (
                                                <img 
                                                    src={product.images[0].url} 
                                                    alt="" 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 text-sm">{product.name}</h4>
                                            <p className="text-xs text-slate-500 font-medium">{product.category?.name || 'Uncategorized'} • ₹{product.price}</p>
                                        </div>
                                        {selectedId === product._id && (
                                            <div className="ml-auto text-blue-600">
                                                <svg className="w-5 h-5 flex-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : searchTerm ? (
                            <div className="text-center py-12 text-slate-400">
                                <p>No products found matching "{searchTerm}"</p>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-400">
                                <p>Type to search products...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState(null);

    const loadCategories = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchCategories();
            setCategories(data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const handleToggleFeatured = useCallback(async (category) => {
        try {
            setUpdatingId(category._id);
            const newStatus = !category.isFeatured;
            
            // Optimistic update
            setCategories(prev => prev.map(cat => 
                cat._id === category._id 
                    ? { ...cat, isFeatured: newStatus }
                    : cat
            ));
            
            await updateCategory(category._id, { isFeatured: newStatus });
            toast.success(newStatus ? 'Category Featured!' : 'Category Un-featured');
        } catch (err) {
            console.error(err);
            toast.error("Failed to update feature status");
            // Revert on error
            loadCategories();
        } finally {
            setUpdatingId(null);
        }
    }, [loadCategories]);

    const handleProductSelect = async (product) => {
        if (!activeCategory) return;
        
        try {
            setUpdatingId(activeCategory._id);
            setModalOpen(false);
            
            await updateCategory(activeCategory._id, { featuredProduct: product._id });
            
            // Update local state
            setCategories(prev => prev.map(cat => 
                cat._id === activeCategory._id 
                    ? { ...cat, featuredProduct: product._id } // In a real app we might want the full object but for now ID is fine or we reload
                    : cat
            ));
            
            toast.success(`Featured product set to ${product.name}`);
            loadCategories(); // Reload to get full populated data if needed
        } catch (err) {
            console.error(err);
            toast.error("Failed to set featured product");
        } finally {
            setUpdatingId(null);
            setActiveCategory(null);
        }
    };

    const openProductModal = (category) => {
        setActiveCategory(category);
        setModalOpen(true);
    };

    const handleToggleVisibility = useCallback(async (category) => {
        try {
            setUpdatingId(category._id);
            const newStatus = !category.isActive;
            
            // Optimistic update
            setCategories(prev => prev.map(cat => 
                cat._id === category._id 
                    ? { ...cat, isActive: newStatus }
                    : cat
            ));
            
            await updateCategory(category._id, { isActive: newStatus });
            toast.success(newStatus ? 'Category is now Visible' : 'Category is now Hidden');
        } catch (err) {
            console.error(err);
            toast.error("Failed to update visibility");
            // Revert on error
            loadCategories();
        } finally {
            setUpdatingId(null);
        }
    }, [loadCategories]);


    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <ProductSelectionModal 
                isOpen={modalOpen} 
                onClose={() => setModalOpen(false)}
                onSelect={handleProductSelect}
                currentProduct={activeCategory?.featuredProduct}
            />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Category Management</h1>
                    <p className="text-slate-500 mt-1">Manage category visibility and featured status for the homepage.</p>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto" />
                </div>
            ) : categories.length === 0 ? (
                <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-100 text-center">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No Categories Found</h3>
                    <p className="text-slate-500">Create categories to get started.</p>
                </div>
            ) : (
                <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Slug</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {categories.map((category) => (
                                <tr key={category._id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="text-sm font-bold text-slate-900">{category.name}</div>
                                            {category.isFeatured && (
                                                <span className="bg-amber-100 text-amber-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-amber-200">Featured</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-600">{category.slug}</div>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                                category.isActive ? 'bg-green-400' : 'bg-gray-400'
                                            }`}></span>
                                            {category.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2">
                                             {/* Featured Product Selection */}
                                             {category.isFeatured && (
                                                <button
                                                    onClick={() => openProductModal(category)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                                                    title="Select Featured Product Image"
                                                >
                                                    <div className="w-4 h-4 rounded overflow-hidden bg-slate-300 flex-shrink-0">
                                                        {/* We need to populate featuredProduct to show the image here effectively, relying on loadCategories to be updated elsewhere potentially or just using ID logic if we don't have populate yet */}
                                                        {/* Assuming category.featuredProduct might be an object if populated, or ID if not. */}
                                                        {/* Just a placeholder icon for now unless we know it's populated */}
                                                        <svg className="w-full h-full text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <span>Set Image</span>
                                                </button>
                                            )}

                                            <div className="h-4 w-px bg-slate-200 mx-2"></div>

                                            {/* Visibility Toggle */}
                                            <button
                                                onClick={() => handleToggleVisibility(category)}
                                                disabled={updatingId === category._id}
                                                className={`p-2 rounded-full transition-colors ${
                                                    category.isActive 
                                                        ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                                                        : 'text-slate-400 bg-slate-100 hover:bg-slate-200 hover:text-slate-600'
                                                } ${updatingId === category._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                title={category.isActive ? "Hide Category" : "Show Category"}
                                            >
                                                {updatingId === category._id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : category.isActive ? (
                                                    <Eye className="w-4 h-4" />
                                                ) : (
                                                    <EyeOff className="w-4 h-4" />
                                                )}
                                            </button>

                                            {/* Featured Toggle */}
                                            <button
                                                onClick={() => handleToggleFeatured(category)}
                                                disabled={updatingId === category._id}
                                                className={`p-2 rounded-full transition-colors ${
                                                    category.isFeatured 
                                                        ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' 
                                                        : 'text-slate-300 hover:text-amber-500 hover:bg-amber-50'
                                                } ${updatingId === category._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                title={category.isFeatured ? "Remove from Featured" : "Mark as Featured"}
                                            >
                                                {updatingId === category._id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Star className={`w-4 h-4 ${category.isFeatured ? 'fill-current' : ''}`} />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CategoryManagement;
