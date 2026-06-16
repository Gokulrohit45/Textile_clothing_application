import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingBag, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useProduct } from '../context/ProductContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { user, isLoggedIn } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted, getStock } = useProduct();
  const [hovered, setHovered] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  const wished = isLoggedIn && isWishlisted(product.id, user?.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!isLoggedIn) { toast.error('Please log in to add to wishlist'); return; }
    toggleWishlist(product.id, user.id);
    toast.success(wished ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const [showQuickSelect, setShowQuickSelect] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);

  const selectedColor = product.colorNames?.[selectedColorIdx];
  const stock = selectedSize && selectedColor ? getStock(product.id, selectedColor, selectedSize) : null;

  const handleQuickAddClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) { toast.error('Please log in to add to cart'); return; }
    setShowQuickSelect(true);
  };

  const handleConfirmAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedSize) { toast.error('Please select a size'); return; }
    
    const color = product.colorNames?.[selectedColorIdx];
    const colorHex = product.colors?.[selectedColorIdx];
    
    addToCart(product, selectedSize, colorHex, color, 1);
    toast.success('Added to cart! 🛍️');
    setShowQuickSelect(false);
    setSelectedSize('');
    setSelectedColorIdx(0);
  };

  return (
    <>
      <Link to={`/product/${product.id}`} className="product-card block group">
      {/* Image */}
      <div
        className="relative overflow-hidden aspect-[3/4] bg-neutral-100"
        onMouseEnter={() => { setHovered(true); if (product.images?.length > 1) setImgIndex(1); }}
        onMouseLeave={() => { setHovered(false); setImgIndex(0); }}
      >
        <img
          src={product.images?.[imgIndex] || product.images?.[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="badge bg-primary text-white text-xs">NEW</span>
          )}
          {discount > 0 && (
            <span className="badge bg-danger text-white text-xs">{discount}% OFF</span>
          )}
        </div>

        {/* Wishlist */}
        <button
          id={`wishlist-${product.id}`}
          onClick={handleWishlist}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm
            ${wished ? 'bg-danger text-white' : 'bg-white/90 text-neutral-500 hover:bg-danger hover:text-white'}`}
        >
          <Heart className="w-4 h-4" fill={wished ? 'currentColor' : 'none'} />
        </button>

        {/* Hover Actions */}
        <div className={`absolute bottom-0 left-0 right-0 p-3 transition-all duration-300 ${hovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
          <button
            id={`quick-add-${product.id}`}
            onClick={handleQuickAddClick}
            className="btn-accent w-full rounded-xl py-2.5 text-sm gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Quick Add
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-neutral-400 mb-1 capitalize">{product.category || ''}</p>
        <h3 className="font-medium text-sm text-neutral-800 line-clamp-2 mb-2 leading-snug group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2 min-h-[16px]">
          {product.reviewCount > 0 ? (
            <>
              <div className="flex">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star
                    key={s}
                    className={`w-3 h-3 ${s <= Math.round(product.rating) ? 'star-filled fill-current' : 'star-empty'}`}
                  />
                ))}
              </div>
              <span className="text-xs text-neutral-400">({product.reviewCount})</span>
            </>
          ) : (
            <span className="text-xs text-neutral-400">No reviews yet</span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-primary text-base">₹{product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-xs text-neutral-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
          )}
          {discount > 0 && (
            <span className="text-xs text-success font-semibold">{discount}% off</span>
          )}
        </div>

        {/* Color Swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex gap-1.5 mt-2.5">
            {product.colors.slice(0, 4).map((color, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm ring-1 ring-neutral-200"
                style={{ backgroundColor: color }}
                title={product.colorNames?.[i]}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-xs text-neutral-400 leading-4">+{product.colors.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </Link>

    {/* Quick Select Modal Overlay */}
    {showQuickSelect && (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowQuickSelect(false); }}
      >
        <div 
          className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden p-6 animate-scale-up text-left"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          {/* Header */}
          <div className="flex justify-between items-start gap-4 mb-4">
            <div>
              <h4 className="font-display font-bold text-base text-primary line-clamp-1">{product.name}</h4>
              <p className="font-bold text-accent-700 text-sm mt-0.5">₹{product.price.toLocaleString()}</p>
            </div>
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowQuickSelect(false); }}
              className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors text-xs"
            >
              ✕
            </button>
          </div>

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-neutral-500 mb-2">
                Color: <span className="text-primary font-semibold">{product.colorNames?.[selectedColorIdx]}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map((color, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedColorIdx(i); }}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      selectedColorIdx === i ? 'border-primary ring-2 ring-primary/20 scale-105' : 'border-neutral-200'
                    }`}
                    style={{ backgroundColor: color }}
                    title={product.colorNames?.[i]}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-neutral-500 mb-2">Size</p>
              <div className="flex gap-1.5 flex-wrap">
                {product.sizes.map(size => {
                  const colorName = product.colorNames?.[selectedColorIdx];
                  const s = colorName ? getStock(product.id, colorName, size) : 10;
                  return (
                    <button
                      key={size}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedSize(size); }}
                      disabled={s === 0}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
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
                <p className={`text-[10px] mt-2 font-medium ${stock === 0 ? 'text-danger' : stock <= 5 ? 'text-warning' : 'text-success'}`}>
                  {stock === 0 ? '❌ Out of stock' : stock <= 5 ? `⚠️ Only ${stock} left!` : `✓ In stock`}
                </p>
              )}
            </div>
          )}

          {/* Add Button */}
          <button
            onClick={handleConfirmAdd}
            disabled={stock === 0}
            className="btn-accent w-full py-2.5 rounded-xl text-sm gap-2 font-semibold mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>
    )}
  </>
);
};

export default ProductCard;
