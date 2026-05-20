import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cart, checkout, address as addrApi } from '../api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function Checkout() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [address, setAddress] = useState(null);
  const [card, setCard] = useState({ card_number: '', card_name: '', expiry: '', cvv: '' });
  const { setCount } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [cartData, addrData] = await Promise.all([cart.get(), addrApi.getDefault()]);
        if (!cartData.items || cartData.items.length === 0) {
          navigate('/cart');
          return;
        }
        setItems(cartData.items);
        setTotal(cartData.total);
        if (addrData.address) {
          setAddress(addrData.address);
        } else {
          navigate('/address');
        }
      } catch (err) {
        showToast('Failed to load checkout data', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    const groups = digits.match(/.{1,4}/g);
    return groups ? groups.join(' ') : digits;
  };

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    let formatted = value;
    if (name === 'card_number') formatted = formatCardNumber(value);
    else if (name === 'expiry') formatted = formatExpiry(value);
    else if (name === 'cvv') formatted = value.replace(/\D/g, '').slice(0, 4);
    setCard({ ...card, [name]: formatted });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!card.card_name || card.card_number.replace(/\s/g, '').length < 16 || !card.expiry || !card.cvv) {
      showToast('Please fill all payment fields', 'error');
      return;
    }
    setProcessing(true);
    try {
      const data = await checkout.process({
        card_number: card.card_number,
        card_name: card.card_name,
        expiry: card.expiry,
        cvv: card.cvv,
      });
      if (data.success) {
        setCount(0);
        showToast('Payment successful!', 'success');
        setTimeout(() => navigate('/?order=success'), 800);
      } else {
        showToast(data.message || 'Payment failed', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Payment failed', 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-8"><div className="h-64 skeleton rounded-xl"></div></div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          {address && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800"><i className="fas fa-map-marker-alt text-indigo-500 mr-2"></i>Delivery Address</h3>
                <Link to="/address" className="text-indigo-600 text-sm hover:underline">Change</Link>
              </div>
              <div className="text-sm text-gray-600">
                <p className="font-semibold text-gray-800">{address.full_name} - {address.phone}</p>
                <p>{address.street_address}</p>
                <p>{address.city}, {address.state} - {address.pincode}</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4"><i className="fas fa-credit-card text-indigo-500 mr-2"></i>Payment Details</h3>
            <p className="text-xs text-gray-400 bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <i className="fas fa-info-circle mr-1"></i>This is a demo payment. No real charges will be made.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Card Number</label>
                <div className="relative">
                  <i className="fas fa-credit-card absolute left-3.5 top-3 text-gray-400"></i>
                  <input name="card_number" value={card.card_number} onChange={handleCardChange}
                         placeholder="1234 5678 9012 3456" maxLength={19}
                         className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Cardholder Name</label>
                <input name="card_name" value={card.card_name} onChange={handleCardChange}
                       placeholder="John Doe"
                       className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Expiry Date</label>
                  <input name="expiry" value={card.expiry} onChange={handleCardChange}
                         placeholder="MM/YY" maxLength={5}
                         className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">CVV</label>
                  <input name="cvv" value={card.cvv} onChange={handleCardChange}
                         placeholder="123" maxLength={4}
                         className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 font-mono" />
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="w-full lg:w-80">
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>

            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                       onError={(e) => { e.target.src = 'https://via.placeholder.com/100x100?text=N'; }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span className="text-green-600 font-medium">FREE</span></div>
              <div className="flex justify-between text-gray-600"><span>Tax (8%)</span><span>${(total * 0.08).toFixed(2)}</span></div>
              <hr />
              <div className="flex justify-between font-bold text-gray-900 text-lg"><span>Total</span><span>${(total * 1.08).toFixed(2)}</span></div>
            </div>

            <button onClick={handleSubmit} disabled={processing}
                    className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-200 disabled:opacity-70">
              {processing ? <><i className="fas fa-spinner fa-spin mr-2"></i>Processing...</> : <><i className="fas fa-lock mr-2"></i>Place Order</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
