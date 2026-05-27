import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Mail, Lock, User, Eye, EyeOff, ChevronRight, Sparkles, ArrowLeft, ShieldCheck, CheckCircle2, AlertTriangle, KeyRound, Phone } from 'lucide-react';

const supportsWebkitTextSecurity = typeof CSS !== 'undefined' && CSS.supports && CSS.supports('-webkit-text-security', 'disc');

const UserAuthPage = () => {
  const location = useLocation();
  const isSignUpPath = location.pathname === '/user/signup';

  const [isLogin, setIsLogin] = useState(!isSignUpPath);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Signup Success state
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [devVerificationLink, setDevVerificationLink] = useState('');

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const checkPasswordStrength = (pass) => {
    const reqs = {
      length: pass.length >= 6,
      hasUpper: /[A-Z]/.test(pass),
      hasNumber: /[0-9]/.test(pass),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pass)
    };

    const count = Object.values(reqs).filter(Boolean).length;
    let strength = 'Weak';
    let color = 'bg-red-500';
    let width = 'w-1/3';
    
    if (count === 4) {
      strength = 'Strong';
      color = 'bg-green-500';
      width = 'w-full';
    } else if (count >= 2) {
      strength = 'Medium';
      color = 'bg-yellow-500';
      width = 'w-2/3';
    }

    return { reqs, strength, color, width, count };
  };

  const strengthData = checkPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (isLogin) {
        await login(email, password, 'user');
        navigate('/restaurants');
      } else {
        if (strengthData.count < 4) {
          setError('Please satisfy all password strength requirements.');
          setIsSubmitting(false);
          return;
        }
        await signup(name, email, password, 'user');
        navigate('/restaurants');
      }
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
    setSignupSuccess(false);
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

          <AnimatePresence mode="wait">
            {/* 1. Signup Success State */}
            {signupSuccess ? (
              <motion.div
                key="signup-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-8 text-center space-y-6"
              >
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500 border border-green-100">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-serif text-brown-900">Registration Successful!</h3>
                  {email && !/[a-zA-Z]/.test(email) ? (
                    <p className="text-sm text-brown-700/70 mt-2">
                      Your customer account has been created successfully with phone number <span className="font-semibold text-brown-900">{email}</span>.
                    </p>
                  ) : (
                    <>
                      <p className="text-sm text-brown-700/70 mt-2">
                        We have sent a verification email to <span className="font-semibold text-brown-900">{email}</span>.
                      </p>
                      <p className="text-xs text-brown-600/60 mt-1">
                        Please click the verification link inside the email to activate your account.
                      </p>
                    </>
                  )}
                </div>

                {devVerificationLink && email && /[a-zA-Z]/.test(email) && (
                  <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-left space-y-2 mt-4">
                    <p className="text-xs font-bold text-amber-800 uppercase tracking-widest flex items-center gap-1">
                      <Sparkles size={12} /> Local Development Helper
                    </p>
                    <p className="text-[11px] text-amber-700/80">
                      Since SMTP is mock in dev mode, you can verify your email instantly by clicking below:
                    </p>
                    <a
                      href={devVerificationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block w-full text-center bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 px-3 rounded-lg transition-colors shadow-sm"
                    >
                      Verify Email Address Now
                    </a>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSignupSuccess(false);
                    setIsLogin(true);
                    setError('');
                  }}
                  className="w-full bg-brown-900 text-cream-100 py-3 rounded-xl font-bold text-sm hover:bg-gold-500 hover:text-brown-900 transition-colors shadow-md"
                >
                  Proceed to Sign In
                </button>
              </motion.div>
            ) : (
              /* 3. Normal Sign In / Sign Up form */
              <motion.div
                key="auth-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Header */}
                <div className="px-8 pt-8 pb-2 text-center">
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
                </div>

                {/* Form */}
                <form className="px-8 pb-8 pt-6 space-y-4 text-left" onSubmit={handleSubmit} autoComplete="off">
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
                        <div className="relative mb-2">
                          <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            id="user-auth-name"
                            type="text"
                            required={!isLogin}
                            autoComplete="one-time-code"
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-brown-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all bg-white capitalize"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '))}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email or Phone Number */}
                  <div>
                    <label htmlFor="user-auth-email" className="block text-xs font-semibold text-brown-700/60 uppercase tracking-wider mb-1.5">
                      Email Address or Phone Number
                    </label>
                    <div className="relative">
                      {email.length > 0 && !/[a-zA-Z]/.test(email) ? (
                        <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      ) : (
                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      )}
                      <input
                        id="user-auth-email"
                        type="text"
                        required
                        autoComplete="one-time-code"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-brown-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all bg-white"
                        placeholder="you@example.com or +91 XXXXX XXXXX"
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
                        type={supportsWebkitTextSecurity ? 'text' : (showPassword ? 'text' : 'password')}
                        required
                        autoComplete={supportsWebkitTextSecurity ? 'one-time-code' : (isLogin ? 'current-password' : 'new-password')}
                        style={supportsWebkitTextSecurity ? { WebkitTextSecurity: showPassword ? 'none' : 'disc' } : {}}
                        className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-brown-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all bg-white"
                        placeholder={isLogin ? 'Enter your password' : 'Create a strong password'}
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

                    {/* Real-time Password Strength Check for Sign Up */}
                    {!isLogin && password.length > 0 && (
                      <div className="mt-4 p-4 bg-cream-100/30 border border-cream-200/50 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-brown-700">Password Strength:</span>
                          <span className={`font-bold uppercase tracking-wider ${
                            strengthData.strength === 'Strong' ? 'text-green-600' :
                            strengthData.strength === 'Medium' ? 'text-yellow-600' : 'text-red-500'
                          }`}>
                            {strengthData.strength}
                          </span>
                        </div>
                        {/* Progress meter bar */}
                        <div className="h-1.5 w-full bg-cream-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-300 ${strengthData.color} ${strengthData.width}`} />
                        </div>

                        {/* Complexity criteria checks */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-medium text-brown-600/80">
                          <div className="flex items-center gap-1.5">
                            <span className={strengthData.reqs.length ? 'text-green-500 font-bold' : 'text-gray-300'}>
                              {strengthData.reqs.length ? '✓' : '•'}
                            </span>
                            <span>At least 6 Characters</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={strengthData.reqs.hasUpper ? 'text-green-500 font-bold' : 'text-gray-300'}>
                              {strengthData.reqs.hasUpper ? '✓' : '•'}
                            </span>
                            <span>At least 1 Uppercase</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={strengthData.reqs.hasNumber ? 'text-green-500 font-bold' : 'text-gray-300'}>
                              {strengthData.reqs.hasNumber ? '✓' : '•'}
                            </span>
                            <span>At least 1 Number</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={strengthData.reqs.hasSpecial ? 'text-green-500 font-bold' : 'text-gray-300'}>
                              {strengthData.reqs.hasSpecial ? '✓' : '•'}
                            </span>
                            <span>At least 1 Special Char</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting || (!isLogin && strengthData.count < 4)}
                    whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer bg-gradient-to-r from-gold-500 to-yellow-400 text-brown-900 shadow-gold-500/25 hover:shadow-gold-500/40 mt-6"
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
              </motion.div>
            )}
          </AnimatePresence>
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
