import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, clearProducts } from '../features/products/productSlice';
import { Search as SearchIcon, ArrowLeft, LayoutGrid } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const dispatch = useDispatch();
    const { products, loading } = useSelector((state) => state.products);
    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        dispatch(clearProducts());
        if (query.trim()) {
            dispatch(fetchProducts(query));
        } else {
            dispatch(fetchProducts());
        }
    }, [dispatch, query]);

    // We strictly rely on the backend to filter products via 'fetchProducts'.
    // The 'products' array from redux already contains the search results.
    useEffect(() => {
        if (products) {
            setFilteredProducts(products);
        }
    }, [products]);

    if (loading && products.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-stone-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-stone-600">Searching...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <Link to="/" className="inline-flex items-center gap-2 text-stone-300 hover:text-white transition-colors text-sm font-medium mb-6">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>

                    <div className="max-w-3xl">
                        <div className="flex items-center gap-3 mb-4">
                            <SearchIcon className="w-8 h-8 text-stone-400" />
                            <h1 className="text-4xl md:text-5xl font-serif leading-tight">
                                Search Results
                            </h1>
                        </div>
                        {query && (
                            <p className="text-lg text-stone-300">
                                Showing results for <span className="font-semibold text-white">"{query}"</span>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {!query.trim() ? (
                    <div className="text-center py-20">
                        <SearchIcon className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-serif text-stone-900 mb-2">Start Searching</h2>
                        <p className="text-stone-500">Enter a search term to find products</p>
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <>
                        <div className="mb-8">
                            <p className="text-stone-600">
                                Found <span className="font-bold text-stone-900">{filteredProducts.length}</span> {filteredProducts.length === 1 ? 'product' : 'products'}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredProducts.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl border border-stone-200">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <LayoutGrid className="w-8 h-8 text-stone-400" />
                            </div>
                            <h3 className="text-xl font-serif text-stone-900 mb-2">No Results Found</h3>
                            <p className="text-stone-500 mb-6">
                                We couldn't find any products matching "<span className="font-semibold">{query}</span>"
                            </p>
                            <p className="text-sm text-stone-400 mb-6">
                                Try different keywords or browse our categories
                            </p>
                            <Link
                                to="/categories"
                                className="inline-block px-6 py-2.5 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors font-medium text-sm"
                            >
                                Browse Categories
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResults;
