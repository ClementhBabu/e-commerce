import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { auth } from '../api';
import { useToast } from '../context/ToastContext';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    setLoading(true);
    try {
      await auth.resetPassword({ token, password });
      setSuccess(true);
      showToast('Password reset successful!', 'success');
    } catch (err) {
      showToast(err.message || 'Reset failed', 'error');
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
          <p className="text-gray-500 mt-3">Set your new password.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {success ? (
            <div className="text-center space-y-4">
              <i className="fas fa-check-circle text-5xl text-green-500"></i>
              <h3 className="text-xl font-bold text-gray-800">Password Reset!</h3>
              <p className="text-gray-500">Your password has been updated successfully.</p>
              <Link to="/login" className="inline-block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors">Go to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Reset Token</label>
                <input type="text" value={token} onChange={(e) => setToken(e.target.value)} required
                       placeholder="Paste your reset token"
                       className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                <div className="relative">
                  <i className="fas fa-lock absolute left-3.5 top-3.5 text-gray-400"></i>
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                         className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                         placeholder="Min 6 characters" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600">
                    <i className={`fas ${showPw ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-70">
                {loading ? <><i className="fas fa-spinner fa-spin mr-2"></i>Resetting...</> : <><i className="fas fa-key mr-2"></i>Reset Password</>}
              </button>
            </form>
          )}

          <div className="mt-6 text-center space-x-4 text-sm">
            <Link to="/forgot-password" className="text-indigo-600 hover:underline">Request a token</Link>
            <Link to="/login" className="text-indigo-600 hover:underline">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
