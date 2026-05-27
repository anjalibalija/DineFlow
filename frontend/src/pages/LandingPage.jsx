import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Utensils, MapPin, BrainCircuit, ScanLine, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate(isAdmin ? '/admin/dashboard' : '/restaurants', { replace: true });
    }
  }, [user, loading, isAdmin, navigate]);

  if (loading || user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream-100">
        <div className="w-12 h-12 border-4 border-amber-650 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-serif text-xl text-stone-900">Redirecting to your dining vault...</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/luxury_dining_hero.png" 
            alt="Luxury Restaurant" 
            className="w-full h-full object-cover filter brightness-[0.4]"
          />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-serif font-bold text-cream-100 mb-6 leading-tight"
          >
            Welcome to <span className="text-gold-500">DineFlow</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-cream-200 mb-10 font-light"
          >
            Experience the ultimate in fine dining with AI table mapping, real-time queues, and delightful waiting games.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center"
          >
            <Link to="/auth" className="bg-gold-500 text-brown-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-gold-400 hover:scale-105 transition-all shadow-lg shadow-gold-500/30">
              Sign In to Book
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-cream-100 text-brown-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold mb-4">Why Dine Flow?</h2>
            <p className="text-lg opacity-80 max-w-2xl mx-auto">Discover a new level of convenience and luxury when planning your next culinary adventure.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <motion.div whileHover={{ y: -10 }} className="bg-white p-8 rounded-2xl shadow-xl border border-cream-200 hover-glow">
              <div className="bg-brown-900/10 w-16 h-16 rounded-full flex items-center justify-center mb-6 text-gold-500">
                <MapPin size={32} />
              </div>
              <h3 className="text-2xl font-serif font-bold mb-3">Interactive Blueprints</h3>
              <p className="opacity-75">Don't just book a table; choose your exact spot. Window side? Rooftop? Our visual floor plan lets you decide.</p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div whileHover={{ y: -10 }} className="bg-white p-8 rounded-2xl shadow-xl border border-cream-200 hover-glow">
              <div className="bg-brown-900/10 w-16 h-16 rounded-full flex items-center justify-center mb-6 text-gold-500">
                <BrainCircuit size={32} />
              </div>
              <h3 className="text-2xl font-serif font-bold mb-3">AI Dining Assistant</h3>
              <p className="opacity-75">Get personalized recommendations based on real-time crowd predictions and your unique dining preferences.</p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div whileHover={{ y: -10 }} className="bg-white p-8 rounded-2xl shadow-xl border border-cream-200 hover-glow">
              <div className="bg-brown-900/10 w-16 h-16 rounded-full flex items-center justify-center mb-6 text-gold-500">
                <Sparkles size={32} />
              </div>
              <h3 className="text-2xl font-serif font-bold mb-3">Gamified Rewards</h3>
              <p className="opacity-75">Wait times are fun again. Solve logic puzzles while you wait and earn exclusive discount coupons.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-24 bg-brown-900 text-cream-100 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="text-gold-500 font-semibold tracking-widest text-sm uppercase block mb-3">Next-Gen Intelligence</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gold-400 mb-4">Core AI Capabilities</h2>
            <p className="text-cream-200 opacity-80 max-w-2xl mx-auto">DineFlow integrates state-of-the-art AI systems to elevate both customer booking and restaurant administration.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* AI Dining & Table Matcher */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl flex flex-col justify-between hover:border-gold-500/50 transition-all duration-300 group"
            >
              <div>
                <div className="bg-gold-500/10 text-gold-400 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:bg-gold-500 group-hover:text-brown-900 transition-all duration-300">
                  <BrainCircuit size={24} />
                </div>
                <h3 className="text-2xl font-serif font-bold text-gold-300 mb-3">AI Dining Matcher</h3>
                <p className="text-cream-200 opacity-75 leading-relaxed mb-6">
                  Analyzes reservation profiles, table ambiance characteristics, and group sizes to deliver highly personalized table suggestions matching exact diner preferences.
                </p>
              </div>
              <div className="flex items-center text-xs text-gold-500/80 font-mono gap-1 border-t border-white/5 pt-4">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Active Matcher Engine
              </div>
            </motion.div>

            {/* AI Menu Digitization */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl flex flex-col justify-between hover:border-gold-500/50 transition-all duration-300 group"
            >
              <div>
                <div className="bg-gold-500/10 text-gold-400 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:bg-gold-500 group-hover:text-brown-900 transition-all duration-300">
                  <ScanLine size={24} />
                </div>
                <h3 className="text-2xl font-serif font-bold text-gold-300 mb-3">Gemini Menu Scanner</h3>
                <p className="text-cream-200 opacity-75 leading-relaxed mb-6">
                  Allows admins to upload handwritten or printed menu cards. Using advanced computer vision via Gemini AI, it instantly extracts menu item descriptions and pricing structure.
                </p>
              </div>
              <div className="flex items-center text-xs text-gold-500/80 font-mono gap-1 border-t border-white/5 pt-4">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Gemini Vision Integration
              </div>
            </motion.div>

            {/* AI Geocoding */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl flex flex-col justify-between hover:border-gold-500/50 transition-all duration-300 group"
            >
              <div>
                <div className="bg-gold-500/10 text-gold-400 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:bg-gold-500 group-hover:text-brown-900 transition-all duration-300">
                  <Compass size={24} />
                </div>
                <h3 className="text-2xl font-serif font-bold text-gold-300 mb-3">AI Address Geocoder</h3>
                <p className="text-cream-200 opacity-75 leading-relaxed mb-6">
                  Automatically translates text locations into precise geolocated coordinates (latitude and longitude) during restaurant setup, enabling distance-based restaurant queries.
                </p>
              </div>
              <div className="flex items-center text-xs text-gold-500/80 font-mono gap-1 border-t border-white/5 pt-4">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Geocoding API Active
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
