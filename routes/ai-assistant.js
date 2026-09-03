const express = require('express');
const AIAssistant = require('../models/AIAssistant');
const AIOrder = require('../models/AIOrder');
const Product = require('../models/Product');
const { authenticate, authorize } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Enable AI Assistant for merchant
router.post('/enable', authenticate, authorize(['merchant']), async (req, res) => {
  try {
    let aiAssistant = await AIAssistant.findOne({ merchant: req.user.id });
    
    if (aiAssistant) {
      aiAssistant.status = 'active';
      aiAssistant.autoOrderGeneration = true;
    } else {
      aiAssistant = new AIAssistant({
        merchant: req.user.id,
        status: 'active'
      });
    }

    await aiAssistant.save();
    res.json({ message: '🤖 AI Assistant enabled', aiAssistant });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get AI Assistant status
router.get('/status', authenticate, authorize(['merchant']), async (req, res) => {
  try {
    const aiAssistant = await AIAssistant.findOne({ merchant: req.user.id });
    
    if (!aiAssistant) {
      return res.json({ status: 'inactive', message: 'AI Assistant not enabled' });
    }

    res.json(aiAssistant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate AI order (auto-design products)
router.post('/generate-order', authenticate, authorize(['merchant']), async (req, res) => {
  try {
    const aiAssistant = await AIAssistant.findOne({ merchant: req.user.id, status: 'active' });
    if (!aiAssistant) return res.status(400).json({ error: 'AI Assistant not enabled' });

    // Get merchant's products
    const products = await Product.find({ merchant: req.user.id }).limit(10);
    if (products.length === 0) return res.status(400).json({ error: 'No products available' });

    // AI logic: randomly select products (simple demo)
    const numItems = Math.floor(Math.random() * 3) + 1;
    const selectedProducts = products.sort(() => Math.random() - 0.5).slice(0, numItems);
    
    let totalAmount = 0;
    const items = selectedProducts.map(product => {
      const quantity = Math.floor(Math.random() * 5) + 1;
      const subtotal = product.price * quantity;
      totalAmount += subtotal;
      return {
        product: product._id,
        quantity,
        price: product.price,
        subtotal
      };
    });

    const aiOrder = new AIOrder({
      aiAssistant: aiAssistant._id,
      merchant: req.user.id,
      orderId: uuidv4(),
      items,
      totalAmount,
      suggestedProducts: selectedProducts.map(p => p._id),
      status: 'pending',
      confidence: Math.floor(Math.random() * 30) + 70, // 70-100% confidence
      reason: 'AI Assistant designed this order based on trending products and inventory'
    });

    await aiOrder.save();
    await aiOrder.populate('items.product', 'name price');

    res.status(201).json({ 
      message: '🤖 Order auto-designed by AI', 
      aiOrder,
      action: 'PENDING OWNER CONFIRMATION'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending AI orders for owner confirmation
router.get('/pending-orders', authenticate, authorize(['merchant']), async (req, res) => {
  try {
    const pendingOrders = await AIOrder.find({ 
      merchant: req.user.id, 
      status: 'pending' 
    })
      .populate('items.product', 'name price')
      .sort({ designedAt: -1 });

    res.json({ 
      count: pendingOrders.length,
      orders: pendingOrders,
      message: `${pendingOrders.length} orders waiting for your confirmation`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Owner confirms AI order
router.post('/:orderId/confirm', authenticate, authorize(['merchant']), async (req, res) => {
  try {
    const { notes } = req.body;
    const aiOrder = await AIOrder.findByIdAndUpdate(
      req.params.orderId,
      { 
        status: 'confirmed',
        confirmedAt: new Date(),
        'ownerAction.action': 'confirmed',
        'ownerAction.timestamp': new Date(),
        'ownerAction.notes': notes
      },
      { new: true }
    );

    res.json({ message: '✅ Order confirmed! Processing...', aiOrder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Owner rejects AI order
router.post('/:orderId/reject', authenticate, authorize(['merchant']), async (req, res) => {
  try {
    const { reason } = req.body;
    const aiOrder = await AIOrder.findByIdAndUpdate(
      req.params.orderId,
      { 
        status: 'rejected',
        'ownerAction.action': 'rejected',
        'ownerAction.timestamp': new Date(),
        'ownerAction.notes': reason
      },
      { new: true }
    );

    res.json({ message: '❌ Order rejected', aiOrder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update AI preferences
router.put('/preferences', authenticate, authorize(['merchant']), async (req, res) => {
  try {
    const { maxOrdersPerDay, minOrderValue, autoConfirmUnder } = req.body;
    
    const aiAssistant = await AIAssistant.findOneAndUpdate(
      { merchant: req.user.id },
      { 
        'preferences.maxOrdersPerDay': maxOrdersPerDay,
        'preferences.minOrderValue': minOrderValue,
        'preferences.autoConfirmUnder': autoConfirmUnder
      },
      { new: true }
    );

    res.json({ message: 'AI preferences updated', aiAssistant });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
