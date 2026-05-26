import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Lock, MapPin, Phone, Mail, Award, CheckCircle2 } from 'lucide-react';

const AVATAR_OPTIONS = [
  { emoji: '👨‍🍳', label: 'Chef' },
  { emoji: '🍕', label: 'Pizza Lover' },
  { emoji: '🍷', label: 'Wine Connoisseur' },
  { emoji: '☕', label: 'Coffee Enthusiast' },
  { emoji: '🍰', label: 'Sweet Tooth' },
  { emoji: '🥗', label: 'Health Nut' },
  { emoji: '🥑', label: 'Avocado Lover' },
  { emoji: '🥩', label: 'Steak Lover' }
];

const DIETARY_OPTIONS = [
  { id: 'Vegetarian', label: 'Vegetarian', desc: 'No meat, poultry, or fish' },
  { id: 'Non-Vegetarian', label: 'Non-Vegetarian', desc: 'Eat everything' },
  { id: 'Vegan', label: 'Vegan', desc: 'Pure plant-based diet' },
  { id: 'Gluten-Free', label: 'Gluten-Free', desc: 'Avoid wheat and gluten' }
];

const ProfilePage = () => {
  const { user, loadUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  
  // Forms State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [profilePicture, setProfilePicture] = useState('🥗');
  const [dietaryPrefs, setDietaryPrefs] = useState([]);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status messages
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setName(user.name || '');
    setPhone(user.phone || '');
    setCity(user.city || '');
    setProfilePicture(user.profilePicture || '🥗');
    
    // Parse dietaryPreference comma-separated string
    if (user.dietaryPreference) {
      setDietaryPrefs(user.dietaryPreference.split(',').map(p => p.trim()).filter(Boolean));
    }
  }, [user, navigate]);

  const showToast = (message, isError = false) => {
    if (isError) {
      setErrorMsg(message);
      setTimeout(() => setErrorMsg(''), 4000);
    } else {
      setSuccessMsg(message);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const payload = {
        name,
        phone,
        city,
        profilePicture,
        dietaryPreference: dietaryPrefs.join(',')
      };

      await axios.put('/api/auth/profile', payload);
      await loadUser();
      showToast('Profile updated successfully!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', true);
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', true);
      return;
    }

    setUpdating(true);
    try {
      await axios.put('/api/auth/password', {
        currentPassword,
        newPassword
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password changed successfully!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change password', true);
    } finally {
      setUpdating(false);
    }
  };

  const handleDietaryToggle = (id) => {
    if (dietaryPrefs.includes(id)) {
      setDietaryPrefs(dietaryPrefs.filter(pref => pref !== id));
    } else {
      setDietaryPrefs([...dietaryPrefs, id]);
    }
  };

  const selectAvatar = (emoji) => {
    setProfilePicture(emoji);
    setShowAvatarModal(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-cream-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Toast notifications */}
        <AnimatePresence>
          {successMsg && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-medium animate-bounce">
              <CheckCircle2 size={16} /> {successMsg}
            </motion.div>
          )}
          {errorMsg && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-medium">
              <Shield size={16} className="rotate-180" /> {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-brown-900">Account Settings</h1>
          <p className="text-brown-700/70 mt-1">Configure your personal preferences, dining profile, and security settings.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Sidebar Nav */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl border border-cream-200 shadow-sm p-6 text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-gold-400 to-gold-600" />
              
              {/* Profile Avatar Trigger */}
              <div className="relative w-24 h-24 mx-auto mb-4 group/avatar cursor-pointer" onClick={() => setShowAvatarModal(true)}>
                <div className="w-full h-full rounded-full bg-cream-100 border border-gold-500/20 shadow-inner flex items-center justify-center text-5xl select-none transition-transform group-hover/avatar:scale-105">
                  {profilePicture}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                  <span className="text-[10px] text-cream-100 font-bold uppercase tracking-wider">Change</span>
                </div>
              </div>

              <h2 className="text-lg font-serif font-bold text-brown-900">{user.name}</h2>
              <p className="text-xs font-semibold text-gold-600 uppercase tracking-widest mt-0.5">
                {isAdmin ? '👑 Admin Account' : '🍽️ DineFlow Customer'}
              </p>
              
              <button 
                onClick={() => { logout(); navigate('/'); }}
                className="mt-5 text-xs font-bold text-red-500 hover:text-red-600 cursor-pointer block mx-auto underline"
              >
                Log out
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden py-2">
              <button 
                onClick={() => setActiveTab('personal')}
                type="button"
                className={`w-full text-left px-5 py-3.5 flex items-center gap-3 text-sm font-semibold border-l-4 transition-all cursor-pointer ${
                  activeTab === 'personal' 
                    ? 'border-gold-500 text-brown-900 bg-gold-500/5' 
                    : 'border-transparent text-brown-700/60 hover:text-brown-900 hover:bg-cream-100/50'
                }`}
              >
                <User size={18} className={activeTab === 'personal' ? 'text-gold-500' : 'text-brown-700/40'} />
                Personal Details
              </button>
              
              {/* Dietary Preferences is customer-only */}
              {!isAdmin && (
                <button 
                  onClick={() => setActiveTab('dietary')}
                  type="button"
                  className={`w-full text-left px-5 py-3.5 flex items-center gap-3 text-sm font-semibold border-l-4 transition-all cursor-pointer ${
                    activeTab === 'dietary' 
                      ? 'border-gold-500 text-brown-900 bg-gold-500/5' 
                      : 'border-transparent text-brown-700/60 hover:text-brown-900 hover:bg-cream-100/50'
                  }`}
                >
                  <Award size={18} className={activeTab === 'dietary' ? 'text-gold-500' : 'text-brown-700/40'} />
                  Dietary Preferences
                </button>
              )}

              <button 
                onClick={() => setActiveTab('security')}
                type="button"
                className={`w-full text-left px-5 py-3.5 flex items-center gap-3 text-sm font-semibold border-l-4 transition-all cursor-pointer ${
                  activeTab === 'security' 
                    ? 'border-gold-500 text-brown-900 bg-gold-500/5' 
                    : 'border-transparent text-brown-700/60 hover:text-brown-900 hover:bg-cream-100/50'
                }`}
              >
                <Lock size={18} className={activeTab === 'security' ? 'text-gold-500' : 'text-brown-700/40'} />
                Security & Password
              </button>
            </div>
          </div>

          {/* Settings Panels */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-3xl border border-cream-200 shadow-sm p-6 sm:p-8 min-h-[450px]">
              
              {/* TAB 1: PERSONAL DETAILS */}
              {activeTab === 'personal' && (
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-brown-900 mb-1">Personal Details</h3>
                    <p className="text-xs text-brown-500">Edit your name, contact details, and location preferences.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-brown-700 uppercase tracking-wider mb-2">Full Name</label>
                      <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required
                        className="w-full px-4 py-3 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 text-sm transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brown-700 uppercase tracking-wider mb-2">Email Address</label>
                      <div className="relative">
                        <input 
                          type="email" 
                          value={user.email} 
                          disabled 
                          className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-cream-100/60 text-brown-500 text-sm focus:outline-none cursor-not-allowed"
                        />
                        <Mail size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-brown-300" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brown-700 uppercase tracking-wider mb-2">Phone Number</label>
                      <div className="relative">
                        <input 
                          type="tel" 
                          placeholder="e.g. +91 98765 43210"
                          value={phone} 
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-4 py-3 pl-10 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 text-sm transition-all"
                        />
                        <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brown-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brown-700 uppercase tracking-wider mb-2">Preferred Dining City</label>
                      <div className="relative">
                        <select 
                          value={city} 
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-4 py-3 pl-10 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 text-sm transition-all bg-white cursor-pointer appearance-none"
                        >
                          <option value="">Select City</option>
                          <option value="Mumbai">Mumbai</option>
                          <option value="Bangalore">Bangalore</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Chennai">Chennai</option>
                          <option value="Hyderabad">Hyderabad</option>
                          <option value="Pune">Pune</option>
                          <option value="Kolkata">Kolkata</option>
                        </select>
                        <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brown-400" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-cream-100 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={updating}
                      className="bg-brown-900 text-cream-100 px-6 py-3 rounded-xl font-bold text-sm hover:bg-gold-500 hover:text-brown-900 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {updating ? 'Saving changes...' : 'Save Profile'}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: DIETARY PREFERENCES */}
              {activeTab === 'dietary' && !isAdmin && (
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-brown-900 mb-1">Dietary Preferences</h3>
                    <p className="text-xs text-brown-500">Tailors DineFlow to show you custom restaurant menu suggestions.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {DIETARY_OPTIONS.map((opt) => {
                      const isSelected = dietaryPrefs.includes(opt.id);
                      return (
                        <div 
                          key={opt.id}
                          onClick={() => handleDietaryToggle(opt.id)}
                          className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                            isSelected 
                              ? 'border-gold-500 bg-gold-500/5 shadow-sm' 
                              : 'border-cream-200 hover:border-cream-300 bg-white'
                          }`}
                        >
                          <div>
                            <h4 className="font-bold text-brown-900 text-sm">{opt.label}</h4>
                            <p className="text-xs text-brown-500/70 mt-0.5">{opt.desc}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected ? 'border-gold-500 bg-gold-500' : 'border-cream-300'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-brown-900" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t border-cream-100 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={updating}
                      className="bg-brown-900 text-cream-100 px-6 py-3 rounded-xl font-bold text-sm hover:bg-gold-500 hover:text-brown-900 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {updating ? 'Saving preferences...' : 'Save Preferences'}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: SECURITY & PASSWORD */}
              {activeTab === 'security' && (
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-brown-900 mb-1">Change Password</h3>
                    <p className="text-xs text-brown-500">Keep your account safe by setting a secure password.</p>
                  </div>

                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-xs font-bold text-brown-700 uppercase tracking-wider mb-2">Current Password</label>
                      <input 
                        type="password" 
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 text-sm transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brown-700 uppercase tracking-wider mb-2">New Password</label>
                      <input 
                        type="password" 
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 text-sm transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brown-700 uppercase tracking-wider mb-2">Confirm New Password</label>
                      <input 
                        type="password" 
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 text-sm transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-cream-100 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={updating}
                      className="bg-brown-900 text-cream-100 px-6 py-3 rounded-xl font-bold text-sm hover:bg-gold-500 hover:text-brown-900 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {updating ? 'Updating password...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>

      {/* Avatar Selection Modal */}
      <AnimatePresence>
        {showAvatarModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center relative border border-cream-200">
              
              <h3 className="text-2xl font-serif font-bold text-brown-900 mb-2">Choose Avatar</h3>
              <p className="text-xs text-brown-500 mb-6">Select a dining character that represents your taste.</p>
              
              <div className="grid grid-cols-4 gap-4 mb-6">
                {AVATAR_OPTIONS.map((opt) => (
                  <button 
                    key={opt.label} 
                    type="button"
                    onClick={() => selectAvatar(opt.emoji)}
                    className="aspect-square bg-cream-100/50 rounded-2xl text-4xl flex items-center justify-center hover:bg-gold-500/10 hover:scale-105 active:scale-95 transition border border-transparent hover:border-gold-500/20 cursor-pointer select-none"
                    title={opt.label}
                  >
                    {opt.emoji}
                  </button>
                ))}
              </div>
              
              <button 
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="w-full py-2.5 rounded-xl border border-cream-300 text-sm font-semibold text-brown-700 hover:bg-cream-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
