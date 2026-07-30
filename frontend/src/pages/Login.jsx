import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';

export default function Login() {
  const [loginIdentity, setLoginIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { refresh: refreshCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      const redirect = localStorage.getItem('redirectAfterLogin') || '/';
      localStorage.removeItem('redirectAfterLogin');
      navigate(redirect, { replace: true });
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await auth.login({ login: loginIdentity.trim(), password });
      login({ user_id: data.user_id, username: data.username, email: data.email });
      await refreshCart();
      showToast('Login successful!', 'success');
      setTimeout(() => {
        const redirect = localStorage.getItem('redirectAfterLogin') || '/';
        localStorage.removeItem('redirectAfterLogin');
        navigate(redirect, { replace: true });
      }, 800);
    } catch (err) {
      showToast(err.message || 'Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <i className="fas fa-store text-3xl text-indigo-600"></i>
            <span className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">ShopHub</span>
          </Link>
          <p className="text-gray-500 mt-3">Welcome back! Sign in to your account.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email or Phone</label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-3.5 top-3.5 text-gray-400"></i>
                <input
                  type="text"
                  value={loginIdentity}
                  onChange={(e) => setLoginIdentity(e.target.value)}
                  required
                  placeholder="Enter email or phone"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-3.5 top-3.5 text-gray-400"></i>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600">
                  <i className={`fas ${showPw ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform hover:scale-[1.02] transition-all duration-200 shadow-lg shadow-indigo-200 disabled:opacity-70"
            >
              {loading ? <><i className="fas fa-spinner fa-spin mr-2"></i>Signing in...</> : <><i className="fas fa-sign-in-alt mr-2"></i>Sign In</>}
            </button>
          </form>

          <div className="mt-6 flex justify-between text-sm">
            <Link to="/forgot-password" className="text-indigo-600 hover:text-indigo-700 transition-colors">Forgot Password?</Link>
            <Link to="/register" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">Create Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
