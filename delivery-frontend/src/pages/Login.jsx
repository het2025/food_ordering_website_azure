import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDelivery } from '../context/DeliveryContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login, isAuthenticated } = useDelivery();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(formData.email, formData.password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-start w-full min-h-screen px-4 min-h-screen-dvh bg-gradient-to-br from-primary to-secondary sm:justify-center"
      style={{
        paddingTop: 'max(3rem, env(safe-area-inset-top))',
        paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))'
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center p-3 mb-4 bg-white rounded-full shadow-lg">
            <img src="/quickbite_logo.svg" alt="QuickBite Delivery" className="w-12 h-12 sm:w-14 sm:h-14" />
          </div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">QuickBite Delivery</h1>
          <p className="mt-1 text-sm text-white/80">Partner Login</p>
        </div>

        {/* Login Card */}
        <div className="p-6 bg-white shadow-2xl rounded-2xl">
          <h2 className="mb-5 text-xl font-bold text-gray-800">Sign In</h2>

          {error && (
            <div className="flex items-start gap-2 p-3 mb-4 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
              <span className="flex-shrink-0 mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                inputMode="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="delivery@example.com"
                className="w-full px-4 py-3 text-base transition border border-gray-300 outline-none rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                required
                maxLength={100}
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 text-base transition border border-gray-300 outline-none rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                required
                minLength={8}
                maxLength={50}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center w-full min-h-[52px] py-3 mt-1 font-semibold text-white rounded-xl transition bg-primary hover:bg-opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-base"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></span>
                  Signing in…
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="mt-5 text-sm text-center text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-primary hover:underline"
            >
              Register as Partner
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
