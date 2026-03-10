import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchProductsByCategory, fetchProductById } from '../features/products/productSlice';
import { addToCart } from '../features/cart/cartSlice';
import { toggleWishlist } from '../features/wishlist/wishlistSlice';
import { ArrowLeft, ShoppingCart, Heart, Share2, Package, Truck, ShieldCheck, RefreshCw, Star, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { products, relatedProducts, loading } = useSelector((state) => state.products);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  
  // Find product in products or relatedProducts to avoid flashing "Not Found" while fetching
  const product = products.find(p => p._id === id) || relatedProducts.find(p => p._id === id);

  const isInWishlist = product ? wishlistItems.some(item => item._id === product._id) : false;

  const { items: cartItems } = useSelector((state) => state.cart);
  const isInCart = product ? cartItems.some(item => item.product._id === product._id) : false;

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Scroll to top whenever navigating to a new product
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
  }, [id]);

  useEffect(() => {
    // Always fetch the fresh product details when the ID changes
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (product && product.images && product.images.length > 0) {
      setSelectedImage(0);
      setQuantity(1); // Reset quantity too when product changes
    }
  }, [product?._id]); // Depend on product ID rather than the whole product object to avoid unnecessary resets

  // Get related products from same category
  useEffect(() => {
    if (product) {
      const categoryId = product.category?._id || product.category;
      if (categoryId) {
        dispatch(fetchProductsByCategory(categoryId));
      }
    }
  }, [dispatch, product]);

  const handleAddToCart = () => {
    if (isInCart) {
      navigate('/cart');
    } else {
      dispatch(addToCart({ product, quantity }));
      toast.success(`Added ${quantity} ${product.name} to cart!`);
    }
  };

  const handleToggleWishlist = () => {
    dispatch(toggleWishlist(product));
    if (isInWishlist) {
      toast.success('Removed from wishlist');
    } else {
      toast.success('Added to wishlist');
    }
  };

  const handleNextImage = () => {
    if (product.images && product.images.length > 0) {
      setSelectedImage((prev) => (prev + 1) % product.images.length);
    }
  };

  const handlePrevImage = () => {
    if (product.images && product.images.length > 0) {
      setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  if (loading && !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-stone-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center max-w-md">
          <Package className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-stone-900 mb-2">Product Not Found</h2>
          <p className="text-stone-500 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="inline-block px-6 py-3 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors font-medium">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [];
  const hasMultipleImages = images.length > 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-stone-500">
            <Link to="/" className="hover:text-stone-900 transition-colors">Home</Link>
            <span>/</span>
            {product.category && (
              <>
                <Link to="/categories" className="hover:text-stone-900 transition-colors">Categories</Link>
                <span>/</span>
                <Link to={`/category/${product.category._id || product.category}`} className="hover:text-stone-900 transition-colors">
                  {typeof product.category === 'object' ? product.category.name : 'Category'}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-stone-900 font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-stone-100 rounded-2xl overflow-hidden group">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[selectedImage].url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Image Navigation */}
                  {hasMultipleImages && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-lg"
                      >
                        <ChevronLeft className="w-5 h-5 text-stone-900" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-lg"
                      >
                        <ChevronRight className="w-5 h-5 text-stone-900" />
                      </button>
                    </>
                  )}

                  {/* Stock Badge */}
                  {product.stock === 0 && (
                    <div className="absolute top-6 right-6 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      SOLD OUT
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-300">
                  <Package className="w-24 h-24 opacity-20" />
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {hasMultipleImages && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
                        ? 'border-stone-900 shadow-md'
                        : 'border-stone-200 hover:border-stone-400'
                      }`}
                  >
                    <img
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category */}
            {product.category && (
              <div className="inline-block px-4 py-1.5 bg-stone-100 text-stone-700 rounded-full text-xs font-bold uppercase tracking-wider">
                {typeof product.category === 'object' ? product.category.name : 'Category'}
              </div>
            )}

            {/* Title */}
            <div>
              <h1 className="text-4xl md:text-5xl font-serif text-stone-900 mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Rating (Placeholder) */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-sm text-stone-500">(4.8 · 127 reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-stone-900">
                ₹{product.price?.toLocaleString()}
              </span>
              {product.stock > 0 ? (
                <span className="px-3 py-1 bg-green-50 text-green-700 text-sm font-semibold rounded-full border border-green-200">
                  In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="px-3 py-1 bg-red-50 text-red-700 text-sm font-semibold rounded-full border border-red-200">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Description */}
            <div className="border-t border-b border-stone-200 py-6">
              <p className="text-stone-600 leading-relaxed">
                {product.description || 'A perfect gift for your loved ones. Premium quality product crafted with care.'}
              </p>
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-stone-700">Quantity:</span>
                <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 bg-stone-50 hover:bg-stone-100 transition-colors text-stone-700 font-medium"
                  >
                    −
                  </button>
                  <span className="px-6 py-2 bg-white font-medium text-stone-900 min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-2 bg-stone-50 hover:bg-stone-100 transition-colors text-stone-700 font-medium"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 px-8 py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-3 shadow-lg ${isInCart
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-900/20'
                    : 'bg-stone-900 hover:bg-stone-800 text-white shadow-stone-900/20 hover:shadow-stone-900/30'
                  } disabled:bg-stone-300 disabled:cursor-not-allowed disabled:shadow-none`}
              >
                {isInCart ? <ArrowRight className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                {product.stock === 0 ? 'Out of Stock' : isInCart ? 'Go to Cart' : 'Add to Cart'}
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`p-4 border-2 rounded-lg transition-all group ${isInWishlist
                    ? 'border-red-200 bg-red-50'
                    : 'border-stone-200 hover:border-stone-900 hover:bg-stone-50'
                  }`}
              >
                <Heart className={`w-5 h-5 transition-all ${isInWishlist
                    ? 'text-red-500 fill-red-500'
                    : 'text-stone-600 group-hover:text-red-500 group-hover:fill-red-500'
                  }`} />
              </button>
              <button className="p-4 border-2 border-stone-200 rounded-lg hover:border-stone-900 hover:bg-stone-50 transition-all">
                <Share2 className="w-5 h-5 text-stone-600" />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-lg">
                <Truck className="w-5 h-5 text-stone-700 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-stone-900 text-sm mb-1">Free Delivery</h4>
                  <p className="text-xs text-stone-600">On orders above ₹500</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-stone-700 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-stone-900 text-sm mb-1">Secure Payment</h4>
                  <p className="text-xs text-stone-600">100% secure transactions</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-lg">
                <RefreshCw className="w-5 h-5 text-stone-700 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-stone-900 text-sm mb-1">Easy Returns</h4>
                  <p className="text-xs text-stone-600">7-day return policy</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-lg">
                <Package className="w-5 h-5 text-stone-700 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-stone-900 text-sm mb-1">Gift Wrapping</h4>
                  <p className="text-xs text-stone-600">Available at checkout</p>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="border-t border-stone-200 pt-6">
              <h3 className="text-lg font-bold text-stone-900 mb-4">Product Details</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-stone-100">
                  <dt className="text-stone-600">Product ID</dt>
                  <dd className="font-medium text-stone-900">{product._id.substring(0, 12)}...</dd>
                </div>
                <div className="flex justify-between py-2 border-b border-stone-100">
                  <dt className="text-stone-600">Vendor</dt>
                  <dd className="font-medium text-stone-900">
                    {product.vendor?.storeName || 'Official Store'}
                  </dd>
                </div>
                <div className="flex justify-between py-2 border-b border-stone-100">
                  <dt className="text-stone-600">Availability</dt>
                  <dd className="font-medium text-stone-900">
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.filter(p => p._id !== product._id).length > 0 && (
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-serif text-stone-900 mb-2">You May Also Like</h2>
                <p className="text-stone-600">Similar products from the same collection</p>
              </div>
              {product.category && (
                <Link
                  to={`/category/${product.category._id || product.category}`}
                  className="text-sm font-semibold text-stone-900 hover:text-stone-600 transition-colors underline"
                >
                  View All in {typeof product.category === 'object' ? product.category.name : 'Category'}
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts
                .filter(p => p._id !== product._id)
                .slice(0, 4)
                .map(relatedProduct => (
                  <ProductCard key={relatedProduct._id} product={relatedProduct} />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
