import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Search, Layers, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { fetchCategories, createCategory, updateCategory } from '../api/adminApi';
import CategoryModal from '../components/CategoryModal';
import toast from 'react-hot-toast';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const data = await fetchCategories();
            setCategories(data);
        } catch (err) {
            toast.error('Failed to load categories');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleOpenAdd = () => {
        setEditingCategory(null);
        setShowModal(true);
    };

    const handleOpenEdit = (category) => {
        setEditingCategory(category);
        setShowModal(true);
    };

    const handleSave = async (formData) => {
        if (editingCategory) {
            await updateCategory(editingCategory._id, formData);
            toast.success('Category updated successfully');
        } else {
            await createCategory(formData);
            toast.success('Category created successfully');
        }
        loadCategories();
    };

    const filteredCategories = categories.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            
            {showModal && (
                <CategoryModal 
                    category={editingCategory} 
                    categories={categories}
                    onClose={() => setShowModal(false)} 
                    onSave={handleSave} 
                />
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Category Management</h1>
                    <p className="text-stone-500 mt-1">Create and organize product categories.</p>
                </div>
                <button 
                    onClick={handleOpenAdd}
                    className="bg-stone-900 text-white px-5 py-2.5 rounded-full font-medium shadow-lg shadow-stone-200 hover:bg-stone-700 transition-all active:scale-95 flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" /> Add Category
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                
                {/* Toolbar */}
                <div className="p-4 border-b border-stone-100 flex items-center gap-4 bg-stone-50/50">
                    <div className="relative flex-1 max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-stone-400" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search categories..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white block w-full pl-10 pr-3 py-2 border border-stone-200 rounded-lg sm:text-sm focus:ring-2 focus:ring-stone-800 outline-none"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-stone-100">
                        <thead className="bg-stone-50 text-stone-500">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Slug</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Parent Category</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Featured</th>
                                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-stone-100">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-stone-400">Loading categories...</td></tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-stone-400">No categories found.</td></tr>
                            ) : (
                                filteredCategories.map((category) => (
                                    <tr key={category._id} className="hover:bg-stone-50/60 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 overflow-hidden border border-stone-100 shrink-0">
                                                    {category.image ? (
                                                        <img src={category.image} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Layers className="w-5 h-5 opacity-50" />
                                                    )}
                                                </div>
                                                <span className="font-semibold text-stone-800">{category.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500 font-mono">
                                            {category.slug}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                                            {category.parent ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                                                    {category.parent.name}
                                                </span>
                                            ) : (
                                                <span className="text-stone-400 text-xs italic">Top Level</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {category.isActive ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">Active</span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-500 border border-stone-200">Inactive</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {category.isFeatured ? (
                                                <span className="flex items-center text-amber-500 font-medium text-xs"><CheckCircle className="w-3.5 h-3.5 mr-1" /> Yes</span>
                                            ) : (
                                                <span className="text-stone-300 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button 
                                                onClick={() => handleOpenEdit(category)}
                                                className="text-stone-400 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 p-2 rounded-lg transition-all"
                                                title="Edit Category"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
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

export default CategoryManagement