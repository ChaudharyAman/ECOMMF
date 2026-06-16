import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyOrders } from '../features/orders/orderSlice';
import { 
  ShoppingBag, 
  ChevronRight, 
  Calendar, 
  Package, 
  ArrowLeft,
  ArrowRight,
  Loader2,
  DollarSign
} from 'lucide-react';

const MyOrders = () => {
  const dispatch = useDispatch();

  // Redux State
  const { 
    orders, 
    currentPage, 
    totalPages, 
    totalOrders, 
    loading, 
    error 
  } = useSelector((state) => state.orders);

  // Tab Filtering & Local Page State
  const [activeTab, setActiveTab] = useState('All');

  const tabs = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  useEffect(() => {
    // Fetch orders when tab changes
    dispatch(fetchMyOrders({ page: 1, limit: 10, status: activeTab }));
  }, [dispatch, activeTab]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    dispatch(fetchMyOrders({ page: newPage, limit: 10, status: activeTab }));
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-stone-100 text-stone-600 border border-stone-200';
      case 'Processing':
        return 'bg-blue-50 text-blue-600 border border-blue-200';
      case 'Shipped':
        return 'bg-amber-50 text-amber-600 border border-amber-200';
      case 'Delivered':
        return 'bg-green-50 text-green-600 border border-green-200';
      case 'Cancelled':
        return 'bg-red-50 text-red-600 border border-red-200';
      default:
        return 'bg-stone-50 text-stone-500 border border-stone-200';
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/70 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-serif text-stone-900 mb-10 tracking-tight font-bold">My Orders</h1>

        {/* Tab Selection */}
        <div className="flex border-b border-stone-200 overflow-x-auto gap-6 mb-8 no-scrollbar scroll-smooth">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-xs md:text-sm font-semibold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? 'border-stone-900 text-stone-950 font-black' 
                  : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Page Loaders & Catalogs */}
        {loading ? (
          /* Skeletons Loader */
          <div className="space-y-6 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-5 bg-stone-200 rounded w-1/4"></div>
                  <div className="h-6 bg-stone-200 rounded-full w-20"></div>
                </div>
                <div className="h-10 bg-stone-150 rounded w-full"></div>
                <div className="h-6 bg-stone-100 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white border border-stone-100 rounded-2xl shadow-sm text-stone-500">
            <p className="font-serif italic text-lg text-red-500 mb-2">Error loading orders</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-6">
            {/* Orders Cards Grid */}
            {orders.map((order) => {
              const orderNum = order._id.substring(order._id.length - 8).toUpperCase();
              const dateText = new Date(order.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              });
              const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

              return (
                <div 
                  key={order._id}
                  className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-stone-100/80 hover:shadow-md transition-all flex flex-col md:flex-row justify-between gap-6"
                >
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-serif text-lg md:text-xl text-stone-900 font-bold">
                        Order #{orderNum}
                      </h3>
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-stone-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-stone-400" />
                        {dateText}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-stone-400" />
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                      </span>
                      <span className="flex items-center gap-1.5 font-bold text-stone-850">
                        <DollarSign className="w-4 h-4 text-stone-450" />
                        ₹{order.totalPrice.toFixed(2)}
                      </span>
                    </div>

                    {/* Small Images Row fallback */}
                    <div className="flex gap-2 overflow-x-auto py-1">
                      {order.items.slice(0, 4).map((item, idx) => (
                        <div key={idx} className="w-12 h-12 bg-stone-100 rounded-lg overflow-hidden border border-stone-100 flex-shrink-0">
                          {item.product?.images?.[0] ? (
                            <img
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-300">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="w-12 h-12 bg-stone-50 border border-stone-200/60 rounded-lg flex items-center justify-center text-xs font-bold text-stone-450 flex-shrink-0">
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex md:flex-col justify-end items-end gap-3.5 flex-shrink-0 border-t md:border-t-0 border-stone-100 pt-4 md:pt-0">
                    <Link
                      to={`/orders/${order._id}`}
                      className="px-5 py-2.5 bg-stone-900 hover:bg-stone-850 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center gap-1.5 font-semibold"
                    >
                      View Details
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center pt-8 border-t border-stone-100 text-xs md:text-sm">
                <button
                  disabled={currentPage === 1 || loading}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="px-4 py-2 border border-stone-250 hover:bg-stone-50 text-stone-800 font-semibold rounded-lg flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4" /> Previous
                </button>
                
                <span className="text-stone-500 font-medium">
                  Page <span className="font-bold text-stone-850">{currentPage}</span> of <span className="font-semibold text-stone-800">{totalPages}</span>
                </span>

                <button
                  disabled={currentPage === totalPages || loading}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="px-4 py-2 border border-stone-250 hover:bg-stone-50 text-stone-800 font-semibold rounded-lg flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Empty catalog state */
          <div className="text-center py-20 bg-white border border-stone-100 rounded-2xl shadow-sm space-y-6">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag className="w-9 h-9 text-stone-400" />
            </div>
            <div>
              <h3 className="text-2xl font-serif text-stone-900 font-bold mb-2">No orders found</h3>
              <p className="text-stone-500 text-sm max-w-sm mx-auto leading-relaxed">
                {activeTab === 'All' 
                  ? "You haven't placed any orders yet. Visit our shop and grab something beautiful!"
                  : `You don't have any orders currently marked as ${activeTab}.`
                }
              </p>
            </div>
            <Link to="/" className="inline-block px-6 py-3 bg-stone-900 hover:bg-stone-850 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
