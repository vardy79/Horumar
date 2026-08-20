const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/horumar')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/delivery', require('./routes/delivery'));

app.get('/health', (req, res) => {
  res.json({ status: '✅ Horumar API running' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Horumar Server running on port ${PORT}`);
  console.log(`📱 Agricultural Marketplace API`);
  console.log(`✨ Free sign up - No mandatory monthly subscription`);
  console.log(`💳 Delivery: 200-300 KES (Nairobi)`);
  console.log(`🎉 Live & Flash Sales: FREE for first 3 months, then 1000 KES/month`);
});

module.exports = app;
