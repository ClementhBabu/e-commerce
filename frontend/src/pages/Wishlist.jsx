import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { wishlist as wishlistApi } from '../api';
import { NO_IMAGE_PLACEHOLDER, formatPrice } from '../utils/format';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { refresh: refreshWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const loadWishlist = async () => {
    try {
      const data = await wishlistApi.get();
      setItems(data.items);
    } catch (err) {
      showToast(err.message || 'Failed to load wishlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { (async () => { await loadWishlist(); })(); }, []);

  const handleRemove = async (productId) => {
    try {
      await wishlistApi.remove(productId);
      setItems((prev) => prev.filter((item) => item.product_id !== productId));
      await refreshWishlist();
    } catch (err) {
      showToast(err.message || 'Failed to remove item', 'error');
    }
  };

  const handleAddToCart = async (productId, name) => {
    try {
      await addToCart(productId, 1);
      showToast(`${name} added to cart!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to add to cart', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => <div key={i} className="aspect-square skeleton rounded-xl"></div>)}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <i className="far fa-heart text-6xl text-gray-300 mb-6"></i>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-6">Save products you love to find them here later.</p>
        <Link to="/" className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <Link to={`/product/${item.product_id}`} className="block aspect-square bg-gray-100">
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src = NO_IMAGE_PLACEHOLDER; }}
              />
            </Link>
            <div className="p-4">
              <Link to={`/product/${item.product_id}`} className="font-semibold text-gray-800 text-sm line-clamp-1 hover:text-indigo-600">
                {item.name}
              </Link>
              <p className="text-lg font-bold text-indigo-600 mt-1">{formatPrice(item.price)}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleAddToCart(item.product_id, item.name)}
                  className="flex-1 text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-3 py-2 rounded-lg transition-all duration-200 font-medium"
                >
                  <i className="fas fa-cart-plus mr-1"></i>Add to Cart
                </button>
                <button
                  onClick={() => handleRemove(item.product_id)}
                  className="w-9 h-9 flex items-center justify-center border-2 border-gray-200 rounded-lg hover:border-red-300 hover:text-red-500 transition-colors"
                >
                  <i className="fas fa-trash-alt text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
