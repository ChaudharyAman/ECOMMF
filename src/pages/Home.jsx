import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories } from '../features/products/productSlice';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Loader2, Heart, Award, Gift, ShieldCheck, Truck, Star } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const Home = () => {
    const dispatch = useDispatch();
    const { products, categories, loading } = useSelector((state) => state.products);
    
    // We rely on the global search in Layout to filter 'products'
    // But for the 'Trending' section we might want to show *some* products even if filtered? 
    // Actually, if user searches, 'products' in redux state changes to the search results.
    // So 'products' IS the filtered list.
    
    useEffect(() => {
        // Initial fetch if empty? Or Layout does it?
        // Layout does it on search. We should ensure we fetch all initially.
        // If we want "Trending" to always be trending, we might need a separate 'trendingProducts' state in redux,
        // or just accept that search filters the whole page.
        // For now, accepting that search filters the page.
        if (products.length === 0) {
            dispatch(fetchProducts());
        }
        if (categories.length === 0) {
            dispatch(fetchCategories());
        }
    }, [dispatch, products.length, categories.length]);
    
    // Get a hero product (prioritize featured, then first with image)
    const heroProduct = products.find(p => p.isFeatured) || products.find(p => p.images && p.images.length > 0) || products[0];

    return (
        <div className="font-sans text-stone-800 bg-stone-50 min-h-screen selection:bg-stone-900 selection:text-white">

            {/* --- Hero Section --- */}
        <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
             {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 w-2/3 h-full bg-[#f3f0ec] -z-10 rounded-l-[100px] hidden md:block"></div>
            
            <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full grid md:grid-cols-2 gap-16 items-center">
                <div className="space-y-8 animate-fade-in-up">
                    <span className="text-xs font-bold tracking-[0.2em] text-stone-500 uppercase">The Art of Giving</span>
                    <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif text-stone-900 leading-[0.9]">
                        Curated <br/> <i className="font-serif italic text-stone-600">Thoughtful</i> <br/> Gestures.
                    </h1>
                    <p className="text-lg text-stone-600 max-w-md leading-relaxed">
                        Explore our collection of hand-picked treasures designed to make every moment memorable. 
                    </p>
                    <div className="flex items-center gap-4 pt-4">
                        <button className="bg-stone-900 text-white px-8 py-4 rounded-full font-medium hover:bg-stone-800 transition-transform hover:scale-105 active:scale-95 duration-300">
                            Shop Collection
                        </button>
                        <button className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center hover:bg-white hover:border-stone-300 transition-colors">
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Hero Image - Real Data Priority */}
                <div className="relative h-[600px] w-full hidden md:block">
                     {heroProduct ? (
                        <div className="relative w-full h-full">
                            <div className="absolute top-10 right-10 w-[80%] h-[90%] bg-white p-2 shadow-2xl shadow-stone-200/50 rotate-3 transition-transform duration-700 hover:rotate-0">
                                <img 
                                    src={heroProduct.images?.[0]?.url || ''} 
                                    alt={heroProduct.name}
                                    className="w-full h-full object-cover filter brightness-[1.02]"
                                />
                            </div>
                            {/* Floating "Card" detail */}
                            <div className="absolute bottom-20 left-0 bg-white p-8 max-w-xs shadow-2xl border border-stone-100 animate-in slide-in-from-bottom-5 duration-700">
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-3">Featured</p>
                                <p className="font-serif text-3xl text-stone-900 leading-tight mb-2">{heroProduct.name}</p>
                                <p className="text-stone-500 text-sm line-clamp-2 leading-relaxed mb-4">{heroProduct.description}</p>
                                <p className="text-stone-900 font-bold text-xl">₹{heroProduct.price?.toLocaleString()}</p>
                            </div>
                        </div>
                     ) : (
                         <div className="w-full h-full flex items-center justify-center bg-stone-100">
                             {loading ? <Loader2 className="w-8 h-8 animate-spin text-stone-300" /> : <span className="text-stone-400 font-serif italic">No products available</span>}
                         </div>
                     )}
                </div>
            </div>
        </section>

        {/* --- Categories (Strict Real Data) --- */}
        {categories.filter(cat => cat.isFeatured).length > 0 && (
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="flex justify-between items-end mb-16">
                        <h2 className="text-4xl font-serif text-stone-900">Browse by Category</h2>
                        <Link to="/categories" className="text-sm font-bold uppercase tracking-widest border-b border-stone-900 pb-1 hover:text-stone-600 hover:border-stone-600 transition-colors">
                            View All
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {categories.filter(cat => cat.isFeatured).slice(0, 4).map((category) => (
                            <Link key={category._id} to={`/category/${category._id}`} className="group cursor-pointer">
                                <div className="aspect-[3/4] bg-stone-100 overflow-hidden relative mb-6">
                                    {category.featuredProduct?.images?.[0]?.url ? (
                                        <img 
                                            src={category.featuredProduct.images[0].url} 
                                            alt={category.name}
                                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />
                                    ) : (
                                        <>
                                            <div className="absolute inset-0 bg-stone-200 group-hover:scale-105 transition-transform duration-700 ease-out"></div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-6xl opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                                                    {category.name.charAt(0)}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <h3 className="text-xl font-serif text-stone-900 group-hover:text-stone-600 transition-colors">{category.name}</h3>
                                <p className="text-sm text-stone-400 mt-1">Collection</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        )}

        {/* --- Trending / Featured --- */}
        <section className="py-24">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                 <h2 className="text-4xl font-serif text-stone-900 text-center mb-4">Trending Gifts</h2>
                 <p className="text-stone-500 text-center mb-16 max-w-lg mx-auto">Discover the most coveted items of the season.</p>
                 
                 {loading ? (
                     <div className="h-64 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
                     </div>
                 ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                        {products.slice(0, 8).map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                 ) : (
                    <div className="text-center py-20">
                        <p className="text-stone-400 font-serif italic text-xl">We couldn't find any gifts matching your search.</p>
                        {/* Clear Search logic would be in Layout now, so we can't clear it from here easily without Redux action or navigation */}
                        <Link to="/" onClick={() => window.location.reload()} className="mt-4 text-stone-900 underline">Refresh</Link>
                    </div>
                 )}
            </div>
        </section>

        {/* --- Newsletter --- */}
        <section className="py-24 bg-stone-900 text-white">
             <div className="max-w-xl mx-auto text-center px-6">
                <h2 className="text-3xl font-serif mb-6">Join the Inner Circle</h2>
                <p className="text-stone-400 mb-8 font-light">Sign up for exclusive access to new collections and expert gifting advice.</p>
                <div className="flex border-b border-stone-700 pb-2 focus-within:border-white transition-colors">
                    <input 
                        type="email" 
                        placeholder="Your email address" 
                        className="bg-transparent w-full outline-none placeholder:text-stone-600 pb-2"
                    />
                    <button className="text-sm font-bold uppercase tracking-widest hover:text-stone-300">Subscribe</button>
                </div>
             </div>
        </section>

        {/* Footer is now in Layout */}
    </div>
  );
};

// --- Sub Components ---

export default Home;
