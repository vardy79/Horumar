const express = require('express');
const Sales = require('../models/Sales');
const { authenticate, authorize } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

router.post('/', authenticate, authorize(['merchant']), async (req, res) => {
  try {
    const { type, productId, title, description, originalPrice, salePrice, quantity, startDate, endDate } = req.body;

    if (!['live', 'flash', 'regular'].includes(type)) {
      return res.status(400).json({ error: 'Invalid sale type' });
    }

    const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);

    const sale = new Sales({
      type,
      merchant: req.user.id,
      product: productId,
      title,
      description,
      originalPrice,
      salePrice,
      discount,
      quantity,
      startDate,
      endDate,
      isPremium: false,
      status: 'active'
    });

    await sale.save();
    await sale.populate('merchant', 'name');
    await sale.populate('product', 'name');

    res.status(201).json({ message: 'Sale created (FREE for first 3 months)', sale });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { type, merchant } = req.query;
    const filter = { status: 'active' };

    if (type) filter.type = type;
    if (merchant) filter.merchant = merchant;

    const sales = await Sales.find(filter)
      .populate('merchant', 'name location')
      .populate('product', 'name')
      .sort({ createdAt: -1 });

    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const sale = await Sales.findById(req.params.id)
      .populate('merchant', 'name location')
      .populate('product', 'name price');

    if (!sale) return res.status(404).json({ error: 'Sale not found' });
    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/live/ongoing', async (req, res) => {
  try {
    const now = new Date();
    const liveSales = await Sales.find({
      type: 'live',
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now }
    })
      .populate('merchant', 'name location')
      .populate('product', 'name price')
      .sort({ createdAt: -1 });

    res.json(liveSales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/flash/ongoing', async (req, res) => {
  try {
    const now = new Date();
    const flashSales = await Sales.find({
      type: 'flash',
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now }
    })
      .populate('merchant', 'name location')
      .populate('product', 'name price')
      .sort({ createdAt: -1 });

    res.json(flashSales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/end', authenticate, authorize(['merchant']), async (req, res) => {
  try {
    const sale = await Sales.findByIdAndUpdate(
      req.params.id,
      { status: 'ended', endDate: new Date() },
      { new: true }
    );

    res.json({ message: 'Sale ended', sale });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;