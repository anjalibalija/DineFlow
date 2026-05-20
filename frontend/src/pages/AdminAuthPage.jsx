import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Mail, Lock, User, Eye, EyeOff, ChevronRight, Shield, ArrowLeft } from 'lucide-react';

const AdminAuthPage = () => {
  const location = useLocation();
  const isSignUp = location.pathname === '/admin/signup';

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
        await login(email, password, 'admin');
      } else {
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setIsSubmitting(false);
          return;
        }
        await signup(name, email, password, 'admin');
      }
      navigate('/admin/dashboard');
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
    navigate(isLogin ? '/admin/signup' : '/admin/signin', { replace: true });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background — dark management dashboard theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-100/80 via-transparent to-brown-900/5" />
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brown-900/8 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-stone-400/8 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-brown-800/3 blur-3xl" />
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
          className="inline-flex items-center gap-1.5 text-sm text-brown-700/60 hover:text-brown-900 font-medium mb-6 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to role selection
        </Link>

        {/* Card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl shadow-brown-900/15 border border-brown-900/10 overflow-hidden">

          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-brown-900 via-brown-800 to-brown-700" />

          {/* Header */}
          <div className="px-8 pt-8 pb-2 text-center">
            <motion.div
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brown-900 to-brown-800 flex items-center justify-center">
                  <Store size={20} className="text-cream-100" />
                </div>
              </div>

              <div className="inline-flex items-center gap-2 bg-brown-900/10 text-brown-800 px-4 py-1.5 rounded-full text-xs font-semibold mb-4">
                <Shield size={12} />
                Restaurant Owner Portal
              </div>

              <h2 className="text-3xl font-extrabold font-serif text-brown-900 mb-1">
                {isLogin ? 'Owner Sign In' : 'Register Your Restaurant'}
              </h2>
              <p className="text-sm text-brown-700/70">
                {isLogin
                  ? 'Access your restaurant management dashboard.'
                  : 'Create an owner account to manage your restaurant on Dine Flow.'}
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
                  <label htmlFor="admin-auth-name" className="block text-xs font-semibold text-brown-700/60 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="admin-auth-name"
                      type="text"
                      required={!isLogin}
                      className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl text-brown-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brown-900/20 focus:border-brown-900 transition-all bg-white"
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label htmlFor="admin-auth-email" className="block text-xs font-semibold text-brown-700/60 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="admin-auth-email"
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl text-brown-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brown-900/20 focus:border-brown-900 transition-all bg-white"
                  placeholder="owner@restaurant.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="admin-auth-password" className="block text-xs font-semibold text-brown-700/60 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="admin-auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 border border-stone-200 rounded-xl text-brown-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brown-900/20 focus:border-brown-900 transition-all bg-white"
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
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer bg-gradient-to-r from-brown-900 to-brown-800 text-cream-100 shadow-brown-900/25 hover:shadow-brown-900/40"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-cream-100/30 border-t-cream-100 rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In to Dashboard' : 'Create Owner Account'}
                  <ChevronRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer toggle */}
          <div className="px-8 pb-8 -mt-2">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white/70 px-4 text-xs text-gray-400">or</span>
              </div>
            </div>
            <button
              type="button"
              onClick={switchMode}
              className="mt-4 w-full text-center text-sm text-brown-700/70 hover:text-brown-900 font-medium transition-colors cursor-pointer"
            >
              {isLogin ? (
                <>New restaurant owner? <span className="text-brown-900 font-semibold">Register here</span></>
              ) : (
                <>Already registered? <span className="text-brown-900 font-semibold">Sign in</span></>
              )}
            </button>
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="text-center text-xs text-brown-700/40 mt-6">
          Restaurant Owner Portal — Powered by Dine Flow
        </p>
      </motion.div>
    </div>
  );
};

export default AdminAuthPage;
