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

    const [expandedCategories, setExpandedCategories] = useState({});

    const toggleExpand = (id) => {
        setExpandedCategories(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleOpenAdd = (parentId = null) => {
        setEditingCategory({ parent: parentId }); // Pass parent as partial object to pre-fill
        setShowModal(true);
    };

    const handleOpenEdit = (category) => {
        setEditingCategory(category);
        setShowModal(true);
    };

    const handleSave = async (formData) => {
        if (editingCategory && editingCategory._id) {
            await updateCategory(editingCategory._id, formData);
            toast.success('Category updated successfully');
        } else {
            await createCategory(formData);
            toast.success('Category created successfully');
        }
        loadCategories();
    };

    // Filter and Group
    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Note: If search term exists, we might want to show flat list or expand all. 
    // For now, let's keep hierarchy if possible, or flat if searching.
    const isSearching = searchTerm.length > 0;

    const primaryCategories = filteredCategories.filter(c => !c.parent);

    // Helper to get subs from the MAIN list (to ensure we have all subs even if parent is filtered out? 
    // No, if parent is filtered out, we usually show flattened results or nothing. 
    // Let's stick to: If searching, show flat list. If not, show hierarchy.)

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
                    <p className="text-stone-500 mt-1">Manage Primary and Sub-categories.</p>
                </div>
                <button
                    onClick={() => handleOpenAdd(null)}
                    className="bg-stone-900 text-white px-5 py-2.5 rounded-full font-medium shadow-lg shadow-stone-200 hover:bg-stone-700 transition-all active:scale-95 flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" /> Add Primary Category
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden min-h-[400px]">

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

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-12 text-stone-400">Loading hierarchy...</div>
                    ) : isSearching ? (
                        // Flat List for Search Results
                        <div className="grid grid-cols-1 gap-4">
                            {filteredCategories.map(cat => (
                                <div key={cat._id} className="flex items-center justify-between p-4 border border-stone-100 rounded-xl bg-stone-50">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-400 overflow-hidden shrink-0">
                                            {cat.image ? <img src={cat.image} className="w-full h-full object-cover" /> : <Layers className="w-5 h-5 opacity-50" />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-stone-800">{cat.name}</div>
                                            <div className="text-xs text-stone-500">
                                                {cat.parent ? `Sub-category of ${cat.parent.name}` : 'Primary Category'}
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => handleOpenEdit(cat)} className="text-stone-400 hover:text-stone-900 p-2"><Pencil className="w-4 h-4" /></button>
                                </div>
                            ))}
                            {filteredCategories.length === 0 && <div className="text-center text-stone-400">No matches found.</div>}
                        </div>
                    ) : (
                        // Hierarchical View
                        <div className="space-y-4">
                            {primaryCategories.length === 0 ? (
                                <div className="text-center py-12 text-stone-400">No categories found. Add a Primary Category to start.</div>
                            ) : (
                                primaryCategories.map(primary => {
                                    const isExpanded = expandedCategories[primary._id];
                                    const subCategories = categories.filter(c => c.parent && (c.parent._id === primary._id || c.parent === primary._id));

                                    return (
                                        <div key={primary._id} className="border border-stone-200 rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md">
                                            {/* Primary Header */}
                                            <div className="bg-stone-50 p-4 flex items-center justify-between group">
                                                <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleExpand(primary._id)}>
                                                    <button className={`text-stone-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                                                        <ChevronRight className="w-5 h-5" />
                                                    </button>
                                                    <div className="h-12 w-12 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-300 overflow-hidden shrink-0">
                                                        {primary.image ? <img src={primary.image} className="w-full h-full object-cover" /> : <Layers className="w-6 h-6 opacity-40" />}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg text-stone-900">{primary.name}</h3>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-xs font-semibold px-2 py-0.5 bg-stone-200 text-stone-600 rounded-full">{subCategories.length} Sub-categories</span>
                                                            {primary.isFeatured && <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center" title="Explore Collection"><CheckCircle className="w-3 h-3 mr-1" /> Explore</span>}
                                                            {primary.isOccasion && <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full flex items-center" title="Shop By Occasion"><CheckCircle className="w-3 h-3 mr-1" /> Occasion</span>}
                                                            {primary.isPromo && <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full flex items-center" title="Promoted on Homepage"><CheckCircle className="w-3 h-3 mr-1" /> Promo</span>}
                                                            {!primary.isActive && <span className="text-xs font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">Inactive</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleOpenAdd(primary._id)}
                                                        className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center transition-colors"
                                                    >
                                                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Sub
                                                    </button>
                                                    <button onClick={() => handleOpenEdit(primary)} className="text-stone-400 hover:text-stone-900 p-2 hover:bg-stone-200 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                                                </div>
                                            </div>

                                            {/* Sub Categories List */}
                                            {isExpanded && (
                                                <div className="bg-white border-t border-stone-100 divide-y divide-stone-50">
                                                    {subCategories.length === 0 ? (
                                                        <div className="p-8 text-center text-stone-400 text-sm">
                                                            No sub-categories yet. <button onClick={() => handleOpenAdd(primary._id)} className="text-indigo-600 font-semibold hover:underline">Add one</button>
                                                        </div>
                                                    ) : (
                                                        subCategories.map(sub => (
                                                            <div key={sub._id} className="p-3 pl-16 pr-4 flex items-center justify-between hover:bg-stone-50 transition-colors group/sub">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-8 w-8 rounded bg-stone-100 flex items-center justify-center text-stone-300 overflow-hidden shrink-0">
                                                                        {sub.image ? <img src={sub.image} className="w-full h-full object-cover" /> : <Layers className="w-4 h-4 opacity-40" />}
                                                                    </div>
                                                                    <span className="text-sm font-medium text-stone-700">{sub.name}</span>
                                                                    {sub.isFeatured && <CheckCircle className="w-3 h-3 text-amber-500" title="Explore Collection" />}
                                                                    {sub.isOccasion && <CheckCircle className="w-3 h-3 text-purple-500" title="Shop By Occasion" />}
                                                                    {sub.isPromo && <CheckCircle className="w-3 h-3 text-pink-500" title="Promoted on Homepage" />}
                                                                    {!sub.isActive && <span className="text-[10px] text-stone-400 border border-stone-200 px-1 rounded">Hidden</span>}
                                                                </div>
                                                                <button
                                                                    onClick={() => handleOpenEdit(sub)}
                                                                    className="text-stone-300 hover:text-stone-800 p-1.5 rounded hover:bg-stone-200 transition-colors opacity-0 group-hover/sub:opacity-100"
                                                                >
                                                                    <Pencil className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryManagement