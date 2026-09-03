const express = require('express');
const WholesalerProduct = require('../models/WholesalerProduct');
const Product = require('../models/Product');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Create/Update wholesaler product with minimum quantities
router.post('/set-wholesale', authenticate, authorize(['merchant']), async (req, res) => {
  try {
    const { productId, minOrderQuantity, wholesalePrice, bulkDiscounts } = req.body;

    let wholesalerProduct = await WholesalerProduct.findOne({ 
      product: productId, 
      merchant: req.user.id 
    });

    if (wholesalerProduct) {
      wholesalerProduct.minOrderQuantity = minOrderQuantity;
      wholesalerProduct.wholesalePrice = wholesalePrice;
      wholesalerProduct.bulkDiscounts = bulkDiscounts || [];
    } else {
      wholesalerProduct = new WholesalerProduct({
        product: productId,
        merchant: req.user.id,
        minOrderQuantity,
        wholesalePrice,
        bulkDiscounts: bulkDiscounts || []
      });
    }

    await wholesalerProduct.save();
    await wholesalerProduct.populate('product', 'name price');

    res.json({ message: 'Wholesale settings configured', wholesalerProduct });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get wholesaler products
router.get('/merchant/:merchantId', async (req, res) => {
  try {
    const products = await WholesalerProduct.find({ merchant: req.params.merchantId })
      .populate('product', 'name category price');
    res.json({ count: products.length, products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if order meets minimum quantity
router.post('/validate-order', async (req, res) => {
  try {
    const { items } = req.body; // [{productId, quantity}, ...]
    
    const validations = await Promise.all(
      items.map(async (item) => {
        const wholesaler = await WholesalerProduct.findOne({ product: item.productId });
        return {
          productId: item.productId,
          requestedQty: item.quantity,
          minQty: wholesaler?.minOrderQuantity || 1,
          valid: item.quantity >= (wholesaler?.minOrderQuantity || 1)
        };
      })
    );

    res.json({ validations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
