import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../api';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', phone: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    setLoading(true);
    try {
      await auth.register({
        username: form.username.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        password: form.password,
      });
      showToast('Account created! Redirecting...', 'success');
      setTimeout(() => navigate('/login'), 800);
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
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
          <p className="text-gray-500 mt-3">Create your account and start shopping!</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
              <div className="relative">
                <i className="fas fa-user absolute left-3.5 top-3.5 text-gray-400"></i>
                <input type="text" name="username" value={form.username} onChange={handleChange} required minLength={3}
                       className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="Choose a username" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-3.5 top-3.5 text-gray-400"></i>
                <input type="email" name="email" value={form.email} onChange={handleChange} required
                       className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="Enter your email" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number <span className="text-gray-400 font-normal">(optional)</span></label>
              <div className="relative">
                <i className="fas fa-phone absolute left-3.5 top-3.5 text-gray-400"></i>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                       className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="+1 555-123-4567" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-3.5 top-3.5 text-gray-400"></i>
                <input type={showPw ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} required minLength={6}
                       className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="Min 6 characters" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600">
                  <i className={`fas ${showPw ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform hover:scale-[1.02] transition-all duration-200 shadow-lg shadow-indigo-200 disabled:opacity-70">
              {loading ? <><i className="fas fa-spinner fa-spin mr-2"></i>Creating account...</> : <><i className="fas fa-user-plus mr-2"></i>Create Account</>}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">Already have an account? <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
