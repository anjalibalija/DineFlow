import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Utensils, MapPin, BrainCircuit } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1934&q=80" 
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
            The Future of <span className="text-gold-500">Fine Dining</span> is Here
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-cream-200 mb-10 font-light"
          >
            AI-powered recommendations, interactive blueprints, and gamified experiences.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/restaurants" className="bg-gold-500 text-brown-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-gold-400 hover:scale-105 transition-all shadow-lg shadow-gold-500/30">
              Explore Restaurants
            </Link>
            <Link to="/auth" className="glassmorphism text-cream-100 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 hover:scale-105 transition-all">
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
    </div>
  );
};

export default LandingPage;
