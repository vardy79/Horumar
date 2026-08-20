const express = require('express');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const subscriptionTiers = {
  free: { 
    price: 0, 
    duration: 0,
    features: [
      'Browse products',
      'Place orders',
      'Regular sales (FREE)',
      'Basic support',
      '3 months FREE live & flash sales'
    ]
  },
  premium: { 
    price: 1000, 
    duration: 30,
    features: [
      'All free features',
      'Unlimited live sales',
      'Unlimited flash sales',
      'Priority support',
      'Analytics dashboard',
      'Featured merchant badge'
    ]
  }
};

router.get('/tiers', (req, res) => {
  res.json(subscriptionTiers);
});

router.post('/subscribe', authenticate, async (req, res) => {
  try {
    const { tier } = req.body;

    if (!subscriptionTiers[tier]) return res.status(400).json({ error: 'Invalid tier' });

    if (tier === 'free') {
      return res.status(400).json({ error: 'Free tier is default' });
    }

    const tierData = subscriptionTiers[tier];
    const endDate = new Date(Date.now() + tierData.duration * 24 * 60 * 60 * 1000);

    const subscription = new Subscription({
      user: req.user.id,
      tier,
      price: tierData.price,
      duration: tierData.duration,
      features: tierData.features,
      endDate
    });

    await subscription.save();

    await User.findByIdAndUpdate(req.user.id, {
      subscriptionTier: tier,
      subscriptionExpiry: endDate
    });

    res.status(201).json({ 
      message: 'Premium subscription activated', 
      subscription,
      cost: `KES ${tierData.price}/month` 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/my-subscription', authenticate, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user.id, status: 'active' });
    const user = await User.findById(req.user.id);

    if (!subscription) {
      return res.json({
        tier: 'free',
        status: 'active',
        features: subscriptionTiers.free.features,
        message: '✨ You are on FREE tier. Live and flash sales are FREE for first 3 months!'
      });
    }

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/upgrade', authenticate, async (req, res) => {
  try {
    const { tier } = req.body;

    if (!subscriptionTiers[tier]) return res.status(400).json({ error: 'Invalid tier' });

    const tierData = subscriptionTiers[tier];
    const endDate = new Date(Date.now() + tierData.duration * 24 * 60 * 60 * 1000);

    await Subscription.updateMany(
      { user: req.user.id, status: 'active' },
      { status: 'cancelled' }
    );

    const subscription = new Subscription({
      user: req.user.id,
      tier,
      price: tierData.price,
      duration: tierData.duration,
      features: tierData.features,
      endDate
    });

    await subscription.save();

    await User.findByIdAndUpdate(req.user.id, {
      subscriptionTier: tier,
      subscriptionExpiry: endDate
    });

    res.json({ message: 'Subscription upgraded', subscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/cancel', authenticate, async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    await User.findByIdAndUpdate(req.user.id, {
      subscriptionTier: 'free'
    });

    res.json({ message: 'Subscription cancelled, reverted to free tier', subscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;