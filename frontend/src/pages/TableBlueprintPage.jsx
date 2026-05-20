import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, Calendar, Clock, Users, ShieldCheck, CreditCard, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

// Booking fee in INR (₹99 reservation fee)
const BOOKING_FEE = 99;

// Dynamically load Razorpay script
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const CATEGORY_PREVIEWS = {
  'VIP Private Cabins': {
    image: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    description: 'Tucked away in our signature private glass alcoves. Features plush leather booths, dimmable gold lighting, and premium acoustic shielding for absolute privacy.',
    ambiance: 'VIP Cabin · Quiet & Romantic',
    noise: 'Very Low'
  },
  'Window Side (Scenic View)': {
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    description: 'Breathtaking seat right next to the grand floor-to-ceiling glass panel windows. Perfect views of the evening skyline and vibrant streets.',
    ambiance: 'Scenic View · Romantic & Serene',
    noise: 'Low'
  },
  'Bar & Lounge': {
    image: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    description: 'Lively high-top seating situated near the central illuminated marble bar counter. Perfect for social groups and viewing live mixologist craft.',
    ambiance: 'Bar Side · Social & Energetic',
    noise: 'Lively'
  },
  'Main Dining Hall': {
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    description: 'At the heart of the restaurant, directly under the grand crystal chandelier. Captures the vibrant dining crowd energy with swift butler access.',
    ambiance: 'Dining Hall · Grand & Classic',
    noise: 'Normal'
  },
  'Rooftop': {
    image: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    description: 'Open-air dining experience on our garden terrace. Enjoy the gentle evening breeze, candlelit tables, and starlit sky views.',
    ambiance: 'Rooftop · Open Air & Breezy',
    noise: 'Moderate'
  },
  'Corner Side': {
    image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    description: 'Cosy, semi-secluded corner table. Offers a relaxed vantage point of the entire restaurant, providing intimacy without complete separation.',
    ambiance: 'Corner · Cozy & Cozy',
    noise: 'Low'
  },
  'Courtyard': {
    image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    description: 'Seated in our indoor botanical courtyard surrounded by lush cascading ivy and a tranquil stone water fountain.',
    ambiance: 'Courtyard · Botanical & Peaceful',
    noise: 'Very Low'
  },
  'Family Table': {
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    description: 'Spacious round banquet table designed to comfortably accommodate large groups and families, close to child-friendly dining facilities.',
    ambiance: 'Family Hall · Warm & Social',
    noise: 'Normal'
  },
  'Couple Table': {
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    description: 'Intimate candlelit seating designed specifically for couples. Set in a quiet area with soft romantic backlighting.',
    ambiance: 'Couples · Cozy & Intimate',
    noise: 'Low'
  }
};

const getPreviewData = (category) => {
  const norm = (category || '').toLowerCase();
  if (norm.includes('rooftop')) return CATEGORY_PREVIEWS['Rooftop'];
  if (norm.includes('vip') || norm.includes('cabin') || norm.includes('private')) return CATEGORY_PREVIEWS['VIP Private Cabins'];
  if (norm.includes('window') || norm.includes('scenic')) return CATEGORY_PREVIEWS['Window Side (Scenic View)'];
  if (norm.includes('bar') || norm.includes('lounge')) return CATEGORY_PREVIEWS['Bar & Lounge'];
  if (norm.includes('corner')) return CATEGORY_PREVIEWS['Corner Side'];
  if (norm.includes('courtyard')) return CATEGORY_PREVIEWS['Courtyard'];
  if (norm.includes('family')) return CATEGORY_PREVIEWS['Family Table'];
  if (norm.includes('couple') || norm.includes('romantic')) return CATEGORY_PREVIEWS['Couple Table'];
  return CATEGORY_PREVIEWS['Main Dining Hall'];
};

const isTableReserved = (tableNumber) => {
  return tableNumber === 'T3' || tableNumber === 'T7' || tableNumber === 'T10';
};

const TableBlueprintPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const preOrder = location.state?.preOrder || [];
  const { user } = useAuth();

  const [tables, setTables] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(true);

  // Booking Form State
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(2);
  const [request, setRequest] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // AI Suggestion
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [is3dMode, setIs3dMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tablesRes, restaurantRes, aiRes] = await Promise.all([
          axios.get(`/api/restaurants/${id}/tables`),
          axios.get(`/api/restaurants/${id}`),
          axios.post('/api/ai/table-suggestion', { restaurantId: id })
        ]);

        const rawTables = tablesRes.data.data;
        const allUnpositioned = rawTables.every(t => !t.positionX && !t.positionY);
        const positionedTables = rawTables.map((t, index) => {
          const posX = (allUnpositioned || (!t.positionX && !t.positionY))
            ? 15 + (index % 4) * 22
            : t.positionX;
          const posY = (allUnpositioned || (!t.positionX && !t.positionY))
            ? 15 + Math.floor(index / 4) * 30
            : t.positionY;

          // Align database category with physical visual zones on floor plan
          let alignedCategory = t.category;
          if (posX < 30) {
            alignedCategory = 'VIP Private Cabins';
          } else if (posX > 70) {
            alignedCategory = 'Bar & Lounge';
          } else if (posY < 20) {
            alignedCategory = 'Window Side (Scenic View)';
          } else {
            // Distribute central dining categories based on index to add flavor variety
            const centerCategories = ['Main Dining Hall', 'Courtyard', 'Family Table', 'Couple Table', 'Corner Side', 'Rooftop'];
            alignedCategory = centerCategories[index % centerCategories.length];
          }

          return {
            ...t,
            positionX: posX,
            positionY: posY,
            category: alignedCategory
          };
        });

        setTables(positionedTables);
        setRestaurant(restaurantRes.data.data);
        setAiSuggestion(aiRes.data.data);
      } catch (err) {
        console.error('Failed to fetch blueprint data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handlePayAndBook = async (e) => {
    e.preventDefault();
    if (!selectedTable) return;

    setIsSubmitting(true);
    setBookingError('');

    try {
      // Step 1: Load Razorpay script
      const loaded = await loadRazorpay();
      if (!loaded) {
        setBookingError('Failed to load payment gateway. Please check your internet connection.');
        setIsSubmitting(false);
        return;
      }

      // Step 2: Create Razorpay order on backend
      const orderRes = await axios.post('/api/payment/create-order', {
        amount: BOOKING_FEE,
        currency: 'INR',
        receipt: `booking_${Date.now()}`
      });

      const order = orderRes.data.data;

      // Step 3: Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Dine Flow',
        description: `Table ${selectedTable.tableNumber} Reservation`,
        image: '/logo.png',
        order_id: order.id,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: ''
        },
        notes: {
          restaurantId: id,
          tableId: selectedTable.id
        },
        theme: { color: '#78350f' }, // brown-900
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
            setBookingError('Payment was cancelled. Your table has not been booked.');
          }
        },
        handler: async (response) => {
          // Step 4: Verify payment + create booking on backend
          try {
            await axios.post('/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              restaurantId: id,
              tableId: selectedTable.id,
              bookingDate: date,
              bookingTime: time,
              peopleCount: guests,
              specialRequest: preOrder.length > 0 
                ? `[Pre-Order: ${preOrder.map(d => `${d.name} (${d.price})`).join(', ')}]${request ? ` | Request: ${request}` : ''}`
                : request
            });
            setPaymentSuccess(true);
            setTimeout(() => navigate('/dashboard'), 2500);
          } catch (err) {
            setBookingError(err.response?.data?.message || 'Payment succeeded but booking failed. Please contact support.');
            setIsSubmitting(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      setBookingError(err.response?.data?.message || 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center font-serif text-2xl text-[#67334F]">
      Loading blueprint...
    </div>
  );

  const totalCount = tables.length || 12;
  const reservedCount = tables.filter(t => isTableReserved(t.tableNumber)).length;
  const availableCount = totalCount - reservedCount;
  const percentAvailable = totalCount > 0 ? Math.round((availableCount / totalCount) * 100) : 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-[#67334F] mb-1">Interactive Floor Plan</h1>
          {restaurant && (
            <p className="text-[#9A7077] font-medium">{restaurant.name}</p>
          )}
        </div>
        
        {/* Toggle Switch */}
        <div className="bg-[#FFF6F7] p-1.5 rounded-xl border border-[#F8D2D7]/50 flex gap-2 self-start md:self-auto shrink-0 shadow-inner">
          <button
            type="button"
            onClick={() => setIs3dMode(false)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer ${!is3dMode ? 'bg-[#67334F] text-white shadow-sm' : 'text-[#67334F] hover:bg-[#FCEAEB]'}`}
          >
            2D Standard
          </button>
          <button
            type="button"
            onClick={() => setIs3dMode(true)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${is3dMode ? 'bg-[#67334F] text-white shadow-sm' : 'text-[#67334F] hover:bg-[#FCEAEB]'}`}
          >
            <Sparkles size={12} /> 3D Isometric
          </button>
        </div>
      </div>
      <p className="text-[#9A7077] text-sm mb-8 -mt-2">Select your preferred table, then complete payment to confirm your booking.</p>

      {aiSuggestion && (
        <div className="bg-[#FFF6F7] border border-[#F8D2D7]/40 p-4 rounded-xl mb-8 flex items-start gap-4 shadow-sm">
          <div className="bg-[#67334F] text-white p-2 rounded-lg shrink-0">
            <Sparkles size={24} />
          </div>
          <div>
            <h4 className="font-bold text-[#67334F]">Dine Flow Suggests: {aiSuggestion.suggestedCategory}</h4>
            <p className="text-[#9A7077] text-sm mt-1">{aiSuggestion.reason}</p>
          </div>
        </div>
      )}

      {/* Payment Success Banner */}
      <AnimatePresence>
        {paymentSuccess && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#67334F] text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 text-base font-semibold">
            <ShieldCheck size={22} /> Payment successful! Booking confirmed. Redirecting...
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Floor Plan */}
        <div className="lg:col-span-2">
          <div 
            className="w-full rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-[#FFF6F7] to-[#FCEAEB] border border-[#F8D2D7]/50 flex items-center justify-center p-6 md:p-12 relative shadow-inner"
            style={{
              perspective: is3dMode ? '1400px' : 'none',
              perspectiveOrigin: '50% 30%'
            }}
          >
            <div
              className="bg-white rounded-[2rem] relative min-h-[620px] w-full border-4 border-[#F8D2D7]/60 transition-all duration-700 ease-out shadow-2xl"
              style={{
                backgroundImage: 'radial-gradient(rgba(255, 140, 142, 0.12) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
                transformStyle: is3dMode ? 'preserve-3d' : 'flat',
                transform: is3dMode ? 'rotateX(52deg) rotateZ(-34deg) translateY(-25px)' : 'none',
                boxShadow: is3dMode
                  ? 'rgba(103, 51, 79, 0.12) -25px 35px 50px 0px, rgba(255, 140, 142, 0.08) 0px 0px 40px 0px'
                  : '0 25px 50px -12px rgba(103, 51, 79, 0.1)'
              }}
            >
              {/* Room landmarks */}
              {/* 1. Window Side (Top) */}
              <div 
                className="absolute top-0 left-0 right-0 h-10 bg-[#FFF6F7]/80 border-b border-[#F8D2D7]/40 flex items-center justify-center text-[#67334F]/70 text-[11px] font-bold uppercase tracking-widest pointer-events-none select-none gap-2 font-serif"
                style={{
                  transform: is3dMode ? 'translateZ(20px)' : 'none',
                  transformStyle: is3dMode ? 'preserve-3d' : 'flat',
                  boxShadow: is3dMode ? '0 8px 16px rgba(103, 51, 79, 0.08)' : 'none'
                }}
              >
                <span>🪟</span> Window Side (Scenic View)
              </div>

              {/* 2. Bar Area (Right) */}
              <div 
                className="absolute top-10 bottom-0 right-0 w-28 bg-[#FFF6F7]/60 border-l border-[#F8D2D7]/40 flex items-center justify-center text-[#67334F]/70 text-[11px] font-bold uppercase tracking-widest pointer-events-none select-none text-center font-serif"
                style={{
                  transform: is3dMode ? 'translateZ(20px)' : 'none',
                  transformStyle: is3dMode ? 'preserve-3d' : 'flat',
                  boxShadow: is3dMode ? '-8px 0 16px rgba(103, 51, 79, 0.08)' : 'none'
                }}
              >
                <span className="rotate-90 whitespace-nowrap">🥂 Bar & Lounge</span>
              </div>

              {/* 3. VIP Private Cabins (Left) */}
              <div 
                className="absolute top-10 bottom-0 left-0 w-28 bg-[#FFF6F7]/60 border-r border-[#F8D2D7]/40 flex items-center justify-center text-[#67334F]/70 text-[11px] font-bold uppercase tracking-widest pointer-events-none select-none text-center font-serif"
                style={{
                  transform: is3dMode ? 'translateZ(20px)' : 'none',
                  transformStyle: is3dMode ? 'preserve-3d' : 'flat',
                  boxShadow: is3dMode ? '8px 0 16px rgba(103, 51, 79, 0.08)' : 'none'
                }}
              >
                <span className="-rotate-90 whitespace-nowrap">✨ VIP Private Cabins</span>
              </div>

              {/* 4. Center Area Label */}
              <div className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#67334F]/5 text-2xl font-bold uppercase tracking-[0.25em] pointer-events-none select-none text-center">
                Main Dining Hall
              </div>

              {/* 5. Entrance */}
              <div className="absolute bottom-0 left-[calc(50%-60px)] w-30 h-2 bg-[#F8D2D7]/80 rounded-t-lg pointer-events-none select-none" />
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[#67334F]/35 text-[9px] uppercase tracking-widest font-bold pointer-events-none select-none">
                Entrance
              </span>

              {tables.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-[#9A7077] text-sm bg-white/40 border border-[#F8D2D7]/20 px-4 py-2 rounded-xl">No tables have been added to this restaurant yet.</p>
                </div>
              )}

              {tables.map((table) => {
                const isSelected = selectedTable?.id === table.id;
                const isAiRecommended = table.category === aiSuggestion?.suggestedCategory;
                const isReserved = isTableReserved(table.tableNumber);

                // State color key
                let stateKey = 'available';
                if (isReserved) stateKey = 'reserved';
                else if (isSelected) stateKey = 'selected';

                // Elegant colors matching user reference image
                const colors = {
                  available: {
                    table: 'bg-[#FFB6B8]',
                    chairs: 'bg-[#FF8D90]',
                    text: 'text-[#67334F]',
                    extrusionTable: '#E26E71',
                    extrusionChairs: '#CF5E61'
                  },
                  reserved: {
                    table: 'bg-[#F3DADE]',
                    chairs: 'bg-[#EAD0D4]',
                    text: 'text-[#9A7077]',
                    extrusionTable: '#D0B4B8',
                    extrusionChairs: '#C5A9AD'
                  },
                  selected: {
                    table: 'bg-[#8A4C6D]',
                    chairs: 'bg-[#67334F]',
                    text: 'text-white',
                    extrusionTable: '#4E2037',
                    extrusionChairs: '#3A1327'
                  }
                }[stateKey];

                const baseSize = 48 + (table.capacity * 6);

                // Table Shape Picker
                let tableShape = 'square';
                const categoryNorm = (table.category || '').toLowerCase();
                if (categoryNorm.includes('vip') || categoryNorm.includes('cabin')) {
                  tableShape = 'booth';
                } else if (categoryNorm.includes('family')) {
                  tableShape = 'round';
                } else if (categoryNorm.includes('window')) {
                  tableShape = 'rectangle';
                } else if (categoryNorm.includes('couple') || categoryNorm.includes('romantic')) {
                  tableShape = 'couple';
                }

                // Renderers for different shapes
                const renderChairsAndTable = () => {
                  if (tableShape === 'round') {
                    const angles = [0, 60, 120, 180, 240, 300];
                    return (
                      <div className="relative w-full h-full flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
                        {angles.map((deg, i) => {
                          const rad = (deg * Math.PI) / 180;
                          const offset = baseSize * 0.45;
                          const cx = Math.cos(rad) * offset;
                          const cy = Math.sin(rad) * offset;
                          return (
                            <div
                              key={i}
                              className={`absolute w-3 h-3 rounded-full transition-all duration-300 ${colors.chairs}`}
                              style={{
                                left: `calc(50% + ${cx}px)`,
                                top: `calc(50% + ${cy}px)`,
                                transform: `translate(-50%, -50%) ${is3dMode ? 'translateZ(-4px)' : ''}`,
                                transformStyle: is3dMode ? 'preserve-3d' : 'flat',
                                boxShadow: is3dMode ? `0 4px 0px ${colors.extrusionChairs}` : 'none'
                              }}
                            />
                          );
                        })}
                        <div
                          className={`w-[60%] h-[60%] rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-md ${colors.table} ${colors.text}`}
                          style={{
                            transform: is3dMode ? 'translateZ(10px)' : 'none',
                            transformStyle: is3dMode ? 'preserve-3d' : 'flat',
                            boxShadow: is3dMode ? `0 8px 0px ${colors.extrusionTable}` : 'none',
                            border: isSelected && !is3dMode ? '2px solid white' : 'none'
                          }}
                        >
                          <span className="font-bold text-[9px] tracking-tight leading-none mb-0.5">{table.tableNumber}</span>
                          <span className="text-[7px] font-semibold opacity-85 leading-none">{table.capacity}p</span>
                        </div>
                      </div>
                    );
                  }

                  if (tableShape === 'rectangle') {
                    const pos = [
                      { left: '28%', top: '-2px' },
                      { left: '72%', top: '-2px' },
                      { left: '28%', top: 'calc(100% + 2px)' },
                      { left: '72%', top: 'calc(100% + 2px)' }
                    ];
                    return (
                      <div className="relative w-full h-full flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
                        {pos.map((p, i) => (
                          <div
                            key={i}
                            className={`absolute w-3.5 h-3 rounded-sm transition-all duration-300 ${colors.chairs}`}
                            style={{
                              left: p.left,
                              top: p.top,
                              transform: `translate(-50%, -50%) ${is3dMode ? 'translateZ(-4px)' : ''}`,
                              transformStyle: is3dMode ? 'preserve-3d' : 'flat',
                              boxShadow: is3dMode ? `0 4px 0px ${colors.extrusionChairs}` : 'none'
                            }}
                          />
                        ))}
                        <div
                          className={`w-[75%] h-[50%] rounded-lg flex flex-col items-center justify-center transition-all duration-300 shadow-md ${colors.table} ${colors.text}`}
                          style={{
                            transform: is3dMode ? 'translateZ(10px)' : 'none',
                            transformStyle: is3dMode ? 'preserve-3d' : 'flat',
                            boxShadow: is3dMode ? `0 8px 0px ${colors.extrusionTable}` : 'none',
                            border: isSelected && !is3dMode ? '2px solid white' : 'none'
                          }}
                        >
                          <span className="font-bold text-[9px] tracking-tight leading-none mb-0.5">{table.tableNumber}</span>
                          <span className="text-[7px] font-semibold opacity-85 leading-none">{table.capacity}p</span>
                        </div>
                      </div>
                    );
                  }

                  if (tableShape === 'couple') {
                    const pos = [
                      { left: '-2px', top: '50%' },
                      { left: 'calc(100% + 2px)', top: '50%' }
                    ];
                    return (
                      <div className="relative w-full h-full flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
                        {pos.map((p, i) => (
                          <div
                            key={i}
                            className={`absolute w-3 h-3 rounded-full transition-all duration-300 ${colors.chairs}`}
                            style={{
                              left: p.left,
                              top: p.top,
                              transform: `translate(-50%, -50%) ${is3dMode ? 'translateZ(-4px)' : ''}`,
                              transformStyle: is3dMode ? 'preserve-3d' : 'flat',
                              boxShadow: is3dMode ? `0 4px 0px ${colors.extrusionChairs}` : 'none'
                            }}
                          />
                        ))}
                        <div
                          className={`w-[55%] h-[55%] rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-md ${colors.table} ${colors.text}`}
                          style={{
                            transform: is3dMode ? 'translateZ(10px)' : 'none',
                            transformStyle: is3dMode ? 'preserve-3d' : 'flat',
                            boxShadow: is3dMode ? `0 8px 0px ${colors.extrusionTable}` : 'none',
                            border: isSelected && !is3dMode ? '2px solid white' : 'none'
                          }}
                        >
                          <span className="font-bold text-[8px] tracking-tight leading-none mb-0.5">{table.tableNumber}</span>
                          <span className="text-[6px] font-semibold opacity-85 leading-none">{table.capacity}p</span>
                        </div>
                      </div>
                    );
                  }

                  if (tableShape === 'booth') {
                    return (
                      <div className="relative w-full h-full flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
                        <div
                          className={`absolute w-[85%] h-[85%] rounded-full border-[5px] transition-all duration-300`}
                          style={{
                            borderColor: stateKey === 'selected' ? '#67334F' : stateKey === 'reserved' ? '#EAD0D4' : '#FF8D90',
                            borderBottomColor: 'transparent',
                            borderLeftColor: 'transparent',
                            transform: `translate(-50%, -50%) rotate(135deg) ${is3dMode ? 'translateZ(-2px)' : ''}`,
                            transformStyle: is3dMode ? 'preserve-3d' : 'flat',
                            boxShadow: is3dMode ? `0 5px 0px ${colors.extrusionChairs}` : 'none',
                            left: '50%',
                            top: '50%'
                          }}
                        />
                        <div
                          className={`w-[45%] h-[45%] rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-md ${colors.table} ${colors.text} z-10`}
                          style={{
                            transform: is3dMode ? 'translateZ(10px)' : 'none',
                            transformStyle: is3dMode ? 'preserve-3d' : 'flat',
                            boxShadow: is3dMode ? `0 8px 0px ${colors.extrusionTable}` : 'none',
                            border: isSelected && !is3dMode ? '2px solid white' : 'none'
                          }}
                        >
                          <span className="font-bold text-[8px] tracking-tight leading-none mb-0.5">{table.tableNumber}</span>
                          <span className="text-[6px] font-semibold opacity-85 leading-none">{table.capacity}p</span>
                        </div>
                      </div>
                    );
                  }

                  // Default / Square Table
                  const pos = [
                    { left: '50%', top: '-2px' },
                    { left: '50%', top: 'calc(100% + 2px)' },
                    { left: '-2px', top: '50%' },
                    { left: 'calc(100% + 2px)', top: '50%' }
                  ];
                  return (
                    <div className="relative w-full h-full flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
                      {pos.map((p, i) => (
                        <div
                          key={i}
                          className={`absolute w-3.5 h-3.5 rounded-sm transition-all duration-300 ${colors.chairs}`}
                          style={{
                            left: p.left,
                            top: p.top,
                            transform: `translate(-50%, -50%) ${is3dMode ? 'translateZ(-4px)' : ''}`,
                            transformStyle: is3dMode ? 'preserve-3d' : 'flat',
                            boxShadow: is3dMode ? `0 4px 0px ${colors.extrusionChairs}` : 'none'
                          }}
                        />
                      ))}
                      <div
                        className={`w-[55%] h-[55%] rounded-md flex flex-col items-center justify-center transition-all duration-300 shadow-md ${colors.table} ${colors.text}`}
                        style={{
                          transform: is3dMode ? 'translateZ(10px)' : 'none',
                          transformStyle: is3dMode ? 'preserve-3d' : 'flat',
                          boxShadow: is3dMode ? `0 8px 0px ${colors.extrusionTable}` : 'none',
                          border: isSelected && !is3dMode ? '2px solid white' : 'none'
                        }}
                      >
                        <span className="font-bold text-[9px] tracking-tight leading-none mb-0.5">{table.tableNumber}</span>
                        <span className="text-[7px] font-semibold opacity-85 leading-none">{table.capacity}p</span>
                      </div>
                    </div>
                  );
                };

                return (
                  <motion.button
                    key={table.id}
                    disabled={isReserved}
                    whileHover={!isReserved ? { 
                      scale: 1.08, 
                      translateZ: is3dMode ? (isSelected ? 38 : 22) : 0,
                      transition: { duration: 0.15 } 
                    } : {}}
                    whileTap={!isReserved ? { scale: 0.95 } : {}}
                    onClick={() => setSelectedTable(table)}
                    className="absolute bg-transparent transition-all duration-300"
                    style={{
                      left: `${table.positionX}%`,
                      top: `${table.positionY}%`,
                      width: `${baseSize}px`,
                      height: `${baseSize}px`,
                      transform: is3dMode
                        ? `translate3d(-50%, -50%, ${isSelected ? '28px' : '14px'})`
                        : 'translate(-50%, -50%)',
                      transformStyle: is3dMode ? 'preserve-3d' : 'flat',
                      cursor: isReserved ? 'not-allowed' : 'pointer',
                      zIndex: isSelected ? 20 : isReserved ? 5 : 10
                    }}
                  >
                    {renderChairsAndTable()}
                    
                    {table.isBestseller && !isSelected && !isReserved && (
                      <span 
                        className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full border border-white animate-pulse shadow-md z-30"
                        style={{
                          transform: is3dMode ? 'translateZ(18px)' : 'none'
                        }}
                      />
                    )}
                    {isAiRecommended && !isSelected && !isReserved && (
                      <span 
                        className="absolute -bottom-4 bg-purple-600 text-white text-[7px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap tracking-wide uppercase border border-purple-400/20 shadow-md z-30"
                        style={{
                          transform: is3dMode ? 'translateZ(18px)' : 'none'
                        }}
                      >
                        AI Pick
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Seat Types Legend Card */}
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md border border-[#F8D2D7]/40 rounded-2xl p-4 shadow-lg flex items-center gap-6 z-30 max-w-[280px]">
              <div className="space-y-2">
                <h5 className="text-[11px] font-bold text-[#67334F] uppercase tracking-wider">Seat Types</h5>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF8D90]" />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#F7E1E3]" />
                  <span>Reserved</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#67334F]" />
                  <span>Premium (Selected)</span>
                </div>
              </div>

              {/* SVG Availability Circular Chart */}
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-100"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#FF8D90]"
                    strokeWidth="3.2"
                    strokeDasharray={`${percentAvailable}, 100`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-[#67334F]">{percentAvailable}%</span>
                  <span className="text-[7px] text-gray-500 font-semibold uppercase leading-none">left</span>
                </div>
              </div>
            </div>

          </div>
          <div className="flex flex-wrap gap-4 mt-6 text-sm text-[#9A7077] justify-center">
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#FF8D90] shadow-sm" /> Available</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#67334F] shadow-sm" /> Selected</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#EAD0D4]" /> Reserved</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-purple-600 animate-pulse" /> AI Recommended</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" /> Bestseller</div>
          </div>
        </div>

        {/* Booking & Payment Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2rem] shadow-xl border border-[#F8D2D7]/40 p-6 sticky top-24">
            <h3 className="text-2xl font-serif font-bold text-[#67334F] mb-6">Reservation Details</h3>

            {selectedTable ? (
              <form onSubmit={handlePayAndBook} className="space-y-5">
                {/* Table Area Ambiance Preview */}
                {(() => {
                  const preview = getPreviewData(selectedTable.category);
                  return (
                    <div className="rounded-2xl overflow-hidden border border-[#F8D2D7]/40 shadow-sm bg-[#FFF6F7]/20 flex flex-col">
                      <div className="h-32 bg-gray-100 relative overflow-hidden shrink-0">
                        <img 
                          src={preview.image} 
                          alt={selectedTable.category} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
                        />
                        <span className="absolute bottom-2 left-2 bg-[#67334F]/95 text-[#FFB6B8] text-[10px] px-2.5 py-0.5 rounded font-bold uppercase tracking-wider shadow-md">
                          ✨ {preview.ambiance}
                        </span>
                        <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-semibold">
                          Noise: {preview.noise}
                        </span>
                      </div>
                      <div className="p-3 bg-white">
                        <p className="text-xs text-[#67334F] leading-relaxed font-serif italic">
                          "{preview.description}"
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Table summary */}
                <div className="p-4 bg-[#FFF6F7]/40 rounded-2xl border border-[#F8D2D7]/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[#9A7077] font-medium">Table</span>
                    <span className="font-bold text-[#67334F]">{selectedTable.tableNumber}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[#9A7077] font-medium">Category</span>
                    <span className="font-bold text-[#67334F]">{selectedTable.category}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#9A7077] font-medium">Max Capacity</span>
                    <span className="font-bold text-[#67334F]">{selectedTable.capacity} Persons</span>
                  </div>
                </div>

                {bookingError && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-100">{bookingError}</div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[#67334F] mb-1 flex items-center gap-2"><Calendar size={16} /> Date</label>
                  <input type="date" required value={date} onChange={e => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 border border-[#F8D2D7]/60 rounded-xl focus:ring-2 focus:ring-[#FF8D90]/30 focus:border-[#FF8D90] outline-none text-sm text-[#67334F] font-semibold bg-white" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#67334F] mb-1 flex items-center gap-2"><Clock size={16} /> Time</label>
                  <input type="time" required value={time} onChange={e => setTime(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#F8D2D7]/60 rounded-xl focus:ring-2 focus:ring-[#FF8D90]/30 focus:border-[#FF8D90] outline-none text-sm text-[#67334F] font-semibold bg-white" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#67334F] mb-1 flex items-center gap-2"><Users size={16} /> Guests</label>
                  <input type="number" min="1" max={selectedTable.capacity} required value={guests}
                    onChange={e => setGuests(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#F8D2D7]/60 rounded-xl focus:ring-2 focus:ring-[#FF8D90]/30 focus:border-[#FF8D90] outline-none text-sm text-[#67334F] font-semibold bg-white" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#67334F] mb-1">Special Requests (Optional)</label>
                  <textarea rows="2" value={request} onChange={e => setRequest(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#F8D2D7]/60 rounded-xl focus:ring-2 focus:ring-[#FF8D90]/30 focus:border-[#FF8D90] outline-none resize-none text-sm text-[#67334F] font-semibold bg-white"
                    placeholder="Allergies, anniversary, window seat preference..." />
                </div>

                {/* Payment summary */}
                <div className="bg-[#FFF6F7]/50 rounded-2xl p-4 border border-[#F8D2D7]/20">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-[#9A7077]">Reservation Fee</span>
                    <span className="font-bold text-[#67334F] flex items-center gap-1"><IndianRupee size={14} />{BOOKING_FEE}</span>
                  </div>
                  <p className="text-[11px] text-[#9A7077]">Secure payment via UPI, Cards, NetBanking, or Wallets</p>
                </div>

                <button type="submit" disabled={isSubmitting}
                  className="w-full bg-[#67334F] text-white py-4 rounded-xl font-bold hover:bg-[#4E2037] transition-all duration-300 shadow-lg hover:shadow-xl flex justify-center items-center gap-2 disabled:opacity-70 cursor-pointer">
                  <CreditCard size={20} />
                  {isSubmitting ? 'Opening Payment...' : `Pay ₹${BOOKING_FEE} & Confirm`}
                </button>

                <p className="text-center text-[11px] text-[#9A7077]">
                  🔒 Secured by Razorpay · Supports UPI, Cards & Wallets
                </p>
              </form>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-[#9A7077] p-6 border-2 border-dashed border-[#F8D2D7]/40 bg-[#FFF6F7]/10 rounded-2xl">
                <Sparkles size={32} className="text-[#FF8D90]/40 mb-4 animate-pulse" />
                <p className="text-sm font-medium">Select a table from the blueprint to continue with your reservation.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableBlueprintPage;
