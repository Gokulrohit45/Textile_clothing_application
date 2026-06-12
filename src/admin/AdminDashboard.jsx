import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ShoppingCart, Users, Package, TrendingUp, AlertTriangle, CreditCard, ArrowUp, ArrowDown } from 'lucide-react';
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ title, value, icon: Icon, change, positive, color, bg }) => (
          <div key={title} className="card p-5">
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
    </div>
  );
};

export default AdminDashboard;
