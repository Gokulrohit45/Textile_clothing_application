import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ShoppingCart, Users, Package, TrendingUp, AlertTriangle, CreditCard, ArrowUp, ArrowDown, RotateCcw, X } from 'lucide-react';
import { useProduct } from '../context/ProductContext';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { products, categories, getLowStockItems, getOutOfStockItems } = useProduct();
  const { orders, getPendingPayments, getRevenueStats } = useOrder();
  const { customers } = useAuth();
  const stats = getRevenueStats();
  const lowStock = getLowStockItems(5);
  const outOfStock = getOutOfStockItems();
  const pendingPay = getPendingPayments();

  const [showReturnsModal, setShowReturnsModal] = useState(false);

  const returnedOrders = orders.filter(o => o.status && o.status.startsWith('return_'));
  const pendingReturns = returnedOrders.filter(o => o.status === 'return_pending');
  const approvedReturns = returnedOrders.filter(o => o.status === 'return_approved');
  const rejectedReturns = returnedOrders.filter(o => o.status === 'return_rejected');

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  // Dynamic monthly revenue calculation (last 6 months up to current month)
  const getMonthlyRevenueData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    const last6 = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      last6.push({
        monthName: months[d.getMonth()],
        yearMonth: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        revenue: 0
      });
    }

    orders.forEach(o => {
      if (o.paymentStatus === 'verified' && o.createdAt) {
        const yearMonth = o.createdAt.substring(0, 7); // '2026-06'
        const match = last6.find(m => m.yearMonth === yearMonth);
        if (match) {
          match.revenue += Number(o.total || 0);
        }
      }
    });

    return last6.map(m => ({
      month: m.monthName,
      revenue: m.revenue
    }));
  };

  const revenueData = getMonthlyRevenueData();

  // Dynamic category sales calculation (based on quantities sold in active categories)
  const getCategorySalesData = () => {
    const salesMap = {};
    categories.forEach(cat => {
      salesMap[cat.id] = { name: cat.name, orders: 0 };
    });

    orders.forEach(order => {
      if (order.status !== 'payment_rejected' && order.items) {
        order.items.forEach(item => {
          const product = products.find(p => p.id === item.productId);
          if (product && salesMap[product.categoryId]) {
            salesMap[product.categoryId].orders += Number(item.qty || 0);
          }
        });
      }
    });

    return Object.values(salesMap);
  };

  const catData = getCategorySalesData();

  // Helper to calculate top-selling products by category
  const getTopCategorySellers = () => {
    const productSales = {};
    orders.forEach(order => {
      if (order.status !== 'payment_rejected' && order.items) {
        order.items.forEach(item => {
          const pId = item.productId;
          productSales[pId] = (productSales[pId] || 0) + Number(item.qty || 0);
        });
      }
    });

    const topSellers = [];
    categories.forEach(cat => {
      let maxSales = 0;
      let topProduct = null;

      const catProducts = products.filter(p => p.categoryId === cat.id);
      catProducts.forEach(p => {
        const sales = productSales[p.id] || 0;
        if (sales > maxSales) {
          maxSales = sales;
          topProduct = p;
        }
      });

      topSellers.push({
        categoryName: cat.name,
        productName: topProduct ? topProduct.name : 'No sales yet',
        sales: maxSales,
        productImage: topProduct?.images?.[0] || null
      });
    });
    return topSellers;
  };

  const topSellersData = getTopCategorySellers();

  // Helper to calculate most returned products and their reasons
  const getMostReturnedProducts = () => {
    const productReturns = {};
    
    orders.forEach(order => {
      const isReturnedStatus = order.status && order.status.startsWith('return_');
      if (isReturnedStatus && order.items) {
        order.items.forEach(item => {
          const pId = item.productId;
          if (!productReturns[pId]) {
            const prod = products.find(p => p.id === pId);
            productReturns[pId] = {
              productName: prod ? prod.name : pId,
              productImage: prod?.images?.[0] || null,
              count: 0,
              reasons: []
            };
          }
          productReturns[pId].count += 1;
          const reason = order.customerReturnReason || order.returnReason;
          if (reason) {
            productReturns[pId].reasons.push(reason);
          }
        });
      }
    });

    return Object.values(productReturns)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(item => {
        const reasonCounts = {};
        let topReason = 'Not specified';
        let maxReasonCount = 0;
        item.reasons.forEach(r => {
          reasonCounts[r] = (reasonCounts[r] || 0) + 1;
          if (reasonCounts[r] > maxReasonCount) {
            maxReasonCount = reasonCounts[r];
            topReason = r;
          }
        });
        return {
          productName: item.productName,
          productImage: item.productImage,
          count: item.count,
          topReason
        };
      });
  };

  const returnedProductsData = getMostReturnedProducts();

  const statCards = [
    {
      title: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`,
      icon: TrendingUp, change: '+12.5%', positive: true, color: 'text-success', bg: 'bg-success/10'
    },
    {
      title: 'Total Orders', value: orders.length.toString(),
      icon: ShoppingCart, change: '+8.2%', positive: true, color: 'text-primary', bg: 'bg-primary/10'
    },
    {
      title: 'Returns', value: returnedOrders.length.toString(),
      icon: RotateCcw, change: `${pendingReturns.length} pending`, positive: false, color: 'text-warning', bg: 'bg-warning/10',
      clickable: true, onClick: () => setShowReturnsModal(true)
    },
    {
      title: 'Total Products', value: products.length.toString(),
      icon: Package, change: '+3 new', positive: true, color: 'text-accent-700', bg: 'bg-accent/10'
    },
    {
      title: 'Customers', value: customers.filter(c => c.role === 'customer').length.toString(),
      icon: Users, change: '+5.1%', positive: true, color: 'text-blue-600', bg: 'bg-blue-50'
    },
  ];

  const STATUS_COLOR = {
    pending: 'badge-warning',
    processing: 'badge-primary',
    shipped: 'badge-neutral',
    delivered: 'badge-success',
    payment_rejected: 'badge-danger',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-primary">Dashboard</h1>
        <p className="text-neutral-400 text-sm mt-0.5">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Alerts */}
      {(lowStock.length > 0 || pendingPay.length > 0) && (
        <div className="flex flex-wrap gap-3">
          {lowStock.length > 0 && (
            <div className="flex items-center gap-2 bg-warning/10 border border-warning/20 rounded-xl px-4 py-2.5 text-sm text-warning font-medium">
              <AlertTriangle className="w-4 h-4" />
              {lowStock.length} products running low on stock
            </div>
          )}
          {pendingPay.length > 0 && (
            <div className="flex items-center gap-2 bg-danger/10 border border-danger/20 rounded-xl px-4 py-2.5 text-sm text-danger font-medium">
              <CreditCard className="w-4 h-4" />
              {pendingPay.length} payment{pendingPay.length > 1 ? 's' : ''} awaiting verification
            </div>
          )}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map(({ title, value, icon: Icon, change, positive, color, bg, clickable, onClick }) => (
          <div 
            key={title} 
            className={`card p-5 ${clickable ? 'cursor-pointer hover:shadow-card transition-all hover:scale-[1.02]' : ''}`}
            onClick={clickable ? onClick : undefined}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <span className={`text-xs font-semibold flex items-center gap-0.5 ${positive ? 'text-success' : 'text-danger'}`}>
                {positive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {change}
              </span>
            </div>
            <p className="text-2xl font-display font-bold text-primary">{value}</p>
            <p className="text-xs text-neutral-400 mt-0.5">{title}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card p-5">
          <h3 className="font-semibold text-primary mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1A1A2E" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1A1A2E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#1A1A2E" fill="url(#revenueGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Chart */}
        <div className="card p-5">
          <h3 className="font-semibold text-primary mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={catData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={50} />
              <Tooltip />
              <Bar dataKey="orders" fill="#E8B86D" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product Performance & Return Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Category Sellers */}
        <div className="card p-5">
          <h3 className="font-semibold text-primary mb-4">Top Category Sellers</h3>
          <div className="space-y-4">
            {topSellersData.map(seller => (
              <div key={seller.categoryName} className="flex items-center gap-4 py-2 border-b border-neutral-50 last:border-0 last:pb-0">
                {seller.productImage ? (
                  <img src={seller.productImage} alt={seller.productName} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-neutral-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-accent-700 uppercase tracking-wider">{seller.categoryName}</p>
                  <p className="text-sm font-semibold text-primary truncate mt-0.5" title={seller.productName}>{seller.productName}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{seller.sales} units sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Returned Products */}
        <div className="card p-5">
          <h3 className="font-semibold text-primary mb-4">Most Returned Products</h3>
          {returnedProductsData.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-12">No product returns recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {returnedProductsData.map(item => (
                <div key={item.productName} className="flex items-center gap-4 py-2 border-b border-neutral-50 last:border-0 last:pb-0">
                  {item.productImage ? (
                    <img src={item.productImage} alt={item.productName} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-neutral-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-primary truncate" title={item.productName}>{item.productName}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">Returned {item.count} time{item.count > 1 ? 's' : ''}</p>
                    <p className="text-[11px] text-danger font-medium mt-0.5 truncate" title={item.topReason}>
                      Common Reason: {item.topReason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-primary">Recent Orders</h3>
            <a href="/admin/orders" className="text-xs text-accent-700 font-medium hover:underline">View All</a>
          </div>
          <div className="space-y-3">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-primary">{order.userName}</p>
                  <p className="text-xs text-neutral-400">#{order.id} • {order.createdAt}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">₹{order.total.toLocaleString()}</p>
                  <span className={`badge text-xs ${STATUS_COLOR[order.status] || 'badge-neutral'}`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-primary">Stock Alerts</h3>
            <a href="/admin/inventory" className="text-xs text-accent-700 font-medium hover:underline">Manage Inventory</a>
          </div>
          {lowStock.length === 0 && outOfStock.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-6">All products well-stocked! ✓</p>
          ) : (
            <div className="space-y-2">
              {outOfStock.slice(0, 3).map(item => (
                <div key={item.id} className="flex items-center justify-between p-2.5 bg-danger/5 rounded-xl">
                  <div>
                    <p className="text-xs font-medium text-primary">{item.productId} / {item.colorName} / {item.size}</p>
                  </div>
                  <span className="badge-danger text-xs">OUT OF STOCK</span>
                </div>
              ))}
              {lowStock.slice(0, 4).map(item => (
                <div key={item.id} className="flex items-center justify-between p-2.5 bg-warning/5 rounded-xl">
                  <div>
                    <p className="text-xs font-medium text-primary">{item.productId} / {item.colorName} / {item.size}</p>
                  </div>
                  <span className="badge-warning text-xs">{item.stock} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Returned Products Modal */}
      {showReturnsModal && (
        <div className="overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowReturnsModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-card-hover animate-scale-in max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-neutral-100">
              <div>
                <h3 className="font-bold text-lg text-primary">Returned Products Directory</h3>
                <p className="text-xs text-neutral-400">Manage customer returns and refunds status</p>
              </div>
              <button onClick={() => setShowReturnsModal(false)} className="btn-ghost p-1.5 rounded-lg"><X className="w-5 h-5 text-neutral-400" /></button>
            </div>
            
            {/* Status counts summary row */}
            <div className="grid grid-cols-3 gap-3 p-5 bg-neutral-50 border-b border-neutral-100">
              <div className="bg-white border border-neutral-100 rounded-xl p-3 text-center">
                <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Return Pending</p>
                <p className="text-lg font-bold text-warning mt-1">{pendingReturns.length}</p>
              </div>
              <div className="bg-white border border-neutral-100 rounded-xl p-3 text-center">
                <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Return Approved</p>
                <p className="text-lg font-bold text-success mt-1">{approvedReturns.length}</p>
              </div>
              <div className="bg-white border border-neutral-100 rounded-xl p-3 text-center">
                <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Return Rejected</p>
                <p className="text-lg font-bold text-danger mt-1">{rejectedReturns.length}</p>
              </div>
            </div>

            {/* Content list */}
            <div className="flex-1 overflow-y-auto p-5">
              {returnedOrders.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-10">No returns recorded yet.</p>
              ) : (
                <div className="overflow-x-auto border border-neutral-100 rounded-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-100 text-xs font-semibold text-neutral-400 uppercase">
                        <th className="py-3 px-4">Order</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Return Reason</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50 text-sm">
                      {returnedOrders.map(order => (
                        <tr key={order.id} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-mono text-xs text-neutral-500 font-semibold">#{order.id.toUpperCase()}</span>
                            <p className="text-[10px] text-neutral-400 mt-0.5">{order.createdAt}</p>
                          </td>
                          <td className="py-3 px-4 font-medium text-primary">{order.userName}</td>
                          <td className="py-3 px-4 text-xs text-neutral-500 max-w-[220px] truncate" title={order.customerReturnReason || order.returnReason}>
                            {order.status === 'return_rejected' 
                              ? `Rejected: ${order.returnReason || 'Not specified'}`
                              : `Customer: ${order.customerReturnReason || 'Not specified'}`
                            }
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`badge text-xs ${
                              order.status === 'return_approved' ? 'badge-success' :
                              order.status === 'return_rejected' ? 'badge-danger' : 'badge-warning'
                            }`}>
                              {order.status === 'return_pending' ? 'Pending' : order.status === 'return_approved' ? 'Approved' : 'Rejected'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-primary">₹{order.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
