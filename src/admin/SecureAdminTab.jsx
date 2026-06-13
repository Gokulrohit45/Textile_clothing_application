import { useState } from 'react';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SecureAdminTab = ({ children }) => {
  const [verified, setVerified] = useState(() => {
    return sessionStorage.getItem('admin_pin_verified') === 'true';
  });
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (pin.length < 4) {
      setError('Please enter a valid PIN.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/settings/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem('admin_pin_verified', 'true');
        setVerified(true);
        toast.success('Access Granted');
      } else {
        setError(data.error || 'Invalid security PIN.');
        setPin('');
      }
    } catch (err) {
      setError('Failed to verify PIN. Server error.');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (num) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError('');
    }
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  if (verified) {
    return children;
  }

  return (
    <div className="flex items-center justify-center min-h-[75vh] px-4 animate-fade-in">
      <div className="card max-w-sm w-full p-8 text-center shadow-xl border border-neutral-200 bg-white rounded-3xl">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="font-display font-bold text-2xl text-primary mb-2">Restricted Access</h3>
        <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
          Please enter the security PIN to view orders and payments.
        </p>

        <form onSubmit={handleVerify} className="space-y-6">
          {error && (
            <div className="bg-danger/10 text-danger text-sm rounded-xl px-4 py-2.5 border border-danger/20">
              {error}
            </div>
          )}

          {/* Dots Indicator */}
          <div className="flex justify-center gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 border-2 ${
                  pin.length > i 
                    ? 'bg-primary border-primary scale-110 shadow-sm' 
                    : 'bg-transparent border-neutral-300'
                }`}
              />
            ))}
          </div>

          {/* Hidden PIN Input */}
          <input 
            type="password" 
            className="sr-only" 
            value={pin}
            readOnly
          />

          {/* Keypad Grid */}
          <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                className="w-14 h-14 bg-neutral-50 hover:bg-neutral-100 active:bg-neutral-200 rounded-full font-display font-semibold text-lg text-primary flex items-center justify-center transition-all shadow-sm border border-neutral-100"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="w-14 h-14 text-neutral-400 hover:text-neutral-600 rounded-full text-xs font-semibold flex items-center justify-center transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress(0)}
              className="w-14 h-14 bg-neutral-50 hover:bg-neutral-100 active:bg-neutral-200 rounded-full font-display font-semibold text-lg text-primary flex items-center justify-center transition-all shadow-sm border border-neutral-100"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="w-14 h-14 text-neutral-400 hover:text-neutral-600 rounded-full text-xs font-semibold flex items-center justify-center transition-colors"
            >
              Del
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || pin.length < 4}
            className="btn-primary w-full py-3.5 text-base gap-2 rounded-2xl mt-4"
          >
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            {loading ? 'Verifying...' : 'Unlock Access'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SecureAdminTab;
