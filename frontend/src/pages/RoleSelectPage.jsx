import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Utensils, Store, ArrowRight, Sparkles } from 'lucide-react';

const RoleSelectPage = () => {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-brown-900/5 via-transparent to-gold-500/5" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gold-500/8 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-brown-900/8 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-3xl"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-gold-500/10 text-gold-500 px-5 py-2 rounded-full text-sm font-semibold mb-5"
          >
            <Sparkles size={16} />
            Welcome to Dine Flow
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-5xl font-serif font-bold text-brown-900 mb-3"
          >
            How would you like to <span className="text-gold-500">continue</span>?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-brown-700/70 text-lg max-w-md mx-auto"
          >
            Choose your experience — discover restaurants or manage your own.
          </motion.p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link
              to="/user/signin"
              id="role-select-user"
              className="group block bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-brown-900/5 border border-white/60 p-8 hover:shadow-2xl hover:shadow-gold-500/10 hover:border-gold-500/30 transition-all duration-500 relative overflow-hidden"
            >
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-gold-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-gold-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Utensils size={28} className="text-gold-500" />
                </div>

                <h2 className="text-2xl font-serif font-bold text-brown-900 mb-2">
                  Continue as Diner
                </h2>
                <p className="text-brown-700/60 text-sm mb-6 leading-relaxed">
                  Discover exceptional restaurants, browse interactive floor plans, and book your perfect table.
                </p>

                <ul className="space-y-2 mb-8">
                  {['Browse & search restaurants', 'Interactive table blueprints', 'Book tables instantly', 'Earn rewards & coupons'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-brown-700/70">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-2 text-gold-500 font-bold text-sm group-hover:gap-3 transition-all duration-300">
                  Sign in as Customer <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Admin Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Link
              to="/admin/signin"
              id="role-select-admin"
              className="group block bg-brown-900/[0.03] backdrop-blur-xl rounded-3xl shadow-xl shadow-brown-900/5 border border-brown-900/10 p-8 hover:shadow-2xl hover:shadow-brown-900/10 hover:border-brown-900/20 hover:bg-brown-900/[0.06] transition-all duration-500 relative overflow-hidden"
            >
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-brown-900/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-stone-200 to-stone-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Store size={28} className="text-brown-800" />
                </div>

                <h2 className="text-2xl font-serif font-bold text-brown-900 mb-2">
                  Continue as Owner
                </h2>
                <p className="text-brown-700/60 text-sm mb-6 leading-relaxed">
                  Manage your restaurant, tables, bookings, and track real-time analytics from your dashboard.
                </p>

                <ul className="space-y-2 mb-8">
                  {['Add & manage restaurants', 'Configure table layouts', 'Track bookings & queue', 'Bestseller analytics'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-brown-700/70">
                      <div className="w-1.5 h-1.5 rounded-full bg-brown-800" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-2 text-brown-800 font-bold text-sm group-hover:gap-3 transition-all duration-300">
                  Sign in as Owner <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-center text-xs text-brown-700/40 mt-8"
        >
          By continuing, you agree to Dine Flow&apos;s Terms of Service and Privacy Policy.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default RoleSelectPage;
