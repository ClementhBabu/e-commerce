import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cart } from '../api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const { setCount } = useCart();
  const { showToast } = useToast();

  const loadCart = async () => {
    try {
      const data = await cart.get();
      setItems(data.items || []);
      setTotal(data.total || 0);
      setCount(data.count || 0);
    } catch (err) {
      showToast('Failed to load cart', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCart(); }, []);

  const handleUpdateQty = async (itemId, newQty) => {
    if (newQty < 1) return;
    try {
      await cart.update(itemId, { quantity: newQty });
      loadCart();
    } catch (err) {
      showToast(err.message || 'Failed to update', 'error');
    }
  };

  const handleRemove = async (itemId) => {
    if (!confirm('Remove this item from cart?')) return;
    try {
      await cart.remove(itemId);
      loadCart();
      showToast('Item removed from cart', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to remove', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4 bg-white rounded-xl p-4 mb-4">
            <div className="w-24 h-24 skeleton rounded-lg shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 skeleton rounded w-2/3"></div>
              <div className="h-4 skeleton rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <i className="fas fa-shopping-cart text-6xl text-gray-300 mb-6"></i>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
        <Link to="/" className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4 shadow-sm">
              <Link to={`/product/${item.product_id}`} className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover"
                     onError={(e) => { e.target.src = 'https://via.placeholder.com/200x200?text=No+Image'; }} />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.product_id}`} className="font-semibold text-gray-800 hover:text-indigo-600 transition-colors text-sm line-clamp-1">
                  {item.name}
                </Link>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-yellow-500"><i className="fas fa-star"></i></span>
                  <span className="text-xs text-gray-400">{item.rating}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border-2 border-gray-200 rounded-lg">
                    <button onClick={() => handleUpdateQty(item.id, item.quantity - 1)} className="px-2.5 py-1 text-gray-500 hover:text-indigo-600 transition-colors">
                      <i className="fas fa-minus text-xs"></i>
                    </button>
                    <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => handleUpdateQty(item.id, item.quantity + 1)} className="px-2.5 py-1 text-gray-500 hover:text-indigo-600 transition-colors">
                      <i className="fas fa-plus text-xs"></i>
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-indigo-600">${(item.price * item.quantity).toFixed(2)}</span>
                    <button onClick={() => handleRemove(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full lg:w-80">
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span><span className="text-green-600 font-medium">FREE</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (8%)</span><span>${(total * 0.08).toFixed(2)}</span>
              </div>
              <hr />
              <div className="flex justify-between font-bold text-gray-900 text-lg">
                <span>Total</span><span>${(total * 1.08).toFixed(2)}</span>
              </div>
            </div>
            <Link to="/address" className="block w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-center font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-200">
              Proceed to Checkout
            </Link>
            <Link to="/" className="block text-center text-sm text-indigo-600 hover:underline mt-3">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
