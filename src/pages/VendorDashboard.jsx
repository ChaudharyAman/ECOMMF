import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteProduct } from '../features/products/productSlice'; // Keep delete from slice if possible, or move to API
import { getMyProducts, submitProductForReview } from '../api/vendorApi';
import ProductForm from '../components/ProductForm';
import { Eye, Pencil, Trash2, Send, Store } from 'lucide-react';
import ProductDetailView from '../components/ProductDetailView';
import { toast } from 'react-hot-toast';

const VendorDashboard = () => {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [viewingProduct, setViewingProduct] = useState(null);

  const loadVendorProducts = async () => {
      try {
          setLoading(true);
          const data = await getMyProducts();
          setProducts(data);
          setLoading(false);
      } catch (err) {
          toast.error('Failed to load products');
          setLoading(false);
      }
  };

  useEffect(() => {
    loadVendorProducts();
  }, []);

  const handleDelete = async (id) => {
      if (window.confirm('Are you sure you want to delete this product?')) {
          await dispatch(deleteProduct(id)); 
          loadVendorProducts(); // Reload
      }
  };

  const handleSubmit = async (id) => {
      if (window.confirm('Submit this product for Admin review?')) {
          try {
              await submitProductForReview(id);
              toast.success('Product submitted successfully');
              loadVendorProducts();
          } catch(err) {
              toast.error(err.response?.data?.message || 'Submission failed');
          }
      }
  };

  const handleEdit = (product) => {
      setEditingProduct(product);
      setShowForm(true);
  };
  
  const handleView = (product) => {
      setViewingProduct(product);
  };

  const handleAddNew = () => {
      setEditingProduct(null);
      setShowForm(true);
  }

  const handleFormClose = () => {
      setShowForm(false);
      setEditingProduct(null);
      loadVendorProducts();
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-6 lg:px-12 font-sans text-stone-800">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-stone-200 pb-6">
            <div>
                <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mb-2">Vendor Dashboard</h2>
                <p className="text-stone-500">Manage your collection and track product status.</p>
            </div>
            <button
                onClick={handleAddNew}
                className="bg-stone-900 text-white px-6 py-3 rounded-full font-medium hover:bg-stone-700 transition-transform active:scale-95 shadow-lg shadow-stone-200"
            >
                + Add New Product
            </button>
        </div>

        {showForm && (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-stone-100 animate-in fade-in slide-in-from-top-4">
                <h3 className="text-xl font-serif mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <ProductForm onCancel={handleFormClose} initialData={editingProduct} />
            </div>
        )}

        {/* View Modal */}
        {viewingProduct && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <ProductDetailView 
                            product={viewingProduct} 
                            onClose={() => setViewingProduct(null)} 
                        />
                </div>
            </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                <h3 className="text-lg font-bold text-stone-700">My Products</h3>
                <span className="text-xs font-medium text-stone-400 uppercase tracking-widest">{products.length} Items</span>
            </div>
            
            {loading && !showForm ? (
                <div className="p-12 text-center text-stone-400">Loading your collection...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-stone-100 text-xs font-bold text-stone-400 uppercase tracking-wider">
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50">
                            {products.map((product) => (
                                <tr key={product._id} className="hover:bg-stone-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-16 w-16 bg-stone-100 rounded-lg overflow-hidden shrink-0 border border-stone-100">
                                                <img 
                                                    src={product.images?.[0]?.url || 'https://via.placeholder.com/150'} 
                                                    alt={product.name} 
                                                    className="h-full w-full object-cover" 
                                                />
                                            </div>
                                            <div>
                                                <div className="font-serif text-lg text-stone-900 font-medium group-hover:text-stone-600 transition-colors">
                                                    {product.name}
                                                </div>
                                                <div className="text-xs text-stone-500 mt-1">
                                                    Stock: <span className="font-medium">{product.stock}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-stone-600">
                                        ₹{product.price?.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border 
                                            ${product.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' : 
                                            product.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                                            'bg-stone-100 text-stone-600 border-stone-200'}`}>
                                            {product.status || 'DRAFT'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            {product.status === 'draft' && (
                                                <button 
                                                    onClick={() => handleSubmit(product._id)} 
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors tooltip" 
                                                    title="Submit for Review"
                                                >
                                                    <Send className="h-4 w-4" />
                                                </button>
                                            )}
                                            
                                            <button 
                                                onClick={() => handleView(product)} 
                                                className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors" 
                                                title="View Details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>

                                            <button 
                                                onClick={() => {
                                                    if (product.status === 'pending' || product.status === 'approved') {
                                                        toast.error('Cannot edit products that are submitted or approved');
                                                        return;
                                                    }
                                                    handleEdit(product);
                                                }} 
                                                disabled={product.status === 'pending' || product.status === 'approved'}
                                                className={`p-2 rounded-full transition-colors ${
                                                    (product.status === 'pending' || product.status === 'approved') 
                                                    ? 'text-stone-300 cursor-not-allowed' 
                                                    : 'text-stone-500 hover:text-indigo-600 hover:bg-indigo-50'
                                                }`}
                                                title={(product.status === 'pending' || product.status === 'approved') ? "Cannot edit submitted products" : "Edit Product"}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            
                                            <button 
                                                onClick={() => handleDelete(product._id)} 
                                                className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-stone-400">
                                            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                                                <Store className="w-8 h-8 opacity-20" />
                                            </div>
                                            <p className="text-lg font-serif text-stone-600 mb-2">No products yet</p>
                                            <p className="text-sm">Start building your collection by adding a product.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
