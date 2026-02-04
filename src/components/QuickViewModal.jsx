import React from 'react';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const QuickViewModal = ({ product, onClose }) => {
    if (!product) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row max-h-[90vh]">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full text-stone-500 hover:text-stone-900 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Image Section */}
                <div className="w-full md:w-1/2 bg-stone-100 aspect-square md:aspect-auto relative overflow-hidden">
                    {product.images?.[0] ? (
                        <img 
                            src={product.images[0].url} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                            <ShoppingBag className="w-16 h-16 opacity-20" />
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col overflow-y-auto">
                    <div className="mb-auto">
                        {product.category && (
                            <span className="text-xs font-bold tracking-[0.2em] text-stone-500 uppercase mb-3 block">
                                {typeof product.category === 'object' ? product.category.name : 'Category'}
                            </span>
                        )}
                        <h2 className="text-3xl font-serif text-stone-900 mb-4 leading-tight">{product.name}</h2>
                        <p className="text-2xl font-medium text-stone-900 mb-6">₹{product.price?.toLocaleString()}</p>
                        
                        <div className="prose prose-stone prose-sm text-stone-600 mb-8">
                            <p>{product.description || "No description available for this curated item."}</p>
                        </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-stone-100 mt-6">
                         <div className="flex gap-4">
                            <button className="flex-1 bg-stone-900 text-white px-6 py-3.5 rounded-full font-bold uppercase tracking-wider text-xs hover:bg-stone-800 transition-colors">
                                Add to Cart
                            </button>
                             <button className="w-12 h-12 flex items-center justify-center border border-stone-200 rounded-full text-stone-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors">
                                <span className="sr-only">Wishlist</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                            </button>
                         </div>
                         <Link 
                            to={`/product/${product._id}`}
                            className="flex items-center justify-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors py-2"
                        >
                            View Full Details <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickViewModal;
