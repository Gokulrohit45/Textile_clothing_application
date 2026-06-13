import { useLocation, Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, XCircle, AlertCircle, Eye, Smartphone, Upload } from 'lucide-react';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useState } from 'react';
import toast from 'react-hot-toast';

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];
const STATUS_LABELS = {
  pending: 'Order Placed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  payment_rejected: 'Payment Rejected',
};

const STATUS_ICONS = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  payment_rejected: XCircle,
};

const OrdersPage = () => {
  const { getOrdersByUser, getPaymentByOrderId, uploadPaymentScreenshot } = useOrder();
  const { user } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPaymentInfo, setShowPaymentInfo] = useState({});
  const [viewImg, setViewImg] = useState(null);

  const orders = getOrdersByUser(user?.id);
  const newOrderId = location.state?.newOrder;

  const togglePaymentInfo = (orderId) => {
    setShowPaymentInfo(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleScreenshotUpload = (orderId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      uploadPaymentScreenshot(orderId, ev.target.result);
      toast.success('Screenshot uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
    <div className="container-main pt-24 pb-16 min-h-screen">
      <h1 className="font-display font-bold text-2xl text-primary mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h2 className="font-semibold text-neutral-600 mb-2">No orders yet</h2>
          <p className="text-sm text-neutral-400">Your orders will appear here after you shop</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const payment = getPaymentByOrderId(order.id);
            const stepIdx = STATUS_STEPS.indexOf(order.status);
            const Icon = STATUS_ICONS[order.status] || Clock;
            const isNew = order.id === newOrderId;

            // Auto-expand payment info if new order and not yet verified
            const isPaymentExpanded = showPaymentInfo[order.id] !== undefined
              ? showPaymentInfo[order.id]
              : (isNew && payment?.status !== 'verified');

            return (
              <div key={order.id} className={`card p-5 animate-fade-in ${isNew ? 'ring-2 ring-success' : ''}`}>
                {isNew && (
                  <div className="flex items-center gap-2 text-success text-sm font-semibold mb-3">
                    <CheckCircle className="w-4 h-4" /> Order placed successfully!
                  </div>
                )}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-neutral-400">#{order.id.toUpperCase()}</span>
                      <span className="text-xs text-neutral-400">•</span>
                      <span className="text-xs text-neutral-400">{order.createdAt}</span>
                    </div>
                    <p className="text-sm text-neutral-600">
                      {order.items.length} item(s) • <span className="font-bold text-primary">₹{order.total.toLocaleString()}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`badge gap-1 ${
                      order.status === 'delivered' ? 'badge-success' :
                      order.status === 'payment_rejected' ? 'badge-danger' :
                      order.status === 'shipped' ? 'badge-primary' : 'badge-warning'
                    }`}>
                      <Icon className="w-3 h-3" />
                      {STATUS_LABELS[order.status] || order.status}
                    </div>
                    <button
                      onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                      className="btn-ghost p-2 rounded-lg"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex-shrink-0 flex items-center gap-2 bg-neutral-50 rounded-xl px-3 py-2 border border-neutral-100 hover:border-neutral-200 transition-colors">
                      <Link to={`/product/${item.productId}`} className="text-xs text-neutral-600 hover:text-primary transition-colors font-medium">
                        {item.productName} ({item.size})
                      </Link>
                      <span className="text-xs text-neutral-400">× {item.qty}</span>
                      {order.status === 'delivered' && (
                        <Link 
                          to={`/product/${item.productId}?tab=reviews`} 
                          className="text-[10px] text-accent-700 hover:text-accent-800 font-bold ml-1 px-1.5 py-0.5 bg-accent/10 hover:bg-accent/20 rounded-md transition-colors"
                        >
                          Review Item
                        </Link>
                      )}
                    </div>
                  ))}
                </div>

                {/* Payment status */}
                <div className="mt-3 space-y-3">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    {order.paymentMethod === 'gpay' ? (
                      <>
                        <div className={`text-xs flex items-center gap-1.5 font-medium ${
                          payment?.status === 'verified' ? 'text-success' :
                          payment?.status === 'rejected' ? 'text-danger' : 'text-warning'
                        }`}>
                          <AlertCircle className="w-3.5 h-3.5" />
                          Payment: {payment?.status === 'verified' ? 'Verified ✓' : payment?.status === 'rejected' ? 'Rejected ✗' : 'Pending verification'}
                        </div>
                        
                        {payment?.status !== 'verified' && (
                          <button
                            onClick={() => togglePaymentInfo(order.id)}
                            className="text-xs text-accent-700 hover:text-accent-800 font-semibold underline"
                          >
                            {isPaymentExpanded ? 'Hide Payment Info' : 'Show Payment Info & QR'}
                          </button>
                        )}
                      </>
                    ) : (
                      <div className={`text-xs flex items-center gap-1.5 font-medium ${
                        order.paymentStatus === 'verified' ? 'text-success' : 'text-warning'
                      }`}>
                        <AlertCircle className="w-3.5 h-3.5" />
                        Payment: {order.paymentStatus === 'verified' ? 'Cash on Delivery - Verified ✓' : `Cash on Delivery - Pay ₹${order.total.toLocaleString()} cash upon delivery`}
                      </div>
                    )}
                  </div>

                  {order.paymentMethod === 'gpay' && isPaymentExpanded && payment?.status !== 'verified' && (
                    <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100 space-y-3 animate-fade-in">
                      <p className="text-xs font-semibold text-primary text-center">
                        Scan to pay ₹{order.total.toLocaleString()} via GPay/UPI
                      </p>
                      
                      {/* QR / UPI Display */}
                      <div className="w-32 h-32 mx-auto bg-white rounded-xl border border-neutral-200 flex flex-col items-center justify-center p-2">
                        {settings.gpayQR ? (
                          <img src={settings.gpayQR} alt="GPay QR" className="w-full h-full object-contain rounded-lg" />
                        ) : (
                          <div className="text-center p-1">
                            <Smartphone className="w-8 h-8 text-neutral-300 mx-auto mb-1" />
                            <span className="text-[9px] text-neutral-400 block">No QR code configured</span>
                          </div>
                        )}
                      </div>
                      {settings.gpayUPI && (
                        <p className="text-center text-[11px] text-neutral-500">
                          UPI ID: <span className="font-semibold text-primary text-xs select-all">{settings.gpayUPI}</span>
                        </p>
                      )}

                      {/* Screenshot Section */}
                      <div className="pt-2 border-t border-neutral-100">
                        {payment?.screenshot ? (
                          <div className="space-y-2">
                            <p className="text-[11px] text-neutral-500 font-medium">Your uploaded screenshot:</p>
                            <div className="relative w-24 aspect-[3/4] rounded-lg overflow-hidden border border-neutral-200 bg-white">
                              <img src={payment.screenshot} alt="Screenshot preview" className="w-full h-full object-cover" />
                              <button
                                onClick={() => setViewImg(payment.screenshot)}
                                className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-semibold"
                              >
                                View Larger
                              </button>
                            </div>
                            <label className="btn-outline py-1 px-2.5 text-[10px] cursor-pointer inline-flex items-center gap-1 bg-white">
                              <Upload className="w-3 h-3" /> Change Screenshot
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleScreenshotUpload(order.id, e)} />
                            </label>
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs font-semibold text-neutral-600 mb-1.5">Upload Payment Screenshot</p>
                            <label className="btn-primary py-1.5 px-4 text-xs cursor-pointer inline-flex items-center gap-1.5">
                              <Upload className="w-3.5 h-3.5" /> Select Screenshot File
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleScreenshotUpload(order.id, e)} />
                            </label>
                            <p className="text-[10px] text-neutral-400 mt-1">Please upload the transaction confirmation image to complete verification.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tracking Timeline */}
                {selectedOrder?.id === order.id && order.status !== 'payment_rejected' && (
                  <div className="mt-4 pt-4 border-t border-neutral-100 animate-fade-in">
                    <p className="text-xs font-semibold text-neutral-500 mb-3 uppercase tracking-wide">Order Timeline</p>
                    <div className="flex items-start gap-0 overflow-x-auto scrollbar-hide pb-2">
                      {STATUS_STEPS.map((status, i) => {
                        const StepIcon = STATUS_ICONS[status];
                        const done = i <= stepIdx;
                        const current = i === stepIdx;
                        return (
                          <div key={status} className="flex items-center">
                            <div className="flex flex-col items-center min-w-[80px]">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                                done ? 'bg-success text-white' : 'bg-neutral-100 text-neutral-300'
                              } ${current ? 'ring-4 ring-success/20' : ''}`}>
                                {done ? <CheckCircle className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                              </div>
                              <p className={`text-xs text-center mt-1.5 font-medium max-w-[75px] ${done ? 'text-primary' : 'text-neutral-300'}`}>
                                {STATUS_LABELS[status]}
                              </p>
                            </div>
                            {i < STATUS_STEPS.length - 1 && (
                              <div className={`w-12 md:w-20 h-0.5 mb-5 transition-all ${i < stepIdx ? 'bg-success' : 'bg-neutral-200'}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {order.trackingId && (
                      <p className="text-xs text-neutral-500 mt-2">
                        Tracking ID: <span className="font-mono font-semibold text-primary">{order.trackingId}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>

    {/* Screenshot Viewer Modal */}
    {viewImg && (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={() => setViewImg(null)}
      >
        <div 
          className="relative bg-white rounded-2xl p-4 max-w-sm w-full animate-scale-in"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-3">
            <p className="font-semibold text-primary">Uploaded Screenshot</p>
            <button onClick={() => setViewImg(null)}>✕</button>
          </div>
          <img src={viewImg} alt="Payment Screenshot" className="w-full rounded-xl object-contain max-h-[70vh] bg-neutral-50" />
        </div>
      </div>
    )}
    </>
  );
};

export default OrdersPage;
