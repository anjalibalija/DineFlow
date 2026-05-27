import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Star, MapPin, Users, Search, Navigation, X, SlidersHorizontal, ChevronDown, Grid, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import DashboardMap from '../components/DashboardMap';

// ─── Haversine distance (km) ───────────────────────────────────────────────
const haversine = (lat1, lon1, lat2, lon2) => {
  if ([lat1, lon1, lat2, lon2].some(v => v == null)) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ─── Smart location match ──────────────────────────────────────────────────
// Splits query into words; a restaurant matches if ALL words appear somewhere
// in (location | city | state | pincode) — case-insensitive, ignoring commas.
const locationMatch = (restaurant, query) => {
  if (!query.trim()) return true; // empty query → show everything

  const haystack = [
    restaurant.location,
    restaurant.city,
    restaurant.state,
    restaurant.pincode,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/,/g, ' ');

  const words = query
    .toLowerCase()
    .replace(/,/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  return words.every(word => haystack.includes(word));
};

// ─── Aliases for common Indian city name variants ──────────────────────────
const CITY_ALIASES = {
  bangalore: ['bengaluru', 'bangalore'],
  bengaluru: ['bengaluru', 'bangalore'],
  mumbai: ['mumbai', 'bombay'],
  bombay: ['mumbai', 'bombay'],
  kolkata: ['kolkata', 'calcutta'],
  calcutta: ['kolkata', 'calcutta'],
  chennai: ['chennai', 'madras'],
  madras: ['chennai', 'madras'],
  pune: ['pune', 'poona'],
  poona: ['pune', 'poona'],
};

const expandQuery = (query) => {
  const lower = query.trim().toLowerCase();
  const aliases = CITY_ALIASES[lower];
  return aliases ? aliases : [lower];
};

// Alias-aware location match
const locationMatchWithAlias = (restaurant, query) => {
  if (!query.trim()) return true;

  const haystack = [
    restaurant.location,
    restaurant.city,
    restaurant.state,
    restaurant.pincode,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/,/g, ' ');

  const variants = expandQuery(query);
  return variants.some(variant =>
    variant.split(/\s+/).every(word => haystack.includes(word))
  );
};

const RestaurantListing = () => {
  const { isAdmin } = useAuth();

  // This page is for customers only — redirect owners/admins to their dashboard
  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [userCoords, setUserCoords] = useState(null);   // { latitude, longitude }
  const [nearMeActive, setNearMeActive] = useState(false); // GPS distance-sort mode
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');

  // Suggestions dropdown
  const [showSuggestions, setShowSuggestions] = useState(false);
  const locationInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Cuisine filter
  const [activeCuisine, setActiveCuisine] = useState('All');
  const [showCuisineMenu, setShowCuisineMenu] = useState(false);

  // Zomato style extra filters
  const [ratingFilter, setRatingFilter] = useState(false);
  const [priceFilter, setPriceFilter] = useState('All'); // 'All' | '1' | '2' | '3' | '4'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map' | 'split'

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await axios.get('/api/restaurants');
        setRestaurants(res.data.data);
      } catch {
        setError('Failed to fetch restaurants.');
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target) &&
        locationInputRef.current &&
        !locationInputRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Build unique location suggestions from restaurant data ──────────────
  const locationSuggestions = useMemo(() => {
    const cities = new Set();
    const areas = new Set();
    restaurants.forEach(r => {
      if (r.city) cities.add(r.city.trim());
      if (r.state) cities.add(r.state.trim());
      // Extract the first significant part of location (usually area/locality)
      if (r.location) {
        const parts = r.location.split(',').map(p => p.trim()).filter(Boolean);
        parts.forEach(p => {
          if (p.length > 2 && p.length < 50) areas.add(p);
        });
      }
    });
    return [...new Set([...cities, ...areas])].sort();
  }, [restaurants]);

  const filteredSuggestions = locationSuggestions.filter(s =>
    locationQuery.trim() &&
    s.toLowerCase().includes(locationQuery.toLowerCase()) &&
    s.toLowerCase() !== locationQuery.toLowerCase()
  );

  // ── Unique cuisines for quick filter ────────────────────────────────────
  const cuisines = useMemo(() => {
    const set = new Set(restaurants.map(r => r.cuisine).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [restaurants]);

  // ── GPS handler ──────────────────────────────────────────────────────────
  const handleGetCurrentLocation = () => {
    if (locating) return;
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setLocationStatus('Accessing GPS…');
    setNearMeActive(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ latitude, longitude });
        setNearMeActive(true);
        setLocationStatus('Sorting by distance…');
        setLocationQuery('Current Location');

        // Try to resolve a human-readable city name (best effort)
        try {
          const res = await axios.post('/api/ai/reverse-geocode', { latitude, longitude });
          if (res.data.success) {
            const { city, state } = res.data.data;
            const resolved = city || state || '';
            if (resolved) {
              setLocationQuery(resolved);
            }
          }
        } catch {
          // GPS distance-sort is still active even if reverse geocode fails
        }

        setLocationStatus('');
        setLocating(false);
      },
      (err) => {
        console.error(err);
        const msgs = {
          1: 'Location permission denied. Please allow access in browser settings.',
          2: 'Position unavailable. Try again.',
          3: 'Location request timed out.',
        };
        setLocationStatus(msgs[err.code] || 'Could not get location.');
        setLocating(false);
        setTimeout(() => setLocationStatus(''), 4000);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const clearLocation = () => {
    setLocationQuery('');
    setUserCoords(null);
    setNearMeActive(false);
    setLocationStatus('');
    locationInputRef.current?.focus();
  };

  // Compute distance for each restaurant
  const withDistance = useMemo(() => {
    return restaurants.map(r => ({
      ...r,
      distance:
        userCoords && r.latitude && r.longitude
          ? haversine(userCoords.latitude, userCoords.longitude, r.latitude, r.longitude)
          : null,
    }));
  }, [restaurants, userCoords]);

  // Price helper
  const getPriceText = (priceRange) => {
    if (priceRange === '₹' || priceRange === '$') return '₹300 for two';
    if (priceRange === '₹₹' || priceRange === '$$') return '₹800 for two';
    if (priceRange === '₹₹₹' || priceRange === '$$$') return '₹1,800 for two';
    if (priceRange === '₹₹₹₹' || priceRange === '$$$$') return '₹3,500 for two';
    return '₹800 for two';
  };

  // Rating color helper
  const getRatingColorClass = (rating) => {
    if (!rating) return 'bg-gray-400';
    if (rating >= 4.0) return 'bg-[#24963F]';
    if (rating >= 3.0) return 'bg-[#CDD614] text-stone-900';
    return 'bg-[#E23744]';
  };

  // ── Filter + Sort ────────────────────────────────────────────────────────
  const filteredAndSorted = useMemo(() => {
    return withDistance
      .filter(r => {
        // 1. Main search (name, cuisine, description, location text)
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          r.name.toLowerCase().includes(q) ||
          r.cuisine.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q)) ||
          (r.location && r.location.toLowerCase().includes(q)) ||
          (r.city && r.city.toLowerCase().includes(q));

        // 2. Cuisine quick-filter
        const matchesCuisine = activeCuisine === 'All' || r.cuisine === activeCuisine;

        // 3. Location filter
        let matchesLocation = true;
        if (nearMeActive && userCoords) {
          matchesLocation = r.distance !== null ? r.distance <= 50 : false;
        } else if (locationQuery.trim()) {
          matchesLocation = locationMatchWithAlias(r, locationQuery);
        }

        // 4. Rating filter
        const matchesRating = !ratingFilter || (r.rating && r.rating >= 4.0);

        // 5. Price filter
        const matchesPrice = priceFilter === 'All' ||
          (priceFilter === '1' && (r.priceRange === '$' || r.priceRange === '₹' || !r.priceRange)) ||
          (priceFilter === '2' && (r.priceRange === '$$' || r.priceRange === '₹₹')) ||
          (priceFilter === '3' && (r.priceRange === '$$$' || r.priceRange === '₹₹₹')) ||
          (priceFilter === '4' && (r.priceRange === '$$$$' || r.priceRange === '₹₹₹₹'));

        return matchesSearch && matchesCuisine && matchesLocation && matchesRating && matchesPrice;
      })
      .sort((a, b) => {
        // Sort by distance if available
        if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
        if (a.distance !== null) return -1;
        if (b.distance !== null) return 1;
        // Fall back to rating
        return (b.rating || 0) - (a.rating || 0);
      });
  }, [withDistance, searchQuery, locationQuery, nearMeActive, activeCuisine, ratingFilter, priceFilter]);

  // ── Render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-[#F8F8F8]">
        <div className="w-12 h-12 border-4 border-[#E23744] border-t-transparent rounded-full animate-spin" />
        <p className="font-sans text-lg text-gray-700 font-semibold animate-pulse">Loading amazing places near you…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-red-500 font-serif text-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-16">
      {/* Breadcrumb section */}
      <div className="max-w-7xl mx-auto px-4 py-4 text-xs text-gray-400 font-medium flex items-center gap-1.5">
        <span>Home</span>
        <span>/</span>
        <span>India</span>
        <span>/</span>
        <span className="text-gray-500 font-semibold">{locationQuery || 'All Cities'}</span>
        <span>/</span>
        <span className="text-gray-700 font-semibold">Dining Out</span>
      </div>

      {/* ── Search + Location Bar Container ── */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Combined Search + Location Card */}
          <div className="w-full lg:max-w-3xl bg-white rounded-lg border border-gray-200 shadow-sm p-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-1 min-h-[56px]">
            
            {/* Location Section */}
            <div className="relative flex items-center flex-1 min-w-[200px] px-3 py-2 sm:py-0">
              <MapPin size={18} className="text-[#E23744] mr-2 shrink-0 animate-pulse" />
              <input
                ref={locationInputRef}
                type="text"
                placeholder={nearMeActive ? '📍 Sorted by distance' : 'Select Location…'}
                value={locationQuery}
                onChange={e => {
                  setLocationQuery(e.target.value);
                  setNearMeActive(false);
                  setUserCoords(null);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                autoComplete="off"
                className="w-full text-sm focus:outline-none bg-transparent text-gray-800 placeholder-gray-400 font-medium"
              />
              
              {/* Clear location */}
              {(locationQuery || nearMeActive) && (
                <button
                  onClick={clearLocation}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 mr-1 shrink-0 cursor-pointer"
                  title="Clear location"
                >
                  <X size={14} />
                </button>
              )}

              {/* GPS Button */}
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={locating}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 shrink-0 ${
                  nearMeActive
                    ? 'bg-[#E23744] text-white shadow-sm'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title="Sort by GPS distance"
              >
                {locating ? (
                  <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Navigation size={12} className={nearMeActive ? '' : 'rotate-45'} />
                )}
                <span>{nearMeActive ? 'Near' : 'GPS'}</span>
              </button>

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    ref={suggestionsRef}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-gray-200 shadow-xl z-50 overflow-hidden max-h-64 overflow-y-auto"
                  >
                    {/* Current Location Option */}
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleGetCurrentLocation();
                        setShowSuggestions(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#E23744] hover:bg-[#FDF0F1]/50 transition-colors text-left border-b border-gray-100 cursor-pointer"
                    >
                      {locating ? (
                        <span className="w-4 h-4 border-2 border-[#E23744] border-t-transparent rounded-full animate-spin shrink-0" />
                      ) : (
                        <Navigation size={14} className="text-[#E23744] rotate-45 shrink-0 animate-pulse" />
                      )}
                      <div>
                        <div className="font-bold text-gray-900 flex items-center gap-1.5">
                          Use Current Location
                        </div>
                        <div className="text-xs text-gray-500 font-normal">
                          {locationStatus || 'Detect location using GPS'}
                        </div>
                      </div>
                    </button>

                    {/* Suggestions list */}
                    {filteredSuggestions.slice(0, 8).map(suggestion => (
                      <button
                        key={suggestion}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setLocationQuery(suggestion);
                          setNearMeActive(false);
                          setUserCoords(null);
                          setShowSuggestions(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50 transition-colors text-left cursor-pointer"
                      >
                        <MapPin size={14} className="text-gray-400 shrink-0" />
                        <span>{suggestion}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Vertical Divider */}
            <div className="hidden sm:block h-8 w-[1px] bg-gray-200 self-center"></div>

            {/* Search Section */}
            <div className="relative flex items-center flex-[1.5] px-3 py-2 sm:py-0">
              <Search size={18} className="text-gray-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search for restaurant, cuisine or a dish…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoComplete="off"
                className="w-full text-sm focus:outline-none bg-transparent text-gray-800 placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
                >
                  <X size={15} />
                </button>
              )}
            </div>

          </div>

          {/* Results Count & Clear All */}
          <div className="flex items-center gap-4 text-sm text-gray-500 font-semibold self-end lg:self-center shrink-0">
            <span>
              {filteredAndSorted.length === restaurants.length
                ? `${restaurants.length} places`
                : `${filteredAndSorted.length} of ${restaurants.length} places`}
            </span>
            {(searchQuery || locationQuery || nearMeActive || activeCuisine !== 'All' || ratingFilter || priceFilter !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setLocationQuery('');
                  setUserCoords(null);
                  setNearMeActive(false);
                  setActiveCuisine('All');
                  setRatingFilter(false);
                  setPriceFilter('All');
                }}
                className="text-[#E23744] hover:text-[#c12f3a] font-bold flex items-center gap-1 transition-colors bg-[#FDF0F1] px-2.5 py-1 rounded-md border border-[#FADCDD] cursor-pointer"
              >
                <X size={13} /> Clear all
              </button>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200/10'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                title="List view"
              >
                <Grid size={13} />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'map'
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200/10'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Map view"
              >
                <Map size={13} />
                <span className="hidden sm:inline">Map</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`hidden md:flex px-3 py-1.5 rounded-md text-xs font-bold transition-all items-center gap-1.5 cursor-pointer ${
                  viewMode === 'split'
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200/10'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Split view"
              >
                <SlidersHorizontal size={13} />
                <span>Split</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Status message */}
        {locationStatus && (
          <p className="text-xs font-semibold text-[#E23744] mt-2 flex items-center gap-1 animate-pulse">
            <Navigation size={11} className="rotate-45" /> {locationStatus}
          </p>
        )}
      </div>

      {/* ── Title Banner ── */}
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
          Dine-out Restaurants in {locationQuery || 'your city'}
        </h1>
      </div>

      {/* ── Filter Pills Row ── */}
      <div className="max-w-7xl mx-auto px-4 mb-8 flex flex-wrap items-center gap-2.5">
        
        {/* Rating 4.0+ */}
        <button
          onClick={() => setRatingFilter(prev => !prev)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
            ratingFilter
              ? 'bg-[#E23744] text-white border-[#E23744] shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <span>Rating: 4.0+</span>
          {ratingFilter && <X size={10} />}
        </button>

        {/* Price filters */}
        {['1', '2', '3', '4'].map((val) => (
          <button
            key={val}
            onClick={() => setPriceFilter(prev => prev === val ? 'All' : val)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
              priceFilter === val
                ? 'bg-[#E23744] text-white border-[#E23744] shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span>{val === '1' ? 'Budget' : val === '2' ? 'Moderate' : val === '3' ? 'Premium' : 'Fine Dining'}</span>
            {priceFilter === val && <X size={10} />}
          </button>
        ))}

        {/* Cuisines separator */}
        <div className="h-4 w-[1px] bg-gray-200 mx-1"></div>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cuisine:</span>

        {cuisines.slice(0, 5).map(c => (
          <button
            key={c}
            onClick={() => setActiveCuisine(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
              activeCuisine === c
                ? 'bg-[#E23744] text-white border-[#E23744] shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* ── Restaurant Listings ── */}
      <div className="max-w-7xl mx-auto px-4">
        {viewMode === 'map' ? (
          <div className="bg-white p-4 rounded-3xl border border-gray-200/80 shadow-md">
            <DashboardMap restaurants={filteredAndSorted} />
          </div>
        ) : viewMode === 'split' ? (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Left List of matching restaurants */}
            <div className="w-full lg:w-5/12 max-h-[600px] overflow-y-auto pr-2 space-y-4 pb-4 scrollbar-thin scrollbar-thumb-gray-200">
              {filteredAndSorted.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
                  <MapPin size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-lg font-bold text-gray-700 mb-1">No matching places</p>
                  <p className="text-xs text-gray-500">Try adjusting your filters or location search.</p>
                </div>
              ) : (
                filteredAndSorted.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="flex bg-white rounded-2xl border border-gray-100 hover:border-gray-300 shadow-sm overflow-hidden hover:shadow-md transition-all group h-36 shrink-0"
                  >
                    {/* Compact Image */}
                    <div className="w-32 sm:w-40 h-full bg-gray-100 relative shrink-0 overflow-hidden">
                      <img
                        src={
                          restaurant.image && restaurant.image !== 'no-photo.jpg'
                            ? restaurant.image
                            : 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
                        }
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {restaurant.distance !== null && (
                        <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm text-gray-800 px-2 py-0.5 rounded text-[10px] font-bold shadow-sm border border-gray-100 flex items-center gap-0.5">
                          <Navigation size={9} className="text-[#E23744] rotate-45" />
                          <span>{restaurant.distance < 1 ? `${Math.round(restaurant.distance * 1000)} m` : `${restaurant.distance.toFixed(1)} km`}</span>
                        </div>
                      )}
                    </div>
                    {/* Compact details */}
                    <div className="p-3 flex flex-col justify-between flex-grow min-w-0">
                      <div>
                        <div className="flex justify-between items-start gap-1 mb-0.5">
                          <h4 className="font-bold text-gray-900 text-sm group-hover:text-[#E23744] transition-colors truncate pr-1">
                            {restaurant.name}
                          </h4>
                          <div className={`flex items-center gap-0.5 text-white font-bold text-[10px] px-1.5 py-0.5 rounded shrink-0 ${getRatingColorClass(restaurant.rating)}`}>
                            <span>{restaurant.rating ? restaurant.rating.toFixed(1) : 'New'}</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-500 truncate mb-0.5">{restaurant.cuisine}</p>
                        <p className="text-[10px] text-gray-400 truncate mb-1">📍 {restaurant.location || restaurant.city}</p>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                        <span className="text-[11px] font-extrabold text-[#E23744]">
                          {restaurant.priceRange === '$' || restaurant.priceRange === '₹' ? 'Budget' : restaurant.priceRange === '$$' || restaurant.priceRange === '₹₹' ? 'Moderate' : restaurant.priceRange === '$$$' || restaurant.priceRange === '₹₹₹' ? 'Premium' : 'Fine Dining'}
                        </span>
                        <Link
                          to={`/restaurants/${restaurant.id}`}
                          className="bg-[#E23744] hover:bg-[#c12f3a] text-white px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all shadow-sm"
                        >
                          Book Table
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Right Sticky Map */}
            <div className="w-full lg:w-7/12 rounded-3xl overflow-hidden border border-gray-200 shadow-md bg-white p-3">
              <DashboardMap restaurants={filteredAndSorted} />
            </div>
          </div>
        ) : (
          filteredAndSorted.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-lg border border-gray-100">
              <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-xl font-bold text-gray-700 mb-2">No places found</p>
              <p className="text-sm text-gray-500 mb-6">
                {locationQuery
                  ? `No restaurants match "${locationQuery}". Try another location.`
                  : 'Try adjusting your search or filter options.'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setLocationQuery('');
                  setUserCoords(null);
                  setNearMeActive(false);
                  setActiveCuisine('All');
                  setRatingFilter(false);
                  setPriceFilter('All');
                }}
                className="bg-[#E23744] hover:bg-[#c12f3a] text-white px-6 py-2.5 rounded-lg font-bold transition-all text-sm cursor-pointer shadow-sm"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAndSorted.map((restaurant, index) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.04, 0.4) }}
                  className="bg-white rounded-lg overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 group flex flex-col h-full"
                >
                  {/* Image Section */}
                  <div className="h-56 bg-gray-100 relative overflow-hidden shrink-0">
                    <img
                      src={
                        restaurant.image && restaurant.image !== 'no-photo.jpg'
                          ? restaurant.image
                          : 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                      }
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Distance Overlay in bottom corner */}
                    {restaurant.distance !== null && (
                      <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm text-gray-800 px-2 py-0.5 rounded text-[11px] font-bold shadow-sm flex items-center gap-1 border border-gray-100">
                        <Navigation size={10} className="text-[#E23744] rotate-45" />
                        <span>
                          {restaurant.distance < 1
                            ? `${Math.round(restaurant.distance * 1000)} m`
                            : `${restaurant.distance.toFixed(1)} km`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details Section */}
                  <div className="p-4 flex flex-col flex-grow">
                    {/* Name and Rating */}
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <h3 className="font-bold text-gray-800 text-lg group-hover:text-[#E23744] transition-colors truncate max-w-[80%]">
                        {restaurant.name}
                      </h3>
                      <div className={`flex items-center gap-0.5 text-white font-bold text-xs px-2 py-0.5 rounded shrink-0 ${getRatingColorClass(restaurant.rating)}`}>
                        <span>{restaurant.rating ? restaurant.rating.toFixed(1) : 'N/A'}</span>
                        <Star size={10} className="fill-white text-white" />
                      </div>
                    </div>

                    {/* Cuisine and Cost */}
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-1 font-medium">
                      <span className="truncate max-w-[65%]">{restaurant.cuisine}</span>
                      <span className="shrink-0 text-gray-600 font-bold">{getPriceText(restaurant.priceRange)}</span>
                    </div>

                    {/* Location and Distance description */}
                    <div className="flex justify-between items-center text-xs text-gray-400 font-semibold mb-3">
                      <span className="truncate max-w-[70%]">{restaurant.location || restaurant.city}</span>
                      <span>Opens {restaurant.openingTime || '10:00'} - {restaurant.closingTime || '22:00'}</span>
                    </div>

                    {/* Description snippet */}
                    {restaurant.description && (
                      <p className="text-gray-500 text-xs line-clamp-2 mb-4 leading-relaxed">
                        {restaurant.description}
                      </p>
                    )}

                    {/* Divider and Actions */}
                    <div className="pt-3.5 border-t border-gray-100 flex items-center justify-between mt-auto">
                      {/* Crowd indicator */}
                      <div className="flex items-center gap-1.5 text-xs">
                        <Users size={14} className="text-gray-400" />
                        <span
                          className={`font-bold ${
                            restaurant.crowdLevel === 'High' || restaurant.crowdLevel === 'Full'
                              ? 'text-red-500'
                              : restaurant.crowdLevel === 'Medium'
                              ? 'text-amber-500'
                              : 'text-green-600'
                          }`}
                        >
                          {restaurant.crowdLevel || 'Average'} Crowd
                        </span>
                      </div>

                      {/* Book a table button */}
                      <Link
                        to={`/restaurants/${restaurant.id}`}
                        className="bg-[#E23744] hover:bg-[#c12f3a] text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow flex items-center gap-1 cursor-pointer"
                      >
                        Book a Table 🍽️
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default RestaurantListing;
