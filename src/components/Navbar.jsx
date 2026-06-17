import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, Heart, Search, User, Menu, X, ChevronDown,
  LogOut, Settings, Package, LayoutDashboard, ShieldCheck,
  Mic
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

const Navbar = () => {
  const { user, logout, isAdmin, isLoggedIn } = useAuth();
  const { cartCount } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice search is not supported in this browser.', { id: 'voice-search-toast' });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      toast.success('Listening... speak now!', { id: 'voice-search-toast', duration: 4000 });
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        toast.error('Microphone permission denied.', { id: 'voice-search-toast' });
      } else {
        toast.error(`Speech recognition failed: ${event.error}`, { id: 'voice-search-toast' });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setSearchQuery(speechToText);
      
      if (speechToText.trim()) {
        navigate(`/search?q=${encodeURIComponent(speechToText.trim())}`);
        setSearchOpen(false);
        setSearchQuery('');
        toast.success(`Searching for "${speechToText}"`, { id: 'voice-search-toast' });
      }
    };

    recognition.start();
  };

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Men', to: '/category/men' },
    { label: 'Women', to: '/category/women' },
    { label: 'Kids', to: '/category/kids' },
    { label: 'Sale', to: '/sale' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-nav' : 'bg-white/95 backdrop-blur-sm'
    }`}>
      {/* Top Banner */}
      <div className="bg-primary text-white text-center text-xs py-2 font-medium tracking-wide">
        🎉 Free Shipping on orders above ₹{settings.freeShippingAbove} &nbsp;|&nbsp; {settings.promoText || 'Use code WELCOME10 for 10% off'}
      </div>

      {/* Main Navbar */}
      <div className="container-main">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            {settings.logo ? (
              <img src={settings.logo} alt={settings.siteName} className="w-8 h-8 rounded-lg object-contain" />
            ) : (
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-accent" />
              </div>
            )}
            <span className="font-display font-bold text-sm sm:text-base md:text-xl text-primary tracking-tight truncate max-w-[135px] sm:max-w-[240px] md:max-w-none">
              {settings.siteName}
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.to
                    ? 'text-primary bg-secondary-200'
                    : 'text-neutral-600 hover:text-primary hover:bg-neutral-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <div className="relative" ref={searchRef}>
              <button
                id="navbar-search-btn"
                onClick={() => setSearchOpen(!searchOpen)}
                className="btn-ghost w-10 h-10 rounded-full p-0 justify-center"
              >
                <Search className="w-5 h-5" />
              </button>
              {searchOpen && (
                <div className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-card-hover border border-neutral-100 p-3 animate-scale-in">
                  <form onSubmit={handleSearch}>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          id="navbar-search-input"
                          autoFocus
                          className="input py-2.5 pr-10 text-sm w-full"
                          placeholder="Search clothes..."
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={startVoiceSearch}
                          className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all duration-200 ${
                            isListening
                              ? 'text-red-500 bg-red-50 animate-pulse'
                              : 'text-neutral-400 hover:text-primary hover:bg-neutral-50'
                          }`}
                          title="Search by voice"
                        >
                          <Mic className="w-4 h-4" />
                        </button>
                      </div>
                      <button type="submit" className="btn-primary py-2 px-3 rounded-xl">
                        <Search className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link id="navbar-wishlist" to={isLoggedIn ? "/wishlist" : "/login?redirect=/wishlist"} className="hidden md:flex btn-ghost w-10 h-10 rounded-full p-0 justify-center">
              <Heart className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <Link id="navbar-cart" to="/cart" className="btn-ghost w-10 h-10 rounded-full p-0 justify-center relative">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-primary text-xs font-bold rounded-full flex items-center justify-center animate-bounce-soft">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="hidden md:block relative" ref={userMenuRef}>
              <button
                id="navbar-user-menu"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="btn-ghost w-10 h-10 rounded-full p-0 justify-center"
              >
                <User className="w-5 h-5" />
              </button>
              {userMenuOpen && (
                isLoggedIn ? (
                  <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-card-hover border border-neutral-100 py-2 animate-scale-in">
                    <div className="px-4 py-3 border-b border-neutral-100">
                      <p className="text-sm font-semibold text-primary truncate">{user.name}</p>
                      <p className="text-xs text-neutral-400 truncate">{user.email}</p>
                    </div>
                    {isAdmin && (
                      <Link id="nav-admin-link" to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-accent-700 hover:bg-accent/10 transition-colors">
                        <ShieldCheck className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>
                    <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                      <Package className="w-4 h-4" />
                      My Orders
                    </Link>
                    <button
                      id="navbar-logout"
                      onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger/5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-card-hover border border-neutral-100 p-4 animate-scale-in">
                    <p className="text-sm font-bold text-primary mb-1">Welcome</p>
                    <p className="text-xs text-neutral-400 mb-3 leading-tight">To access account and manage orders</p>
                    <Link
                      id="navbar-login-btn"
                      to="/login"
                      onClick={() => setUserMenuOpen(false)}
                      className="btn-accent w-full py-2.5 justify-center text-center text-sm font-semibold inline-block rounded-xl mb-3 shadow-btn-gold"
                    >
                      LOGIN / SIGNUP
                    </Link>
                    <div className="h-[1px] bg-neutral-100 my-2" />
                    <div className="flex flex-col gap-1 mt-1 text-left">
                      <Link to="/login?redirect=/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 py-2 text-sm text-neutral-600 hover:text-primary transition-colors">
                        <Package className="w-4 h-4 text-neutral-400" />
                        Orders
                      </Link>
                      <Link to="/login?redirect=/wishlist" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 py-2 text-sm text-neutral-600 hover:text-primary transition-colors">
                        <Heart className="w-4 h-4 text-neutral-400" />
                        Wishlist
                      </Link>
                      <Link to="/login" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 py-2 text-sm text-accent-700 hover:underline transition-colors font-semibold">
                        <ShieldCheck className="w-4 h-4" />
                        Admin Login
                      </Link>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              id="navbar-mobile-menu"
              className="md:hidden btn-ghost w-10 h-10 rounded-full p-0 justify-center"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-neutral-100 animate-slide-up">
          <div className="container-main py-4 flex flex-col gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-3 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="h-[1px] bg-neutral-100 my-2" />
            {isLoggedIn ? (
              <>
                <Link to="/profile" className="px-4 py-3 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-primary transition-colors flex items-center gap-3">
                  <User className="w-4 h-4 text-neutral-400" />
                  My Profile
                </Link>
                <Link to="/orders" className="px-4 py-3 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-primary transition-colors flex items-center gap-3">
                  <Package className="w-4 h-4 text-neutral-400" />
                  My Orders
                </Link>
                <Link to="/wishlist" className="px-4 py-3 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-primary transition-colors flex items-center gap-3">
                  <Heart className="w-4 h-4 text-neutral-400" />
                  My Wishlist
                </Link>
                <button
                  id="navbar-logout-mobile"
                  onClick={() => { logout(); setMobileOpen(false); navigate('/'); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-danger hover:bg-danger/5 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/wishlist" className="px-4 py-3 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-primary transition-colors flex items-center gap-3">
                  <Heart className="w-4 h-4 text-neutral-400" />
                  My Wishlist
                </Link>
                <Link to="/login" className="btn-accent mt-2 justify-center py-2.5 text-center text-sm font-semibold rounded-xl shadow-btn-gold">
                  LOGIN / SIGNUP
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
