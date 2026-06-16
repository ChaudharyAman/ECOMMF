import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { 
  fetchOrderById, 
  cancelOrder, 
  requestReturn 
} from '../features/orders/orderSlice';
import { 
  Package, 
  Truck, 
  MapPin, 
  CreditCard, 
  ChevronRight, 
  AlertCircle, 
  ArrowLeft,
  XCircle,
  CornerUpLeft,
  Loader2,
  Calendar,
  CheckCircle2,
  HelpCircle,
  Tag
} from 'lucide-react';

const OrderTracking = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { currentOrder: order, loading, error } = useSelector((state) => state.orders);

  // Local Action States
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReasonInput, setCancelReasonInput] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnReasonInput, setReturnReasonInput] = useState('');
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    dispatch(fetchOrderById(id));
  }, [dispatch, id]);

  const handleCancelOrderSubmit = async (e) => {
    e.preventDefault();
    if (!cancelReasonInput.trim()) {
      toast.error('Please specify a cancellation reason');
      return;
    }

    try {
      setCancelling(true);
      await dispatch(cancelOrder({ id, reason: cancelReasonInput })).unwrap();
      toast.success('Order cancelled successfully!');
      setShowCancelForm(false);
      setCancelReasonInput('');
    } catch (err) {
      toast.error(err || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleReturnOrderSubmit = async (e) => {
    e.preventDefault();
    if (!returnReasonInput.trim()) {
      toast.error('Please specify a return reason');
      return;
    }

    try {
      setReturning(true);
      await dispatch(requestReturn({ id, reason: returnReasonInput })).unwrap();
      toast.success('Return requested successfully!');
      setShowReturnForm(false);
      setReturnReasonInput('');
    } catch (err) {
      toast.error(err || 'Failed to request return');
    } finally {
      setReturning(false);
    }
  };

  if (loading && !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
        <Loader2 className="w-10 h-10 animate-spin text-stone-700 mb-4" />
        <p className="text-sm font-semibold tracking-wider text-stone-500 uppercase">Loading tracking details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-stone-50 px-4">
        <div className="w-20 h-20 bg-stone-200 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-stone-400" />
        </div>
        <h2 className="text-2xl font-serif text-stone-900 mb-4">Tracking Not Available</h2>
        <p className="text-stone-500 mb-8 text-center max-w-sm">
          {error || 'Unable to retrieve order details at this moment.'}
        </p>
        <Link to="/orders" className="px-6 py-3 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors font-semibold">
          My Orders
        </Link>
      </div>
    );
  }

  // Format Dates
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const estimatedDate = order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) : null;

  // Resolve status steps
  const statusEnum = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const currentStatusIndex = statusEnum.indexOf(order.status);

  // Group items by vendor
  const groupedItems = order.items.reduce((acc, item) => {
    const vendorId = item.vendor?._id || 'unknown';
    if (!acc[vendorId]) {
      acc[vendorId] = {
        vendor: item.vendor || { storeName: 'General Merchant', slug: '' },
        items: [],
      };
    }
    acc[vendorId].items.push(item);
    return acc;
  }, {});

  // Timeline steps config
  const steps = [
    { name: 'Order Placed', desc: 'Received and registered' },
    { name: 'Processing', desc: 'Preparing and packing' },
    { name: 'Shipped', desc: 'Sent with courier' },
    { name: 'Out for Delivery', desc: 'On the way to you' },
    { name: 'Delivered', desc: 'Received successfully' },
  ];

  // Map database status to step active index
  let activeStep = 0;
  if (order.status === 'Processing') activeStep = 1;
  else if (order.status === 'Shipped') activeStep = 2;
  else if (order.status === 'Delivered') activeStep = 4; // Completed all, including 'Out for Delivery' step 3

  return (
    <div className="min-h-screen bg-stone-50/70 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation back */}
        <Link to="/profile" className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile</span>
        </Link>

        {/* SECTION A — ORDER HEADER */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-stone-100/80 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-serif text-stone-900 font-bold">
                Order #{order._id.substring(order._id.length - 8).toUpperCase()}
              </h1>
              
              {/* Status Badge */}
              <span className={`px-3.5 py-1 text-xs font-black uppercase tracking-wider rounded-full shadow-sm ${
                order.status === 'Pending' ? 'bg-stone-100 text-stone-600 border border-stone-200' :
                order.status === 'Processing' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                order.status === 'Shipped' ? 'bg-amber-50 text-amber-600 border border-amber-200 animate-pulse' :
                order.status === 'Delivered' ? 'bg-green-50 text-green-600 border border-green-200' :
                'bg-red-50 text-red-600 border border-red-200'
              }`}>
                {order.status}
              </span>
            </div>
            
            <p className="text-sm text-stone-500 mt-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-stone-400" />
              Placed on {orderDate}
            </p>
          </div>

          {/* Tracking info if Shipped */}
          {order.trackingNumber && (
            <div className="bg-stone-50/70 border border-stone-200/60 p-4 rounded-xl flex items-start gap-3 w-full md:w-auto">
              <Truck className="w-5 h-5 text-stone-700 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-stone-900 text-sm">Courier Tracking</h4>
                <p className="text-xs text-stone-500 mt-1 uppercase font-bold tracking-wider">
                  {order.courierName || 'Partner'} &mdash; <span className="text-stone-800">{order.trackingNumber}</span>
                </p>
                {estimatedDate && (
                  <p className="text-xs text-stone-500 mt-1">
                    Est. Delivery: <span className="text-stone-850 font-semibold">{estimatedDate}</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* SECTION B — STATUS TIMELINE */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100/80 mb-10">
          <h2 className="text-xl font-serif text-stone-900 mb-8 font-bold">Delivery Status Timeline</h2>
          
          {order.status === 'Cancelled' ? (
            /* Cancelled Banner State */
            <div className="bg-red-50/40 border border-red-200/60 p-6 rounded-xl flex items-start gap-4">
              <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="text-red-950 font-serif text-lg font-bold">This order has been cancelled</h3>
                <p className="text-sm text-red-750 mt-1.5 leading-relaxed">
                  Reason: <span className="italic font-medium">"{order.cancelReason || 'No reason provided.'}"</span>
                </p>
                {order.statusHistory && order.statusHistory.length > 0 && (
                  <p className="text-[11px] text-red-500 mt-2">
                    Cancelled on {new Date(order.statusHistory[order.statusHistory.length - 1].timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Standard Responsive Timeline */
            <div className="relative">
              {/* Desktop Horizontal Timeline */}
              <div className="hidden md:flex justify-between items-start relative select-none">
                {/* Connector Line */}
                <div className="absolute top-[18px] left-[10%] right-[10%] h-0.5 bg-stone-200 -z-10" />
                <div 
                  className="absolute top-[18px] left-[10%] h-0.5 bg-stone-900 -z-10 transition-all duration-700" 
                  style={{ width: `${(activeStep / 4) * 80}%` }}
                />

                {steps.map((step, idx) => {
                  const isCompleted = activeStep >= idx;
                  const isActive = activeStep === idx;
                  return (
                    <div key={idx} className="flex flex-col items-center text-center w-[20%] px-2">
                      <span className={`w-9 h-9 rounded-full flex items-center justify-center border-2 font-bold text-sm transition-all ${
                        isCompleted 
                          ? 'bg-stone-900 border-stone-900 text-white shadow-md' 
                          : 'bg-white border-stone-200 text-stone-400'
                      } ${isActive ? 'ring-4 ring-stone-900/10 scale-105' : ''}`}>
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </span>
                      <h4 className={`text-sm font-semibold mt-3 ${isCompleted ? 'text-stone-900' : 'text-stone-400'}`}>
                        {step.name}
                      </h4>
                      <p className="text-[11px] text-stone-500 mt-1 leading-normal max-w-[130px]">
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Mobile Vertical Timeline */}
              <div className="md:hidden space-y-6 relative pl-8">
                {/* Vertical Line */}
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-stone-200 -z-10" />
                <div 
                  className="absolute left-[15px] top-2 w-0.5 bg-stone-900 -z-10 transition-all duration-700"
                  style={{ height: `${(activeStep / 4) * 92}%` }}
                />

                {steps.map((step, idx) => {
                  const isCompleted = activeStep >= idx;
                  const isActive = activeStep === idx;
                  return (
                    <div key={idx} className="relative flex gap-4 items-start">
                      <span className={`absolute -left-[30px] w-7 h-7 rounded-full flex items-center justify-center border-2 font-bold text-xs bg-white transition-all ${
                        isCompleted 
                          ? 'bg-stone-900 border-stone-900 text-white' 
                          : 'border-stone-200 text-stone-450'
                      } ${isActive ? 'ring-4 ring-stone-900/10' : ''}`}>
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </span>
                      <div>
                        <h4 className={`text-sm font-bold ${isCompleted ? 'text-stone-900' : 'text-stone-400'}`}>
                          {step.name}
                        </h4>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Split Grid Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* SECTION C — ITEMS LIST GROUPED BY VENDOR */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-stone-100/80">
              <h2 className="text-xl font-serif text-stone-900 mb-6 font-bold">Order Items Catalog</h2>
              
              <div className="space-y-8">
                {Object.keys(groupedItems).map((vendorId) => {
                  const group = groupedItems[vendorId];
                  return (
                    <div key={vendorId} className="border border-stone-100 rounded-xl overflow-hidden bg-stone-50/20 shadow-sm">
                      {/* Vendor Header */}
                      <div className="bg-stone-50 p-4 border-b border-stone-150/60 flex items-center justify-between flex-wrap gap-2 text-xs md:text-sm">
                        <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                          Sold by &mdash; 
                          {group.vendor.slug ? (
                            <Link to={`/company/${group.vendor.slug}`} className="text-stone-850 underline font-black hover:text-stone-600 transition-colors">
                              {group.vendor.storeName}
                            </Link>
                          ) : (
                            <span className="text-stone-850 font-bold">{group.vendor.storeName}</span>
                          )}
                        </span>
                      </div>

                      {/* Vendor Catalog Items */}
                      <div className="divide-y divide-stone-100 bg-white">
                        {group.items.map((item, idx) => (
                          <div key={item._id || idx} className="p-4 flex gap-4">
                            <div className="w-16 h-16 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                              {item.product?.images?.[0] ? (
                                <img
                                  src={item.product.images[0].url}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-300">
                                  <Package className="w-6 h-6" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-stone-900 truncate">
                                {item.product ? (
                                  <Link to={`/product/${item.product._id}`} className="hover:text-stone-600 transition-colors">
                                    {item.product.name}
                                  </Link>
                                ) : (
                                  'Product Deleted'
                                )}
                              </h4>
                              <p className="text-xs text-stone-500 mt-1">Qty: {item.quantity} &times; ₹{item.price.toFixed(2)}</p>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <span className="font-bold text-stone-900 text-sm">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ACTION FORMS (CONDITIONAL) */}
            {/* Cancellation Form */}
            {showCancelForm && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100/80">
                <h3 className="font-serif text-lg text-stone-900 font-bold mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-stone-700" />
                  Confirm Order Cancellation
                </h3>
                <form onSubmit={handleCancelOrderSubmit} className="space-y-4">
                  <textarea
                    placeholder="Please let us know the reason for cancelling this order..."
                    rows={4}
                    value={cancelReasonInput}
                    onChange={(e) => setCancelReasonInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-1 focus:ring-stone-900 focus:outline-none text-sm transition-all resize-none"
                    required
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      disabled={cancelling}
                      onClick={() => setShowCancelForm(false)}
                      className="px-5 py-2.5 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors text-sm font-semibold"
                    >
                      Dismiss
                    </button>
                    <button
                      type="submit"
                      disabled={cancelling}
                      className="px-6 py-2.5 bg-red-650 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-semibold flex items-center gap-2"
                    >
                      {cancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                      {cancelling ? 'Processing...' : 'Confirm Cancellation'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Returns Form */}
            {showReturnForm && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100/80">
                <h3 className="font-serif text-lg text-stone-900 font-bold mb-4 flex items-center gap-2">
                  <CornerUpLeft className="w-5 h-5 text-stone-700" />
                  Request Return / Refund
                </h3>
                <form onSubmit={handleReturnOrderSubmit} className="space-y-4">
                  <textarea
                    placeholder="Provide a detailed explanation of why you wish to return these products..."
                    rows={4}
                    value={returnReasonInput}
                    onChange={(e) => setReturnReasonInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-1 focus:ring-stone-900 focus:outline-none text-sm transition-all resize-none"
                    required
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      disabled={returning}
                      onClick={() => setShowReturnForm(false)}
                      className="px-5 py-2.5 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors text-sm font-semibold"
                    >
                      Dismiss
                    </button>
                    <button
                      type="submit"
                      disabled={returning}
                      className="px-6 py-2.5 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors text-sm font-semibold flex items-center gap-2"
                    >
                      {returning && <Loader2 className="w-4 h-4 animate-spin" />}
                      {returning ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* SIDEBAR SUMMARY & SHIPPING CARDS */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* SECTION D — ORDER SUMMARY SIDEBAR */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100/80 space-y-6">
              <h3 className="text-xl font-serif text-stone-900 font-bold border-b border-stone-100 pb-3">Billing Summary</h3>
              
              <div className="space-y-3.5 text-sm text-stone-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">₹{order.itemsPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  {order.shippingPrice === 0 ? (
                    <span className="text-green-600 font-semibold uppercase text-xs">Free</span>
                  ) : (
                    <span className="font-semibold text-stone-900">₹{order.shippingPrice.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span>Tax (GST)</span>
                  <span className="font-semibold text-stone-900">₹{order.taxPrice.toFixed(2)}</span>
                </div>
                {order.couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 fill-green-50 text-green-600" />
                      Coupon discount ({order.couponCode})
                    </span>
                    <span className="font-semibold">-₹{order.couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-stone-150 pt-4 flex justify-between font-serif text-lg text-stone-950 font-bold">
                  <span>Grand Total</span>
                  <span>₹{order.totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="border-t border-stone-100 pt-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-400 font-semibold uppercase tracking-wider">Method</span>
                  <span className="font-bold text-stone-850 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                    {order.paymentInfo?.type === 'Online' ? 'Online Payment' : 'Cash on Delivery'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-400 font-semibold uppercase tracking-wider">Gateway Status</span>
                  <span className={`font-black uppercase tracking-wider ${
                    order.paymentInfo?.status === 'paid' ? 'text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200' :
                    order.paymentInfo?.status === 'cod_pending' ? 'text-stone-600 bg-stone-150 px-2 py-0.5 rounded border border-stone-250' :
                    'text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200'
                  }`}>
                    {order.paymentInfo?.status || 'Pending'}
                  </span>
                </div>
              </div>

              {/* Conditional Action CTAs */}
              <div className="border-t border-stone-100 pt-5 space-y-3">
                {/* Cancel Order */}
                {(order.status === 'Pending' || order.status === 'Processing') && !showCancelForm && (
                  <button
                    onClick={() => {
                      setShowCancelForm(true);
                      setShowReturnForm(false);
                    }}
                    className="w-full py-3 border border-red-500 text-red-650 hover:bg-red-50 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors font-bold shadow-sm"
                  >
                    Cancel Order
                  </button>
                )}

                {/* Request Return */}
                {order.status === 'Delivered' && (!order.returnRequest || !order.returnRequest.requested) && !showReturnForm && (
                  <button
                    onClick={() => {
                      setShowReturnForm(true);
                      setShowCancelForm(false);
                    }}
                    className="w-full py-3 bg-stone-900 text-white hover:bg-stone-800 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors font-bold shadow-sm"
                  >
                    Request Return / Refund
                  </button>
                )}

                {/* Return Requested Badge */}
                {order.returnRequest && order.returnRequest.requested && (
                  <div className={`p-4 rounded-xl border flex items-start gap-2.5 text-xs ${
                    order.returnRequest.status === 'pending' ? 'bg-amber-50 border-amber-250 text-amber-900' :
                    order.returnRequest.status === 'approved' ? 'bg-green-50 border-green-250 text-green-900' :
                    'bg-red-50 border-red-250 text-red-900'
                  }`}>
                    <CornerUpLeft className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold uppercase tracking-wider">
                        Return {order.returnRequest.status}
                      </h5>
                      <p className="text-[11px] leading-relaxed mt-1 italic text-stone-600">
                        "{order.returnRequest.reason}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION E — SHIPPING ADDRESS CARD */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100/80 space-y-4">
              <h3 className="text-lg font-serif text-stone-900 font-bold border-b border-stone-100 pb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-stone-600" />
                Shipping Details
              </h3>
              
              <div className="text-sm text-stone-600 space-y-1">
                <p className="font-semibold text-stone-900">{order.shippingAddress?.phone}</p>
                <p className="leading-relaxed pt-1">
                  {order.shippingAddress?.street},<br />
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} &mdash; {order.shippingAddress?.zip},<br />
                  {order.shippingAddress?.country}
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
