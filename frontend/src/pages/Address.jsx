import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { address as addrApi } from '../api';
import { useToast } from '../context/ToastContext';

export default function Address() {
  const [savedAddress, setSavedAddress] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '', phone: '', street_address: '', city: '', state: '', pincode: '', is_default: true,
  });
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await addrApi.list();
        if (data.addresses?.length > 0) {
          setSavedAddress(data.addresses[0]);
        } else {
          setShowForm(true);
        }
      } catch { showToast('Failed to load address', 'error'); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation not supported', 'error');
      return;
    }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const data = await addrApi.geocode({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        if (data.success) {
          setForm({
            ...form,
            street_address: data.address.street_address || '',
            city: data.address.city || '',
            state: data.address.state || '',
            pincode: data.address.pincode || '',
          });
          showToast('Location detected!', 'success');
        }
      } catch { showToast('Geocoding failed', 'error'); }
    }, () => showToast('Location access denied', 'error'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.phone || !form.street_address || !form.city || !form.state || !form.pincode) {
      showToast('Please fill all fields', 'error');
      return;
    }
    setSaving(true);
    try {
      if (savedAddress) {
        await addrApi.update(savedAddress.id, form);
      } else {
        await addrApi.create(form);
      }
      showToast('Address saved!', 'success');
      navigate('/checkout');
    } catch (err) {
      showToast(err.message || 'Failed to save address', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="max-w-2xl mx-auto px-4 py-8"><div className="h-48 skeleton rounded-xl"></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Delivery Address</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          {savedAddress && !showForm ? (
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Saved Address</h3>
                <button onClick={() => {
                  setForm({
                    full_name: savedAddress.full_name,
                    phone: savedAddress.phone,
                    street_address: savedAddress.street_address,
                    city: savedAddress.city,
                    state: savedAddress.state,
                    pincode: savedAddress.pincode,
                    is_default: !!savedAddress.is_default,
                  });
                  setShowForm(true);
                }} className="text-indigo-600 text-sm font-medium hover:underline">Change</button>
              </div>
              <div className="space-y-1 text-gray-600 text-sm">
                <p className="font-semibold text-gray-800">{savedAddress.full_name}</p>
                <p>{savedAddress.phone}</p>
                <p>{savedAddress.street_address}</p>
                <p>{savedAddress.city}, {savedAddress.state} - {savedAddress.pincode}</p>
              </div>
              <button onClick={() => navigate('/checkout')} className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors">
                Continue to Payment <i className="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">{savedAddress ? 'Update' : 'New'} Address</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                    <input name="full_name" value={form.full_name} onChange={handleChange} required
                           className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                    <input name="phone" value={form.phone} onChange={handleChange} required
                           className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Street Address</label>
                  <input name="street_address" value={form.street_address} onChange={handleChange} required
                         className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                    <input name="city" value={form.city} onChange={handleChange} required
                           className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
                    <input name="state" value={form.state} onChange={handleChange} required
                           className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Pincode</label>
                    <input name="pincode" value={form.pincode} onChange={handleChange} required
                           className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>
                <button type="button" onClick={useCurrentLocation} className="text-sm text-indigo-600 hover:underline">
                  <i className="fas fa-location-crosshairs mr-1"></i>Use Current Location
                </button>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" name="is_default" checked={form.is_default} onChange={handleChange} />
                  Set as default address
                </label>
                <button type="submit" disabled={saving}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-70">
                  {saving ? <><i className="fas fa-spinner fa-spin mr-2"></i>Saving...</> : <>Continue to Payment <i className="fas fa-arrow-right ml-2"></i></>}
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="w-full md:w-64 shrink-0">
          <div className="bg-gray-50 rounded-xl p-4 text-sm">
            <i className="fas fa-shield-halved text-indigo-500 text-lg mb-2"></i>
            <p className="font-medium text-gray-700 mb-1">Your Privacy Matters</p>
            <p className="text-gray-500 text-xs">Your address is securely stored and used only for order delivery.</p>
          </div>
          <Link to="/cart" className="block text-center text-sm text-indigo-600 hover:underline mt-4">
            <i className="fas fa-arrow-left mr-1"></i>Back to Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
