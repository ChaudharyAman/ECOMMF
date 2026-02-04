import React, { useState } from 'react';

const ProductDetailView = ({ product, actions = null, onClose }) => {
    const [lightboxImage, setLightboxImage] = useState(null);

    return (
        <div className="bg-slate-50 border-b border-slate-200">
            {/* Main Card Container */}
            <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden my-6">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b border-slate-100 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-1">{product.name}</h2>
                        <div className="flex items-center space-x-2 text-sm text-slate-500">
                            <span>By</span>
                            <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">{product.vendor?.storeName || 'Unknown Vendor'}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {/* Custom Actions (e.g. Approve/Reject/Edit) */}
                        {actions}

                        {/* Close Button */}
                        <button 
                            onClick={onClose} 
                            className="ml-2 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
                            title="Close Details"
                        >
                            <span className="text-xl leading-none">&times; close</span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row">
                    {/* Visuals Column */}
                    <div className="w-full lg:w-1/3 p-6 border-b lg:border-b-0 lg:border-r border-slate-100 bg-slate-50/50">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Product Visuals</h4>
                        {product.images?.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3">
                                <div 
                                    className="col-span-2 relative group cursor-zoom-in rounded-lg overflow-hidden border border-slate-200 shadow-sm aspect-video bg-white"
                                    onClick={() => setLightboxImage(product.images[0].url)}
                                >
                                    <img src={product.images[0].url} className="w-full h-full object-contain" alt="Main Product" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                        <span className="opacity-0 group-hover:opacity-100 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm transform translate-y-2 group-hover:translate-y-0 transition-all">
                                            View Fullscreen
                                        </span>
                                    </div>
                                </div>
                                {product.images.slice(1).map((img, idx) => (
                                    <div 
                                        key={idx} 
                                        className="relative group cursor-zoom-in rounded-lg overflow-hidden border border-slate-200 shadow-sm aspect-square bg-white"
                                        onClick={() => setLightboxImage(img.url)}
                                    >
                                        <img src={img.url} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 text-slate-400">
                                <span className="text-4xl mb-2">📷</span>
                                <span className="text-sm">No images provided</span>
                            </div>
                        )}
                    </div>

                    {/* Specifications Column */}
                    <div className="w-full lg:w-2/3 p-6 space-y-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Category</span>
                                <span className="font-medium text-slate-800 block truncate" title={product.category?.name}>{product.category?.name || 'Uncategorized'}</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Price</span>
                                <span className="font-bold text-green-600 block">₹{product.price?.toLocaleString()}</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Inventory</span>
                                <span className={`font-medium block ${product.stock > 0 ? 'text-slate-800' : 'text-red-500'}`}>
                                    {product.stock > 0 ? `${product.stock} units` : 'Out of Stock'}
                                </span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Status</span>
                                <span className={`font-medium block px-2 py-0.5 rounded text-xs w-fit ${
                                    product.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                    product.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-slate-200 text-slate-800'
                                }`}>
                                    {product.status ? product.status.toUpperCase() : 'UNKNOWN'}
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Product Description</h4>
                            <div className="prose prose-sm prose-slate max-w-none bg-slate-50 p-5 rounded-xl border border-slate-100 text-slate-600 leading-relaxed shadow-sm">
                                {product.description || <em className="text-slate-400">No description provided.</em>}
                            </div>
                        </div>

                        {/* Attributes if any */}
                        {product.attributes && product.attributes.length > 0 && (
                             <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Additional Attributes</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {product.attributes.map((attr, idx) => (
                                        <div key={idx} className="flex justify-between border-b border-dashed border-slate-200 py-1">
                                            <span className="text-slate-500 text-sm">{attr.key}</span>
                                            <span className="text-slate-800 font-medium text-sm">{attr.value}</span>
                                        </div>
                                    ))}
                                </div>
                             </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Lightbox Modal */}
            {lightboxImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 transition-all" onClick={() => setLightboxImage(null)}>
                    <div className="relative max-w-7xl w-full h-full flex items-center justify-center">
                        <img src={lightboxImage} alt="Full View" className="max-w-full max-h-[90vh] object-contain rounded-sm shadow-2xl" />
                        <button 
                            className="absolute top-4 right-4 text-white/70 hover:text-white text-5xl font-light transition-colors"
                            onClick={(e) => { e.stopPropagation(); setLightboxImage(null); }}
                        >
                            &times;
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetailView;
