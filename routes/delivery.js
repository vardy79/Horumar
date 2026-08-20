const express = require('express');
const Delivery = require('../models/Delivery');
const Order = require('../models/Order');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

const calculateDeliveryFee = (area) => {
  const fees = {
    'nairobi': { min: 200, max: 300 },
    'outside_nairobi': { min: 500, max: 1000 }
  };
  return fees[area] || { min: 200, max: 300 };
};

router.post('/', authenticate, async (req, res) => {
  try {
    const { orderId, location, area, estimatedDeliveryDate } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const feeRange = calculateDeliveryFee(area);
    const deliveryFee = Math.floor(Math.random() * (feeRange.max - feeRange.min + 1)) + feeRange.min;

    const delivery = new Delivery({
      order: orderId,
      merchant: order.merchant,
      customer: order.customer,
      location,
      area,
      deliveryFee,
      estimatedDelivery: estimatedDeliveryDate || new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: 'pending'
    });

    await delivery.save();
    res.status(201).json({ message: 'Delivery scheduled', delivery, deliveryFee });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/order/:orderId', authenticate, async (req, res) => {
  try {
    const deliveries = await Delivery.findOne({ order: req.params.orderId })
      .populate('merchant', 'name phone')
      .populate('customer', 'name phone')
      .populate('order', 'orderId totalAmount');

    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/status', authenticate, authorize(['merchant', 'admin']), async (req, res) => {
  try {
    const { status, location, notes } = req.body;

    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (location || notes) {
      delivery.trackingUpdates.push({
        status,
        location: location || delivery.location,
        notes
      });
      await delivery.save();
    }

    res.json({ message: 'Delivery status updated', delivery });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/track', authenticate, async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) return res.status(404).json({ error: 'Delivery not found' });

    res.json({
      status: delivery.status,
      location: delivery.location,
      estimatedDelivery: delivery.estimatedDelivery,
      trackingUpdates: delivery.trackingUpdates
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;