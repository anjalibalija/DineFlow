import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, MapPin, Users, Ticket, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [bookingsRes, couponsRes] = await Promise.all([
          axios.get('/api/bookings/my'),
          axios.get('/api/coupons/my')
        ]);
        setBookings(bookingsRes.data.data);
        setCoupons(couponsRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center font-serif text-2xl text-brown-900">Loading dashboard...</div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-bold text-brown-900 mb-2">Welcome, {user.name}</h1>
        <p className="text-brown-700">Manage your reservations and luxury dining rewards.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Bookings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-serif font-bold text-brown-900">Upcoming Reservations</h2>
            <Link to="/restaurants" className="text-sm font-bold text-gold-600 hover:text-gold-500">Book New Table &rarr;</Link>
          </div>

          {bookings.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl border border-cream-200 text-center shadow-sm">
              <p className="text-brown-600 mb-4">You have no upcoming reservations.</p>
              <Link to="/restaurants" className="inline-block bg-brown-900 text-cream-100 px-6 py-2 rounded-full text-sm font-medium hover:bg-gold-500 hover:text-brown-900 transition-colors">
                Explore Restaurants
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-2xl overflow-hidden shadow-md border border-cream-200 flex flex-col sm:flex-row">
                  <div className="sm:w-1/3 h-48 sm:h-auto bg-gray-200 relative">
                    <img src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt={booking.restaurant?.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6 sm:w-2/3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-serif font-bold text-brown-900">{booking.restaurant?.name}</h3>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium flex items-center gap-1">
                          <CheckCircle2 size={12} /> {booking.status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-brown-600 flex items-center gap-1 mb-4">
                        <MapPin size={14} /> {booking.restaurant?.location}
                      </p>

                      <div className="grid grid-cols-2 gap-4 text-sm text-brown-800 bg-cream-100 p-3 rounded-lg">
                        <div className="flex items-center gap-2"><Calendar size={16} className="text-gold-600" /> {new Date(booking.bookingDate).toLocaleDateString()}</div>
                        <div className="flex items-center gap-2"><Clock size={16} className="text-gold-600" /> {booking.bookingTime}</div>
                        <div className="flex items-center gap-2"><Users size={16} className="text-gold-600" /> {booking.peopleCount} Guests</div>
                        <div className="flex items-center gap-2 text-brown-900 font-bold">Table {booking.table?.tableNumber}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Rewards & Coupons */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-2xl font-serif font-bold text-brown-900 mb-4">Your Rewards</h2>
          
          <div className="bg-gradient-to-br from-brown-900 to-brown-800 rounded-2xl p-6 text-cream-100 shadow-xl relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-10">
              <Ticket size={160} />
            </div>
            
            <h3 className="text-lg font-bold mb-1 relative z-10">Active Coupons</h3>
            <p className="text-sm text-cream-200/80 mb-6 relative z-10">Available to use on your next dining experience.</p>
            
            {coupons.length === 0 ? (
              <div className="text-center py-6 bg-black/20 rounded-xl relative z-10">
                <p className="text-sm text-cream-200">No active coupons.</p>
              </div>
            ) : (
              <div className="space-y-3 relative z-10">
                {coupons.map((coupon) => (
                  <div key={coupon.id} className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-black text-gold-500 block">{coupon.discount}% OFF</span>
                      <span className="text-xs tracking-wider opacity-70">CODE: {coupon.code}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase block opacity-60">Expires</span>
                      <span className="text-xs font-medium">{new Date(coupon.expiry).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
