import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingCart, Heart, ArrowRight } from 'lucide-react';
import { removeFromWishlist } from '../features/wishlist/wishlistSlice';
import { addToCart } from '../features/cart/cartSlice';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const dispatch = useDispatch();
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  const handleRemoveFromWishlist = (productId, productName) => {
    dispatch(removeFromWishlist(productId));
    toast.success(`${productName} removed from wishlist`);
  };

  const handleMoveToCart = (product) => {
      dispatch(addToCart({ product, quantity: 1 }));
      dispatch(removeFromWishlist(product._id));
      toast.success(`${product.name} moved to cart!`);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-stone-50 px-4">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <Heart className="w-12 h-12 text-red-300" />
        </div>
        <h2 className="text-3xl font-serif text-stone-900 mb-4">Your wishlist is empty</h2>
        <p className="text-stone-500 mb-8 text-center max-w-md">
          Save items you love here to buy them later. Explore our collection to verify your style.
        </p>
        <Link 
          to="/" 
          className="px-8 py-4 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors font-semibold flex items-center gap-2"
        >
          Start Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-serif text-stone-900 mb-8">My Wishlist ({wishlistItems.length})</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <div key={product._id} className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden group hover:shadow-md transition-shadow">
                <div className="relative aspect-[4/5] bg-stone-200 overflow-hidden">
                    {product.images && product.images[0] ? (
                        <img 
                            src={product.images[0].url} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400">
                            <Heart className="w-12 h-12 opacity-20" />
                        </div>
                    )}
                    
                    <button 
                        onClick={() => handleRemoveFromWishlist(product._id, product.name)}
                        className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-white transition-all shadow-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                        title="Remove from wishlist"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-4">
                    <div className="mb-2">
                         <div className="text-xs text-stone-500 mb-1">{product.category?.name || 'General'}</div>
                        <Link to={`/product/${product._id}`} className="font-medium text-stone-900 line-clamp-1 hover:text-stone-600 transition-colors">
                            {product.name}
                        </Link>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                        <span className="font-bold text-stone-900">₹{product.price.toLocaleString()}</span>
                        
                        <button 
                            onClick={() => handleMoveToCart(product)}
                            className="p-2 bg-stone-900 text-white rounded-lg hover:bg-stone-700 transition-colors flex items-center gap-2 text-xs font-semibold px-3"
                        >
                            <ShoppingCart className="w-3 h-3" /> Move to Cart
                        </button>
                    </div>
                </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
