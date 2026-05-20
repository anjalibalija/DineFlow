import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, User, Mail, Phone, MapPin, Globe, Clock, Utensils, IndianRupee, Image, FileText, LayoutGrid, Users, ListOrdered, Sparkles } from 'lucide-react';
import axios from 'axios';

const CUISINE_OPTIONS = ['Fine Dining', 'Italian', 'Japanese', 'Indian', 'Chinese', 'Mexican', 'Thai', 'French', 'Mediterranean', 'American', 'Korean', 'Other'];
const PRICE_OPTIONS = ['₹', '₹₹', '₹₹₹', '₹₹₹₹'];
const CROWD_OPTIONS = ['Low', 'Medium', 'High', 'Full'];

const Field = ({ label, icon: Icon, name, type = 'text', placeholder, required, half, value, onChange }) => (
  <div className={half ? 'col-span-1' : 'col-span-2'}>
    <label className="block text-xs font-semibold text-brown-700/60 uppercase tracking-wider mb-1.5">{label}</label>
    <div className="relative">
      {Icon && <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}
      <input name={name} type={type} value={value} onChange={onChange} required={required}
        className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-brown-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all bg-white`}
        placeholder={placeholder} />
    </div>
  </div>
);

const Select = ({ label, icon: Icon, name, options, half, value, onChange }) => (
  <div className={half ? 'col-span-1' : 'col-span-2'}>
    <label className="block text-xs font-semibold text-brown-700/60 uppercase tracking-wider mb-1.5">{label}</label>
    <div className="relative">
      {Icon && <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}
      <select name={name} value={value} onChange={onChange}
        className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-brown-900 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all bg-white appearance-none cursor-pointer`}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  </div>
);

