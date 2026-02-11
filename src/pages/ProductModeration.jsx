import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { fetchPendingProducts, approveProduct, rejectProduct, fetchCategories, fetchVendors, fetchAllProducts, updateProduct, updateCategory, fetchApprovedProducts } from '../api/adminApi';
import ProductForm from '../components/ProductForm';
import ProductDetailView from '../components/ProductDetailView';
import { Star, ChevronDown, Search, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProductModeration = () => {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'approved', or 'catalog'
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter State
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [expandedCategories, setExpandedCategories] = useState([]);
  
  // Catalog-specific state
  const [catalogSearch, setCatalogSearch] = useState('');
  const [updatingCategoryId, setUpdatingCategoryId] = useState(null);


  const loadFilters = async () => {
      try {
          const [catData, vendData] = await Promise.all([
              fetchCategories(),
              fetchVendors()
          ]);
          setCategories(catData);
          setVendors(vendData);
      } catch (err) {
          console.error("Failed to load filter options", err);
      }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      
      // For catalog view, don't apply filters - show all products grouped by category
      if (activeTab !== 'catalog') {
          if (selectedCategory) params.category = selectedCategory;
          if (selectedVendor) params.vendor = selectedVendor;
      }

      console.log('Loading products with params:', params, 'activeTab:', activeTab);

      let data;
      if (activeTab === 'pending') {
          data = await fetchPendingProducts(params);
      } else {
          // Use Admin API for approved/catalog view to see ALL products (including inactive)
          data = await fetchApprovedProducts(params);
      }
      
      console.log('Frontend products load:', data);
      setProducts(data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setProducts([]); 
    }
  };

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, selectedVendor, activeTab]);



  const [viewingProduct, setViewingProduct] = useState(null);
  const [rejectingProduct, setRejectingProduct] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = async (id) => {
    if (window.confirm('Are you sure you want to approve this product?')) {
      try {
        await approveProduct(id);
        const updatedList = products.filter((p) => p._id !== id);
        setProducts(updatedList);
        
        if (viewingProduct && viewingProduct._id === id) {
             setViewingProduct(null);
        }
        toast.success('Product Approved!');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Approval failed');
      }
    }
  };

  const handleReject = async () => {
    if (!rejectingProduct || !rejectReason) return;
    try {
        await rejectProduct(rejectingProduct._id, rejectReason);
        setProducts(products.filter((p) => p._id !== rejectingProduct._id));
        setRejectingProduct(null);
        setRejectReason('');
        
        if (viewingProduct && viewingProduct._id === rejectingProduct._id) {
             setViewingProduct(null);
        }
        toast.success('Product Rejected');
    } catch (err) {
        toast.error(err.response?.data?.message || 'Rejection failed');
    }
  };
  
  const handleToggleFeature = async (product) => {
      try {
          const newStatus = !product.isFeatured;
          await updateProduct(product._id, { isFeatured: newStatus });
          
          // Update local state: if turning ON, turn off for everyone else. 
          // If turning OFF, just turn off for this one.
          const updatedProducts = products.map(p => {
              if (p._id === product._id) {
                  return { ...p, isFeatured: newStatus };
              }
              if (newStatus === true) {
                  return { ...p, isFeatured: false };
              }
              return p;
          });
          setProducts(updatedProducts);
          toast.success(newStatus ? 'Product Featured!' : 'Product Un-featured');
      } catch (err) {
          toast.error("Failed to update feature status");
      }
  };
  
  const openRejectModal = (product) => {
      setRejectingProduct(product);
  }

  const toggleCategoryExpansion = useCallback((categoryId) => {
      setExpandedCategories(prev => 
          prev.includes(categoryId) 
              ? prev.filter(id => id !== categoryId)
              : [...prev, categoryId]
      );
  }, []);

  const handleSetCategoryFeaturedProduct = useCallback(async (categoryId, productId) => {
      try {
          setUpdatingCategoryId(categoryId);
          
          // Optimistic update
          setCategories(prev => prev.map(cat => {
              if (cat._id === categoryId) {
                  const selectedProduct = products.find(p => p._id === productId);
                  return { ...cat, featuredProduct: selectedProduct || null };
              }
              return cat;
          }));
          
          await updateCategory(categoryId, { featuredProduct: productId || null });
          toast.success(productId ? 'Category Featured Image Updated!' : 'Featured Image Removed');
      } catch (err) {
          console.error(err);
          toast.error("Failed to update category featured product");
          // Revert on error
          loadFilters();
      } finally {
          setUpdatingCategoryId(null);
      }
  }, [products]);

  // Group products by category for catalog view with search filtering
  const groupedProducts = useMemo(() => {
    // Helper for safe ID comparison
    const safeId = (id) => id ? String(id) : '';

    const grouped = categories.map(category => ({
        ...category,
        products: products.filter(p => {
             const pCatId = p.category?._id || p.category; // Handle populated object or raw ID
             return safeId(pCatId) === safeId(category._id);
        })
    })).filter(cat => cat.products.length > 0);
    
    // Find products that didn't match ANY category (Uncategorized)
    const categorizedProductIds = new Set(grouped.flatMap(c => c.products.map(p => p._id)));
    const uncategorizedProducts = products.filter(p => !categorizedProductIds.has(p._id));
    
    if (uncategorizedProducts.length > 0) {
        grouped.push({
            _id: 'uncategorized',
            name: 'Uncategorized',
            products: uncategorizedProducts,
            featuredProduct: null
        });
    }

    // Apply search filter if catalog search is active
    if (catalogSearch.trim()) {
      const searchLower = catalogSearch.toLowerCase();
      return grouped
        .map(cat => ({
          ...cat,
          products: cat.products.filter(p => 
            p.name.toLowerCase().includes(searchLower) ||
            p.vendor?.storeName?.toLowerCase().includes(searchLower)
          )
        }))
        .filter(cat => 
          cat.products.length > 0 || 
          cat.name.toLowerCase().includes(searchLower)
        );
    }
    
    return grouped;
  }, [categories, products, catalogSearch]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Product Management</h1>
            <p className="text-slate-500 mt-1">Manage approvals and featured products.</p>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'pending' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
                Pending Reviews
            </button>
            <button 
                onClick={() => setActiveTab('approved')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'approved' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
                Product Catalog
            </button>
            <button 
                onClick={() => setActiveTab('catalog')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'catalog' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
                Category Catalog
            </button>
        </div>
      </div>


      {/* Filters - Hide in catalog view */}
      {activeTab !== 'catalog' && (
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">Filter By:</span>
          </div>
          <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none hover:border-indigo-300 transition-colors"
          >
              <option value="">All Categories</option>
              {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
          </select>

          <select 
              value={selectedVendor} 
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none hover:border-indigo-300 transition-colors"
          >
              <option value="">All Vendors</option>
              {vendors.map(vendor => (
                  <option key={vendor._id} value={vendor._id}>{vendor.storeName}</option>
                  
              ))}
          </select>

          {(selectedCategory || selectedVendor) && (
              <button 
                  onClick={() => { setSelectedCategory(''); setSelectedVendor(''); }}
                  className="text-sm text-red-600 hover:text-red-800 font-medium ml-auto"
              >
                  Reset Filters
              </button>
          )}
      </div>
      )}
      
      
      {loading ? (
          <div className="text-center py-20 text-slate-500">Loading...</div>
      ) : activeTab === 'catalog' ? (
        /* Category Catalog View */
        groupedProducts.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-100 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No Products Found</h3>
              <p className="text-slate-500">No approved products available in any category.</p>
          </div>
        ) : (
          <>
            {/* Search and Stats Bar */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                {/* Search */}
                <div className="flex-1 w-full md:max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search products or categories..."
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                    {catalogSearch && (
                      <button
                        onClick={() => setCatalogSearch('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">{groupedProducts.length}</span>
                    <span className="text-slate-500">Categories</span>
                  </div>
                  <div className="h-4 w-px bg-slate-300"></div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">
                      {groupedProducts.reduce((sum, cat) => sum + cat.products.length, 0)}
                    </span>
                    <span className="text-slate-500">Products</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-blue-900 mb-1">Set Category Featured Images</h4>
                  <p className="text-sm text-blue-700">
                    Click on any product's "Set as Category Image" button to use that product's image as the category thumbnail on the homepage. 
                    Click category headers to expand/collapse.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
            {groupedProducts.map((category) => (
              <div key={category._id} className="bg-white shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden border border-slate-200">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategoryExpansion(category._id)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white hover:from-slate-100 hover:to-slate-50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    {category.featuredProduct?.images?.[0]?.url ? (
                      <img 
                        src={category.featuredProduct.images[0].url} 
                        alt={category.name}
                        className="w-16 h-16 object-cover rounded-lg border-2 border-slate-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-2xl font-bold text-white">
                        {category.name.charAt(0)}
                      </div>
                    )}
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-slate-900">{category.name}</h3>
                      <p className="text-sm text-slate-500">{category.products.length} product{category.products.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedCategories.includes(category._id) ? 'rotate-180' : ''}`} />
                </button>

                {/* Category Products */}
                {expandedCategories.includes(category._id) && (
                  <div className="border-t border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                      {category.products.map((product) => (
                        <div 
                          key={product._id}
                          className={`relative group border-2 rounded-xl p-4 transition-all hover:shadow-lg ${
                            category.featuredProduct?._id === product._id 
                              ? 'border-amber-400 bg-amber-50/50' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {/* Product Image */}
                          <div className="relative mb-3">
                            {product.images?.[0]?.url ? (
                              <img 
                                src={product.images[0].url} 
                                alt={product.name}
                                className="w-full h-40 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-full h-40 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                No Image
                              </div>
                            )}
                            
                            {/* Featured Badge */}
                            {category.featuredProduct?._id === product._id && (
                              <div className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                <Star className="w-3 h-3 fill-current" />
                                Featured
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <h4 className="font-bold text-slate-900 mb-1 truncate">{product.name}</h4>
                          <p className="text-sm text-slate-500 mb-2">{product.vendor?.storeName || 'Unknown Vendor'}</p>
                          <p className="text-lg font-bold text-slate-900 mb-3">₹{product.price}</p>

                          {/* Set as Featured Button */}
                          <button
                            onClick={() => handleSetCategoryFeaturedProduct(
                              category._id, 
                              category.featuredProduct?._id === product._id ? null : product._id
                            )}
                            disabled={updatingCategoryId === category._id}
                            className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                              category.featuredProduct?._id === product._id
                                ? 'bg-amber-500 text-white hover:bg-amber-600'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            } ${updatingCategoryId === category._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {updatingCategoryId === category._id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              category.featuredProduct?._id === product._id 
                                ? 'Remove as Category Image' 
                                : 'Set as Category Image'
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          </>
        )
      ) : products.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-100 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Products Found</h3>
            <p className="text-slate-500">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden border border-slate-200">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Vendor</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {products.map((product) => (
                <React.Fragment key={product._id}>
                <tr className={`transition-colors duration-150 ${viewingProduct === product._id ? 'bg-slate-50' : 'hover:bg-slate-50/80'}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0">
                            {product.images && product.images[0] ? (
                                <img src={product.images[0].url} alt="" className="h-12 w-12 rounded-lg object-cover border border-slate-200" />
                            ) : (
                                <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs">No Img</div>
                            )}
                        </div>
                        <div className="ml-4">
                            <div className="flex items-center gap-2">
                                <div className="text-sm font-bold text-slate-900">{product.name}</div>
                                {product.isFeatured && (
                                    <span className="bg-amber-100 text-amber-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-amber-200">Featured</span>
                                )}
                            </div>
                            <div className="text-xs text-slate-500">{product.category?.name || 'Uncategorized'}</div>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900 font-medium">{product.vendor?.storeName || 'Unknown'}</div>
                    <div className="text-xs text-slate-500">ID: {product.vendor?._id?.substring(0, 6)}...</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-800">
                      ₹{product.price}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        product.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            product.status === 'pending' ? 'bg-yellow-400' :
                            product.status === 'approved' ? 'bg-green-400' :
                            'bg-gray-400'
                        }`}></span>
                        {product.status.replace(/^./, str => str.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                        {activeTab === 'approved' && (
                            <button
                                onClick={() => handleToggleFeature(product)}
                                className={`p-2 rounded-full transition-colors ${product.isFeatured ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-slate-300 hover:text-amber-500 hover:bg-amber-50'}`}
                                title={product.isFeatured ? "Remove from Featured" : "Mark as Featured"}
                            >
                                <Star className={`w-4 h-4 ${product.isFeatured ? 'fill-current' : ''}`} />
                            </button>
                        )}
                        <button 
                            onClick={() => setViewingProduct(viewingProduct === product._id ? null : product._id)}
                            className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-bold rounded-md shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                viewingProduct === product._id 
                                ? 'text-slate-700 bg-slate-200 hover:bg-slate-300 focus:ring-slate-500' 
                                : 'text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                            }`}
                        >
                            {viewingProduct === product._id ? 'Close' : (activeTab === 'pending' ? 'Review' : 'Details')}
                        </button>
                    </div>
                  </td>
                </tr>
                {viewingProduct === product._id && (
                    <ExpandedProductRow 
                        product={product} 
                        handleApprove={() => handleApprove(product._id)}
                        openRejectModal={() => openRejectModal(product)}
                        closeDetails={() => setViewingProduct(null)}
                        activeTab={activeTab} // Pass tab to know checks
                    />
                )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingProduct && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 z-[90]">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all">
                <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3 text-red-600 font-bold">!</div>
                    <h3 className="text-lg font-bold text-red-800">Reject Product Submission</h3>
                </div>
                <div className="p-6">
                    <p className="text-sm text-slate-600 mb-4">
                        You are about to reject <strong>{rejectingProduct.name}</strong>. Please provide a clear reason for the vendor so they can correct the issue.
                    </p>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Rejection Reason</label>
                    <textarea
                        className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-shadow text-sm"
                        rows="4"
                        placeholder="e.g., Image quality is too low, Inaccurate description..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                    />
                </div>
                <div className="bg-slate-50 px-6 py-4 flex justify-end space-x-3 border-t border-slate-100">
                    <button 
                        onClick={() => setRejectingProduct(null)}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleReject}
                        className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm"
                    >
                        Confirm Rejection
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for easy management of View vs Edit state
function ExpandedProductRow({ product, handleApprove, openRejectModal, closeDetails }) {
    const [isEditing, setIsEditing] = useState(false);

    // Edit Mode Container
    if (isEditing) {
        return (
            <tr>
                <td colSpan="5" className="px-0 py-0">
                    <div className="bg-slate-50 border-b border-slate-200 p-6">
                        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
                                <h3 className="text-lg font-semibold text-slate-800">Edit Product Details</h3>
                                <button 
                                    onClick={() => setIsEditing(false)} 
                                    className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center"
                                >
                                    &larr; Back to View
                                </button>
                            </div>
                            <div className="p-6">
                                <ProductForm 
                                    initialData={product} 
                                    onCancel={() => setIsEditing(false)} 
                                />
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
        );
    }

    const moderationActions = (
        <>
            <button 
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all"
            >
                Edit Details
            </button>
            
            {product.status === 'pending' && (
                <>
                    <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block"></div>
                    <button 
                        onClick={handleApprove}
                        className="px-4 py-2 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
                    >
                        Approve Product
                    </button>
                </>
            )}

            <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block"></div>
            <button 
                onClick={openRejectModal}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
            >
                {product.status === 'approved' ? 'Disable / Reject' : 'Reject'}
            </button>
        </>
    );

    // View Mode Container using new component
    return (
        <tr>
            <td colSpan="5" className="px-0 py-0">
                 <ProductDetailView 
                    product={product} 
                    actions={moderationActions} 
                    onClose={closeDetails} 
                 />
            </td>
        </tr>
    );
};


export default ProductModeration;
