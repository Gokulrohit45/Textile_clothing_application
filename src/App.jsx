import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';

// Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Customer Pages
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/WishlistPage';
import SearchPage from './pages/SearchPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// Admin Pages
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminProducts from './admin/AdminProducts';
import AdminCategories from './admin/AdminCategories';
import AdminInventory from './admin/AdminInventory';
import AdminOrders from './admin/AdminOrders';
import AdminPayments from './admin/AdminPayments';
import AdminBanners from './admin/AdminBanners';
import AdminCoupons from './admin/AdminCoupons';
import AdminReviews from './admin/AdminReviews';
import AdminCustomers from './admin/AdminCustomers';
import AdminSettings from './admin/AdminSettings';
import SecureAdminTab from './admin/SecureAdminTab';

// Protected route wrappers
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  return isLoggedIn ? children : <Navigate to="/login" replace state={{ from: location }} />;
};

const AdminRoute = ({ children }) => {
  const { isAdmin, isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

const PolicyPage = () => {
  const { slug } = useParams();
  const { settings } = useSettings();
  const content = {
    privacy: { title: 'Privacy Policy', body: settings.privacyPolicy },
    returns: { title: 'Return Policy', body: settings.returnPolicy },
    terms: { title: 'Terms & Conditions', body: settings.termsAndConditions },
  };
  const page = content[slug] || { title: 'Policy', body: 'Content not found.' };
  return (
    <div className="container-main pt-24 pb-16 min-h-screen">
      <h1 className="font-display font-bold text-2xl text-primary mb-6">{page.title}</h1>
      <div className="card p-6">
        <p className="text-neutral-600 leading-relaxed whitespace-pre-line">{page.body}</p>
      </div>
    </div>
  );
};

// Main customer layout
const CustomerLayout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
  </>
);

const App = () => {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AuthProvider>
          <ProductProvider>
            <CartProvider>
              <OrderProvider>
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 3000,
                    style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' },
                    success: { iconTheme: { primary: '#27AE60', secondary: '#fff' } },
                    error: { iconTheme: { primary: '#C0392B', secondary: '#fff' } },
                  }}
                />
                <Routes>
                  {/* Customer Routes */}
                  <Route path="/" element={<CustomerLayout><HomePage /></CustomerLayout>} />
                  <Route path="/category/:slug" element={<CustomerLayout><CategoryPage /></CustomerLayout>} />
                  <Route path="/product/:id" element={<CustomerLayout><ProductDetailPage /></CustomerLayout>} />
                  <Route path="/search" element={<CustomerLayout><SearchPage /></CustomerLayout>} />
                  <Route path="/sale" element={<Navigate to="/search?featured=true" replace />} />
                  <Route path="/cart" element={<CustomerLayout><CartPage /></CustomerLayout>} />
                  <Route path="/policy/:slug" element={<CustomerLayout><PolicyPage /></CustomerLayout>} />

                  {/* Auth */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                  {/* Protected Customer */}
                  <Route path="/checkout" element={<ProtectedRoute><CustomerLayout><CheckoutPage /></CustomerLayout></ProtectedRoute>} />
                  <Route path="/orders" element={<ProtectedRoute><CustomerLayout><OrdersPage /></CustomerLayout></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><CustomerLayout><ProfilePage /></CustomerLayout></ProtectedRoute>} />
                  <Route path="/wishlist" element={<ProtectedRoute><CustomerLayout><WishlistPage /></CustomerLayout></ProtectedRoute>} />

                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="inventory" element={<AdminInventory />} />
                    <Route path="orders" element={<SecureAdminTab><AdminOrders /></SecureAdminTab>} />
                    <Route path="payments" element={<SecureAdminTab><AdminPayments /></SecureAdminTab>} />
                    <Route path="banners" element={<AdminBanners />} />
                    <Route path="coupons" element={<AdminCoupons />} />
                    <Route path="reviews" element={<AdminReviews />} />
                    <Route path="customers" element={<AdminCustomers />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>

                  {/* 404 */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </OrderProvider>
            </CartProvider>
          </ProductProvider>
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
};

export default App;
