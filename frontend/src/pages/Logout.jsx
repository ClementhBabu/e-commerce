import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Logout() {
  const { logout } = useAuth();
  const { setCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    logout();
    setCount(0);
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    navigate('/login', { replace: true });
  }, []);

  return null;
}
