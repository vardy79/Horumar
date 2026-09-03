const express = require('express');
const ShippingZone = require('../models/ShippingZone');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all shipping zones
router.get('/', async (req, res) => {
  try {
    const zones = await ShippingZone.find({ active: true });
    res.json(zones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get shipping cost estimate
router.post('/calculate', async (req, res) => {
  try {
    const { region, weight } = req.body;
    
    const zone = await ShippingZone.findOne({ region, active: true });
    if (!zone) return res.status(404).json({ error: 'Shipping zone not available' });

    const shippingCost = zone.baseFee + (weight * zone.pricePerKg);
    
    res.json({
      region: zone.name,
      baseFee: zone.baseFee,
      weightFee: weight * zone.pricePerKg,
      totalCost: shippingCost,
      estimatedDays: zone.estimatedDays
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create shipping zone (admin only)
router.post('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { name, region, baseFee, pricePerKg, estimatedDays } = req.body;
    
    const zone = new ShippingZone({
      name,
      region,
      baseFee,
      pricePerKg,
      estimatedDays
    });

    await zone.save();
    res.status(201).json({ message: 'Shipping zone created', zone });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get zone by region
router.get('/:region', async (req, res) => {
  try {
    const zone = await ShippingZone.findOne({ region: req.params.region, active: true });
    if (!zone) return res.status(404).json({ error: 'Zone not found' });
    res.json(zone);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
