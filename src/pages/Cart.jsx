import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { removeFromCart, updateQuantity, clearCart } from '../features/cart/cartSlice';
import toast from 'react-hot-toast';

const Cart = () => {
  const dispatch = useDispatch();
  const { items: cartItems } = useSelector((state) => state.cart);

  const totalAmount = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    dispatch(updateQuantity({ productId, quantity: newQuantity }));
  };

  const handleRemoveItem = (productId, productName) => {
    dispatch(removeFromCart(productId));
    toast.success(`${productName} removed from cart`);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-stone-50 px-4">
        <div className="w-24 h-24 bg-stone-200 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-stone-400" />
        </div>
        <h2 className="text-3xl font-serif text-stone-900 mb-4">Your cart is empty</h2>
        <p className="text-stone-500 mb-8 text-center max-w-md">
          Looks like you haven't added anything to your cart yet. Explore our collection to find something special.
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
        <h1 className="text-3xl font-serif text-stone-900 mb-8">Shopping Cart ({cartItems.length} items)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div key={item.product._id} className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 flex gap-6">
                {/* Product Image */}
                <div className="w-24 h-24 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                   {item.product.images && item.product.images[0] ? (
                      <img 
                        src={item.product.images[0].url} 
                        alt={item.product.name} 
                        className="w-full h-full object-cover"
                      />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                   )}
                </div>

                {/* Product Details */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <Link to={`/product/${item.product._id}`} className="font-serif text-lg text-stone-900 hover:text-stone-600 transition-colors">
                      {item.product.name}
                    </Link>
                    <button 
                      onClick={() => handleRemoveItem(item.product._id, item.product.name)}
                      className="text-stone-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="text-sm text-stone-500 mb-4">
                    {item.product.category?.name || 'General'}
                  </div>

                  <div className="flex justify-between items-end">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-stone-200 rounded-lg">
                      <button 
                        onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                        className="p-2 hover:bg-stone-50 text-stone-600 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-medium text-stone-900">{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                        className="p-2 hover:bg-stone-50 text-stone-600 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <div className="font-bold text-lg text-stone-900">
                        ₹{(item.product.price * item.quantity).toLocaleString()}
                      </div>
                      {item.quantity > 1 && (
                        <div className="text-xs text-stone-500">
                           ₹{item.product.price.toLocaleString()} each
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 sticky top-24">
              <h2 className="text-xl font-serif text-stone-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="border-t border-stone-200 pt-4 flex justify-between font-bold text-lg text-stone-900">
                  <span>Total</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <button className="w-full py-4 bg-stone-900 text-white rounded-lg font-semibold hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/10">
                Proceed to Checkout
              </button>
              
              <div className="mt-6 text-xs text-stone-500 text-center">
                Secure Checkout • Free Returns • 100% Authentic
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
