import { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, BrainCircuit, Gift, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const PuzzlePage = () => {
  const [puzzleData, setPuzzleData] = useState(null);
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState('idle'); // idle, checking, success, error
  const [message, setMessage] = useState('');
  const [coupon, setCoupon] = useState(null);
  
  useEffect(() => {
    const fetchPuzzle = async () => {
      try {
        const res = await axios.get('/api/puzzle');
        setPuzzleData(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPuzzle();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('checking');
    
    try {
      // 1. Verify puzzle
      const verifyRes = await axios.post('/api/puzzle/verify', { answer });
      
      if (verifyRes.data.success) {
        setStatus('success');
        setMessage(verifyRes.data.message);
        
        // 2. Generate coupon
        const couponRes = await axios.post('/api/coupons/generate');
        setCoupon(couponRes.data.data);
      }
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Incorrect answer. Try again!');
    }
  };

  if (!puzzleData) return <div className="min-h-[60vh] flex items-center justify-center font-serif text-2xl text-brown-900">Loading challenge...</div>;

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[70vh]">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl border border-gold-500/20 overflow-hidden relative"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gold-400 via-gold-500 to-brown-900"></div>
        
        <div className="p-10 text-center">
          <div className="mx-auto w-20 h-20 bg-cream-200 rounded-full flex justify-center items-center mb-6 text-gold-600 shadow-inner">
            <BrainCircuit size={40} />
          </div>
          
          <h1 className="text-3xl font-serif font-bold text-brown-900 mb-2">Waitlist Challenge</h1>
          <p className="text-brown-600 mb-8 max-w-md mx-auto">Solve this logic puzzle while you wait in the queue. Answer correctly to unlock an exclusive discount coupon!</p>
          
          <div className="bg-brown-50 p-6 rounded-2xl border border-brown-100 mb-8">
            <h3 className="text-xl font-bold text-brown-900 mb-2">{puzzleData.question}</h3>
            <p className="text-sm text-brown-500 italic">Hint: {puzzleData.hint}</p>
          </div>

          {status !== 'success' ? (
            <form onSubmit={handleSubmit} className="max-w-xs mx-auto">
              <div className="mb-4">
                <input 
                  type="text" 
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Your answer..."
                  className="w-full text-center text-xl font-bold px-4 py-3 border-2 border-cream-200 rounded-xl focus:border-gold-500 focus:outline-none text-brown-900 transition-colors"
                  required
                />
              </div>
              
              {status === 'error' && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-2 text-red-500 text-sm mb-4">
                  <XCircle size={16} /> {message}
                </motion.div>
              )}

              <button 
                type="submit" 
                disabled={status === 'checking'}
                className="w-full bg-brown-900 text-cream-100 py-3 rounded-xl font-bold hover:bg-gold-500 hover:text-brown-900 transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {status === 'checking' ? 'Verifying...' : 'Submit Answer'}
              </button>
            </form>
          ) : (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              className="bg-green-50 border border-green-200 p-6 rounded-2xl"
            >
              <div className="flex justify-center text-green-500 mb-4">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-2xl font-bold text-green-800 mb-2">Brilliant!</h3>
              <p className="text-green-700 mb-6">You've successfully solved the puzzle.</p>
              
              {coupon && (
                <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm inline-block">
                  <div className="flex items-center gap-3 text-brown-900 mb-2">
                    <Gift className="text-gold-500" />
                    <span className="font-bold">Your Reward</span>
                  </div>
                  <div className="text-3xl font-black text-gold-500 mb-1">{coupon.discount}% OFF</div>
                  <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded inline-block tracking-widest">{coupon.code}</div>
                </div>
              )}
              
              <div className="mt-8">
                <Link to="/dashboard" className="text-brown-900 font-medium hover:text-gold-600 underline underline-offset-4">
                  View in Dashboard
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PuzzlePage;
