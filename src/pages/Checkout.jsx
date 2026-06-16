import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { 
  MapPin, 
  CreditCard, 
  Truck, 
  ShoppingBag, 
  Plus, 
  Check, 
  ChevronRight, 
  ArrowLeft,
  Loader2 
} from 'lucide-react';

import api from '../utils/api';
import { loadUser } from '../features/auth/authSlice';
import { clearCart } from '../features/cart/cartSlice';
import { placeOrder } from '../features/orders/orderSlice';
import { createRazorpayOrder, verifyPayment, createCODOrder } from '../features/payments/paymentSlice';

// Helper to load Razorpay SDK dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Online'); // 'Online' or 'COD'
  
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [orderProcessing, setOrderProcessing] = useState(false);

  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');

  // react-hook-form for new address
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Set default address
  useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0 && !selectedAddress) {
      setSelectedAddress(user.addresses[0]);
    }
  }, [user, selectedAddress]);

  // Billing calculations
  const itemsSubtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  
  // Calculate discount if coupon is applied
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      couponDiscount = itemsSubtotal * (appliedCoupon.discountValue / 100);
      if (appliedCoupon.maxDiscount && couponDiscount > appliedCoupon.maxDiscount) {
        couponDiscount = appliedCoupon.maxDiscount;
      }
    } else if (appliedCoupon.discountType === 'flat') {
      couponDiscount = appliedCoupon.discountValue;
    }
    // Cap coupon discount at items total
    couponDiscount = Math.min(couponDiscount, itemsSubtotal);
  }

  const shippingPrice = itemsSubtotal > 500 ? 0 : 50;
  const discountedSubtotal = Math.max(0, itemsSubtotal - couponDiscount);
  const gstPrice = discountedSubtotal * 0.18;
  const grandTotal = discountedSubtotal + shippingPrice + gstPrice;

  // Handle new address form submission
  const onSubmitAddress = async (data) => {
    try {
      setAddingAddress(true);
      const res = await api.post('/users/addresses', data);
      await dispatch(loadUser()).unwrap();
      toast.success('Address added successfully!');
      
      // Auto select newly added address
      if (res.data && res.data.length > 0) {
        setSelectedAddress(res.data[res.data.length - 1]);
      }
      
      reset();
      setShowAddressForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add address');
    } finally {
      setAddingAddress(false);
    }
  };

  // Handle coupon verification
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    setValidatingCoupon(true);
    setCouponError('');
    try {
      const res = await api.get(`/coupons/validate/${couponCode.toUpperCase().trim()}?cartTotal=${itemsSubtotal}`);
      if (res.data && res.data.success) {
        setAppliedCoupon({
          code: res.data.code,
          discountType: res.data.discountType,
          discountValue: res.data.discountValue,
          discountAmount: res.data.discountAmount,
        });
        setCouponError('');
        toast.success(`Coupon ${res.data.code} applied!`);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Invalid coupon code';
      setCouponError(errMsg);
      toast.error(errMsg);
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    toast.success('Coupon removed');
  };

  // Main order placement handler
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select or add a delivery address');
      return;
    }

    setOrderProcessing(true);
    const toastId = toast.loading('Initiating your order...');

    try {
      // 1. placeOrder thunk payload
      const orderPayload = {
        orderItems: cartItems.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
          vendor: item.product.vendor
        })),
        shippingAddress: {
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zip: selectedAddress.zip,
          country: selectedAddress.country,
          phone: selectedAddress.phone,
        },
        paymentMethod: paymentMethod === 'Online' ? 'Online' : 'COD',
        itemsPrice: itemsSubtotal,
        taxPrice: gstPrice,
        shippingPrice: shippingPrice,
        totalPrice: grandTotal,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        couponDiscount: couponDiscount,
      };

      const createdOrder = await dispatch(placeOrder(orderPayload)).unwrap();

      if (paymentMethod === 'Online') {
        // ONLINE FLOW
        toast.loading('Preparing online secure gateway...', { id: toastId });
        
        // 2. createRazorpayOrder thunk
        const rzpData = await dispatch(createRazorpayOrder({ orderId: createdOrder._id })).unwrap();

        // 3. Load Razorpay script dynamically
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          toast.error('Razorpay SDK failed to load. Please check your internet connection.', { id: toastId });
          setOrderProcessing(false);
          return;
        }

        // 4. Open Razorpay Popup
        const options = {
          key: rzpData.keyId,
          amount: rzpData.amount,
          currency: rzpData.currency,
          name: 'My Store',
          description: `Order Payment for #${createdOrder._id.substring(createdOrder._id.length - 6)}`,
          order_id: rzpData.razorpayOrderId,
          handler: async (response) => {
            const verificationToastId = toast.loading('Verifying secure payment transaction...');
            try {
              const verifyPayload = {
                razorpayOrderId: rzpData.razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderId: createdOrder._id,
              };
              
              // 5. verifyPayment thunk
              await dispatch(verifyPayment(verifyPayload)).unwrap();
              dispatch(clearCart());
              toast.success('Payment verified and order placed successfully!', { id: verificationToastId });
              navigate(`/orders/${createdOrder._id}`);
            } catch (err) {
              toast.error(err || 'Payment verification failed', { id: verificationToastId });
            }
          },
          prefill: {
            name: user?.name || '',
            contact: selectedAddress.phone || '',
          },
          theme: {
            color: '#1c1917', // premium stone-900 slate theme
          },
          modal: {
            ondismiss: () => {
              toast.error('Payment popup closed. You can complete it from your profile orders tab.');
              navigate(`/profile`);
            }
          }
        };

        toast.dismiss(toastId);
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // COD FLOW
        toast.loading('Processing Cash on Delivery request...', { id: toastId });
        
        // 2. createCODOrder thunk
        await dispatch(createCODOrder({ orderId: createdOrder._id })).unwrap();
        
        dispatch(clearCart());
        toast.success('Order placed successfully via Cash on Delivery!', { id: toastId });
        navigate(`/orders/${createdOrder._id}`);
      }

    } catch (err) {
      toast.error(err || 'Failed to place order. Please try again.', { id: toastId });
    } finally {
      setOrderProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-stone-50 px-4">
        <div className="w-20 h-20 bg-stone-200 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-stone-400" />
        </div>
        <h2 className="text-2xl font-serif text-stone-900 mb-4">Your cart is empty</h2>
        <p className="text-stone-500 mb-8 text-center max-w-sm">
          Please add items to your cart before proceeding to checkout.
        </p>
        <Link 
          to="/cart" 
          className="px-6 py-3 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors font-semibold"
        >
          Go to Cart
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/70 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Link */}
        <Link to="/cart" className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </Link>

        <h1 className="text-4xl font-serif text-stone-900 mb-10 tracking-tight">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Main Checkout Columns */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* SECTION A — ADDRESS SELECTION */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100/80">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif text-stone-900 flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-stone-700" />
                  Delivery Address
                </h2>
                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-850 hover:text-stone-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Address
                  </button>
                )}
              </div>

              {/* Address Cards */}
              {user?.addresses && user.addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {user.addresses.map((address, idx) => {
                    const isSelected = selectedAddress && selectedAddress._id === address._id;
                    return (
                      <div
                        key={address._id || idx}
                        onClick={() => setSelectedAddress(address)}
                        className={`cursor-pointer p-5 rounded-xl border-2 transition-all relative ${
                          isSelected 
                            ? 'border-stone-900 bg-stone-50/40 shadow-sm' 
                            : 'border-stone-200/70 hover:border-stone-400 bg-white'
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-4 right-4 w-5 h-5 bg-stone-900 rounded-full flex items-center justify-center text-white">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                        <h4 className="font-semibold text-stone-900 mb-1">{address.name}</h4>
                        <p className="text-sm text-stone-500 mb-2">{address.phone}</p>
                        <p className="text-sm text-stone-600 leading-relaxed">
                          {address.street}, {address.city},<br />
                          {address.state} - {address.zip}, {address.country}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-stone-300 rounded-xl bg-stone-50/50 mb-6">
                  <p className="text-stone-500 text-sm">No saved delivery addresses found. Add one below to continue.</p>
                </div>
              )}

              {/* Add Address Inline Form */}
              {showAddressForm && (
                <form onSubmit={handleSubmit(onSubmitAddress)} className="mt-8 pt-8 border-t border-stone-100 space-y-6">
                  <h3 className="text-lg font-serif text-stone-800 mb-4">Add New Shipping Address</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Recipient Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        {...register('name', { required: 'Name is required' })}
                        className={`w-full px-4 py-3 rounded-lg border focus:ring-1 focus:ring-stone-900 focus:outline-none transition-all ${
                          errors.name ? 'border-red-400 focus:ring-red-400' : 'border-stone-200'
                        }`}
                      />
                      {errors.name && <span className="text-xs text-red-500 mt-1 block">{errors.name.message}</span>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Phone Number</label>
                      <input
                        type="text"
                        placeholder="10-digit mobile"
                        {...register('phone', { required: 'Phone is required' })}
                        className={`w-full px-4 py-3 rounded-lg border focus:ring-1 focus:ring-stone-900 focus:outline-none transition-all ${
                          errors.phone ? 'border-red-400 focus:ring-red-400' : 'border-stone-200'
                        }`}
                      />
                      {errors.phone && <span className="text-xs text-red-500 mt-1 block">{errors.phone.message}</span>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Street Address</label>
                    <input
                      type="text"
                      placeholder="Apartment, suite, unit, building, floor, street details"
                      {...register('street', { required: 'Street is required' })}
                      className={`w-full px-4 py-3 rounded-lg border focus:ring-1 focus:ring-stone-900 focus:outline-none transition-all ${
                        errors.street ? 'border-red-400 focus:ring-red-400' : 'border-stone-200'
                      }`}
                    />
                    {errors.street && <span className="text-xs text-red-500 mt-1 block">{errors.street.message}</span>}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">City</label>
                      <input
                        type="text"
                        placeholder="City"
                        {...register('city', { required: 'Required' })}
                        className={`w-full px-4 py-3 rounded-lg border focus:ring-1 focus:ring-stone-900 focus:outline-none transition-all ${
                          errors.city ? 'border-red-400 focus:ring-red-400' : 'border-stone-200'
                        }`}
                      />
                      {errors.city && <span className="text-xs text-red-500 mt-1 block">{errors.city.message}</span>}
                    </div>

                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">State</label>
                      <input
                        type="text"
                        placeholder="State"
                        {...register('state', { required: 'Required' })}
                        className={`w-full px-4 py-3 rounded-lg border focus:ring-1 focus:ring-stone-900 focus:outline-none transition-all ${
                          errors.state ? 'border-red-400 focus:ring-red-400' : 'border-stone-200'
                        }`}
                      />
                      {errors.state && <span className="text-xs text-red-500 mt-1 block">{errors.state.message}</span>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">ZIP / Postal Code</label>
                      <input
                        type="text"
                        placeholder="Pin"
                        {...register('zip', { required: 'Required' })}
                        className={`w-full px-4 py-3 rounded-lg border focus:ring-1 focus:ring-stone-900 focus:outline-none transition-all ${
                          errors.zip ? 'border-red-400 focus:ring-red-400' : 'border-stone-200'
                        }`}
                      />
                      {errors.zip && <span className="text-xs text-red-500 mt-1 block">{errors.zip.message}</span>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Country</label>
                      <input
                        type="text"
                        placeholder="Country"
                        {...register('country', { required: 'Required' })}
                        className={`w-full px-4 py-3 rounded-lg border focus:ring-1 focus:ring-stone-900 focus:outline-none transition-all ${
                          errors.country ? 'border-red-400 focus:ring-red-400' : 'border-stone-200'
                        }`}
                      />
                      {errors.country && <span className="text-xs text-red-500 mt-1 block">{errors.country.message}</span>}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      disabled={addingAddress}
                      onClick={() => setShowAddressForm(false)}
                      className="px-5 py-2.5 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors text-sm font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addingAddress}
                      className="px-6 py-2.5 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors text-sm font-semibold flex items-center gap-2"
                    >
                      {addingAddress && <Loader2 className="w-4 h-4 animate-spin" />}
                      {addingAddress ? 'Saving...' : 'Save & Select Address'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* SECTION C — PAYMENT METHOD */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100/80">
              <h2 className="text-2xl font-serif text-stone-900 flex items-center gap-3 mb-6">
                <CreditCard className="w-6 h-6 text-stone-700" />
                Payment Method
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pay Online */}
                <div
                  onClick={() => setPaymentMethod('Online')}
                  className={`cursor-pointer p-6 rounded-xl border-2 transition-all flex items-start gap-4 ${
                    paymentMethod === 'Online'
                      ? 'border-stone-900 bg-stone-50/40'
                      : 'border-stone-200/70 hover:border-stone-400 bg-white'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    paymentMethod === 'Online' ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300'
                  }`}>
                    {paymentMethod === 'Online' && <span className="w-2 h-2 bg-white rounded-full" />}
                  </span>
                  <div>
                    <h4 className="font-semibold text-stone-900 mb-1 flex items-center gap-2">
                      Pay Online (Razorpay)
                    </h4>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      Pay securely via Credit Cards, Debit Cards, UPI, Net Banking, or Digital Wallets.
                    </p>
                  </div>
                </div>

                {/* Cash On Delivery */}
                <div
                  onClick={() => setPaymentMethod('COD')}
                  className={`cursor-pointer p-6 rounded-xl border-2 transition-all flex items-start gap-4 ${
                    paymentMethod === 'COD'
                      ? 'border-stone-900 bg-stone-50/40'
                      : 'border-stone-200/70 hover:border-stone-400 bg-white'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    paymentMethod === 'COD' ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300'
                  }`}>
                    {paymentMethod === 'COD' && <span className="w-2 h-2 bg-white rounded-full" />}
                  </span>
                  <div>
                    <h4 className="font-semibold text-stone-900 mb-1 flex items-center gap-2">
                      Cash on Delivery (COD)
                    </h4>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      Pay cash or scan an UPI code on delivery. Simple, risk-free, and easy.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* SECTION B — ORDER SUMMARY */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100/80 sticky top-24 space-y-6">
              <h2 className="text-2xl font-serif text-stone-900 mb-4">Summary</h2>

              {/* Cart Items List */}
              <div className="divide-y divide-stone-100 max-h-[280px] overflow-y-auto pr-2 space-y-3">
                {cartItems.map((item, idx) => (
                  <div key={item.product._id || idx} className="flex gap-4 pt-3 first:pt-0">
                    <div className="w-16 h-16 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.images && item.product.images[0] ? (
                        <img
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-350 bg-stone-100">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-serif text-stone-950 truncate">{item.product.name}</h4>
                      <p className="text-xs text-stone-500 mt-1">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-stone-900 mt-1">
                        ₹{(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Application Block */}
              <div className="border-t border-stone-100 pt-4">
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Have a Coupon?</label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-lg px-3 py-2">
                    <div className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                      <span className="text-green-600 font-bold">✓</span> {appliedCoupon.code} applied
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="ENTER CODE"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg border border-stone-200 focus:ring-1 focus:ring-stone-900 focus:outline-none text-sm uppercase tracking-wide font-medium"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={validatingCoupon}
                        className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-sm font-semibold transition-colors disabled:bg-stone-400"
                      >
                        {validatingCoupon ? '...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                  </div>
                )}
              </div>

              {/* Price Details */}
              <div className="border-t border-stone-100 pt-4 space-y-3.5">
                <div className="flex justify-between text-stone-500 text-sm">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">₹{itemsSubtotal.toFixed(2)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600 text-sm font-medium">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-500 text-sm">
                  <span>Shipping</span>
                  {shippingPrice === 0 ? (
                    <span className="text-green-600 font-semibold uppercase text-xs">Free</span>
                  ) : (
                    <span className="font-semibold text-stone-900">₹{shippingPrice.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex justify-between text-stone-500 text-sm">
                  <span>GST (18%)</span>
                  <span className="font-semibold text-stone-900">₹{gstPrice.toFixed(2)}</span>
                </div>
                <div className="border-t border-stone-150 pt-4 flex justify-between font-serif text-lg text-stone-955 font-bold">
                  <span>Grand Total</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* SECTION D — PLACE ORDER BUTTON */}
              <button
                onClick={handlePlaceOrder}
                disabled={!selectedAddress || orderProcessing}
                className="w-full py-4 bg-stone-900 text-white rounded-xl font-semibold hover:bg-stone-850 transition-colors shadow-lg shadow-stone-900/10 disabled:bg-stone-300 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
              >
                {orderProcessing && <Loader2 className="w-5 h-5 animate-spin" />}
                {orderProcessing 
                  ? 'Processing Order...' 
                  : paymentMethod === 'Online' ? 'Proceed to Online Payment' : 'Confirm Order (COD)'
                }
              </button>

              <div className="text-[11px] text-stone-400 text-center leading-relaxed flex items-center justify-center gap-1.5 pt-2">
                <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                <span>Fully Secure SSL Encrypted Checkout</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;
