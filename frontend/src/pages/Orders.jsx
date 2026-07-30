import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orders } from '../api';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/format';

const statusColors = {
  'Order Placed': 'bg-blue-100 text-blue-700',
  'Shipped': 'bg-amber-100 text-amber-700',
  'Delivered': 'bg-green-100 text-green-700',
};

export default function Orders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const data = await orders.list();
        setItems(data);
      } catch (err) {
        showToast(err.message || 'Failed to load orders', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 skeleton rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <i className="fas fa-box-open text-6xl text-gray-300 mb-6"></i>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">No orders yet</h2>
        <p className="text-gray-500 mb-6">Your placed orders will show up here.</p>
        <Link to="/" className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
      <div className="space-y-4">
        {items.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="block bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-semibold text-gray-800">Order #{order.id}</p>
                <p className="text-xs text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()} &middot; {order.item_count} item{order.item_count === 1 ? '' : 's'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                  {order.status}
                </span>
                <span className="font-bold text-indigo-600">{formatPrice(order.total)}</span>
                <i className="fas fa-chevron-right text-gray-300"></i>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
