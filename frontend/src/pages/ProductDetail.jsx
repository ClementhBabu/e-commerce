import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { products } from '../api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await products.get(id);
        setProduct(data);
      } catch {
        showToast('Product not found', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) stars.push(<i key={i} className="fas fa-star text-yellow-400"></i>);
      else if (i - 0.5 <= rating) stars.push(<i key={i} className="fas fa-star-half-alt text-yellow-400"></i>);
      else stars.push(<i key={i} className="far fa-star text-yellow-400"></i>);
    }
    return stars;
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      await addToCart(product.id, qty);
      showToast(`${product.name} added to cart!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to add to cart', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 aspect-square skeleton rounded-2xl"></div>
          <div className="w-full md:w-1/2 space-y-4">
            <div className="h-4 skeleton rounded w-1/3"></div>
            <div className="h-8 skeleton rounded w-3/4"></div>
            <div className="h-6 skeleton rounded w-1/4"></div>
            <div className="h-24 skeleton rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-indigo-600">Home</Link>
        <i className="fas fa-chevron-right text-xs"></i>
        <Link to={`/?category=${encodeURIComponent(product.category)}`} className="hover:text-indigo-600">{product.category}</Link>
        <i className="fas fa-chevron-right text-xs"></i>
        <span className="text-gray-800 font-medium truncate">{product.name}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2">
          <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/600x600?text=No+Image'; }}
            />
            <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-sm font-semibold px-3 py-1.5 rounded-full text-indigo-600">
              {product.category}
            </span>
            {product.rating >= 4.7 && (
              <span className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1.5 rounded-full">BESTSELLER</span>
            )}
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <div className="flex items-center gap-2 mb-2">
            {renderStars(product.rating)}
            <span className="text-sm text-gray-500">({Math.round(product.rating * 37)} reviews)</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
          <p className="text-4xl font-bold text-indigo-600 mb-1">${product.price.toFixed(2)}</p>
          <p className="text-sm text-green-600 mb-6"><i className="fas fa-truck mr-1"></i>Free shipping</p>

          <div className="prose prose-sm text-gray-600 mb-6">
            <p>{product.description}</p>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm font-medium text-gray-700">Quantity:</span>
            <div className="flex items-center border-2 border-gray-200 rounded-xl">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-gray-500 hover:text-indigo-600 transition-colors">
                <i className="fas fa-minus text-xs"></i>
              </button>
              <input
                type="number"
                value={qty}
                onChange={(e) => { const v = parseInt(e.target.value) || 1; setQty(Math.min(99, Math.max(1, v))); }}
                className="w-14 text-center py-2 text-sm focus:outline-none"
                min="1" max="99"
              />
              <button onClick={() => setQty(Math.min(99, qty + 1))} className="px-3 py-2 text-gray-500 hover:text-indigo-600 transition-colors">
                <i className="fas fa-plus text-xs"></i>
              </button>
            </div>
            <span className="text-sm text-gray-500">{product.stock < 20 && <span className="text-orange-500 font-medium">Only {product.stock} left</span>}</span>
          </div>

          <div className="flex gap-3">
            <button onClick={handleAddToCart} className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-200">
              <i className="fas fa-cart-plus mr-2"></i>Add to Cart
            </button>
            <button className="w-14 h-14 flex items-center justify-center border-2 border-gray-200 rounded-xl hover:border-red-300 hover:text-red-500 transition-colors">
              <i className="far fa-heart text-xl"></i>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { icon: 'fa-shield-halved', label: 'Secure Payment' },
              { icon: 'fa-medal', label: 'Quality Guaranteed' },
              { icon: 'fa-headset', label: '24/7 Support' },
            ].map((item) => (
              <div key={item.label} className="text-center p-3 bg-gray-50 rounded-xl">
                <i className={`fas ${item.icon} text-indigo-500 text-lg mb-1`}></i>
                <p className="text-xs text-gray-500 font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
