import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await addToCart(product.id, 1);
      showToast(`${product.name} added to cart!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to add to cart', 'error');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) stars.push(<i key={i} className="fas fa-star text-yellow-400 text-xs"></i>);
      else if (i - 0.5 <= rating) stars.push(<i key={i} className="fas fa-star-half-alt text-yellow-400 text-xs"></i>);
      else stars.push(<i key={i} className="far fa-star text-yellow-400 text-xs"></i>);
    }
    return stars;
  };

  return (
    <Link to={`/product/${product.id}`} className="group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400?text=No+Image'; }}
          loading="lazy"
        />
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-semibold px-2 py-1 rounded-full text-indigo-600">
          {product.category}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1 mb-1.5">
          {renderStars(product.rating)}
          <span className="text-xs text-gray-400 ml-1">({product.rating})</span>
        </div>
        <h3 className="font-semibold text-gray-800 text-sm line-clamp-1 group-hover:text-indigo-600 transition-colors">{product.name}</h3>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-indigo-600">${product.price.toFixed(2)}</span>
          <button onClick={handleAddToCart} className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-lg transition-all duration-200 font-medium">
            <i className="fas fa-cart-plus mr-1"></i>Add
          </button>
        </div>
      </div>
    </Link>
  );
}
