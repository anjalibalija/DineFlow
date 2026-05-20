import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Store, Plus, Pencil, Trash2, LayoutGrid, Ticket, BarChart3,
  Users, MapPin, Clock, IndianRupee, Utensils, TrendingUp,
  CheckCircle2, AlertTriangle
} from 'lucide-react';

import AddRestaurantForm from '../components/admin/AddRestaurantForm';
import EditRestaurantForm from '../components/admin/EditRestaurantForm';
import ManageTablesModal from '../components/admin/ManageTablesModal';
import ViewBookingsModal from '../components/admin/ViewBookingsModal';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editRestaurant, setEditRestaurant] = useState(null);
  const [tablesRestaurant, setTablesRestaurant] = useState(null);
  const [bookingsRestaurant, setBookingsRestaurant] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isAdmin) return <Navigate to="/user/signin" />;

  const fetchRestaurants = useCallback(async () => {
    try {
      const res = await axios.get('/api/restaurants/mine');
      setRestaurants(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRestaurants(); }, [fetchRestaurants]);

  const handleAddSuccess = () => {
    setShowAddForm(false);
    setSuccessMsg('Restaurant added successfully!');
    fetchRestaurants();
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleEditSuccess = () => {
    setEditRestaurant(null);
    setSuccessMsg('Restaurant updated successfully!');
    fetchRestaurants();
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await axios.delete(`/api/restaurants/${id}`);
      setDeleteConfirm(null);
      setSuccessMsg('Restaurant deleted.');
      fetchRestaurants();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const totalTables = restaurants.reduce((a, r) => a + (r.tables?.length || 0), 0);
  const totalBookings = restaurants.reduce((a, r) => a + (r._count?.bookings || 0), 0);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-brown-900/20 border-t-brown-900 rounded-full animate-spin mx-auto mb-4" />
        <p className="font-serif text-xl text-brown-900">Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream-100">
      <div className="container mx-auto px-4 py-10 max-w-7xl">

        {/* Success Toast */}
        <AnimatePresence>
          {successMsg && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 size={16} /> {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brown-900 to-brown-800 flex items-center justify-center shadow-lg shadow-brown-900/20">
              <Store size={26} className="text-cream-100" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-brown-900">Welcome, Restaurant Admin</h1>
              <p className="text-brown-700/70 mt-1">Manage your restaurants, tables, and reservations — all in one place.</p>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-brown-900 to-brown-800 text-cream-100 px-6 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-brown-900/20 hover:shadow-brown-900/30 transition-all cursor-pointer whitespace-nowrap">
            <Plus size={18} /> Add Your Restaurant
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: 'My Restaurants', value: restaurants.length, icon: Store, color: 'bg-amber-50', iconColor: 'text-gold-500' },
            { label: 'Total Tables', value: totalTables, icon: LayoutGrid, color: 'bg-blue-50', iconColor: 'text-blue-600' },
            { label: 'Total Bookings', value: totalBookings, icon: Ticket, color: 'bg-green-50', iconColor: 'text-green-600' }
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-cream-200 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center`}>
                <s.icon size={22} className={s.iconColor} />
              </div>
              <div>
                <p className="text-sm text-brown-600">{s.label}</p>
                <p className="text-2xl font-bold text-brown-900">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* My Restaurants Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-serif font-bold text-brown-900 mb-1">My Restaurants</h2>
          <p className="text-sm text-brown-700/60">Restaurants you own and manage on Dine Flow.</p>
        </div>

        {restaurants.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-cream-200 shadow-sm p-16 text-center">
            <Store size={48} className="mx-auto text-brown-300 mb-5" />
            <h3 className="text-xl font-serif font-bold text-brown-900 mb-2">No restaurants yet</h3>
            <p className="text-brown-600 mb-6 max-w-md mx-auto">Add your first restaurant to start receiving bookings and managing your tables.</p>
            <button onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 bg-brown-900 text-cream-100 px-6 py-3 rounded-xl font-bold text-sm hover:bg-gold-500 hover:text-brown-900 transition-colors cursor-pointer">
              <Plus size={16} /> Add Your Restaurant
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {restaurants.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden hover:shadow-md transition-shadow group">
                {/* Card Header with image */}
                <div className="h-40 relative overflow-hidden bg-gradient-to-br from-brown-900/80 to-brown-800/80">
                  {r.image && r.image !== 'no-photo.jpg' ? (
                    <img src={r.image} alt={r.name} className="w-full h-full object-cover opacity-60" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store size={48} className="text-cream-100/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5">
                    <h3 className="text-xl font-serif font-bold text-white mb-0.5">{r.name}</h3>
                    <div className="flex items-center gap-3 text-white/70 text-xs">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {r.location}{r.city ? `, ${r.city}` : ''}</span>
                      <span className="flex items-center gap-1"><Utensils size={12} /> {r.cuisine}</span>
                      <span className="flex items-center gap-1"><IndianRupee size={12} /> {r.priceRange}</span>
                    </div>
                  </div>
                  {/* Rating badge */}
                  {r.rating && (
                    <div className="absolute top-3 right-3 bg-gold-500 text-brown-900 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                      ⭐ {r.rating}
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5">
                  <p className="text-sm text-brown-600 line-clamp-2 mb-4">{r.description}</p>

                  {/* Quick stats */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[
                      { label: 'Tables', value: r.tables?.length || 0, icon: LayoutGrid },
                      { label: 'Bookings', value: r._count?.bookings || 0, icon: Ticket },
                      { label: 'Queue', value: r.queueCount, icon: Users },
                      { label: 'Hours', value: `${r.openingTime || '10:00'}-${r.closingTime || '22:00'}`, icon: Clock, small: true }
                    ].map(s => (
                      <div key={s.label} className="bg-cream-100/80 rounded-xl p-2.5 text-center">
                        <s.icon size={14} className="mx-auto text-gold-500 mb-1" />
                        <p className={`font-bold text-brown-900 ${s.small ? 'text-[10px]' : 'text-sm'}`}>{s.value}</p>
                        <p className="text-[10px] text-brown-500 uppercase">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Crowd status */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-brown-500">Crowd Level</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      r.crowdLevel === 'Full' ? 'bg-red-100 text-red-700' :
                      r.crowdLevel === 'High' ? 'bg-orange-100 text-orange-700' :
                      r.crowdLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>{r.crowdLevel}</span>
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button onClick={() => setEditRestaurant(r)}
                      className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold bg-gold-50 text-gold-500 hover:bg-gold-500 hover:text-brown-900 transition-all cursor-pointer border border-gold-500/20">
                      <Pencil size={14} /> Edit
                    </button>
                    <button onClick={() => setTablesRestaurant(r)}
                      className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer border border-blue-200">
                      <LayoutGrid size={14} /> Tables
                    </button>
                    <button onClick={() => setBookingsRestaurant(r)}
                      className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all cursor-pointer border border-green-200">
                      <Ticket size={14} /> Bookings
                    </button>
                    <button onClick={() => setDeleteConfirm(r)}
                      className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer border border-red-200">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddForm && <AddRestaurantForm onClose={() => setShowAddForm(false)} onSuccess={handleAddSuccess} />}
        {editRestaurant && <EditRestaurantForm restaurant={editRestaurant} onClose={() => setEditRestaurant(null)} onSuccess={handleEditSuccess} />}
        {tablesRestaurant && <ManageTablesModal restaurant={tablesRestaurant} onClose={() => setTablesRestaurant(null)} onSuccess={fetchRestaurants} />}
        {bookingsRestaurant && <ViewBookingsModal restaurant={bookingsRestaurant} onClose={() => setBookingsRestaurant(null)} />}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={28} className="text-red-500" />
              </div>
              <h3 className="text-xl font-serif font-bold text-brown-900 mb-2">Delete Restaurant?</h3>
              <p className="text-sm text-brown-600 mb-6">This will permanently delete <strong>{deleteConfirm.name}</strong> and all its tables and bookings. This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-brown-700 hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm.id)} disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 cursor-pointer">
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
