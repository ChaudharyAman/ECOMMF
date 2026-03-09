import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories } from '../features/products/productSlice';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, SlidersHorizontal, Grid3x3, LayoutGrid, ChevronDown, List, LayoutList } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const CategoryProducts = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { products, categories, loading } = useSelector((state) => state.products);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [displayProducts, setDisplayProducts] = useState([]); // Products currently shown (after local sub-cat filter)
    const [categoryName, setCategoryName] = useState('');
    const [categoryDescription, setCategoryDescription] = useState('');
    const [subCategories, setSubCategories] = useState([]);
    const [selectedSubCat, setSelectedSubCat] = useState('all');

    // Filters and sorting
    const [sortBy, setSortBy] = useState('newest');
    const [priceRange, setPriceRange] = useState('all');
    const [viewMode, setViewMode] = useState('grid-3');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        // Reset local state whenever category changes to avoid stale display
        setFilteredProducts([]);
        setSelectedSubCat('all');
        setPriceRange('all');
        dispatch(fetchProducts({ category: id, limit: 1000 }));

        if (categories.length === 0) dispatch(fetchCategories());
    }, [dispatch, id]);

    useEffect(() => {
        // 1. Identify current category
        const currentCategory = categories.find(c => c._id === id);
        if (!currentCategory) return;

        setCategoryName(currentCategory.name);
        setCategoryDescription(currentCategory.description || `Discover our exclusive ${currentCategory.name} collection.`);

        // 2. Identify relationship (Primary or Sub)
        let relevantCategoryIds = [id];
        let subs = [];

        if (!currentCategory.parent) {
            // It's a Primary Category -> Get all its sub-categories
            subs = categories.filter(c => c.parent === id || c.parent?._id === id);
            relevantCategoryIds = [String(id), ...subs.map(s => String(s._id))];
            setSubCategories(subs);
        } else {
            // It's a Sub-category -> Show siblings? Or just itself? 
            // User asked: "top option to select the subcategory". 
            // Usually implies viewing Primary allows filtering by Sub. 
            // If viewing Sub, maybe show siblings filter?
            // Let's implement: If Primary, show Subs filter. If Sub, show siblings (all subs of same parent).

            const parentId = currentCategory.parent._id || currentCategory.parent;
            subs = categories.filter(c => c.parent === parentId || c.parent?._id === parentId);
            relevantCategoryIds = [id]; // Initially just show this sub's products

            // Actually, if we want the user to be able to switch subs easily, we should probably 
            // redirect to the Primary view with this sub selected, OR just load all siblings' data 
            // but pre-select this sub.
            // Let's try loading all siblings + parent to allow easy switching.
            relevantCategoryIds = [String(parentId), ...subs.map(s => String(s._id))];
            setSubCategories(subs);
            setSelectedSubCat(id); // Pre-select current
        }

        // 3. Stringify all IDs to avoid ObjectId reference equality issues with Set.has()
        const validCategoryIds = new Set(relevantCategoryIds.map(String));
        const filtered = products.filter(p => {
            const pCatId = String(p.category?._id || p.category || '');
            return validCategoryIds.has(pCatId);
        });
        setFilteredProducts(filtered);

    }, [id, products, categories]);

    // Apply Sub-Cat Filter, Price, Sort
    useEffect(() => {
        let result = [...filteredProducts];

        // Sub-category Filter
        if (selectedSubCat !== 'all') {
            result = result.filter(p => {
                const pCatId = p.category?._id || p.category;
                return pCatId === selectedSubCat;
            });
        }

        // Price Filter
        if (priceRange !== 'all') {
            result = result.filter(p => {
                const price = p.price;
                if (priceRange === 'under500') return price < 500;
                if (priceRange === '500-1000') return price >= 500 && price <= 1000;
                if (priceRange === '1000-2000') return price >= 1000 && price <= 2000;
                if (priceRange === 'over2000') return price > 2000;
                return true;
            });
        }

        // Sorting
        result.sort((a, b) => {
            if (sortBy === 'price-low') return a.price - b.price;
            if (sortBy === 'price-high') return b.price - a.price;
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        setDisplayProducts(result);

    }, [filteredProducts, selectedSubCat, priceRange, sortBy]);

    if (loading && products.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <Link to="/categories" className="inline-flex items-center gap-2 text-stone-300 hover:text-white transition-colors text-sm font-medium mb-6">
                        <ArrowLeft className="w-4 h-4" /> Back to Collections
                    </Link>

                    <div className="max-w-3xl">
                        <span className="text-xs font-bold tracking-[0.3em] text-stone-400 uppercase mb-4 block">
                            Curated Collection
                        </span>
                        <h1 className="text-5xl md:text-6xl font-serif mb-6 leading-tight">
                            {categoryName || 'Category'}
                        </h1>
                        <p className="text-lg text-stone-300 leading-relaxed">
                            {categoryDescription}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters & Products Section */}
            <div className="max-w-7xl mx-auto px-6 py-12">

                {/* Sub-Category Filter Tabs */}
                {subCategories.length > 0 && (
                    <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
                        <div className="flex gap-2 min-w-max">
                            <button
                                onClick={() => setSelectedSubCat('all')}
                                className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${selectedSubCat === 'all'
                                    ? 'bg-stone-900 text-white shadow-md'
                                    : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-400 hover:text-stone-900'
                                    }`}
                            >
                                All Products
                            </button>
                            {subCategories.map(sub => (
                                <button
                                    key={sub._id}
                                    onClick={() => setSelectedSubCat(sub._id)}
                                    className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${selectedSubCat === sub._id
                                        ? 'bg-stone-900 text-white shadow-md'
                                        : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-400 hover:text-stone-900'
                                        }`}
                                >
                                    {sub.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-stone-200">
                    <div className="flex items-center gap-4">
                        <p className="text-sm text-stone-600">
                            <span className="font-bold text-stone-900">{displayProducts.length}</span> {displayProducts.length === 1 ? 'Product' : 'Products'}
                        </p>

                        {/* Mobile Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="md:hidden flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors text-sm font-medium"
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Filters
                        </button>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {/* Sort Dropdown */}
                        <div className="relative flex-1 md:flex-initial">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full md:w-auto appearance-none bg-white border border-stone-200 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-stone-700 hover:border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all cursor-pointer"
                            >
                                <option value="newest">Newest First</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="name">Name: A to Z</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                        </div>

                        {/* View Mode Toggle */}
                        <div className="hidden md:flex items-center gap-1 bg-stone-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-900'}`}
                                title="List View"
                            >
                                <LayoutList className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('grid-3')}
                                className={`p-2 rounded transition-colors ${viewMode === 'grid-3' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-900'}`}
                                title="Grid View"
                            >
                                <Grid3x3 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Sidebar Filters */}
                    <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
                        <div className="bg-white rounded-xl border border-stone-200 p-6 sticky top-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-stone-900 flex items-center gap-2">
                                    <SlidersHorizontal className="w-4 h-4" />
                                    Filters
                                </h3>
                                {(priceRange !== 'all') && (
                                    <button
                                        onClick={() => setPriceRange('all')}
                                        className="text-xs text-stone-500 hover:text-stone-900 underline"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            {/* Price Range Filter */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">Price Range</h4>
                                {[
                                    { value: 'all', label: 'All Prices' },
                                    { value: 'under500', label: 'Under ₹500' },
                                    { value: '500-1000', label: '₹500 - ₹1,000' },
                                    { value: '1000-2000', label: '₹1,000 - ₹2,000' },
                                    { value: 'over2000', label: 'Over ₹2,000' },
                                ].map(option => (
                                    <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="priceRange"
                                            value={option.value}
                                            checked={priceRange === option.value}
                                            onChange={(e) => setPriceRange(e.target.value)}
                                            className="w-4 h-4 text-stone-900 border-stone-300 focus:ring-stone-900 cursor-pointer"
                                        />
                                        <span className="text-sm text-stone-700 group-hover:text-stone-900 transition-colors">
                                            {option.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Products Grid/List */}
                    <div className="flex-1">
                        {displayProducts.length > 0 ? (
                            viewMode === 'list' ? (
                                // List View
                                <div className="space-y-4">
                                    {displayProducts.map(product => (
                                        <Link
                                            key={product._id}
                                            to={`/product/${product._id}`}
                                            className="flex gap-6 bg-white rounded-xl border border-stone-200 hover:shadow-lg transition-all duration-300 overflow-hidden group"
                                        >
                                            {/* Product Image */}
                                            <div className="w-48 h-48 flex-shrink-0 bg-stone-100 relative overflow-hidden">
                                                {product.images && product.images.length > 0 ? (
                                                    <img
                                                        src={product.images[0].url}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                                                        <LayoutGrid className="w-12 h-12" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex-1 py-6 pr-6 flex flex-col justify-between">
                                                <div>
                                                    <h3 className="text-xl font-serif text-stone-900 mb-2 group-hover:text-stone-600 transition-colors">
                                                        {product.name}
                                                    </h3>
                                                    <p className="text-sm text-stone-500 line-clamp-2 mb-4">
                                                        {product.description || 'A perfect gift for your loved ones.'}
                                                    </p>
                                                    {product.category && (
                                                        <span className="inline-block px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-medium">
                                                            {product.category.name || product.category}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between mt-4">
                                                    <div>
                                                        <span className="text-2xl font-bold text-stone-900">
                                                            ₹{product.price?.toLocaleString()}
                                                        </span>
                                                        {product.stock > 0 ? (
                                                            <span className="ml-3 text-xs text-green-600 font-medium">
                                                                In Stock ({product.stock})
                                                            </span>
                                                        ) : (
                                                            <span className="ml-3 text-xs text-red-600 font-medium">
                                                                Out of Stock
                                                            </span>
                                                        )}
                                                    </div>
                                                    <button className="px-6 py-2.5 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors font-medium text-sm">
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                // Grid View
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {displayProducts.map(product => (
                                        <ProductCard key={product._id} product={product} />
                                    ))}
                                </div>
                            )
                        ) : (
                            <div className="text-center py-20 bg-white rounded-xl border border-stone-200">
                                <div className="max-w-md mx-auto">
                                    <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <LayoutGrid className="w-8 h-8 text-stone-400" />
                                    </div>
                                    <h3 className="text-xl font-serif text-stone-900 mb-2">No Products Found</h3>
                                    <p className="text-stone-500 mb-6">
                                        {priceRange !== 'all'
                                            ? 'Try adjusting your filters to see more results.'
                                            : 'No products available in this category yet.'}
                                    </p>
                                    {priceRange !== 'all' && (
                                        <button
                                            onClick={() => setPriceRange('all')}
                                            className="inline-block px-6 py-2.5 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors font-medium text-sm"
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                    <Link
                                        to="/categories"
                                        className="inline-block mt-3 text-stone-600 hover:text-stone-900 underline text-sm"
                                    >
                                        Browse Other Collections
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryProducts;
