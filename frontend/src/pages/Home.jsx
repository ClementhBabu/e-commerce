import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { products } from '../api';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';

const categoryIcons = {
  'Electronics': 'fa-laptop',
  'Fashion': 'fa-tshirt',
  'Home & Kitchen': 'fa-couch',
  'Accessories': 'fa-glasses',
  'Food & Beverages': 'fa-mug-hot',
  'Sports': 'fa-dumbbell',
  'Beauty & Health': 'fa-heart',
  'Books & Stationery': 'fa-book',
  'Toys & Games': 'fa-gamepad',
};

const categoryColors = {
  'Electronics': 'from-blue-500 to-cyan-500',
  'Fashion': 'from-pink-500 to-rose-500',
  'Home & Kitchen': 'from-amber-500 to-orange-500',
  'Accessories': 'from-purple-500 to-violet-500',
  'Food & Beverages': 'from-red-500 to-pink-500',
  'Sports': 'from-green-500 to-emerald-500',
  'Beauty & Health': 'from-rose-500 to-red-500',
  'Books & Stationery': 'from-teal-500 to-cyan-500',
  'Toys & Games': 'from-yellow-500 to-orange-500',
};

export default function Home() {
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const activeCategory = searchParams.get('category') || 'All';
  const { showToast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const data = await products.list();
        setAllProducts(data);
        const cats = [...new Set(data.map((p) => p.category))];
        setCategories(cats);
      } catch (err) {
        showToast('Failed to load products', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const orderSuccess = searchParams.get('order');
    if (orderSuccess === 'success') {
      showToast('Order placed successfully! Thank you for your purchase.', 'success');
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('order');
      setSearchParams(newParams, { replace: true });
    }
  }, []);

  const filteredProducts = allProducts.filter((p) => {
    if (activeCategory !== 'All' && p.category !== activeCategory) return false;
    const search = searchParams.get('search');
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCategoryClick = (cat) => {
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All') newParams.delete('category');
    else newParams.set('category', cat);
    newParams.delete('search');
    setSearchParams(newParams);
    setSearchInput('');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) newParams.set('search', searchInput.trim());
    else newParams.delete('search');
    setSearchParams(newParams);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4">
              <div className="aspect-square skeleton rounded-lg mb-4"></div>
              <div className="h-4 skeleton rounded w-3/4 mb-2"></div>
              <div className="h-3 skeleton rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            <i className="fas fa-truck mr-2"></i>Free Shipping on Orders Over $50
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            Discover Premium Products at{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">ShopHub</span>
          </h1>
          <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">Shop from thousands of quality products with fast delivery and exceptional customer service.</p>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">Start Shopping</Link>
            <a href="#products" className="bg-white text-indigo-600 px-8 py-3.5 rounded-xl font-semibold border-2 border-indigo-100 hover:border-indigo-300 transition-colors">Explore Products</a>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { icon: 'fa-truck-fast', title: 'Free Shipping', desc: 'Orders over $50' },
            { icon: 'fa-shield-halved', title: 'Secure Payment', desc: '100% protected' },
            { icon: 'fa-headset', title: '24/7 Support', desc: 'Dedicated support' },
            { icon: 'fa-rotate-left', title: 'Easy Returns', desc: '30-day returns' },
          ].map((item) => (
            <div key={item.title} className="flex items-center justify-center gap-3 py-3">
              <i className={`fas ${item.icon} text-2xl text-indigo-500`}></i>
              <div className="text-left">
                <p className="font-semibold text-sm text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="products" className="max-w-7xl mx-auto px-4 py-8">
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-md">
            <i className="fas fa-search absolute left-4 top-3 text-gray-400"></i>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </form>

        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => handleCategoryClick('All')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeCategory === 'All' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {categories.slice(0, 5).map((cat) => (
          activeCategory === 'All' && filteredProducts.some(p => p.category === cat) ? (
            <Link key={cat} to={`/?category=${encodeURIComponent(cat)}`} className="block mb-8">
              <div className={`bg-gradient-to-r ${categoryColors[cat] || 'from-indigo-500 to-purple-500'} rounded-2xl p-6 text-white hover:scale-[1.02] transition-transform duration-200 shadow-lg`}>
                <div className="flex items-center justify-between">
                  <div>
                    <i className={`fas ${categoryIcons[cat] || 'fa-tag'} text-2xl mb-2 opacity-80`}></i>
                    <h3 className="text-xl font-bold">{cat}</h3>
                    <p className="text-sm opacity-80">{allProducts.filter(p => p.category === cat).length} products</p>
                  </div>
                  <i className="fas fa-arrow-right text-2xl opacity-60"></i>
                </div>
              </div>
            </Link>
          ) : null
        ))}

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <i className="fas fa-search text-5xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-500 mb-2">No products found</h3>
            <p className="text-gray-400">Try adjusting your search or filter</p>
            <button onClick={() => handleCategoryClick('All')} className="mt-4 text-indigo-600 font-medium hover:underline">Clear filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-indigo-600 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Stay in the Loop</h2>
          <p className="text-indigo-200 mb-6">Subscribe to our newsletter for the latest products and exclusive deals.</p>
          <div className="flex max-w-md mx-auto">
            <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-l-xl text-gray-800 text-sm focus:outline-none" />
            <button className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-r-xl font-semibold text-sm transition-colors">Subscribe</button>
          </div>
        </div>
      </section>
    </div>
  );
}
