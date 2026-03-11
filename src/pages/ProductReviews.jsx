import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { fetchProductById } from '../features/products/productSlice';
import { ArrowLeft, Star, Clock, ThumbsUp, ChevronDown, CheckCircle2, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { PageSkeleton } from '../components/Skeletons';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ProductReviews = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  
  const { products, relatedProducts, loading } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);
  const product = products.find(p => p._id === id) || relatedProducts.find(p => p._id === id);

  const [sortBy, setSortBy] = useState('newest'); // newest, highest, lowest

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    if (!product && id) {
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id, product]);

  const helpfulHandler = async (reviewId) => {
    if (!user) {
      toast.error('Please login to vote');
      return;
    }
    try {
      await api.put(`/products/${id}/reviews/${reviewId}/helpful`);
      dispatch(fetchProductById(id));
      toast.success('Thank you for your feedback');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update vote');
    }
  };

  if (loading && !product) {
    return <PageSkeleton />;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <h2 className="text-2xl font-serif text-stone-900 mb-2">Product Not Found</h2>
          <Link to="/" className="inline-block px-6 py-3 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const reviews = product.reviews || [];
  
  let sortedReviews = [...reviews];
  if (sortBy === 'newest') {
    sortedReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortBy === 'highest') {
    sortedReviews.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'lowest') {
    sortedReviews.sort((a, b) => a.rating - b.rating);
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <Link 
          to={`/product/${product._id}`} 
          className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Product
        </Link>
        
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="p-8 border-b border-stone-200 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between bg-stone-900 text-white">
            <div className="flex gap-6 items-center">
              {product.images && product.images.length > 0 && (
                <img 
                  src={product.images[0].url} 
                  alt={product.name} 
                  className="w-20 h-20 object-cover rounded-lg bg-white p-1"
                />
              )}
              <div>
                <h1 className="text-2xl font-serif font-bold mb-1">{product.name}</h1>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    <span className="ml-1.5 font-bold text-lg">{averageRating}</span>
                  </div>
                  <span className="text-stone-400 text-sm">/ 5</span>
                  <span className="text-stone-400 text-sm ml-2">({reviews.length} reviews)</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-stone-800 border-none text-white rounded-lg px-4 py-2.5 pr-10 hover:bg-stone-700 outline-none transition-colors cursor-pointer text-sm font-medium"
              >
                <option value="newest">Most Recent</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            </div>
          </div>
          
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-12 mb-12 border-b border-stone-100 pb-12">
              {/* Rating Distribution */}
              <div className="w-full md:w-1/2">
                <h3 className="text-xl font-serif font-bold text-stone-900 mb-6">Review Statistics</h3>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter(r => r.rating === star).length;
                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <span className="text-sm font-medium text-stone-700 min-w-[50px]">
                          {star} star
                        </span>
                        <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-stone-900 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-stone-400 min-w-[35px] text-right">
                          {Math.round(percentage)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Photos Gallery */}
              <div className="w-full md:w-1/2">
                <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Gallery from Customers
                </h3>
                {reviews.some(r => r.images?.length > 0) ? (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                    {reviews.flatMap(r => r.images || []).slice(0, 10).map((img, i) => (
                      <div key={i} className="aspect-square rounded-lg overflow-hidden border border-stone-200 shadow-sm">
                        <img src={img.url} alt="User submission" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-32 bg-stone-50 rounded-xl flex items-center justify-center border border-dashed border-stone-200">
                    <p className="text-stone-400 text-sm">No photos shared yet</p>
                  </div>
                )}
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-stone-500">No reviews have been written for this product yet.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {sortedReviews.map((rev) => (
                  <div key={rev._id} className="bg-white p-8 rounded-2xl border border-stone-200 transition-shadow hover:shadow-md">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-900 text-lg">
                          {rev.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-stone-900 block text-base">{rev.name}</span>
                          <div className="flex items-center gap-1.5 text-[10px] text-green-600 font-bold uppercase tracking-widest mt-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Verified Customer
                          </div>
                        </div>
                      </div>
                      <div className="text-[11px] text-stone-400 font-medium font-serif italic flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(rev.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-0.5 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`} 
                        />
                      ))}
                    </div>

                    <p className="text-stone-600 leading-relaxed text-sm mb-6 bg-stone-50 p-4 rounded-xl border border-stone-100 italic">
                      "{rev.comment}"
                    </p>

                    {rev.images && rev.images.length > 0 && (
                      <div className="flex flex-wrap gap-3 mb-8">
                        {rev.images.map((img, i) => (
                          <img 
                            key={i}
                            src={img.url} 
                            alt="Review attachment" 
                            className="h-28 w-28 object-cover rounded-xl border border-stone-200 shadow-sm" 
                          />
                        ))}
                      </div>
                    )}

                    <div className="pt-6 border-t border-stone-100 flex items-center justify-between">
                      <button 
                        onClick={() => helpfulHandler(rev._id)}
                        className={`flex items-center gap-2.5 text-xs font-bold transition-all ${rev.helpful?.includes(user?._id) ? 'text-stone-900 scale-105' : 'text-stone-400 hover:text-stone-600'}`}
                      >
                         <ThumbsUp className={`w-4 h-4 ${rev.helpful?.includes(user?._id) ? 'fill-stone-900' : ''}`} />
                         Helpful ({rev.helpful?.length || 0})
                      </button>
                      <button className="text-[10px] text-stone-300 font-bold uppercase hover:text-stone-500 transition-colors">
                        Report Abuse
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;
