import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { returns as returnsApi } from '../api';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/format';

export default function Returns() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const data = await returnsApi.list();
        setItems(data);
      } catch (err) {
        showToast(err.message || 'Failed to load returns', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {[...Array(2)].map((_, i) => <div key={i} className="h-20 skeleton rounded-xl"></div>)}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <i className="fas fa-rotate-left text-6xl text-gray-300 mb-6"></i>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">No return requests</h2>
        <p className="text-gray-500 mb-6">You can request a return from any order's detail page.</p>
        <Link to="/orders" className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">View Orders</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Returns</h1>
      <div className="space-y-4">
        {items.map((ret) => (
          <Link
            key={ret.id}
            to={`/orders/${ret.order_id}`}
            className="block bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-semibold text-gray-800">Order #{ret.order_id}</p>
                <p className="text-xs text-gray-500 mt-1">{ret.reason}</p>
                <p className="text-xs text-gray-400 mt-1">Requested on {new Date(ret.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-700 capitalize">{ret.status}</span>
                <span className="font-bold text-indigo-600">{formatPrice(ret.total)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
