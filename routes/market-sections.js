const express = require('express');
const MarketSection = require('../models/MarketSection');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all market sections
router.get('/', async (req, res) => {
  try {
    const sections = await MarketSection.find({ active: true })
      .populate('merchants', 'name location')
      .sort({ name: 1 });
    res.json(sections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific market section
router.get('/:id', async (req, res) => {
  try {
    const section = await MarketSection.findById(req.params.id)
      .populate('merchants', 'name email location');
    if (!section) return res.status(404).json({ error: 'Market section not found' });
    res.json(section);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get merchants in a market section
router.get('/:id/merchants', async (req, res) => {
  try {
    const section = await MarketSection.findById(req.params.id)
      .populate('merchants', 'name email location rating');
    if (!section) return res.status(404).json({ error: 'Market section not found' });
    res.json({ section: section.name, merchants: section.merchants });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add merchant to market section
router.post('/:id/add-merchant', authenticate, authorize(['merchant', 'admin']), async (req, res) => {
  try {
    const section = await MarketSection.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { merchants: req.user.id } },
      { new: true }
    ).populate('merchants', 'name');

    res.json({ message: 'Added to market section', section });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get products by market section
router.get('/:id/products', async (req, res) => {
  try {
    const Product = require('../models/Product');
    const section = await MarketSection.findById(req.params.id);
    if (!section) return res.status(404).json({ error: 'Market section not found' });

    const products = await Product.find({ merchant: { $in: section.merchants } })
      .populate('merchant', 'name location');
    
    res.json({ section: section.name, productCount: products.length, products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
