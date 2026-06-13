import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';

const DEFAULT_LOGIN_IMAGE = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80';

export const LoginPage = () => {
  const { login } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const result = await login(form.email, form.password);
      if (result.success) {
        toast.success(`Welcome back, ${result.user.name}!`);
        const searchParams = new URLSearchParams(location.search);
        const redirectParam = searchParams.get('redirect');
        const stateRedirect = location.state?.from?.pathname;
        const defaultPath = result.user.role === 'admin' ? '/admin' : '/';
        const finalRedirect = redirectParam || stateRedirect || defaultPath;
        
        if (result.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate(finalRedirect);
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Visual with Background Image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-neutral-900 items-center justify-center">
        <img
          src={settings.loginImage || DEFAULT_LOGIN_IMAGE}
          alt=""
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-transform duration-[10000ms] ease-out scale-100 hover:scale-105 opacity-80 z-0"
        />
        <div className="absolute inset-0 bg-primary/45 backdrop-blur-[1px] z-10" />
        
        <div className="relative z-20 text-white max-w-sm text-center bg-primary/30 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
          {settings.logo ? (
            <img src={settings.logo} alt={settings.siteName} className="w-16 h-16 rounded-2xl object-contain mx-auto mb-6 bg-white p-1 shadow-btn-gold" />
          ) : (
            <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-btn-gold">
              <ShoppingBag className="w-8 h-8 text-primary" />
            </div>
          )}
          <h1 className="font-display font-bold text-3xl mb-3">{settings.siteName}</h1>
          <p className="text-white/80 text-sm leading-relaxed mb-6">{settings.tagline}</p>
          <div className="grid grid-cols-2 gap-3 text-left">
            {['Premium Quality', 'Easy Returns', 'Fast Delivery', 'Secure Payments'].map(f => (
              <div key={f} className="flex items-center gap-1.5">
                <span className="text-accent font-bold">✓</span>
                <span className="text-white/90 text-xs">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2 mb-6 lg:hidden">
              {settings.logo ? (
                <img src={settings.logo} alt={settings.siteName} className="w-8 h-8 rounded-lg object-contain bg-white p-0.5" />
              ) : (
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-accent" />
                </div>
              )}
              <span className="font-display font-bold text-xl text-primary">{settings.siteName}</span>
            </Link>
            <h2 className="font-display font-bold text-2xl text-primary mb-1">Welcome back</h2>
            <p className="text-neutral-400 text-sm">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-danger/10 text-danger text-sm rounded-xl px-4 py-3 border border-danger/20">
                {error}
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input id="login-email" type="email" className="input" placeholder="your@email.com"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-accent-700 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input id="login-password" type={showPwd ? 'text' : 'password'} className="input pr-11"
                  placeholder="Enter password"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button id="login-btn" type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base gap-2">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:text-accent-700 transition-colors">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export const RegisterPage = () => {
  const { register } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    try {
      const result = await register(form.name, form.email, form.phone, form.password);
      if (result.success) {
        toast.success('Account created! Welcome!');
        const searchParams = new URLSearchParams(location.search);
        const redirectParam = searchParams.get('redirect');
        navigate(redirectParam || '/');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Visual with Background Image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-neutral-900 items-center justify-center">
        <img
          src={settings.loginImage || DEFAULT_LOGIN_IMAGE}
          alt=""
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-transform duration-[10000ms] ease-out scale-100 hover:scale-105 opacity-80 z-0"
        />
        <div className="absolute inset-0 bg-primary/45 backdrop-blur-[1px] z-10" />
        
        <div className="relative z-20 text-white max-w-sm text-center bg-primary/30 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
          {settings.logo ? (
            <img src={settings.logo} alt={settings.siteName} className="w-16 h-16 rounded-2xl object-contain mx-auto mb-6 bg-white p-1 shadow-btn-gold" />
          ) : (
            <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-btn-gold">
              <ShoppingBag className="w-8 h-8 text-primary" />
            </div>
          )}
          <h1 className="font-display font-bold text-3xl mb-3">{settings.siteName}</h1>
          <p className="text-white/80 text-sm leading-relaxed mb-6">{settings.tagline}</p>
          <div className="grid grid-cols-2 gap-3 text-left">
            {['Premium Quality', 'Easy Returns', 'Fast Delivery', 'Secure Payments'].map(f => (
              <div key={f} className="flex items-center gap-1.5">
                <span className="text-accent font-bold">✓</span>
                <span className="text-white/90 text-xs">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white overflow-y-auto max-h-screen">
        <div className="w-full max-w-md my-auto">
          <div className="mb-6">
            <Link to="/" className="flex items-center gap-2 mb-6 lg:hidden">
              {settings.logo ? (
                <img src={settings.logo} alt={settings.siteName} className="w-8 h-8 rounded-lg object-contain bg-white p-0.5" />
              ) : (
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-accent" />
                </div>
              )}
              <span className="font-display font-bold text-xl text-primary">{settings.siteName}</span>
            </Link>
            <h2 className="font-display font-bold text-2xl text-primary mb-1">Create Account</h2>
            <p className="text-neutral-400 text-sm">Join us for exclusive deals and offers</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-danger/10 text-danger text-sm rounded-xl px-4 py-3 border border-danger/20">{error}</div>}
            {[
              { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your full name' },
              { label: 'Email', key: 'email', type: 'email', placeholder: 'your@email.com' },
              { label: 'Phone', key: 'phone', type: 'tel', placeholder: '10-digit mobile number' },
            ].map(f => (
              <div key={f.key}>
                <label className="label">{f.label}</label>
                <input id={`register-${f.key}`} type={f.type} className="input" placeholder={f.placeholder}
                  value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} required />
              </div>
            ))}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input id="register-password" type={showPwd ? 'text' : 'password'} className="input pr-11"
                  placeholder="Min. 6 characters"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input type="password" className="input" placeholder="Repeat password"
                value={form.confirm} onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} required />
            </div>
            <button id="register-btn" type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-neutral-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:text-accent-700 transition-colors">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
