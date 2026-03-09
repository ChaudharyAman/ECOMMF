import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, clearProducts } from '../features/products/productSlice';
import { Loader2 } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const Products = () => {
    const dispatch = useDispatch();
    const { products, loading } = useSelector((state) => state.products);

    useEffect(() => {
        dispatch(clearProducts());
        dispatch(fetchProducts());
    }, [dispatch]);

    if (loading && products.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 py-12 px-6 lg:px-12 font-sans text-stone-800">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-xs font-bold tracking-[0.2em] text-stone-500 uppercase mb-3 block">Shop All</span>
                    <h1 className="text-4xl md:text-5xl font-serif text-stone-900 mb-6">Our Complete Collection</h1>
                    <p className="text-lg text-stone-600 max-w-2xl mx-auto">
                        Browse our full range of curated items, designed to bring joy and elegance to your life.
                    </p>
                </div>

                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                        {products.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-stone-400">
                        <p className="font-serif italic text-xl">No products found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
