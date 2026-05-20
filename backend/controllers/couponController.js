const prisma = require('../prisma/client');
const crypto = require('crypto');

exports.getPuzzle = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      question: "I am always hungry, I must always be fed. The finger I touch, will soon turn red. What am I?",
      hint: "Think about elements."
    }
  });
};

exports.verifyPuzzle = (req, res) => {
  const { answer } = req.body;
  
  if (answer && answer.toLowerCase().trim() === 'fire') {
    res.status(200).json({ success: true, message: 'Correct answer!' });
  } else {
    res.status(400).json({ success: false, message: 'Incorrect answer. Try again!' });
  }
};

exports.generateCoupon = async (req, res) => {
  try {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    
    // Generate a random discount percentage between 20% and 30% (inclusive)
    const discount = Math.floor(Math.random() * 11) + 20;

    // Set expiry to 7 days from now
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);

    const coupon = await prisma.coupon.create({
      data: {
        code,
        discount,
        userId: req.user.id,
        expiry
      }
    });

    res.status(201).json({ success: true, data: coupon });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getMyCoupons = async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      where: {
        userId: req.user.id,
        isUsed: false,
        expiry: { gt: new Date() }
      }
    });

    res.status(200).json({ success: true, count: coupons.length, data: coupons });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
