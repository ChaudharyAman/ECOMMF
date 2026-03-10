import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories } from '../features/products/productSlice';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, Gift, Heart, Calendar, Star, Package } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const Home = () => {
    const dispatch = useDispatch();
    const { products, categories, loading } = useSelector((state) => state.products);

    useEffect(() => {
        if (products.length === 0) dispatch(fetchProducts({ limit: 1000 }));
        if (categories.length === 0) dispatch(fetchCategories());
    }, [dispatch, products.length, categories.length]);

    const exploreCollections = categories.filter(c => c.isFeatured).slice(0, 3);
    const occasionCollections = categories.filter(c => c.isOccasion).slice(0, 4);
    const promoCategory = categories.find(c => c.isPromo);
    
    // Logic for Featured vs Trending
    const featuredProduct = products.find(p => p.isFeatured) || products[0];
    const trendingProducts = products.filter(p => !p.isFeatured && p._id !== featuredProduct?._id).slice(0, 4);
    
    // Fallback if no trending products left (e.g. only one product exists)
    const displayTrending = trendingProducts.length > 0 ? trendingProducts : products.filter(p => p._id !== featuredProduct?._id).slice(0, 4);

    if (loading && products.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
                <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
            </div>
        );
    }

    return (
        <div className="font-sans text-stone-800 bg-[#FDFBF7] min-h-screen">

            {/* --- Promotional Category Banner (Top Priority) --- */}
            {promoCategory && (
                <section 
                    className="relative z-20 w-full pt-[48px] bg-[#2D281E] overflow-visible"
                    style={{
                        maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320' preserveAspectRatio='none'%3E%3Cpath fill='black' d='M0,240 Q60,250 120,240 T240,240 T360,240 T480,240 T600,240 T720,240 T840,240 T960,240 T1080,240 T1200,240 T1320,240 T1440,240L1440,0L0,0Z'/%3E%3C/svg%3E")`,
                        WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320' preserveAspectRatio='none'%3E%3Cpath fill='black' d='M0,240 Q60,250 120,240 T240,240 T360,240 T480,240 T600,240 T720,240 T840,240 T960,240 T1080,240 T1200,240 T1320,240 T1440,240L1440,0L0,0Z'/%3E%3C/svg%3E")`,
                        maskSize: '100% 100%',
                        WebkitMaskSize: '100% 100%',
                        maskRepeat: 'no-repeat',
                        WebkitMaskRepeat: 'no-repeat',
                        marginBottom: '-90px'
                    }}
                >
                    <div className="w-full relative h-[180px] sm:h-[200px] md:h-[220px] flex items-stretch group cursor-pointer pb-12">
                        <Link to={`/category/${promoCategory._id}`} className="absolute inset-0 z-20"></Link>

                        {/* Left: Elegant Dark Text Panel */}
                        <div className="relative z-10 flex flex-col justify-center pt-1 pb-4 px-6 sm:px-12 md:px-20 w-[70%] md:w-[50%] flex-shrink-0">

                            {/* Premium Spotlight Badge */}
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-stone-800/50 border border-stone-700/50 shadow-lg mb-2 w-fit">
                                <Star className="w-3 h-3 text-[#FFD55F] fill-[#FFD55F]" />
                                <span className="text-[7.5px] md:text-[9px] font-bold tracking-[0.2em] uppercase text-stone-200">Curated Spotlight</span>
                            </div>

                            <h2 className="text-lg sm:text-xl md:text-2xl font-serif text-white tracking-tight leading-[1.1] mb-1">
                                The <span className="italic font-light text-[#FFD55F]">{promoCategory.name}</span> Collection
                            </h2>



                            {/* Premium Yellow Button */}
                            <div className="inline-flex items-center gap-2 bg-[#FFD55F] text-stone-950 px-3 py-1.5 rounded-full text-[9px] md:text-[10px] font-black tracking-widest hover:bg-[#ffcd3c] hover:scale-105 transition-all w-fit shadow-xl shadow-yellow-500/20 uppercase border border-yellow-400/20">
                                Shop The Collection
                                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>

                        {/* Right: Modern Image Panel - Full bleed with mask */}
                        <div className="absolute inset-y-0 right-0 w-[55%] md:w-[65%] overflow-hidden z-0 flex justify-end">
                            {promoCategory.image ? (
                                <div
                                    className="w-full h-full relative"
                                    style={{
                                        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 40%, black 80%, transparent 100%)',
                                        maskImage: 'linear-gradient(to right, transparent 0%, black 40%, black 80%, transparent 100%)',
                                    }}
                                >
                                    <img
                                        src={promoCategory.promoImage || promoCategory.image}
                                        alt={promoCategory.name}
                                        className="w-full h-full object-cover object-left-center group-hover:scale-105 transition-transform duration-1000 ease-out opacity-80"
                                    />
                                    {/* Extra left-side dark fade overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#2D281E] via-transparent to-transparent" />
                                </div>
                            ) : (
                                <div
                                    className="w-full h-full bg-[#3d382d] flex items-center justify-center"
                                >
                                    <Gift className="w-20 h-20 text-[#FFD55F] opacity-20" />
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* --- Hero: Emotional & Warm --- */}
            <section className={`relative flex items-center justify-center px-6 overflow-hidden ${promoCategory ? 'min-h-[20vh] pb-10 pt-24' : 'min-h-[85vh] pb-24 pt-32'}`}>
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=2574&auto=format&fit=crop"
                        alt="Background"
                        className="w-full h-full object-cover opacity-[0.15] scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-transparent to-transparent"></div>
                </div>

                <div className="relative z-10 text-center max-w-4xl mx-auto space-y-6 md:space-y-8 animate-fade-in-up mt-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-stone-200 shadow-sm mb-2 md:mb-4">
                        <Gift className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold tracking-widest uppercase text-stone-600">The Art of Meaningful Gifting</span>
                    </div>

                    <h1 className={`${promoCategory ? 'text-5xl md:text-7xl' : 'text-6xl md:text-8xl'} font-serif text-stone-900 leading-tight`}>
                        Find the <br />
                        <span className="italic text-stone-500">Perfect</span> Gesture.
                    </h1>

                    <p className={`${promoCategory ? 'text-lg md:text-xl' : 'text-xl'} text-stone-600 font-light max-w-2xl mx-auto leading-relaxed`}>
                        Thoughtfully curated collections for the people who matter most.
                        Make every occasion unforgettable with a hand-picked treasure.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 md:pt-6">
                        <Link to="/categories" className="px-10 py-4 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-all hover:scale-105 shadow-lg shadow-stone-900/10">
                            Find a Gift
                        </Link>
                        <Link to="/about" className="px-10 py-4 bg-white text-stone-900 border border-stone-200 rounded-full font-medium hover:bg-stone-50 transition-colors">
                            Our Story
                        </Link>
                    </div>
                </div>

                {/* Wavy bottom divider spanning full width */}
                <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-10 pointer-events-none transform translate-y-[99%]">
                    <svg
                        className="relative block w-[calc(100%+1.3px)] h-[40px] md:h-[70px] fill-white"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1200 120"
                        preserveAspectRatio="none"
                    >
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C50.69,16.59,102.58,35.79,154.2,46.51A481.56,481.56,0,0,0,321.39,56.44Z"></path>
                    </svg>
                </div>
            </section>

            {/* --- Gift Finder Module (Categories) --- */}
            {/* Added pt-10 to account for the wave bleeding down into this section */}
            <section className="relative z-20 px-6 lg:px-12 bg-white pt-10 pb-20">
                <div className="max-w-5xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-stone-200/50 border border-t-stone-100">
                    <h2 className="text-center font-serif text-3xl mb-10 text-stone-800">Explore Our Collections</h2>

                    {exploreCollections.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {exploreCollections.map((category, idx) => (
                                <Link
                                    key={category._id}
                                    to={`/category/${category._id}`}
                                    className="group flex flex-col items-center justify-center p-8 rounded-2xl border border-stone-100 hover:border-stone-300 hover:shadow-lg transition-all cursor-pointer bg-stone-50/50"
                                >
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-stone-100 text-stone-600 group-hover:scale-110 group-hover:bg-stone-900 group-hover:text-white transition-all`}>
                                        {/* Dynamic Icon or fallback */}
                                        <Gift className="w-6 h-6" />
                                    </div>
                                    <span className="text-lg font-serif font-medium text-stone-900 text-center">{category.name}</span>
                                    <span className="text-xs font-bold uppercase tracking-wider text-stone-400 mt-2 group-hover:text-stone-600">Browse Collection</span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-stone-500">Loading collections...</p>
                        </div>
                    )}
                </div>
            </section>


            {/* --- Shop by Occasion --- */}
            <section className="py-32 px-6 lg:px-12">
                <div className="max-w-[1400px] mx-auto">
                    <div className="text-center mb-20">
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-stone-500">Celebrations</span>
                        <h2 className="text-4xl md:text-5xl font-serif text-stone-900 mt-3">Shop by Occasion</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {occasionCollections.map((category) => (
                            <Link key={category._id} to={`/category/${category._id}`} className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer">
                                <img
                                    src={category.image || category.featuredProduct?.images?.[0]?.url || ''}
                                    alt={category.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-stone-900/20 group-hover:bg-stone-900/30 transition-colors"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <h3 className="font-serif text-stone-900 text-lg">{category.name}</h3>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- Featured Treasure & Packaging Experience (Consolidated) --- */}
            {featuredProduct && (
                <section className="py-24 bg-white border-y border-stone-100">
                    <div className="max-w-[1400px] mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">

                        {/* Interactive Image Side */}
                        <div className="order-2 md:order-1 relative aspect-[4/3] rounded-3xl overflow-hidden bg-stone-100 group cursor-pointer shadow-xl">
                            {/* The Actual Product (Revealed) */}
                            <Link to={`/product/${featuredProduct._id}`} className="absolute inset-0 z-10">
                                <img
                                    src={featuredProduct.images?.[0]?.url || ''}
                                    alt={featuredProduct.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Unwrapped For You</p>
                                                <p className="font-serif text-lg text-stone-900">{featuredProduct.name}</p>
                                            </div>
                                            <span className="bg-stone-900 text-white rounded-full p-2">
                                                <ArrowRight className="w-4 h-4" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            {/* The Gift Wrap (Cover) */}
                            <div className="absolute inset-0 z-20 transition-all duration-1000 ease-in-out group-hover:-translate-y-full group-hover:opacity-0 origin-top pointer-events-none">
                                <img
                                    src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2640&auto=format&fit=crop"
                                    alt="Gift Wrapped"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/5"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl transform transition-transform duration-500 group-hover:scale-110">
                                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-stone-900 flex items-center gap-2">
                                            <Gift className="w-4 h-4 text-pink-500" /> Hover to Unwrap
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Side */}
                        <div className="order-1 md:order-2 space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 text-stone-600">
                                <Package className="w-4 h-4" />
                                <span className="text-xs font-bold tracking-widest uppercase">The Experience</span>
                            </div>

                            <h2 className="text-4xl md:text-5xl font-serif text-stone-900">Wrapped with Love.</h2>
                            <p className="text-lg text-stone-600 leading-relaxed font-light">
                                Every order arrives in our signature sustainable packaging, ready to impress.
                                We treat every item like a featured masterpiece.
                            </p>

                            <ul className="space-y-4 pt-4 border-t border-stone-100">
                                <li className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center flex-shrink-0">
                                        <Star className="w-5 h-5 text-stone-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-stone-900 text-sm uppercase tracking-wide">Premium Boxing</h4>
                                        <p className="text-sm text-stone-500">Rigid, keepsake-quality boxes.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center flex-shrink-0">
                                        <Heart className="w-5 h-5 text-stone-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-stone-900 text-sm uppercase tracking-wide">Personal Touch</h4>
                                        <p className="text-sm text-stone-500">Handwritten notes available.</p>
                                    </div>
                                </li>
                            </ul>

                            <div className="pt-6">
                                <Link to={`/product/${featuredProduct._id}`} className="text-sm font-bold uppercase tracking-widest text-stone-900 border-b border-stone-900 pb-1 hover:text-stone-600 hover:border-stone-600 transition-colors">
                                    Shop the Featured Gift
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* --- Trending Gifts --- */}
            <section className="py-32 px-6 bg-[#FDFBF7]">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex justify-between items-end mb-16 px-2">
                        <div>
                            <h2 className="text-4xl font-serif text-stone-900">Trending Gifts</h2>
                            <p className="text-stone-500 mt-2">What everyone is loving right now.</p>
                        </div>
                        <Link to="/categories" className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-stone-900 hover:text-stone-600 transition-colors">
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {displayTrending.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* --- Newsletter --- */}
            <section className="py-24 bg-stone-900 text-white px-6 relative overflow-hidden">
                <div className="max-w-xl mx-auto text-center relative z-10 space-y-8">
                    <Calendar className="w-10 h-10 mx-auto text-stone-400" />
                    <h2 className="text-3xl md:text-5xl font-serif">Never Miss a Moment</h2>
                    <p className="text-stone-400 text-lg font-light">
                        Get reminders for important dates, curated gift guides, and exclusive access to new arrivals.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <input
                            type="email"
                            placeholder="Your email address"
                            className="flex-1 bg-white/10 border border-white/10 rounded-full px-6 py-4 text-white placeholder:text-white/40 focus:outline-none focus:bg-white/20 transition-all"
                        />
                        <button className="bg-white text-stone-900 px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-[#FDFBF7] transition-colors">
                            Join Club
                        </button>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
