import { Link } from 'react-router-dom';
import { ShoppingBag, Eye } from 'lucide-react';

const ProductCard = ({ product }) => {
    return (
        <div className="group cursor-pointer">
            <div className="relative aspect-[4/5] bg-stone-100 overflow-hidden mb-4 rounded-lg">
                {/* Image */}
                {product.images?.[0] ? (
                    <img 
                        src={product.images[0].url} 
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300 bg-stone-50">
                        <ShoppingBag className="w-8 h-8 opacity-20" />
                    </div>
                )}
                
                {/* Stock Badge */}
                {product.stock === 0 && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 text-xs font-bold rounded-full">
                        SOLD OUT
                    </div>
                )}

                {/* View Details Button (Appears on hover) */}
                <Link 
                    to={`/product/${product._id}`}
                    className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm text-stone-900 py-3 text-sm font-semibold rounded-lg translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-stone-900 hover:text-white flex items-center justify-center gap-2 shadow-lg"
                >
                    <Eye className="w-4 h-4" />
                    View Details
                </Link>
            </div>
            
            <div className="flex justify-between items-start">
                <div>
                    {product.category && (
                        <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">
                            {typeof product.category === 'object' ? product.category.name : 'Category'}
                        </p>
                    )}
                    <h3 className="text-stone-900 font-medium leading-tight group-hover:text-stone-600 transition-colors">
                        {product.name}
                    </h3>
                </div>
                <span className="text-stone-900 font-serif">₹{product.price?.toLocaleString()}</span>
            </div>
        </div>
    );
};

export default ProductCard;
