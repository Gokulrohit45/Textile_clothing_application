import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, ChevronRight, ChevronLeft, Plus, Upload, Smartphone, Truck, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { useSettings } from '../context/SettingsContext';
import { useProduct } from '../context/ProductContext';
import toast from 'react-hot-toast';

const STEPS = ['Address', 'Order Summary', 'Payment'];

const CheckoutPage = () => {
  const { cartItems, subtotal, appliedCoupon, applyCoupon, removeCoupon, getDiscount, getShippingDiscount, clearCart } = useCart();
  const { user, getUserAddresses, addAddress } = useAuth();
  const { placeOrder } = useOrder();
  const { settings } = useSettings();
  const { validateCoupon, coupons } = useProduct();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(0);
  const [couponCode, setCouponCode] = useState('');

  const handleApplyCoupon = (codeToApply) => {
    const code = (typeof codeToApply === 'string' ? codeToApply : couponCode).trim().toUpperCase();
    if (!code) { toast.error('Please enter a coupon code'); return; }
    const result = validateCoupon(code, subtotal);
    if (!result.valid) { toast.error(result.error); return; }
    applyCoupon(result.coupon);
    toast.success(`Coupon "${result.coupon.code}" applied!`);
    setCouponCode('');
  };

  const handleCancelCheckout = () => {
    const searchParams = new URLSearchParams(location.search);
    const fromProductParam = searchParams.get('fromProduct');
    const dest = location.state?.fromProduct || fromProductParam || sessionStorage.getItem('lastProductPage') || '/cart';
    navigate(dest);
  };
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [newAddrMode, setNewAddrMode] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('gpay');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [placing, setPlacing] = useState(false);

  const [newAddr, setNewAddr] = useState({
    name: user?.name || '', phone: user?.phone || '', addressLine1: '', addressLine2: '',
    city: '', state: '', pincode: '', isDefault: false
  });

  const addresses = getUserAddresses();
  const shipping = subtotal >= settings.freeShippingAbove ? 0 : settings.shippingCharge;
  const discount = getDiscount();
  const shippingDiscount = getShippingDiscount(shipping);
  const effectiveShipping = Math.max(0, shipping - shippingDiscount);
  const total = subtotal - discount + effectiveShipping;

  const handleSaveAddress = () => {
    if (!newAddr.name || !newAddr.addressLine1 || !newAddr.city || !newAddr.pincode) {
      toast.error('Please fill all required fields'); return;
    }
    const saved = addAddress(newAddr);
    setSelectedAddress(saved.id);
    setNewAddrMode(false);
    toast.success('Address saved!');
  };

  const handleScreenshotUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setScreenshot(ev.target.result); setScreenshotPreview(ev.target.result); };
    reader.readAsDataURL(file);
  };

  const handlePlaceOrder = () => {
    if (!selectedAddress) { toast.error('Please select a delivery address'); setStep(0); return; }
    if (paymentMethod === 'gpay' && !screenshot) { toast.error('Please upload payment screenshot'); return; }

    setPlacing(true);
    const addr = addresses.find(a => a.id === selectedAddress);
    const order = placeOrder({
      userId: user.id, userName: user.name,
      addressId: selectedAddress,
      shippingAddress: addr,
      items: cartItems.map(i => ({
        productId: i.productId, productName: i.productName,
        size: i.size, color: i.colorName, qty: i.qty, price: i.price
      })),
      subtotal, discount, shipping: effectiveShipping, total,
      paymentMethod, paymentScreenshot: screenshot,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      couponCode: appliedCoupon?.code || null,
    });
    clearCart();
    setTimeout(() => {
      setPlacing(false);
      navigate('/orders', { state: { newOrder: order.id } });
      toast.success('Order placed successfully! 🎉');
    }, 1500);
  };

  return (
    <div className="container-main pt-24 pb-16 min-h-screen">
      <h1 className="font-display font-bold text-2xl text-primary mb-6">Checkout</h1>

      {/* Step Indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i < step ? 'bg-success text-white' : i === step ? 'bg-primary text-white' : 'bg-neutral-200 text-neutral-400'
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm font-medium hidden md:block ${i === step ? 'text-primary' : 'text-neutral-400'}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 transition-all ${i < step ? 'bg-success' : 'bg-neutral-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* STEP 0: Address */}
          {step === 0 && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-semibold text-lg text-primary mb-4">Select Delivery Address</h2>
              {addresses.length > 0 && (
                <div className="space-y-3 mb-4">
                  {addresses.map(addr => (
                    <label key={addr.id} className={`flex gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedAddress === addr.id ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:border-neutral-300'
                    }`}>
                      <input type="radio" name="address" className="mt-1" checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-primary">{addr.name}</span>
                          {addr.isDefault && <span className="badge-primary text-xs">Default</span>}
                        </div>
                        <p className="text-sm text-neutral-600 mt-0.5">
                          {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}, {addr.city}, {addr.state} – {addr.pincode}
                        </p>
                        <p className="text-xs text-neutral-400 mt-0.5">📞 {addr.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {!newAddrMode ? (
                <button onClick={() => setNewAddrMode(true)} className="btn-outline btn-sm gap-2 w-full md:w-auto">
                  <Plus className="w-4 h-4" /> Add New Address
                </button>
              ) : (
                <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-5 space-y-3 animate-fade-in">
                  <h3 className="font-semibold text-primary text-sm">New Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { label: 'Full Name *', key: 'name', placeholder: 'Enter full name' },
                      { label: 'Phone *', key: 'phone', placeholder: 'Mobile number' },
                      { label: 'Address Line 1 *', key: 'addressLine1', placeholder: 'Street, Area' },
                      { label: 'Address Line 2', key: 'addressLine2', placeholder: 'Landmark (optional)' },
                      { label: 'City *', key: 'city', placeholder: 'City' },
                      { label: 'State *', key: 'state', placeholder: 'State' },
                      { label: 'Pincode *', key: 'pincode', placeholder: '6-digit pincode' },
                    ].map(field => (
                      <div key={field.key} className={field.key === 'addressLine1' || field.key === 'addressLine2' ? 'md:col-span-2' : ''}>
                        <label className="label">{field.label}</label>
                        <input
                          className="input"
                          placeholder={field.placeholder}
                          value={newAddr[field.key]}
                          onChange={e => setNewAddr(prev => ({ ...prev, [field.key]: e.target.value }))}
                        />
                      </div>
                    ))}
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer mt-2">
                    <input type="checkbox" checked={newAddr.isDefault} onChange={e => setNewAddr(prev => ({ ...prev, isDefault: e.target.checked }))} className="w-4 h-4 accent-primary" />
                    <span className="text-sm text-neutral-600">Set as default address</span>
                  </label>
                  <div className="flex gap-2">
                    <button onClick={handleSaveAddress} className="btn-primary btn-sm">Save Address</button>
                    <button onClick={() => setNewAddrMode(false)} className="btn-ghost btn-sm">Cancel</button>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mt-6">
                <button
                  type="button"
                  onClick={handleCancelCheckout}
                  className="btn-ghost text-neutral-500 hover:text-primary gap-1"
                >
                  Cancel
                </button>
                <button
                  id="checkout-next-1"
                  disabled={!selectedAddress}
                  onClick={() => setStep(1)}
                  className="btn-primary gap-2"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 1: Order Summary */}
          {step === 1 && (
            <div className="card p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg text-primary">Order Summary</h2>
                <button onClick={() => setStep(0)} className="btn-ghost btn-sm gap-1"><ChevronLeft className="w-4 h-4" /> Back</button>
              </div>
              <div className="space-y-3 mb-4">
                {cartItems.map(item => (
                  <div key={item.key} className="flex gap-3 pb-3 border-b border-neutral-100 last:border-0">
                    <img src={item.image} alt={item.productName} className="w-14 h-14 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary">{item.productName}</p>
                      <p className="text-xs text-neutral-400">Size: {item.size} • Color: {item.colorName} • Qty: {item.qty}</p>
                    </div>
                    <span className="font-semibold text-sm text-primary whitespace-nowrap">₹{(item.price * item.qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <button id="checkout-next-2" onClick={() => setStep(2)} className="btn-primary gap-2 w-full md:w-auto">
                  Choose Payment <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Payment */}
          {step === 2 && (
            <div className="card p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg text-primary">Payment Method</h2>
                <button onClick={() => setStep(1)} className="btn-ghost btn-sm gap-1"><ChevronLeft className="w-4 h-4" /> Back</button>
              </div>

              <div className="space-y-3 mb-6">
                {/* GPay */}
                <label className={`flex gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'gpay' ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:border-neutral-300'
                }`}>
                  <input type="radio" name="payment" checked={paymentMethod === 'gpay'} onChange={() => setPaymentMethod('gpay')} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-sm">GPay / UPI</span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">Scan QR code and upload screenshot</p>
                  </div>
                </label>

                {/* COD */}
                <label className={`flex gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:border-neutral-300'
                }`}>
                  <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-sm">Cash on Delivery</span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">Pay when your order arrives</p>
                  </div>
                </label>
              </div>

              {/* GPay QR Section */}
              {paymentMethod === 'gpay' && (
                <div className="bg-secondary-200 rounded-2xl p-5 mb-4 animate-fade-in">
                  <p className="text-sm font-semibold text-primary mb-3 text-center">
                    Scan QR to Pay ₹{total.toLocaleString()}
                  </p>
                  {/* QR Placeholder */}
                  <div className="w-44 h-44 mx-auto bg-white rounded-2xl border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center mb-3">
                    {settings.gpayQR ? (
                      <img src={settings.gpayQR} alt="GPay QR" className="w-full h-full object-contain rounded-2xl" />
                    ) : (
                      <>
                        <Smartphone className="w-12 h-12 text-neutral-300 mb-2" />
                        <p className="text-xs text-neutral-400 text-center px-4">QR Code will appear here</p>
                        <p className="text-xs font-semibold text-primary mt-1">{settings.gpayUPI}</p>
                      </>
                    )}
                  </div>
                  <p className="text-center text-xs text-neutral-500 mb-4">UPI ID: <span className="font-semibold text-primary">{settings.gpayUPI}</span></p>

                  {/* Screenshot Upload */}
                  <div>
                    <p className="text-xs font-semibold text-neutral-600 mb-2">Upload Payment Screenshot *</p>
                    <label className={`block w-full rounded-xl border-2 border-dashed transition-all cursor-pointer p-4 text-center
                      ${screenshotPreview ? 'border-success bg-success/5' : 'border-neutral-300 hover:border-primary'}`}>
                      <input id="screenshot-upload" type="file" accept="image/*" className="hidden" onChange={handleScreenshotUpload} />
                      {screenshotPreview ? (
                        <div>
                          <img src={screenshotPreview} alt="Payment Screenshot" className="w-full max-h-40 object-contain rounded-lg mx-auto" />
                          <p className="text-xs text-success font-medium mt-2">✓ Screenshot uploaded</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 py-2">
                          <Upload className="w-8 h-8 text-neutral-300" />
                          <p className="text-sm text-neutral-500">Click to upload screenshot</p>
                          <p className="text-xs text-neutral-400">JPG, PNG supported</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  id="place-order-btn"
                  onClick={handlePlaceOrder}
                  disabled={placing || (paymentMethod === 'gpay' && !screenshot)}
                  className="btn-accent gap-2 w-full md:w-auto"
                >
                  {placing ? (
                    <><span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> Placing...</>
                  ) : (
                    <><Check className="w-4 h-4" /> Place Order</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Price Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-24">
            <h3 className="font-semibold text-primary mb-4">Price Details</h3>

            {/* Coupon Section */}
            <div className="mb-5">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-success/10 rounded-xl border border-success/20 animate-fade-in">
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
                    className="input py-2 text-sm uppercase"
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

            <div className="space-y-2 text-sm pb-4 border-b border-neutral-100">
              <div className="flex justify-between">
                <span className="text-neutral-500">Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>-₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-500">Shipping</span>
                <span className={effectiveShipping === 0 ? 'text-success' : ''}>
                  {effectiveShipping === 0 ? 'FREE' : `₹${effectiveShipping}`}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-baseline pt-4">
              <span className="font-bold text-primary">Total</span>
              <span className="font-display font-bold text-2xl text-primary">₹{total.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <p className="text-xs text-success text-center mt-3">
                🎉 You're saving ₹{discount.toLocaleString()} on this order!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
