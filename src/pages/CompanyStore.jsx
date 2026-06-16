import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ShoppingBag, 
  Star, 
  Facebook, 
  Instagram, 
  Globe, 
  Mail, 
  MapPin, 
  Calendar, 
  DollarSign,
  SlidersHorizontal,
  ChevronDown,
  Loader2,
  RefreshCw
} from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';

const CompanyStore = () => {
  const { slug } = useParams();

  // Core Storefront State
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Tab State
  const [activeTab, setActiveTab] = useState('Products'); // 'Products' | 'About'

  // Pagination & Filter States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  
  // Debounced Price Range States
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Debounce price filters (500ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setMinPrice(minPriceInput);
    }, 500);
    return () => clearTimeout(handler);
  }, [minPriceInput]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setMaxPrice(maxPriceInput);
    }, 500);
    return () => clearTimeout(handler);
  }, [maxPriceInput]);

  // 1. Initial parallel fetch (Vendor Info + Initial Products + Categories list)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [vendorRes, categoriesRes] = await Promise.all([
          api.get(`/vendors/store/${slug}`),
          api.get('/categories')
        ]);
        
        setVendor(vendorRes.data);
        setCategories(categoriesRes.data || []);
        
        // Reset page and fetch products for this vendor
        const productsRes = await api.get(`/vendors/store/${slug}/products`, {
          params: { page: 1, limit: 12, sort, category, minPrice, maxPrice }
        });
        
        setProducts(productsRes.data.products || []);
        setTotalPages(productsRes.data.totalPages || 1);
        setTotalProducts(productsRes.data.totalProducts || 0);
        setPage(1);
      } catch (err) {
        console.error('Failed to load store data:', err);
        setError(err.response?.data?.message || 'Failed to load company storefront details.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [slug]);

  // 2. Re-fetch products when filters/sorting changes
  useEffect(() => {
    // Skip initial mount loading
    if (loading) return;

    const fetchFilteredProducts = async () => {
      try {
        setProductsLoading(true);
        const res = await api.get(`/vendors/store/${slug}/products`, {
          params: { page: 1, limit: 12, sort, category, minPrice, maxPrice }
        });
        
        setProducts(res.data.products || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalProducts(res.data.totalProducts || 0);
        setPage(1);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [sort, category, minPrice, maxPrice]);

  // 3. Load More products (Pagination)
  const handleLoadMore = async () => {
    const nextPage = page + 1;
    try {
      setProductsLoading(true);
      const res = await api.get(`/vendors/store/${slug}/products`, {
        params: { page: nextPage, limit: 12, sort, category, minPrice, maxPrice }
      });
      
      setProducts(prev => [...prev, ...(res.data.products || [])]);
      setPage(nextPage);
    } catch (err) {
      console.error('Failed to load more products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setCategory('');
    setSort('newest');
    setMinPriceInput('');
    setMaxPriceInput('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
        <Loader2 className="w-10 h-10 animate-spin text-stone-700 mb-4" />
        <p className="text-sm font-semibold tracking-wider text-stone-500 uppercase">Loading storefront...</p>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-stone-50 px-4">
        <div className="w-20 h-20 bg-stone-200 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-9 h-9 text-stone-400" />
        </div>
        <h2 className="text-3xl font-serif text-stone-900 mb-3">Store Not Found</h2>
        <p className="text-stone-500 mb-8 text-center max-w-md">
          {error || "The storefront you are looking for does not exist or has been disabled."}
        </p>
        <Link to="/" className="px-6 py-3 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors font-semibold">
          Return Home
        </Link>
      </div>
    );
  }

  const joinDate = new Date(vendor.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-stone-50/50 pb-20">
      
      {/* SECTION A — STORE HERO */}
      <div className="relative h-[250px] md:h-[350px] w-full overflow-hidden">
        {/* Banner with gradient overlay */}
        {vendor.banner ? (
          <img 
            src={vendor.banner} 
            alt={vendor.storeName} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-stone-850 via-stone-900 to-stone-950" />
        )}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
      </div>

      {/* Store Header & Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-stone-100 flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-end">
          {/* Logo circle */}
          <div className="w-28 h-28 md:w-32 md:h-32 bg-stone-100 border-4 border-white rounded-full overflow-hidden flex-shrink-0 shadow-md flex items-center justify-center">
            {vendor.logo ? (
              <img src={vendor.logo} alt={vendor.storeName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-serif font-black text-stone-800 uppercase">
                {vendor.storeName.charAt(0)}
              </span>
            )}
          </div>

          {/* Store Info */}
          <div className="flex-1 space-y-3.5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-serif text-stone-900 font-bold">{vendor.storeName}</h1>
                {vendor.tagline && <p className="text-stone-500 italic mt-1 text-sm md:text-base">{vendor.tagline}</p>}
              </div>
              
              {/* Social links */}
              {vendor.socialLinks && (
                <div className="flex items-center gap-3">
                  {vendor.socialLinks.website && (
                    <a href={vendor.socialLinks.website} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 text-stone-600 transition-colors shadow-sm">
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                  {vendor.socialLinks.facebook && (
                    <a href={vendor.socialLinks.facebook} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 text-stone-650 transition-colors shadow-sm">
                      <Facebook className="w-5 h-5 fill-stone-650 text-stone-650" />
                    </a>
                  )}
                  {vendor.socialLinks.instagram && (
                    <a href={vendor.socialLinks.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 text-stone-650 transition-colors shadow-sm">
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 border-t border-stone-100 text-xs md:text-sm text-stone-500">
              <span className="flex items-center gap-1.5 font-medium">
                <ShoppingBag className="w-4 h-4 text-stone-400" />
                <span className="text-stone-850 font-semibold">{totalProducts}</span> Products
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-stone-850 font-semibold">{vendor.rating ? vendor.rating.toFixed(1) : 'No Rating'}</span> Store Rating
              </span>
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-stone-400" />
                <span className="text-stone-850 font-semibold">{vendor.totalSales}</span> Sales
              </span>
              <span className="flex items-center gap-1.5 ml-auto">
                <Calendar className="w-4 h-4 text-stone-400" />
                Joined <span className="text-stone-800 font-semibold">{joinDate}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Storefront Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        
        {/* SECTION B — TABS */}
        <div className="flex border-b border-stone-200 gap-8 mb-8">
          <button
            onClick={() => setActiveTab('Products')}
            className={`pb-4 text-base font-semibold tracking-wide border-b-2 transition-all ${
              activeTab === 'Products' 
                ? 'border-stone-900 text-stone-950 font-bold' 
                : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('About')}
            className={`pb-4 text-base font-semibold tracking-wide border-b-2 transition-all ${
              activeTab === 'About' 
                ? 'border-stone-900 text-stone-950 font-bold' 
                : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            About
          </button>
        </div>

        {/* SECTION C — PRODUCTS TAB */}
        {activeTab === 'Products' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Filters Sidebar */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-stone-100 shadow-sm space-y-6 h-fit sticky top-24">
              <div className="flex justify-between items-center pb-4 border-b border-stone-100">
                <h3 className="font-serif text-lg text-stone-900 font-bold flex items-center gap-2">
                  <SlidersHorizontal className="w-4.5 h-4.5" />
                  Filters
                </h3>
                <button 
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-stone-400 hover:text-stone-800 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Reset
                </button>
              </div>

              {/* Category selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-stone-200 text-sm focus:ring-1 focus:ring-stone-900 focus:outline-none bg-white transition-all"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Sort selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Sort By</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-stone-200 text-sm focus:ring-1 focus:ring-stone-900 focus:outline-none bg-white transition-all"
                >
                  <option value="newest">Newest Additions</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>

              {/* Price range inputs (Debounced) */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Price Range (₹)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-1 focus:ring-stone-900 focus:outline-none transition-all"
                  />
                  <span className="text-stone-400 text-xs">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-1 focus:ring-stone-900 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Products grid area */}
            <div className="lg:col-span-3 space-y-12">
              
              {productsLoading && products.length === 0 ? (
                /* Grid Skeletons */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 animate-pulse">
                  {[1, 2, 3, 4, 6].map(i => (
                    <div key={i} className="space-y-4">
                      <div className="aspect-[4/5] bg-stone-200 rounded-lg w-full"></div>
                      <div className="h-4 bg-stone-200 rounded w-2/3"></div>
                      <div className="h-4 bg-stone-150 rounded w-1/3"></div>
                    </div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 relative">
                    {productsLoading && (
                      <div className="absolute inset-0 bg-stone-50/20 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <Loader2 className="w-8 h-8 animate-spin text-stone-700" />
                      </div>
                    )}
                    {products.map(product => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>

                  {/* Load more button */}
                  {page < totalPages && (
                    <div className="flex justify-center pt-6">
                      <button
                        onClick={handleLoadMore}
                        disabled={productsLoading}
                        className="px-8 py-3.5 border border-stone-900 text-stone-950 font-bold rounded-lg hover:bg-stone-900 hover:text-white transition-all flex items-center gap-2 shadow-sm font-semibold"
                      >
                        {productsLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {productsLoading ? 'Loading more...' : 'Load More Products'}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* Empty state */
                <div className="text-center py-20 bg-white border border-dashed border-stone-200 rounded-2xl">
                  <p className="font-serif italic text-lg text-stone-400">No products found matching the filter criteria.</p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-4 px-5 py-2 bg-stone-900 text-white rounded-lg text-sm font-semibold hover:bg-stone-850 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* SECTION D — ABOUT TAB */}
        {activeTab === 'About' && (
          <div className="max-w-4xl space-y-10 bg-white p-8 md:p-10 rounded-2xl border border-stone-100 shadow-sm">
            {/* Description */}
            <div>
              <h3 className="text-xl font-serif text-stone-900 font-bold mb-4">About the Store</h3>
              <p className="text-stone-655 leading-relaxed text-sm md:text-base whitespace-pre-line">
                {vendor.storeDescription || 'No description available for this merchant.'}
              </p>
            </div>

            {/* Address / Contact details */}
            <div className="pt-6 border-t border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3">Merchant Address</h4>
                {vendor.address ? (
                  <p className="text-stone-655 leading-relaxed text-sm flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-stone-400 mt-1 flex-shrink-0" />
                    <span>
                      {vendor.address.street}, {vendor.address.city},<br />
                      {vendor.address.state} - {vendor.address.zip}
                    </span>
                  </p>
                ) : (
                  <p className="text-stone-450 italic text-sm">No address listed.</p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3">Customer Support</h4>
                <p className="text-stone-655 leading-relaxed text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4 text-stone-400 flex-shrink-0" />
                  <span>{vendor.user?.email || 'No email support listed.'}</span>
                </p>
              </div>
            </div>

            {/* Shipping & Return Policies */}
            {vendor.policies && (
              <div className="pt-8 border-t border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                {vendor.policies.shipping && (
                  <div>
                    <h4 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3">Shipping Policy</h4>
                    <p className="text-stone-655 leading-relaxed text-sm whitespace-pre-line">
                      {vendor.policies.shipping}
                    </p>
                  </div>
                )}
                {vendor.policies.returns && (
                  <div>
                    <h4 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3">Returns & Refunds</h4>
                    <p className="text-stone-655 leading-relaxed text-sm whitespace-pre-line">
                      {vendor.policies.returns}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default CompanyStore;
