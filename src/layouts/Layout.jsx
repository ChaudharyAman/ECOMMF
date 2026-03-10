import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { fetchProducts } from '../features/products/productSlice';
import { Search, ShoppingBag, Menu, User, LogOut, LayoutDashboard, Store, X, Heart } from 'lucide-react';

const Layout = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { items: cartItems } = useSelector(state => state.cart);
    const { items: wishlistItems } = useSelector(state => state.wishlist);


    const [isScrolled, setIsScrolled] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    const isHomePage = location.pathname === '/';

    // Scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Scroll to top on every route change
    useEffect(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, [location.pathname]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Products for search suggestions
    const { products } = useSelector((state) => state.products);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);

    // Fetch products for global search if not loaded
    useEffect(() => {
        if (products.length === 0) {
            dispatch(fetchProducts());
        }
    }, [dispatch, products.length]);

    // Filter suggestions
    useEffect(() => {
        if (searchTerm.trim()) {
            const queryWords = searchTerm.toLowerCase().split(/\s+/).filter(w => w);
            const filtered = products.filter(product => {
                const productName = product.name.toLowerCase();
                const categoryName = (product.category?.name || '').toLowerCase();
                // Match if ALL query words are present in either name OR category
                return queryWords.every(word => productName.includes(word) || categoryName.includes(word));
            }).slice(0, 5);
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    }, [searchTerm, products]);

    // Handle click outside for search suggestions
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
            setShowSuggestions(false);
            setIsMobileMenuOpen(false);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        setIsProfileOpen(false);
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col font-sans text-stone-800 bg-stone-50 selection:bg-stone-900 selection:text-white">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-md shadow-sm py-4">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-4">

                    {/* Logo */}
                    <Link to="/" className="text-2xl font-serif font-bold tracking-tighter text-stone-900 shrink-0 z-50">
                        Gifter.
                    </Link>

                    {/* Search Bar (Desktop) */}
                    <div ref={searchRef} className="hidden md:flex flex-1 max-w-md mx-auto relative group flex-col">
                        <form onSubmit={handleSearch} className="relative w-full z-50">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => { if (searchTerm) setShowSuggestions(true); }}
                                placeholder="Find something special..."
                                className="w-full bg-stone-100 border border-transparent rounded-full py-2.5 pl-5 pr-12 text-sm outline-none transition-all duration-300 focus:bg-white focus:border-stone-200 placeholder:text-stone-400 z-50 relative"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors z-50"
                            >
                                <Search className="w-4 h-4" />
                            </button>
                        </form>

                        {/* Search Suggestions Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-stone-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-40">
                                <div className="py-2">
                                    {suggestions.map((product) => (
                                        <Link
                                            key={product._id}
                                            to={`/product/${product._id}`}
                                            onClick={() => {
                                                setShowSuggestions(false);
                                                setSearchTerm('');
                                            }}
                                            className="flex items-center gap-4 px-4 py-3 hover:bg-stone-50 transition-colors group"
                                        >
                                            <div className="w-12 h-12 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                                                {product.images?.[0] ? (
                                                    <img
                                                        src={product.images[0].url}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                                                        <ShoppingBag className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-stone-900 truncate group-hover:text-stone-600">
                                                    {product.name}
                                                </h4>
                                                <p className="text-xs text-stone-500 truncate">
                                                    {product.category?.name || 'Product'}
                                                </p>
                                            </div>
                                            <span className="text-sm font-semibold text-stone-900 whitespace-nowrap">
                                                ₹{product.price?.toLocaleString()}
                                            </span>
                                        </Link>
                                    ))}
                                    <Link
                                        to={`/search?q=${encodeURIComponent(searchTerm)}`}
                                        onClick={() => setShowSuggestions(false)}
                                        className="block px-4 py-2.5 text-xs font-bold text-center text-stone-500 hover:text-stone-900 border-t border-stone-100 bg-stone-50 hover:bg-stone-100 transition-colors"
                                    >
                                        View all results for "{searchTerm}"
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-6 shrink-0">
                        {/* Desktop Nav Links */}
                        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-stone-600 transition-colors">
                            <Link to="/" className="hover:text-stone-900">Home</Link>
                            <Link to="/products" className="hover:text-stone-900">Shop</Link>
                            <Link to="/categories" className="hover:text-stone-900">Categories</Link>
                        </nav>

                        <div className="flex items-center gap-4">
                            {/* Wishlist */}
                            <Link to="/wishlist" className="relative p-2 text-stone-800 hover:text-stone-600 transition-colors">
                                <Heart className="w-5 h-5" />
                                {wishlistItems.length > 0 && (
                                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                                        {wishlistItems.length}
                                    </span>
                                )}
                            </Link>

                            {/* Cart */}
                            <Link to="/cart" className="relative p-2 text-stone-800 hover:text-stone-600 transition-colors">
                                <ShoppingBag className="w-5 h-5" />
                                {cartItems.length > 0 && (
                                    <span className="absolute top-0 right-0 w-4 h-4 bg-stone-900 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                                        {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                                    </span>
                                )}
                            </Link>

                            {/* Profile Dropdown */}
                            {user ? (
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center gap-2 p-1 pl-2 pr-1 rounded-full border border-stone-200 bg-white hover:border-stone-300 transition-all focus:outline-none"
                                    >
                                        <span className="text-xs font-bold text-stone-600 pl-1 hidden sm:block truncate max-w-[80px]">
                                            {user.name?.split(' ')[0] || 'User'}
                                        </span>
                                        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                                            <User className="w-4 h-4" />
                                        </div>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isProfileOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                                            <div className="px-4 py-3 border-b border-stone-50 bg-stone-50/50">
                                                <p className="text-sm font-bold text-stone-900 truncate">{user.name}</p>
                                                <p className="text-xs text-stone-500 truncate">{user.email}</p>
                                            </div>

                                            <div className="py-1">
                                                <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors">
                                                    <User className="w-4 h-4" /> My Profile
                                                </Link>

                                                {user.role === 'vendor' && (
                                                    <Link to="/vendor" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors">
                                                        <Store className="w-4 h-4" /> Vendor Dashboard
                                                    </Link>
                                                )}

                                                {user.role === 'admin' && (
                                                    <Link to="/admin" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors">
                                                        <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                                                    </Link>
                                                )}
                                            </div>

                                            <div className="border-t border-stone-50 mt-1 pt-1">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                                                >
                                                    <LogOut className="w-4 h-4" /> Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link to="/login" className="text-sm font-bold text-stone-900 hover:text-stone-600 transition-colors">
                                    Login
                                </Link>
                            )}

                            {/* Mobile Menu Toggle */}
                            <button
                                className="md:hidden text-stone-800"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu (Simple implementation) */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-stone-100 shadow-lg p-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search..."
                                className="w-full bg-stone-100 border-none rounded-lg p-3 pr-10 text-sm"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-900"
                            >
                                <Search className="w-4 h-4" />
                            </button>
                        </form>
                        <nav className="flex flex-col gap-3 font-medium text-stone-600">
                            <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                            <Link to="/products" onClick={() => setIsMobileMenuOpen(false)}>Shop All</Link>
                        </nav>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className={`flex-1 w-full ${!isHomePage ? 'pt-16' : ''}`}>
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-stone-900 text-stone-400 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-sm">&copy; {new Date().getFullYear()} Gifter. All rights reserved.</p>
                    <div className="flex gap-6 text-sm">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
