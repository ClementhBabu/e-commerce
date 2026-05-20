import { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../api';
import { useToast } from '../context/ToastContext';

export default function ForgotPassword() {
  const [loginIdentity, setLoginIdentity] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await auth.forgotPassword({ login: loginIdentity.trim() });
      setToken(data.token);
      showToast('Reset token generated!', 'success');
    } catch (err) {
      showToast(err.message || 'Request failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    showToast('Token copied!', 'info');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <i className="fas fa-store text-3xl text-indigo-600"></i>
            <span className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">ShopHub</span>
          </Link>
          <p className="text-gray-500 mt-3">Forgot your password? No worries.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {!token ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email or Phone</label>
                <div className="relative">
                  <i className="fas fa-envelope absolute left-3.5 top-3.5 text-gray-400"></i>
                  <input type="text" value={loginIdentity} onChange={(e) => setLoginIdentity(e.target.value)} required
                         placeholder="Enter your email or phone"
                         className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-70">
                {loading ? <><i className="fas fa-spinner fa-spin mr-2"></i>Sending...</> : <><i className="fas fa-paper-plane mr-2"></i>Send Reset Token</>}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <i className="fas fa-check-circle text-4xl text-green-500"></i>
              <p className="text-gray-700 font-medium">Reset token generated!</p>
              <div className="bg-gray-50 rounded-lg p-3 break-all">
                <code className="text-xs text-indigo-600">{token}</code>
              </div>
              <div className="flex gap-3">
                <button onClick={copyToken} className="flex-1 py-2.5 bg-indigo-100 text-indigo-600 font-medium rounded-lg hover:bg-indigo-200 transition-colors text-sm">
                  <i className="fas fa-copy mr-1"></i>Copy Token
                </button>
                <Link to={`/reset-password?token=${encodeURIComponent(token)}`} className="flex-1 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors text-sm text-center">
                  Reset Password
                </Link>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-indigo-600 text-sm hover:underline">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