const EditRestaurantForm = ({ restaurant, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: restaurant.name || '', ownerName: restaurant.ownerName || '',
    email: restaurant.email || '', phone: restaurant.phone || '',
    location: restaurant.location || '', city: restaurant.city || '',
    state: restaurant.state || '', pincode: restaurant.pincode || '',
    latitude: restaurant.latitude ?? '', longitude: restaurant.longitude ?? '',
    cuisine: restaurant.cuisine || 'Fine Dining', priceRange: restaurant.priceRange || '$$',
    openingTime: restaurant.openingTime || '10:00', closingTime: restaurant.closingTime || '22:00',
    description: restaurant.description || '', image: restaurant.image || '',
    menuHighlights: restaurant.menuHighlights || '', tableCategories: restaurant.tableCategories || '',
    crowdLevel: restaurant.crowdLevel || 'Low', queueCount: String(restaurant.queueCount ?? 0)
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [menuImage, setMenuImage] = useState(null);
  const [digitizing, setDigitizing] = useState(false);

  const handleGeocode = async () => {
    if (!form.location) {
      setError('Please fill in the Address field first.');
      return;
    }
    setGeocoding(true);
    setError('');
    try {
      const fullAddress = `${form.location}, ${form.city || ''}, ${form.state || ''} ${form.pincode || ''}`;
      const res = await axios.post('/api/ai/geocode', { address: fullAddress });
      if (res.data.success) {
        const { latitude, longitude, city, state } = res.data.data;
        setForm(prev => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          city: prev.city || city,
          state: prev.state || state
        }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Geocoding failed. Make sure the address is valid.');
    } finally {
      setGeocoding(false);
    }
  };

  const handleMenuImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setMenuImage({
        base64: reader.result,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const digitizeMenu = async () => {
    if (!menuImage) return;
    setDigitizing(true);
    try {
      const res = await axios.post('/api/ai/digitize-menu', {
        base64Image: menuImage.base64,
        mimeType: menuImage.mimeType,
        restaurantId: restaurant.id
      });
      
      const items = res.data.data;
      const highlightString = items.map(item => `${item.name}: ₹${item.price}`).join(', ');
      setForm(prev => ({
        ...prev,
        menuHighlights: highlightString
      }));
      setMenuImage(null);
    } catch (err) {
      console.error(err);
      alert('Failed to digitize menu. Please try again.');
    } finally {
      setDigitizing(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await axios.put(`/api/restaurants/${restaurant.id}`, form);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update restaurant.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl relative">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-8 py-5 rounded-t-3xl flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold text-brown-900">Edit Restaurant</h2>
            <p className="text-sm text-brown-700/60">Update details for {restaurant.name}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-red-50 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors cursor-pointer"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6">
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 text-red-600 text-sm text-center py-3 px-4 rounded-xl border border-red-100 mb-4">{error}</motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <Field label="Restaurant Name" icon={Building2} name="name" required half value={form.name} onChange={handleChange} />
            <Field label="Owner Name" icon={User} name="ownerName" half value={form.ownerName} onChange={handleChange} />
            <Field label="Email" icon={Mail} name="email" type="email" half value={form.email} onChange={handleChange} />
            <Field label="Phone" icon={Phone} name="phone" half value={form.phone} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="col-span-2">
              <Field label="Address" icon={MapPin} name="location" required value={form.location} onChange={handleChange} />
            </div>
            <div className="col-span-2 flex justify-end">
              <button
                type="button"
                onClick={handleGeocode}
                disabled={geocoding}
                className="bg-brown-900 text-gold-500 hover:bg-gold-500 hover:text-brown-900 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                {geocoding ? 'Locating...' : 'Auto-Locate Coordinates (AI)'}
              </button>
            </div>
            <Field label="City" name="city" half value={form.city} onChange={handleChange} />
            <Field label="State" name="state" half value={form.state} onChange={handleChange} />
            <Field label="Pincode" name="pincode" half value={form.pincode} onChange={handleChange} />
            <div className="col-span-2 grid grid-cols-2 gap-3">
              <Field label="Latitude" icon={Globe} name="latitude" type="number" half value={form.latitude} onChange={handleChange} />
              <Field label="Longitude" icon={Globe} name="longitude" type="number" half value={form.longitude} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <Select label="Cuisine" icon={Utensils} name="cuisine" options={CUISINE_OPTIONS} half value={form.cuisine} onChange={handleChange} />
            <Select label="Price Range" icon={IndianRupee} name="priceRange" options={PRICE_OPTIONS} half value={form.priceRange} onChange={handleChange} />
            <Field label="Opening Time" icon={Clock} name="openingTime" type="time" half value={form.openingTime} onChange={handleChange} />
            <Field label="Closing Time" icon={Clock} name="closingTime" type="time" half value={form.closingTime} onChange={handleChange} />
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-brown-700/60 uppercase tracking-wider mb-1.5">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-brown-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all bg-white resize-none" />
            </div>
            <Field label="Image URL" icon={Image} name="image" value={form.image} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <Field label="Menu Highlights" icon={FileText} name="menuHighlights" value={form.menuHighlights} onChange={handleChange} />
            <Field label="Table Categories" icon={LayoutGrid} name="tableCategories" value={form.tableCategories} onChange={handleChange} />
          </div>

          {/* AI Menu Digitizer */}
          <div className="col-span-2 bg-gold-50/50 border border-gold-500/20 p-5 rounded-2xl mb-6">
            <h4 className="font-serif font-bold text-brown-900 text-sm mb-1 flex items-center gap-1.5">
              <Sparkles size={16} className="text-gold-500" /> AI Menu Digitizer (Beta)
            </h4>
            <p className="text-xs text-brown-600 mb-3">Upload a photo of your physical menu, and DineFlow AI will extract the items directly to your Highlights.</p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleMenuImageUpload}
                className="hidden"
                id="menu-file-upload"
              />
              <label
                htmlFor="menu-file-upload"
                className="flex items-center justify-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-xs font-semibold text-brown-800 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Image size={14} /> {menuImage ? "Change Image" : "Select Menu Image"}
              </label>
              {menuImage && (
                <button
                  type="button"
                  onClick={digitizeMenu}
                  disabled={digitizing}
                  className="bg-brown-900 hover:bg-gold-500 hover:text-brown-900 text-cream-100 px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {digitizing ? (
                    <div className="w-3.5 h-3.5 border-2 border-cream-100/30 border-t-cream-100 rounded-full animate-spin" />
                  ) : (
                    <Sparkles size={14} />
                  )}
                  Digitize Menu with AI
                </button>
              )}
            </div>
            {menuImage && (
              <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                <span>📁 Image ready to process</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            <Select label="Crowd Level" icon={Users} name="crowdLevel" options={CROWD_OPTIONS} half value={form.crowdLevel} onChange={handleChange} />
            <Field label="Queue Length" icon={ListOrdered} name="queueCount" type="number" half value={form.queueCount} onChange={handleChange} />
          </div>

          <button type="submit" disabled={submitting}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-gold-500 to-yellow-400 text-brown-900 shadow-lg disabled:opacity-60 transition-all cursor-pointer flex items-center justify-center gap-2">
            {submitting ? <div className="w-5 h-5 border-2 border-brown-900/30 border-t-brown-900 rounded-full animate-spin" /> : 'Save Changes'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditRestaurantForm;
