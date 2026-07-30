import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { orders } from '../api';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/format';

const statusColors = {
  'Order Placed': 'bg-blue-100 text-blue-700',
  'Shipped': 'bg-amber-100 text-amber-700',
  'Delivered': 'bg-green-100 text-green-700',
};

export default function OrderDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const loadOrder = async () => {
    try {
      const data = await orders.get(id);
      setOrder(data);
    } catch (err) {
      showToast(err.message || 'Order not found', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => { await loadOrder(); })();
    if (searchParams.get('success') === '1') {
      showToast('Order placed successfully! Thank you for your purchase.', 'success');
    }
  }, [id]);

  const handleRequestReturn = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      showToast('Please describe the reason for the return', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await orders.requestReturn(id, reason.trim());
      showToast('Return request submitted', 'success');
      setReason('');
      await loadOrder();
    } catch (err) {
      showToast(err.message || 'Failed to submit return request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-8"><div className="h-64 skeleton rounded-xl"></div></div>;
  }

  if (!order) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/orders" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">
        <i className="fas fa-arrow-left mr-1"></i>Back to Orders
      </Link>

      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
            <p className="text-sm text-gray-500">Placed on {new Date(order.created_at).toLocaleString()}</p>
          </div>
          <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
            {order.status}
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {order.items.map((item) => (
            <div key={item.product_id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">{item.product_name}</p>
                <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
              </div>
              <span className="text-sm font-semibold text-gray-700">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-100">
          <span className="font-bold text-gray-900">Total</span>
          <span className="font-bold text-indigo-600 text-lg">{formatPrice(order.total)}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3"><i className="fas fa-rotate-left text-indigo-500 mr-2"></i>Returns</h3>

        {order.return ? (
          <div className="text-sm text-gray-600">
            <p>Return requested on {new Date(order.return.created_at).toLocaleDateString()}</p>
            <p className="mt-1">Reason: {order.return.reason}</p>
            <span className="inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-700 capitalize">
              {order.return.status}
            </span>
          </div>
        ) : (
          <form onSubmit={handleRequestReturn} className="space-y-3">
            <p className="text-xs text-gray-500">Not happy with this order? Request a return within 30 days.</p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for return..."
              rows={3}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={submitting}
              className="text-sm font-semibold text-indigo-600 border-2 border-indigo-100 hover:border-indigo-300 px-4 py-2 rounded-lg transition-colors disabled:opacity-70"
            >
              {submitting ? 'Submitting...' : 'Request Return'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
