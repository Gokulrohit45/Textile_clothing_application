import { useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, Share2, ChevronLeft, ChevronRight, Star, Truck, RefreshCw, Shield, Minus, Plus, Check, Play } from 'lucide-react';
import { useProduct } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useOrder } from '../context/OrderContext';
import ProductCard from '../components/ProductCard';
import StarRating from '../components/StarRating';
import toast from 'react-hot-toast';

const DEFAULT_SIZE_GUIDE = [
  { size: 'S', chest: '38 in', length: '27 in', shoulder: '17.5 in' },
  { size: 'M', chest: '40 in', length: '28 in', shoulder: '18 in' },
  { size: 'L', hex: '42 in', chest: '42 in', length: '29 in', shoulder: '18.5 in' },
  { size: 'XL', chest: '44 in', length: '30 in', shoulder: '19 in' },
  { size: 'XXL', chest: '46 in', length: '30.5 in', shoulder: '19.5 in' }
];

const getYoutubeEmbedUrl = (url) => {
  if (!url) return null;
  let videoId = '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    videoId = match[2];
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getProductById, getCategoryById, getSubcategoryById, getProductReviews, addReview, toggleWishlist, isWishlisted, getStock, getProductsByCategory } = useProduct();
  const { addToCart } = useCart();
  const { user, isLoggedIn } = useAuth();
  const { settings } = useSettings();
  const { getOrdersByUser } = useOrder();
  
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') === 'reviews' ? 'reviews' : 'description';
  
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const product = getProductById(id);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [imgIndex, setImgIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [added, setAdded] = useState(false);

  const userOrders = isLoggedIn ? getOrdersByUser(user?.id) : [];
  const hasPurchased = isLoggedIn && userOrders.some(order => 
    order.status !== 'payment_rejected' && 
    order.items.some(item => item.productId === id)
  );

  if (!product) return (
    <div className="container-main pt-28 pb-16 text-center">
      <h2 className="text-2xl font-bold text-primary mb-4">Product Not Found</h2>
      <Link to="/" className="btn-primary">Go Home</Link>
    </div>
  );

  const category = getCategoryById(product.categoryId);
  const subcategory = getSubcategoryById(product.subcategoryId);

  const isBottomwear = () => {
    const subName = subcategory?.name?.toLowerCase() || '';
    const subSlug = subcategory?.slug?.toLowerCase() || '';
    const prodName = product.name?.toLowerCase() || '';
    const prodDesc = product.description?.toLowerCase() || '';
    
    return (
      subName.includes('trouser') || subName.includes('pant') || subName.includes('legging') || subName.includes('jean') || subName.includes('short') || subName.includes('skirt') ||
      subSlug.includes('trouser') || subSlug.includes('pant') || subSlug.includes('legging') || subSlug.includes('jean') || subSlug.includes('short') || subSlug.includes('skirt') ||
      prodName.includes('trouser') || prodName.includes('pant') || prodName.includes('legging') || prodName.includes('jean') || prodName.includes('short') || prodName.includes('skirt') || prodName.includes('jogger')
    );
  };

  const getBottomwearSizeGuide = () => {
    const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL', 'XXL'];
    return sizes.map(size => {
      const numSize = parseInt(size, 10);
      if (!isNaN(numSize)) {
        return {
          size: size,
          waist: `${numSize} in`,
          hip: `${numSize + 8} in`,
          length: `${numSize >= 34 ? 41 : 40} in`
        };
      }
      const mapping = {
        'XS': { waist: '28 in', hip: '36 in', length: '37 in' },
        'S': { waist: '30 in', hip: '38 in', length: '38 in' },
        'M': { waist: '32 in', hip: '40 in', length: '39 in' },
        'L': { waist: '34 in', hip: '42 in', length: '40 in' },
        'XL': { waist: '36 in', hip: '44 in', length: '41 in' },
        'XXL': { waist: '38 in', hip: '46 in', length: '41.5 in' }
      };
      const upperSize = size.toUpperCase();
      return {
        size: size,
        waist: mapping[upperSize]?.waist || '32 in',
        hip: mapping[upperSize]?.hip || '40 in',
        length: mapping[upperSize]?.length || '39 in'
      };
    });
  };

  const reviews = getProductReviews(id);
  const wished = isLoggedIn && isWishlisted(id, user?.id);
  const selectedColor = product.colorNames?.[selectedColorIdx];
  const selectedColorHex = product.colors?.[selectedColorIdx];
  const stock = selectedSize && selectedColor ? getStock(id, selectedColor, selectedSize) : null;
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  const relatedProducts = getProductsByCategory(product.categoryId).filter(p => p.id !== id).slice(0, 4);
  const media = [...(product.images || [])];
  if (product.videoUrl) {
    media.push({ type: 'video', url: product.videoUrl });
  }

  const handleAddToCart = () => {
    if (!selectedSize) { toast.error('Please select a size'); return; }
    if (stock === 0) { toast.error('Out of stock'); return; }
    addToCart(product, selectedSize, selectedColorHex, selectedColor, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    toast.success('Added to cart! 🛍️');
  };

  const handleBuyNow = () => {
    if (!selectedSize) { toast.error('Please select a size'); return; }
    addToCart(product, selectedSize, selectedColorHex, selectedColor, qty);
    if (isLoggedIn) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=/checkout');
    }
  };

  const handleReview = (e) => {
    e.preventDefault();
    if (!isLoggedIn) { toast.error('Please log in'); return; }
    if (!reviewText.trim()) return;
    addReview({ productId: id, userId: user.id, userName: user.name, rating: reviewRating, comment: reviewText });
    setReviewText('');
    setReviewRating(5);
    toast.success('Review submitted!');
  };

  return (
    <div className="min-h-screen">
      <div className="container-main pt-24 pb-16">
        {/* Breadcrumb */}
        <nav className="text-sm text-neutral-400 mb-6 flex items-center gap-2 flex-wrap">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          {category && <Link to={`/category/${category.slug}`} className="hover:text-primary transition-colors">{category.name}</Link>}
          <span>/</span>
          <span className="text-primary font-medium line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {/* Image Gallery */}
          <div className="space-y-3">
            {/* Main Image or Video */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-100 group">
              {media[imgIndex]?.type === 'video' ? (
                getYoutubeEmbedUrl(media[imgIndex].url) ? (
                  <iframe
                    src={getYoutubeEmbedUrl(media[imgIndex].url)}
                    title={product.name}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video src={media[imgIndex].url} controls autoPlay className="w-full h-full object-contain bg-black" />
                )
              ) : (
                <img
                  src={media[imgIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              )}
              {/* Nav Arrows */}
              {media.length > 1 && (
                <>
                  <button
                    onClick={() => setImgIndex(prev => (prev - 1 + media.length) % media.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setImgIndex(prev => (prev + 1) % media.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
              {discount > 0 && (
                <div className="absolute top-4 left-4 badge bg-danger text-white">{discount}% OFF</div>
              )}
            </div>
            {/* Thumbnails */}
            {media.length > 1 && (
              <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                {media.map((item, i) => {
                  const isVideo = item && typeof item === 'object' && item.type === 'video';
                  return (
                    <button
                      key={i}
                      onClick={() => setImgIndex(i)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all relative ${
                        imgIndex === i ? 'border-primary shadow-btn' : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      {isVideo ? (
                        <div className="w-full h-full bg-neutral-900 flex flex-col items-center justify-center text-white relative">
                          <Play className="w-6 h-6 text-accent" fill="currentColor" />
                          <span className="text-[10px] mt-0.5 text-neutral-300 font-semibold uppercase">Video</span>
                        </div>
                      ) : (
                        <img src={item} alt="" className="w-full h-full object-cover" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="font-display font-bold text-2xl md:text-3xl text-primary leading-tight flex-1">
                {product.name}
              </h1>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  id={`wishlist-detail-${id}`}
                  onClick={() => {
                    if (!isLoggedIn) { toast.error('Please log in'); return; }
                    toggleWishlist(id, user.id);
                    toast.success(wished ? 'Removed from wishlist' : 'Added to wishlist');
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    wished ? 'bg-danger border-danger text-white' : 'border-neutral-200 text-neutral-400 hover:border-danger hover:text-danger'
                  }`}
                >
                  <Heart className="w-5 h-5" fill={wished ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={product.rating} size="sm" />
              <span className="text-sm text-neutral-500">({product.reviewCount} reviews)</span>
              {product.isNew && <span className="badge-accent">NEW</span>}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold font-display text-primary">₹{product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-neutral-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                  <span className="badge-success">{discount}% off</span>
                </>
              )}
            </div>

            {/* Material / Fabric */}
            {product.material && (
              <div className="mb-5 flex items-center gap-1.5 text-sm">
                <span className="text-neutral-400">Fabric:</span>
                <span className="font-semibold text-primary">{product.material}</span>
              </div>
            )}

            {/* Color Selector */}
            <div className="mb-5">
              <p className="label">Color: <span className="text-primary font-semibold">{selectedColor}</span></p>
              <div className="flex gap-2.5 flex-wrap">
                {product.colors?.map((color, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedColorIdx(i)}
                    title={product.colorNames?.[i]}
                    className={`w-9 h-9 rounded-full border-4 transition-all duration-200 ${
                      selectedColorIdx === i
                        ? 'border-primary shadow-btn scale-110'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <p className="label mb-0">Size</p>
                {product.categoryId !== 'cat3' && (
                  <button 
                    onClick={() => setShowSizeGuide(true)}
                    className="text-xs text-accent-600 font-medium hover:underline"
                  >
                    Size Guide
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes?.map(size => {
                  const s = getStock(id, selectedColor, size);
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      disabled={s === 0}
                      className={`px-4 py-2 text-sm font-medium rounded-xl border-2 transition-all duration-200 ${
                        selectedSize === size
                          ? 'bg-primary text-white border-primary'
                          : s === 0
                            ? 'border-neutral-100 text-neutral-300 cursor-not-allowed line-through'
                            : 'border-neutral-200 text-neutral-700 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
              {stock !== null && (
                <p className={`text-xs mt-2 font-medium ${stock === 0 ? 'text-danger' : stock <= 5 ? 'text-warning' : 'text-success'}`}>
                  {stock === 0 ? '❌ Out of stock' : stock <= 5 ? `⚠️ Only ${stock} left!` : `✓ In stock (${stock} available)`}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <p className="label">Quantity</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center border-2 border-neutral-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQty(prev => Math.max(1, prev - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                  <button
                    onClick={() => setQty(prev => Math.min(stock || 10, prev + 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3 mb-6">
              <button
                id="add-to-cart-btn"
                onClick={handleAddToCart}
                className={`btn-primary flex-1 py-4 text-base transition-all ${added ? 'bg-success hover:bg-success' : ''}`}
              >
                {added ? <><Check className="w-5 h-5" /> Added!</> : <><ShoppingBag className="w-5 h-5" /> Add to Cart</>}
              </button>
              <button
                id="buy-now-btn"
                onClick={handleBuyNow}
                className="btn-accent flex-1 py-4 text-base"
              >
                Buy Now
              </button>
            </div>

            {/* Trust Icons */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-secondary-200 rounded-2xl">
              {[
                { icon: Truck, text: 'Free delivery above ₹999' },
                { icon: RefreshCw, text: '7-day easy returns' },
                { icon: Shield, text: 'Secure checkout' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center text-center gap-1.5">
                  <Icon className="w-5 h-5 text-accent-600" />
                  <span className="text-xs text-neutral-500">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card overflow-hidden mb-12">
          <div className="flex border-b border-neutral-100">
            {['description', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-semibold capitalize transition-all duration-200 border-b-2 ${
                  activeTab === tab
                    ? 'border-primary text-primary bg-secondary-200/50'
                    : 'border-transparent text-neutral-500 hover:text-primary'
                }`}
              >
                {tab === 'reviews' ? `Reviews (${reviews.length})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'description' && (
              <div className="prose prose-sm max-w-none text-neutral-600 leading-relaxed space-y-4">
                <p>{product.description}</p>
                {product.material && (
                  <p className="text-sm font-medium text-neutral-700">
                    Fabric / Material: <span className="text-neutral-600 font-normal">{product.material}</span>
                  </p>
                )}
                {product.tags && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {product.tags.map(tag => (
                      <span key={tag} className="badge-neutral">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                {/* Review Form */}
                {isLoggedIn && hasPurchased ? (
                  <form onSubmit={handleReview} className="bg-secondary-200 rounded-2xl p-5 mb-6">
                    <h4 className="font-semibold text-primary mb-3">Write a Review</h4>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-neutral-600">Your Rating:</span>
                      <StarRating rating={reviewRating} size="md" interactive onRate={setReviewRating} />
                    </div>
                    <textarea
                      className="input text-sm resize-none mb-3"
                      rows={3}
                      placeholder="Share your experience..."
                      value={reviewText}
                      onChange={e => setReviewText(e.target.value)}
                    />
                    <button type="submit" className="btn-primary btn-sm">Submit Review</button>
                  </form>
                ) : isLoggedIn ? (
                  <div className="bg-secondary-200 rounded-2xl p-5 mb-6 text-center text-neutral-600 text-sm">
                    🔒 Only customers who have purchased this product can leave a review.
                  </div>
                ) : (
                  <div className="bg-secondary-200 bg-secondary-200/50 border border-neutral-100 rounded-2xl p-5 mb-6 text-center text-neutral-500 text-sm">
                    Please <Link to="/login" className="text-primary font-semibold hover:underline">Log In</Link> to write a review.
                  </div>
                )}

                {reviews.length === 0 ? (
                  <p className="text-center text-neutral-400 py-8">No reviews yet. Be the first!</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map(r => (
                      <div key={r.id} className="flex gap-4 pb-4 border-b border-neutral-100 last:border-0">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {r.userName?.[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-primary">{r.userName}</span>
                            <StarRating rating={r.rating} size="xs" />
                          </div>
                          <p className="text-sm text-neutral-600">{r.comment}</p>
                          <span className="text-xs text-neutral-400 mt-1 block">{r.createdAt}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="section-title mb-2">You May Also Like</h2>
            <div className="divider mb-6" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>

      {/* Premium Glassmorphic Size Guide Modal Overlay */}
      {showSizeGuide && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowSizeGuide(false)}
        >
          <div 
            className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-lg text-primary">Size Guide</h3>
                <p className="text-xs text-neutral-400">All measurements are in inches unless specified otherwise.</p>
              </div>
              <button 
                onClick={() => setShowSizeGuide(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Content - Table */}
            <div className="p-6">
              <div className="overflow-x-auto border border-neutral-200 rounded-xl">
                {isBottomwear() ? (
                  <table className="w-full text-sm text-left">
                    <thead className="bg-neutral-50 text-neutral-600 font-medium border-b border-neutral-200">
                      <tr>
                        <th className="p-3">Size</th>
                        <th className="p-3">Waist</th>
                        <th className="p-3">Hip</th>
                        <th className="p-3">Length</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-neutral-700">
                      {getBottomwearSizeGuide().map((row, idx) => (
                        <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="p-3 font-semibold text-primary">{row.size}</td>
                          <td className="p-3">{row.waist}</td>
                          <td className="p-3">{row.hip}</td>
                          <td className="p-3">{row.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-sm text-left">
                    <thead className="bg-neutral-50 text-neutral-600 font-medium border-b border-neutral-200">
                      <tr>
                        <th className="p-3">Size</th>
                        <th className="p-3">Chest</th>
                        <th className="p-3">Length</th>
                        <th className="p-3">Shoulder</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-neutral-700">
                      {((settings?.sizeGuide && settings.sizeGuide.length > 0) ? settings.sizeGuide : DEFAULT_SIZE_GUIDE).map((row, idx) => (
                        <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="p-3 font-semibold text-primary">{row.size}</td>
                          <td className="p-3">{row.chest}</td>
                          <td className="p-3">{row.length}</td>
                          <td className="p-3">{row.shoulder}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex justify-end">
              <button 
                onClick={() => setShowSizeGuide(false)}
                className="btn-primary btn-sm py-2 px-5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
