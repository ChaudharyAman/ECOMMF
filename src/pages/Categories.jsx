import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, fetchProducts } from '../features/products/productSlice';
import { Link } from 'react-router-dom';
import { Loader2, ChevronDown, CheckCircle, ArrowRight } from 'lucide-react';

const Categories = () => {
    const dispatch = useDispatch();
    const { categories, products, loading } = useSelector((state) => state.products);
    const [expandedCategory, setExpandedCategory] = useState(null);

    useEffect(() => {
        dispatch(fetchCategories());
        if (products.length === 0) {
            dispatch(fetchProducts());
        }
    }, [dispatch, products.length]);

    // Group Categories
    const primaryCategories = categories.filter(c => !c.parent && c.isActive !== false && c.isFeatured);

    const toggleExpand = (id) => {
        if (expandedCategory === id) {
            setExpandedCategory(null);
        } else {
            setExpandedCategory(id);
        }
    };

    // Helper to get image for primary category
    const getCategoryImage = (primaryCat) => {
        // 1. Check featured product image (Priority)
        if (primaryCat.featuredProduct && primaryCat.featuredProduct.images && primaryCat.featuredProduct.images.length > 0) {
            return primaryCat.featuredProduct.images[0].url;
        }
        // 2. Check direct image field
        if (primaryCat.image) return primaryCat.image;
        
        // 3. Fallback
        return 'https://images.unsplash.com/photo-1472851294608-4155f2118c03?q=80&w=2070&auto=format&fit=crop'; 
    };

    if (loading && categories.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 py-12 px-4 lg:px-8 font-sans text-stone-800">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-xs font-bold tracking-[0.2em] text-stone-500 uppercase mb-3 block">Curated Collections</span>
                    <h1 className="text-4xl md:text-5xl font-serif text-stone-900 mb-6">Explore by Category</h1>
                    <p className="text-lg text-stone-600 max-w-2xl mx-auto">
                        Browse our exclusive collections. Select a category to discover specific items.
                    </p>
                </div>

                <div className="relative overflow-hidden py-10 group">
                    <div className="flex whitespace-nowrap">
                        {/* Tracks nested within a group to sync pause state */}
                        <div className="flex flex-shrink-0 animate-marquee group-hover:[animation-play-state:paused]">
                            {primaryCategories.map((primary) => {
                                const displayImage = primary.image || getCategoryImage(primary);
                                return (
                                    <Link 
                                        key={`cat1-${primary._id}`}
                                        to={`/category/${primary._id}`} 
                                        className="inline-flex flex-col flex-shrink-0 w-80 sm:w-96 mx-4 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100"
                                    >
                                        <div className="relative h-48 sm:h-64 overflow-hidden">
                                            <img 
                                                src={displayImage} 
                                                alt={primary.name}
                                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/30 hover:bg-black/20 transition-colors flex items-center justify-center flex-col text-white p-4 text-center">
                                                <h2 className="text-3xl font-serif font-medium mb-2 whitespace-normal">{primary.name}</h2>
                                                <div className="flex items-center gap-2 opacity-90 text-sm font-medium tracking-wider uppercase bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                                    <span>View Collection</span>
                                                    <ArrowRight className="w-4 h-4 ml-1" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                        <div className="flex flex-shrink-0 animate-marquee group-hover:[animation-play-state:paused]">
                            {primaryCategories.map((primary) => {
                                const displayImage = primary.image || getCategoryImage(primary);
                                return (
                                    <Link 
                                        key={`cat2-${primary._id}`}
                                        to={`/category/${primary._id}`} 
                                        className="inline-flex flex-col flex-shrink-0 w-80 sm:w-96 mx-4 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100"
                                    >
                                        <div className="relative h-48 sm:h-64 overflow-hidden">
                                            <img 
                                                src={displayImage} 
                                                alt={primary.name}
                                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/30 hover:bg-black/20 transition-colors flex items-center justify-center flex-col text-white p-4 text-center">
                                                <h2 className="text-3xl font-serif font-medium mb-2 whitespace-normal">{primary.name}</h2>
                                                <div className="flex items-center gap-2 opacity-90 text-sm font-medium tracking-wider uppercase bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                                    <span>View Collection</span>
                                                    <ArrowRight className="w-4 h-4 ml-1" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {primaryCategories.length === 0 && !loading && (
                    <div className="text-center py-24 text-stone-400">
                        No categories found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Categories;
