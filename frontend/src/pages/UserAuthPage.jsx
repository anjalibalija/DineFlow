import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Mail, Lock, User, Eye, EyeOff, ChevronRight, Sparkles, ArrowLeft } from 'lucide-react';

const UserAuthPage = () => {
  const location = useLocation();
  const isSignUp = location.pathname === '/user/signup';

  const [isLogin, setIsLogin] = useState(!isSignUp);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (isLogin) {
        await login(email, password, 'user');
      } else {
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setIsSubmitting(false);
          return;
        }
        await signup(name, email, password, 'user');
      }
      navigate('/restaurants');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setEmail('');
    setPassword('');
    setName('');
    navigate(isLogin ? '/user/signup' : '/user/signin', { replace: true });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background — warm dining theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-transparent to-gold-50/30" />
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gold-500/8 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold-500/3 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Back to role selection */}
        <Link
          to="/auth"
          className="inline-flex items-center gap-1.5 text-sm text-brown-700/60 hover:text-gold-500 font-medium mb-6 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to role selection
        </Link>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-brown-900/10 border border-white/50 overflow-hidden">

          {/* Header */}
          <div className="px-8 pt-8 pb-2 text-center">
            <motion.div
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-gold-50 flex items-center justify-center">
                  <Utensils size={20} className="text-gold-500" />
                </div>
              </div>

              <div className="inline-flex items-center gap-2 bg-gold-500/10 text-gold-500 px-4 py-1.5 rounded-full text-xs font-semibold mb-4">
                <Sparkles size={12} />
                Customer Portal
              </div>

              <h2 className="text-3xl font-extrabold font-serif text-brown-900 mb-1">
                {isLogin ? 'Welcome Back' : 'Create Your Account'}
              </h2>
              <p className="text-sm text-brown-700/70">
                {isLogin
                  ? 'Sign in to access your bookings and discover fine dining.'
                  : 'Join Dine Flow for a premium dining experience.'}
              </p>
            </motion.div>
          </div>

          {/* Form */}
          <form className="px-8 pb-8 pt-6 space-y-4" onSubmit={handleSubmit}>
            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="bg-red-50 text-red-600 text-sm text-center py-3 px-4 rounded-xl border border-red-100"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Name field (signup only) */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label htmlFor="user-auth-name" className="block text-xs font-semibold text-brown-700/60 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="user-auth-name"
                      type="text"
                      required={!isLogin}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-brown-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all bg-white"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label htmlFor="user-auth-email" className="block text-xs font-semibold text-brown-700/60 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="user-auth-email"
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-brown-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all bg-white"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="user-auth-password" className="block text-xs font-semibold text-brown-700/60 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="user-auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-brown-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all bg-white"
                  placeholder={isLogin ? 'Enter your password' : 'Create a strong password (min 6 chars)'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brown-700 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer bg-gradient-to-r from-gold-500 to-yellow-400 text-brown-900 shadow-gold-500/25 hover:shadow-gold-500/40"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ChevronRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer toggle */}
          <div className="px-8 pb-8 -mt-2">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white/80 px-4 text-xs text-gray-400">or</span>
              </div>
            </div>
            <button
              type="button"
              onClick={switchMode}
              className="mt-4 w-full text-center text-sm text-brown-700/70 hover:text-gold-500 font-medium transition-colors cursor-pointer"
            >
              {isLogin ? (
                <>Don&apos;t have an account? <span className="text-gold-500 font-semibold">Sign up</span></>
              ) : (
                <>Already have an account? <span className="text-gold-500 font-semibold">Sign in</span></>
              )}
            </button>
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="text-center text-xs text-brown-700/40 mt-6">
          By continuing, you agree to Dine Flow&apos;s Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
};

export default UserAuthPage;
