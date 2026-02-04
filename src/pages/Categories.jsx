import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, fetchProducts } from '../features/products/productSlice';
import { Link } from 'react-router-dom';
import { Loader2, ArrowRight, ShoppingBag } from 'lucide-react';

const Categories = () => {
    const dispatch = useDispatch();
    const { categories, products, loading } = useSelector((state) => state.products);

    useEffect(() => {
        dispatch(fetchCategories());
        if (products.length === 0) {
            dispatch(fetchProducts());
        }
    }, [dispatch, products.length]);

    // Helper to find one product image for a category
    const getCategoryImage = (category) => {
        const product = products.find(p => {
            const pCatId = p.category?._id || p.category;
            const catId = category._id;
            // Check for ID match or fuzzy name match
            return pCatId === catId || p.category?.name === category.name;
        });
        
        return product?.images?.[0]?.url || null;
    };

    if (loading && categories.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 py-12 px-6 lg:px-12 font-sans text-stone-800">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-xs font-bold tracking-[0.2em] text-stone-500 uppercase mb-3 block">Collections</span>
                    <h1 className="text-4xl md:text-5xl font-serif text-stone-900 mb-6">Browse by Category</h1>
                    <p className="text-lg text-stone-600 max-w-2xl mx-auto">
                        Explore our thoughtfully curated collections, each designed to help you find the perfect gift for every occasion.
                    </p>
                </div>

                {categories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {categories
                            .filter(category => category.isActive !== false) // Only show active categories
                            .map((category) => {
                            const imageUrl = getCategoryImage(category);
                            
                            return (
                                <div key={category._id} className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-stone-100 flex flex-col h-full">
                                    
                                    {/* Image Area */}
                                    <div className="relative aspect-[4/3] overflow-hidden bg-stone-200">
                                        {imageUrl ? (
                                            <img 
                                                src={imageUrl} 
                                                alt={category.name}
                                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-stone-300 gap-2">
                                                <ShoppingBag className="w-10 h-10 opacity-20" />
                                                <span className="text-xs font-medium uppercase tracking-widest opacity-40">No Images</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                                    </div>

                                    {/* Content Area */}
                                    <div className="p-8 flex flex-col flex-grow items-center text-center">
                                        <h2 className="text-2xl font-serif text-stone-900 mb-3 group-hover:text-stone-600 transition-colors">
                                            {category.name}
                                        </h2>
                                        <p className="text-stone-500 text-sm mb-6 line-clamp-2 px-4">
                                            {/* Assuming description might exist, else generic */}
                                             Discover our exclusive {category.name.toLowerCase()} collection.
                                        </p>
                                        
                                        <div className="mt-auto">
                                            <Link 
                                                to={`/category/${category._id}`} 
                                                className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-stone-900 hover:text-stone-600 transition-colors border-b border-stone-900 hover:border-stone-600 pb-1"
                                            >
                                                View Collection <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 text-stone-400">
                        <p className="font-serif italic text-xl">
                            {categories.length === 0 
                                ? 'No categories found.' 
                                : 'No active categories available at the moment.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Categories;
