import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tag, BarChart3, ShoppingCart, CreditCard,
  Image, Ticket, Star, Users, Settings, ChevronLeft, Menu, X,
  AlertTriangle, ShoppingBag, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProduct } from '../context/ProductContext';
import { useOrder } from '../context/OrderContext';
import { useSettings } from '../context/SettingsContext';

const adminNavItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/categories', icon: Tag, label: 'Categories' },
  { to: '/admin/inventory', icon: BarChart3, label: 'Inventory' },
  { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { to: '/admin/banners', icon: Image, label: 'Banners' },
  { to: '/admin/coupons', icon: Ticket, label: 'Coupons' },
  { to: '/admin/reviews', icon: Star, label: 'Reviews' },
  { to: '/admin/customers', icon: Users, label: 'Customers' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { getLowStockItems } = useProduct();
  const { getPendingPayments } = useOrder();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const lowStockCount = getLowStockItems(5).length;
  const pendingPayments = getPendingPayments().length;

  const badges = {
    '/admin/inventory': lowStockCount > 0 ? lowStockCount : null,
    '/admin/payments': pendingPayments > 0 ? pendingPayments : null,
  };

  return (
    <div className="flex h-screen bg-secondary-200 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} bg-white shadow-nav flex flex-col transition-all duration-300 flex-shrink-0 z-30`}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-100">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              {settings.logo ? (
                <img src={settings.logo} alt={settings.siteName} className="w-7 h-7 rounded-lg object-contain" />
              ) : (
                <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-3.5 h-3.5 text-accent" />
                </div>
              )}
              <span className="font-display font-bold text-sm text-primary">{settings.siteName}</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4 text-neutral-400" /> : <Menu className="w-4 h-4 text-neutral-400" />}
          </button>
        </div>

        {/* Admin Badge */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-neutral-100">
            <div className="flex items-center gap-2 bg-primary/5 rounded-xl px-3 py-2">
              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.[0]}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-primary truncate">{user?.name}</p>
                <p className="text-xs text-accent-700 font-medium">Admin</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {adminNavItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `admin-nav-item relative ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm">{label}</span>}
              {badges[to] && (
                <span className={`${sidebarOpen ? 'ml-auto' : 'absolute -top-1 -right-1'} w-5 h-5 bg-danger text-white text-xs rounded-full flex items-center justify-center font-bold`}>
                  {badges[to]}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-neutral-100 space-y-1">
          <button
            onClick={() => navigate('/')}
            className="admin-nav-item w-full"
          >
            <ShoppingBag className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">View Store</span>}
          </button>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="admin-nav-item w-full text-danger hover:text-danger hover:bg-danger/5"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white shadow-nav h-14 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            {lowStockCount > 0 && (
              <div className="flex items-center gap-1.5 text-warning text-xs font-medium bg-warning/10 px-3 py-1.5 rounded-full">
                <AlertTriangle className="w-3.5 h-3.5" />
                {lowStockCount} low stock items
              </div>
            )}
            {pendingPayments > 0 && (
              <div className="flex items-center gap-1.5 text-danger text-xs font-medium bg-danger/10 px-3 py-1.5 rounded-full">
                <CreditCard className="w-3.5 h-3.5" />
                {pendingPayments} payment{pendingPayments > 1 ? 's' : ''} pending
              </div>
            )}
          </div>
          <p className="text-xs text-neutral-400">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
