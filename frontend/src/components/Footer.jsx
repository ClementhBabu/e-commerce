import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <i className="fas fa-store text-2xl text-indigo-400"></i>
              <span className="text-xl font-bold text-white">ShopHub</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your one-stop shop for quality products at great prices. Fast shipping and excellent customer service.
            </p>
            <div className="flex space-x-3 mt-4">
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors"><i className="fab fa-facebook-f text-sm"></i></a>
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors"><i className="fab fa-twitter text-sm"></i></a>
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors"><i className="fab fa-instagram text-sm"></i></a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link></li>
              <li><Link to="/cart" className="hover:text-indigo-400 transition-colors">Cart</Link></li>
              <li><Link to="/login" className="hover:text-indigo-400 transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-indigo-400 transition-colors">Register</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/?category=Electronics" className="hover:text-indigo-400 transition-colors">Electronics</Link></li>
              <li><Link to="/?category=Fashion" className="hover:text-indigo-400 transition-colors">Fashion</Link></li>
              <li><Link to="/?category=Home+%26+Kitchen" className="hover:text-indigo-400 transition-colors">Home & Kitchen</Link></li>
              <li><Link to="/?category=Sports" className="hover:text-indigo-400 transition-colors">Sports</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2"><i className="fas fa-envelope w-4"></i><span>support@shophub.com</span></li>
              <li className="flex items-center space-x-2"><i className="fas fa-phone w-4"></i><span>+1 (555) 123-4567</span></li>
              <li className="flex items-center space-x-2"><i className="fas fa-map-marker-alt w-4"></i><span>123 Commerce St, NY</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} ShopHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
