import { useState } from 'react';
import { Search, ChevronDown, Printer, Eye, X } from 'lucide-react';
import { useOrder } from '../context/OrderContext';
import { useSettings } from '../context/SettingsContext';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'payment_rejected'];
const STATUS_COLOR = {
  pending: 'badge-warning', processing: 'badge-primary', shipped: 'badge-neutral',
  delivered: 'badge-success', payment_rejected: 'badge-danger'
};

const AdminOrders = () => {
  const { orders, updateOrderStatus } = useOrder();
  const { settings } = useSettings();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');

  const filtered = orders.filter(o => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchSearch = o.id.includes(search.toLowerCase()) || o.userName?.toLowerCase().includes(search.toLowerCase());
    const matchMonth = selectedMonth === 'all' || (o.createdAt && o.createdAt.startsWith(selectedMonth));
    return matchStatus && matchSearch && matchMonth;
  });

  const getAvailableMonths = () => {
    const monthsSet = new Set();
    orders.forEach(o => {
      if (o.createdAt) {
        monthsSet.add(o.createdAt.substring(0, 7));
      }
    });
    return Array.from(monthsSet).sort().reverse();
  };

  const formatMonth = (yearMonth) => {
    const [year, month] = yearMonth.split('-');
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
  };

  const handleStatusUpdate = (orderId, status) => {
    updateOrderStatus(orderId, status, status === 'shipped' ? trackingInput || undefined : undefined);
    setTrackingInput('');
  };

  const handlePrint = (order) => {
    const siteName = settings?.siteName || 'PSP garments and clothing';
    const siteLogo = settings?.logo;
    const siteTagline = settings?.tagline || 'Dress Your Best, Every Day';
    const siteAddress = settings?.address || 'Delite Building 719, Puliyakulam Road, Dhamu nagar, Coimbatore - 641 045';
    const sitePhone = settings?.phone || '8903733144';
    const siteEmail = settings?.email || 'shanthiprabaa@gmail.com';

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
      <head>
        <title>Invoice - Order #${order.id.toUpperCase()}</title>
        <style>
          body { font-family: sans-serif; color: #333; padding: 30px; }
          .header { text-align: center; margin-bottom: 30px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
          .brand-logo { max-height: 60px; object-fit: contain; margin-bottom: 8px; }
          .brand { font-size: 24px; font-weight: bold; color: #1A1A2E; margin: 0; }
          .subtitle { font-size: 12px; color: #E8B86D; text-transform: uppercase; margin: 2px 0 0 0; }
          .meta { margin-top: 15px; font-size: 14px; color: #555; }
          .details { margin: 25px 0; padding: 15px; background: #FCFAF8; border-left: 4px solid #E8B86D; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background: #1A1A2E; color: white; padding: 10px; text-align: left; font-size: 14px; }
          td { padding: 10px; border-bottom: 1px solid #eee; text-align: left; font-size: 14px; }
          .totals { margin-left: auto; max-width: 300px; margin-top: 30px; font-size: 14px; text-align: right; }
          .totals table { width: 100%; border-collapse: collapse; }
          .totals td { padding: 5px 0; border: none; }
          .totals .grand-total { font-size: 16px; font-weight: bold; color: #1A1A2E; border-top: 1px solid #ddd; padding-top: 8px; }
          .footer { text-align: center; font-size: 11px; color: #999; margin-top: 50px; }
        </style>
      </head>
      <body>
        <div class="header">
          ${siteLogo ? `<img src="${siteLogo}" class="brand-logo" alt="${siteName}" />` : `<div class="brand">${siteName}</div>`}
          <div class="subtitle">${siteTagline}</div>
          <div class="meta">
            <strong>Order ID:</strong> #${order.id.toUpperCase()} &nbsp;&bull;&nbsp; 
            <strong>Date:</strong> ${order.createdAt}
          </div>
        </div>
        <div class="details">
          <strong>Customer:</strong> ${order.userName}<br/>
          <strong>Payment:</strong> ${order.paymentMethod?.toUpperCase()} (${order.paymentStatus})<br/>
          <strong>Delivery Destination:</strong> ${order.shippingAddress ? `${order.shippingAddress.name || order.userName}, ${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}` : 'N/A'}<br/>
          <strong>Merchant:</strong> ${siteName} | Phone: ${sitePhone} | Email: ${siteEmail} | Address: ${siteAddress}
        </div>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Details</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td><strong>${item.productName}</strong></td>
                <td>Size: ${item.size} | Color: ${item.color}</td>
                <td style="text-align: center;">${item.qty}</td>
                <td style="text-align: right;">₹${item.price}</td>
                <td style="text-align: right;"><strong>₹${item.price * item.qty}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="totals">
          <table>
            <tr><td>Subtotal:</td><td style="text-align: right;">₹${order.subtotal}</td></tr>
            ${order.discount > 0 ? `<tr><td style="color: #DC2626;">Discount:</td><td style="text-align: right; color: #DC2626;">-₹${order.discount}</td></tr>` : ''}
            <tr><td>Shipping:</td><td style="text-align: right;">${order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</td></tr>
            <tr class="grand-total"><td>Net Total:</td><td style="text-align: right;">₹${order.total}</td></tr>
          </table>
        </div>
        <div class="footer">
          ${siteName} E-Commerce Platform &bull; Printed Invoice
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handlePrintMonthlyInvoice = (ordersList, monthKey) => {
    const siteName = settings?.siteName || 'PSP garments and clothing';
    const siteLogo = settings?.logo;
    const siteTagline = settings?.tagline || 'Dress Your Best, Every Day';

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let totalSubtotal = 0;
    let totalDiscount = 0;
    let totalShipping = 0;
    let totalNet = 0;

    ordersList.forEach(o => {
      totalSubtotal += Number(o.subtotal || 0);
      totalDiscount += Number(o.discount || 0);
      totalShipping += Number(o.shipping || 0);
      totalNet += Number(o.total || 0);
    });

    const periodName = monthKey === 'all' ? 'All Time Orders' : formatMonth(monthKey);

    printWindow.document.write(`
      <html>
      <head>
        <title>Monthly Statement - ${periodName}</title>
        <style>
          body { font-family: sans-serif; color: #333; padding: 30px; }
          .header { text-align: center; margin-bottom: 30px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
          .brand-logo { max-height: 60px; object-fit: contain; margin-bottom: 8px; }
          .brand { font-size: 24px; font-weight: bold; color: #1A1A2E; margin: 0; }
          .subtitle { font-size: 12px; color: #E8B86D; text-transform: uppercase; margin: 2px 0 0 0; }
          .meta { margin-top: 15px; font-size: 14px; color: #555; }
          
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 25px 0; }
          .stat-card { padding: 15px; background: #FCFAF8; border-top: 3px solid #E8B86D; border-radius: 8px; text-align: center; }
          .stat-val { font-size: 18px; font-weight: bold; color: #1A1A2E; margin-top: 5px; }
          .stat-lbl { font-size: 11px; text-transform: uppercase; color: #888; letter-spacing: 0.5px; }

          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background: #1A1A2E; color: white; padding: 10px; text-align: left; font-size: 12px; }
          td { padding: 10px; border-bottom: 1px solid #eee; text-align: left; font-size: 12px; vertical-align: top; }
          
          .item-desc { font-size: 11px; color: #666; margin-top: 3px; }
          .footer { text-align: center; font-size: 11px; color: #999; margin-top: 50px; }
          @media print {
            .no-print { display: none; }
            body { padding: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          ${siteLogo ? `<img src="${siteLogo}" class="brand-logo" alt="${siteName}" />` : `<div class="brand">${siteName}</div>`}
          <div class="subtitle">Monthly Sales Statement & Invoice</div>
          <div class="meta">
            <strong>Statement Period:</strong> ${periodName} &nbsp;&bull;&nbsp; 
            <strong>Total Orders:</strong> ${ordersList.length} &nbsp;&bull;&nbsp;
            <strong>Generated:</strong> ${new Date().toLocaleDateString()}
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-lbl">Gross Subtotal</div>
            <div class="stat-val">₹${totalSubtotal.toLocaleString()}</div>
          </div>
          <div class="stat-card">
            <div class="stat-lbl">Total Discount</div>
            <div class="stat-val">-₹${totalDiscount.toLocaleString()}</div>
          </div>
          <div class="stat-card">
            <div class="stat-lbl">Total Shipping</div>
            <div class="stat-val">₹${totalShipping.toLocaleString()}</div>
          </div>
          <div class="stat-card">
            <div class="stat-lbl">Net Revenue</div>
            <div class="stat-val" style="color: #1A1A2E;">₹${totalNet.toLocaleString()}</div>
          </div>
        </div>

        <h3>Order Ledger & Details</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items & Configuration</th>
              <th>Payment Info</th>
              <th>Status</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${ordersList.map(order => `
              <tr>
                <td>${order.createdAt}</td>
                <td style="font-family: monospace;">#${order.id.toUpperCase()}</td>
                <td><strong>${order.userName}</strong></td>
                <td>
                  ${order.items.map(item => `
                    <div>${item.productName} (Qty: ${item.qty}) <span class="item-desc">[Size: ${item.size} | Color: ${item.color}]</span></div>
                  `).join('')}
                </td>
                <td>${order.paymentMethod?.toUpperCase()} (${order.paymentStatus})</td>
                <td><span style="text-transform: capitalize;">${order.status}</span></td>
                <td style="text-align: right; font-weight: bold;">₹${order.total.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          ${siteName} Business Administration Dashboard &bull; Generated Monthly Invoice Statement
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="font-display font-bold text-xl text-primary">Orders</h2>
        <p className="text-neutral-400 text-sm">{orders.length} total orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 flex-1">
          <div className="relative flex-1 min-w-48 max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input className="input pl-10" placeholder="Search by order ID or customer..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input w-44" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="input w-44" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
            <option value="all">All Months</option>
            {getAvailableMonths().map(m => (
              <option key={m} value={m}>{formatMonth(m)}</option>
            ))}
          </select>
        </div>
        {filtered.length > 0 && (
          <button
            onClick={() => handlePrintMonthlyInvoice(filtered, selectedMonth)}
            className="btn-accent gap-2 py-2 px-4 rounded-xl text-sm font-semibold flex items-center h-[42px]"
          >
            <Printer className="w-4 h-4" />
            Print Monthly Invoice
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                {['Order', 'Customer', 'Date', 'Total', 'Payment', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {filtered.map(order => (
                <tr key={order.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs text-neutral-500">#{order.id.toUpperCase()}</p>
                    <p className="text-xs text-neutral-400">{order.items.length} items</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-primary">{order.userName}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-400">{order.createdAt}</td>
                  <td className="px-4 py-3 font-bold text-sm text-primary">₹{order.total.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${order.paymentStatus === 'verified' ? 'badge-success' : order.paymentStatus === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                      {order.paymentMethod?.toUpperCase()} • {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      id={`order-status-${order.id}`}
                      value={order.status}
                      onChange={e => handleStatusUpdate(order.id, e.target.value)}
                      className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 outline-none cursor-pointer ${
                        order.status === 'delivered' ? 'bg-success/10 text-success' :
                        order.status === 'shipped' ? 'bg-primary/10 text-primary' :
                        order.status === 'payment_rejected' ? 'bg-danger/10 text-danger' :
                        order.status === 'processing' ? 'bg-blue-50 text-blue-600' :
                        'bg-warning/10 text-warning'
                      }`}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      id={`view-order-${order.id}`}
                      onClick={() => setSelectedOrder(order)}
                      className="btn-ghost p-1.5 rounded-lg"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center py-10 text-neutral-400 text-sm">No orders found</p>}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="overlay fixed inset-0 z-50 flex items-end md:items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-card-hover animate-slide-up max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b border-neutral-100 sticky top-0 bg-white">
              <div>
                <h3 className="font-bold text-primary">Order #{selectedOrder.id.toUpperCase()}</h3>
                <p className="text-xs text-neutral-400">{selectedOrder.createdAt}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handlePrint(selectedOrder)} className="btn-ghost p-2 rounded-xl" title="Print Invoice"><Printer className="w-4 h-4" /></button>
                <button onClick={() => setSelectedOrder(null)}><X className="w-5 h-5 text-neutral-400" /></button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {/* Customer */}
              <div className="bg-neutral-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-neutral-500 uppercase mb-2">Customer</p>
                <p className="font-semibold text-primary">{selectedOrder.userName}</p>
                {selectedOrder.shippingAddress && (
                  <p className="text-sm text-neutral-500 mt-1">
                    {selectedOrder.shippingAddress.addressLine1}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                  </p>
                )}
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase mb-2">Items</p>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-neutral-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-primary">{item.productName}</p>
                      <p className="text-xs text-neutral-400">{item.size} • {item.color} • ×{item.qty}</p>
                    </div>
                    <span className="font-semibold text-sm">₹{(item.price * item.qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="bg-neutral-50 rounded-xl p-4 space-y-1.5">
                <div className="flex justify-between text-sm"><span className="text-neutral-500">Subtotal</span><span>₹{selectedOrder.subtotal?.toLocaleString()}</span></div>
                {selectedOrder.discount > 0 && <div className="flex justify-between text-sm text-success"><span>Discount</span><span>-₹{selectedOrder.discount}</span></div>}
                <div className="flex justify-between text-sm"><span className="text-neutral-500">Shipping</span><span>{selectedOrder.shipping === 0 ? 'FREE' : `₹${selectedOrder.shipping}`}</span></div>
                <div className="flex justify-between font-bold text-primary border-t border-neutral-200 pt-2 mt-2"><span>Total</span><span>₹{selectedOrder.total?.toLocaleString()}</span></div>
              </div>

              {/* Update Status */}
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase mb-2">Update Status</p>
                <div className="flex gap-2 flex-wrap">
                  {STATUSES.map(status => (
                    <button
                      key={status}
                      onClick={() => { handleStatusUpdate(selectedOrder.id, status); setSelectedOrder({ ...selectedOrder, status }); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                        selectedOrder.status === status ? 'bg-primary text-white border-primary' : 'border-neutral-200 text-neutral-600 hover:border-primary'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                {selectedOrder.status !== 'shipped' && (
                  <div className="flex gap-2 mt-2">
                    <input className="input py-2 text-sm flex-1" placeholder="Tracking ID (when shipping)" value={trackingInput} onChange={e => setTrackingInput(e.target.value)} />
                    <button onClick={() => { handleStatusUpdate(selectedOrder.id, 'shipped'); setSelectedOrder({ ...selectedOrder, status: 'shipped' }); }} className="btn-primary btn-sm">Ship</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
