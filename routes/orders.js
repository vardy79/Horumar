const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { authenticate, authorize } = require('../middleware/auth');
const EscrowManager = require('../utils/escrow');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

router.post('/', authenticate, async (req, res) => {
  try {
    const { items, paymentMethod, deliveryLocation, notes } = req.body;

    let totalAmount = 0;
    const orderItems = [];

    for (let item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ error: 'Product not found' });

      const price = req.user.role === 'merchant' && product.wholesalePrice ? product.wholesalePrice : product.price;
      const subtotal = price * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price,
        subtotal
      });
    }

    const order = new Order({
      orderId: uuidv4(),
      customer: req.user.id,
      merchant: orderItems[0].product.merchant,
      items: orderItems,
      totalAmount,
      paymentMethod,
      deliveryLocation,
      notes
    });

    await order.save();
    await EscrowManager.holdPayment(order._id, totalAmount);

    res.status(201).json({ message: 'Order created', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ $or: [{ customer: req.user.id }, { merchant: req.user.id }] })
      .populate('customer', 'name email')
      .populate('merchant', 'name email')
      .populate('items.product', 'name price');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('merchant', 'name email')
      .populate('items.product', 'name price');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/status', authenticate, authorize(['merchant', 'admin']), async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/confirm-delivery', authenticate, authorize(['customer']), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    await EscrowManager.releasePayment(order._id);
    res.json({ message: 'Delivery confirmed, payment released' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/refund', authenticate, authorize(['customer', 'admin']), async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    await EscrowManager.refundPayment(order._id, reason);
    res.json({ message: 'Refund processed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;