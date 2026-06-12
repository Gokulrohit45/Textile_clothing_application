import { useState } from 'react';
import { CheckCircle, XCircle, Eye, X, Upload, QrCode } from 'lucide-react';
import { useOrder } from '../context/OrderContext';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';

const AdminPayments = () => {
  const { payments, orders, verifyPayment } = useOrder();
  const { settings, updateSettings } = useSettings();
  const [filter, setFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all'); // 'all', 'gpay', 'cod'
  const [viewImg, setViewImg] = useState(null);

  // QR Config state
  const [upiInput, setUpiInput] = useState(settings.gpayUPI || '');
  const [qrImage, setQrImage] = useState(settings.gpayQR || null);

  const handleSaveQRConfig = () => {
    updateSettings({ gpayUPI: upiInput, gpayQR: qrImage });
    toast.success('UPI & QR Code config updated successfully!');
  };

  const handleQRUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setQrImage(ev.target.result);
      toast.success('QR Code image uploaded! Save changes to apply.');
    };
    reader.readAsDataURL(file);
  };

  const getOrder = (id) => orders.find(o => o.id === id);

  // Synthesize COD payments from orders list
  const codPayments = orders
    .filter(o => o.paymentMethod === 'cod')
    .map(o => ({
      id: `cod-${o.id}`,
      orderId: o.id,
      method: 'cod',
      amount: o.total,
      screenshot: null,
      status: o.paymentStatus || 'pending',
      verifiedAt: o.status === 'delivered' ? o.updatedAt : ''
    }));

  const allPayments = [...payments, ...codPayments];

  const filtered = allPayments.filter(p => {
    const matchesStatus = filter === 'all' || p.status === filter;
    const matchesMethod = methodFilter === 'all' || p.method === methodFilter;
    return matchesStatus && matchesMethod;
  });

  const handleVerify = async (orderId, approved) => {
    const success = await verifyPayment(orderId, approved);
    if (success) {
      toast.success(approved ? '✓ Payment verified!' : '✗ Payment rejected');
    } else {
      toast.error('Failed to verify payment');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-xl text-primary">Payment Management</h2>
          <p className="text-neutral-400 text-sm">Verify GPay screenshot uploads and manage COD payments</p>
        </div>
      </div>

      {/* Quick QR Code & UPI Config Widget */}
      <div className="card p-5 bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-primary text-sm">Customer QR & UPI Config</h3>
              <p className="text-xs text-neutral-500">Configure the QR code and UPI ID shown to customers during checkout.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-1.5 border border-neutral-200">
              <span className="text-xs text-neutral-400 font-medium whitespace-nowrap">UPI ID:</span>
              <input 
                className="text-xs font-semibold text-primary bg-transparent border-0 outline-none w-44" 
                placeholder="e.g. shop@upi" 
                value={upiInput} 
                onChange={e => setUpiInput(e.target.value)} 
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="btn-outline py-1.5 px-3 text-xs gap-1.5 cursor-pointer bg-white">
                <Upload className="w-3.5 h-3.5" /> 
                {qrImage ? 'Change QR' : 'Upload QR'}
                <input type="file" accept="image/*" className="hidden" onChange={handleQRUpload} />
              </label>
              {qrImage && (
                <div className="relative group">
                  <img src={qrImage} alt="QR Thumbnail" className="w-8 h-8 rounded border border-neutral-200 object-contain bg-white animate-scale-in" />
                  <button onClick={() => setQrImage(null)} className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-danger text-white rounded-full text-[8px] flex items-center justify-center">×</button>
                </div>
              )}
            </div>
            <button 
              onClick={handleSaveQRConfig} 
              className="btn-primary py-1.5 px-4 text-xs font-semibold"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Payments', value: allPayments.length, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Pending Review', value: allPayments.filter(p => p.status === 'pending').length, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Verified', value: allPayments.filter(p => p.status === 'verified').length, color: 'text-success', bg: 'bg-success/10' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="card p-4 text-center">
            <p className={`text-2xl font-display font-bold ${color}`}>{value}</p>
            <p className="text-xs text-neutral-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          {[['all', 'All Statuses'], ['pending', 'Pending'], ['verified', 'Verified'], ['rejected', 'Rejected']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === val ? 'bg-primary text-white' : 'bg-white text-neutral-600 border border-neutral-200 hover:border-primary'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Method Filter */}
        <div className="flex flex-wrap gap-2">
          {[['all', 'All Methods'], ['gpay', 'GPay & UPI'], ['cod', 'Cash on Delivery (COD)']].map(([val, label]) => (
            <button key={val} onClick={() => setMethodFilter(val)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${methodFilter === val ? 'bg-primary text-white' : 'bg-white text-neutral-600 border border-neutral-200 hover:border-primary'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Cards */}
      <div className="space-y-4">
        {filtered.map(payment => {
          const order = getOrder(payment.orderId);
          return (
            <div key={payment.id} className="card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-neutral-400">#{payment.orderId.toUpperCase()}</span>
                    <span className={`badge ${payment.status === 'verified' ? 'badge-success' : payment.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                      {payment.status}
                    </span>
                  </div>
                  <p className="font-bold text-xl text-primary font-display">₹{payment.amount.toLocaleString()}</p>
                  <p className="text-sm text-neutral-500">{order?.userName} • {payment.method?.toUpperCase()} • {order?.createdAt}</p>
                </div>
                <div className="flex items-center gap-2">
                  {payment.screenshot && (
                    <button
                      id={`view-screenshot-${payment.id}`}
                      onClick={() => setViewImg(payment.screenshot)}
                      className="btn-outline btn-sm gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Screenshot
                    </button>
                  )}
                  {payment.status === 'pending' && (
                    <>
                      <button
                        id={`approve-payment-${payment.id}`}
                        onClick={() => handleVerify(payment.orderId, true)}
                        className="btn-primary btn-sm gap-1.5 bg-success hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        id={`reject-payment-${payment.id}`}
                        onClick={() => handleVerify(payment.orderId, false)}
                        className="btn-danger btn-sm gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>

              {!payment.screenshot && payment.method === 'gpay' && payment.status === 'pending' && (
                <div className="mt-3 bg-warning/10 text-warning text-xs rounded-lg px-3 py-2">
                  ⚠️ Customer has not yet uploaded payment screenshot
                </div>
              )}
              {payment.verifiedAt && (
                <p className="text-xs text-neutral-400 mt-2">
                  {payment.status === 'verified' ? '✓ Verified' : '✗ Rejected'} on {payment.verifiedAt}
                </p>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 card">
            <p className="text-neutral-400">No payments found</p>
          </div>
        )}
      </div>

      {/* Screenshot Viewer */}
      {viewImg && (
        <div className="overlay fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setViewImg(null)}>
          <div className="relative bg-white rounded-2xl p-4 max-w-sm w-full animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <p className="font-semibold text-primary">Payment Screenshot</p>
              <button onClick={() => setViewImg(null)}><X className="w-5 h-5 text-neutral-400" /></button>
            </div>
            <img src={viewImg} alt="Payment Screenshot" className="w-full rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
