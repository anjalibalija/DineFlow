import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Star, MapPin, Users, Search, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Haversine formula to compute distance in km
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null;
  const R = 6371; // Radius of earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const RestaurantListing = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [userCoords, setUserCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await axios.get('/api/restaurants');
        setRestaurants(res.data.data);
      } catch (err) {
        setError('Failed to fetch restaurants.');
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setLocationStatus('Accessing GPS...');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ latitude, longitude });
        setLocationStatus('Resolving location...');
        try {
          const res = await axios.post('/api/ai/reverse-geocode', { latitude, longitude });
          if (res.data.success) {
            const { city, state } = res.data.data;
            setLocationQuery(city || state || '');
            setLocationStatus('');
          }
        } catch (err) {
          console.error(err);
          setLocationStatus('Could not resolve city name, sorting by nearest.');
          setTimeout(() => setLocationStatus(''), 3000);
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        console.error(error);
        setLocationStatus('GPS access denied or timed out.');
        setLocating(false);
        setTimeout(() => setLocationStatus(''), 3000);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Filter and sort restaurants
  const filteredAndSortedRestaurants = restaurants
    .map(r => {
      const distance = userCoords && r.latitude && r.longitude
        ? calculateDistance(userCoords.latitude, userCoords.longitude, r.latitude, r.longitude)
        : null;
      return { ...r, distance };
    })
    .filter(r => {
      const matchesSearch = 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLocation =
        r.location.toLowerCase().includes(locationQuery.toLowerCase()) ||
        (r.city && r.city.toLowerCase().includes(locationQuery.toLowerCase())) ||
        (r.state && r.state.toLowerCase().includes(locationQuery.toLowerCase()));

      return matchesSearch && matchesLocation;
    })
    .sort((a, b) => {
      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }
      if (a.distance !== null) return -1;
      if (b.distance !== null) return 1;
      return 0;
    });

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center font-serif text-2xl text-brown-900">Loading restaurants...</div>;
  if (error) return <div className="min-h-[60vh] flex items-center justify-center text-red-500 font-serif text-xl">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-brown-900 mb-4">Discover Exceptional Dining</h1>
        <p className="text-lg text-brown-700 max-w-2xl mx-auto">Explore our curated selection of luxury restaurants, complete with AI-powered insights and interactive table blueprints.</p>
      </div>

      {/* Advanced Location & Search Filters */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-cream-200 shadow-lg p-6 mb-12 flex flex-col md:flex-row gap-4 items-center">
        {/* Restaurant / Cuisine Search */}
        <div className="relative w-full md:flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-400" />
          <input
            type="text"
            placeholder="Search name, cuisine, descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all bg-cream-50/10 text-brown-900"
          />
        </div>

        {/* Location Box */}
        <div className="relative w-full md:w-80">
          <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-500" />
          <input
            type="text"
            placeholder="Enter city or locality..."
            value={locationQuery}
            onChange={(e) => {
              setLocationQuery(e.target.value);
              if (userCoords) setUserCoords(null);
            }}
            className="w-full pl-10 pr-24 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all bg-cream-50/10 font-medium text-brown-900"
          />
          
          {/* GPS Button */}
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={locating}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-brown-900 hover:bg-gold-500 hover:text-brown-900 text-gold-500 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
            title="Use current GPS location"
          >
            {locating ? (
              <span className="animate-spin text-gold-500">⏳</span>
            ) : (
              <Navigation size={12} className="rotate-45" />
            )}
            <span>GPS</span>
          </button>
        </div>
      </div>

      {/* GPS Status feedback */}
      <AnimatePresence>
        {locationStatus && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center text-xs text-gold-600 font-bold mb-6 -mt-8"
          >
            {locationStatus}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Restaurant Grid */}
      {filteredAndSortedRestaurants.length === 0 ? (
        <div className="text-center py-16 bg-cream-50/20 rounded-2xl border border-cream-200">
          <p className="text-xl font-serif text-brown-700">No restaurants match your search criteria.</p>
          <button 
            onClick={() => { setSearchQuery(''); setLocationQuery(''); setUserCoords(null); }}
            className="mt-4 bg-brown-900 text-gold-500 px-6 py-2.5 rounded-full font-bold hover:bg-gold-500 hover:text-brown-900 transition-all text-sm"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAndSortedRestaurants.map((restaurant, index) => (
            <motion.div 
              key={restaurant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg border border-cream-200 hover-glow group flex flex-col h-full"
            >
              <div className="h-48 bg-gray-200 relative overflow-hidden shrink-0">
                <img 
                  src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt={restaurant.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Distance Badge */}
                {restaurant.distance !== null && (
                  <div className="absolute top-4 left-4 bg-brown-900/90 backdrop-blur-sm text-gold-500 border border-gold-500/20 px-3 py-1 rounded-full text-xs font-bold shadow-md">
                    📍 {restaurant.distance.toFixed(1)} km away
                  </div>
                )}

                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 text-brown-900">
                  <Star size={14} className="text-gold-500 fill-gold-500" />
                  {restaurant.rating ? restaurant.rating : 'N/A'}
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h2 className="text-2xl font-serif font-bold text-brown-900 leading-tight">{restaurant.name}</h2>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-xs font-semibold px-2 py-1 bg-cream-200 text-brown-800 rounded">{restaurant.cuisine}</span>
                    <span className="text-[10px] font-bold text-gold-600 bg-gold-50 px-2 py-0.5 rounded border border-gold-500/10">
                      {restaurant.priceRange ? restaurant.priceRange.replace(/\$/g, '₹') : '₹₹'} ({
                        restaurant.priceRange === '₹' ? 'Budget' :
                        restaurant.priceRange === '₹₹' ? 'Moderate' :
                        restaurant.priceRange === '₹₹₹' ? 'Premium' :
                        restaurant.priceRange === '₹₹₹₹' ? 'Fine Dining' :
                        'Moderate'
                      })
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-brown-700 mb-4">
                  <MapPin size={16} className="text-gold-500 shrink-0" />
                  <span className="truncate">{restaurant.location}</span>
                </div>
                
                <p className="text-brown-700 text-sm mb-6 line-clamp-2 flex-grow">
                  {restaurant.description}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-cream-200 mt-auto">
                  <div className="flex items-center gap-2 text-sm">
                    <Users size={16} className="text-brown-700" />
                    <span className={`font-medium ${restaurant.crowdLevel === 'High' || restaurant.crowdLevel === 'Full' ? 'text-red-500' : 'text-green-600'}`}>
                      {restaurant.crowdLevel} Crowd
                    </span>
                  </div>
                  <Link 
                    to={`/restaurants/${restaurant.id}`}
                    className="bg-brown-900 text-cream-100 px-5 py-2 rounded-full text-sm font-medium hover:bg-gold-500 hover:text-brown-900 transition-colors shadow-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantListing;
