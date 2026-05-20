import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Utensils, LogOut, User, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 glassmorphism border-b border-brown-900/10 py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-brown-900 hover:text-gold-500 transition">
          <Utensils size={28} />
          <span className="font-serif text-2xl font-bold tracking-wide">Dine Flow</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/restaurants" className="text-brown-800 hover:text-gold-500 font-medium transition">
            Restaurants
          </Link>
          {user ? (
            <>
              {isAdmin ? (
                <Link to="/admin/dashboard" className="text-brown-800 hover:text-gold-500 font-medium transition flex items-center gap-1">
                  <Shield size={16} /> Dashboard
                </Link>
              ) : (
                <Link to="/dashboard" className="text-brown-800 hover:text-gold-500 font-medium transition flex items-center gap-1">
                  <User size={18} /> My Bookings
                </Link>
              )}
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-brown-700/60 bg-cream-200 px-2.5 py-1 rounded-full">
                  {isAdmin ? '👑 Admin' : '🍽️ Diner'}
                </span>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1 bg-brown-900 text-cream-100 px-4 py-2 rounded-full hover:bg-gold-500 hover:text-brown-900 transition-colors cursor-pointer"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </>
          ) : (
            <Link 
              to="/auth" 
              className="bg-brown-900 text-cream-100 px-6 py-2 rounded-full hover:bg-gold-500 hover:text-brown-900 transition-colors font-medium"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
