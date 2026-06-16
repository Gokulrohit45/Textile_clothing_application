import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, Tag, ArrowRight, ChevronLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProduct } from '../context/ProductContext';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';

const CartPage = () => {
  const { cartItems, updateQty, removeFromCart, appliedCoupon, applyCoupon, removeCoupon, subtotal, getDiscount, getShippingDiscount } = useCart();
  const { validateCoupon, coupons } = useProduct();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');

  const shipping = subtotal >= settings.freeShippingAbove ? 0 : settings.shippingCharge;
  const discount = getDiscount();
  const shippingDiscount = getShippingDiscount(shipping);
  const effectiveShipping = Math.max(0, shipping - shippingDiscount);
  const total = subtotal - discount + effectiveShipping;

  const handleApplyCoupon = (codeToApply) => {
    const code = (typeof codeToApply === 'string' ? codeToApply : couponCode).trim().toUpperCase();
    if (!code) { toast.error('Please enter a coupon code'); return; }
    const result = validateCoupon(code, subtotal);
    if (!result.valid) { toast.error(result.error); return; }
    applyCoupon(result.coupon);
    toast.success(`Coupon "${result.coupon.code}" applied!`);
    setCouponCode('');
  };

  if (cartItems.length === 0) {
    return (
      <div className="container-main pt-28 pb-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-neutral-300" />
          </div>
          <h2 className="font-display font-bold text-2xl text-primary mb-2">Your Cart is Empty</h2>
          <p className="text-neutral-500 mb-8">Add items to your cart to proceed with checkout</p>
          <Link to="/" className="btn-primary">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-main pt-24 pb-16 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="btn-ghost p-2 rounded-xl">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display font-bold text-2xl text-primary">
          Shopping Cart <span className="text-neutral-400 font-normal text-lg">({cartItems.length} items)</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map(item => (
            <div key={item.key} className="card p-4 flex gap-4 animate-fade-in">
              <Link to={`/product/${item.productId}`}>
                <img
                  src={item.image}
                  alt={item.productName}
                  className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-xl flex-shrink-0"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.productId}`}>
                  <h3 className="font-semibold text-primary text-sm md:text-base hover:text-accent-700 transition-colors line-clamp-2">
                    {item.productName}
                  </h3>
                </Link>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="text-xs text-neutral-400">Size: <span className="font-medium text-neutral-600">{item.size}</span></span>
                  <span className="text-neutral-300">|</span>
                  <span className="text-xs text-neutral-400 flex items-center gap-1">
                    Color:
                    <span className="w-3 h-3 rounded-full border border-neutral-200 inline-block" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-neutral-600">{item.colorName}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                  {/* Quantity */}
                  <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => updateQty(item.key, item.qty - 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.key, item.qty + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  {/* Price + Delete */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-primary text-sm">₹{(item.price * item.qty).toLocaleString()}</p>
                      {item.qty > 1 && <p className="text-xs text-neutral-400">₹{item.price} each</p>}
                    </div>
                    <button
                      id={`remove-${item.key}`}
                      onClick={() => { removeFromCart(item.key); toast.success('Item removed'); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:bg-danger/10 hover:text-danger transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-24">
            <h2 className="font-display font-bold text-lg text-primary mb-5">Order Summary</h2>

            {/* Coupon */}
            <div className="mb-5">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-success/10 rounded-xl border border-success/20">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-success" />
                    <span className="text-sm font-semibold text-success">{appliedCoupon.code}</span>
                  </div>
                  <button onClick={() => { removeCoupon(); toast.success('Coupon removed'); }} className="text-xs text-neutral-400 hover:text-danger transition-colors">
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    id="coupon-input"
                    className="input py-2.5 text-sm uppercase"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                  />
                  <button id="apply-coupon-btn" onClick={handleApplyCoupon} className="btn-outline btn-sm px-4 whitespace-nowrap">
                    Apply
                  </button>
                </div>
              )}
              {coupons && coupons.filter(c => c.status === 'active').length > 0 && (
                <div className="mt-3">
                  <p className="text-[11px] font-bold text-neutral-400 tracking-wider mb-2">AVAILABLE COUPONS</p>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {coupons.filter(c => c.status === 'active').map(c => {
                      const desc = c.type === 'percentage' ? `${c.value}% OFF` :
                                   c.type === 'fixed' ? `₹${c.value} OFF` : 'FREE SHIPPING';
                      return (
                        <div key={c.id} className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 border border-neutral-200/60 hover:bg-neutral-100/50 transition-all">
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono font-bold text-xs text-primary bg-neutral-200/70 px-1.5 py-0.5 rounded uppercase tracking-wider">{c.code}</span>
                              <span className="text-xs font-semibold text-accent-700">{desc}</span>
                            </div>
                            <p className="text-[10px] text-neutral-500 mt-1">
                              Min. order: <span className="font-medium text-neutral-700">₹{c.minOrder}</span>
                            </p>
                          </div>
                          <button
                            onClick={() => handleApplyCoupon(c.code)}
                            className="btn-outline btn-xs px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap"
                          >
                            Apply
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 pb-4 border-b border-neutral-100">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Subtotal ({cartItems.reduce((s, i) => s + i.qty, 0)} items)</span>
                <span className="font-medium">₹{subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-success">Coupon Discount</span>
                  <span className="text-success font-medium">-₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Shipping</span>
                <span className={effectiveShipping === 0 ? 'text-success font-medium' : 'font-medium'}>
                  {effectiveShipping === 0 ? 'FREE' : `₹${effectiveShipping}`}
                </span>
              </div>
              {subtotal < settings.freeShippingAbove && effectiveShipping > 0 && (
                <p className="text-xs text-neutral-400">
                  Add ₹{(settings.freeShippingAbove - subtotal).toLocaleString()} more for free shipping
                </p>
              )}
            </div>

            <div className="flex justify-between items-baseline py-4">
              <span className="font-bold text-primary text-base">Total</span>
              <span className="font-display font-bold text-2xl text-primary">₹{total.toLocaleString()}</span>
            </div>

            {discount > 0 && (
              <p className="text-xs text-success text-center mb-3">
                🎉 You're saving ₹{discount.toLocaleString()} on this order!
              </p>
            )}

            <Link to="/checkout" id="checkout-btn" className="btn-accent w-full py-4 text-base gap-2 justify-center">
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </Link>

            <Link to="/" className="btn-ghost w-full mt-2 text-sm justify-center">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
