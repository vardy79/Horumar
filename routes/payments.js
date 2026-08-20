const express = require('express');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { authenticate } = require('../middleware/auth');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const getMPESAToken = async () => {
  try {
    const auth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString('base64');

    const response = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      { headers: { Authorization: `Basic ${auth}` } }
    );

    return response.data.access_token;
  } catch (error) {
    throw new Error('Failed to get M-Pesa token');
  }
};

router.post('/mpesa', authenticate, async (req, res) => {
  try {
    const { orderId, phoneNumber, amount } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const token = await getMPESAToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(
      `${process.env.MPESA_BUSINESS_SHORT_CODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString('base64');

    const mpesaResponse = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: process.env.MPESA_BUSINESS_SHORT_CODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: process.env.MPESA_BUSINESS_SHORT_CODE,
        PhoneNumber: phoneNumber,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: orderId,
        TransactionDesc: 'Payment for agricultural products'
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const payment = new Payment({
      transactionId: uuidv4(),
      order: orderId,
      amount,
      method: 'mpesa',
      status: 'processing',
      mpesaResponse: {
        checkoutRequestId: mpesaResponse.data.CheckoutRequestID,
        responseCode: mpesaResponse.data.ResponseCode,
        responseDescription: mpesaResponse.data.ResponseDescription
      }
    });

    await payment.save();
    res.json({ message: 'M-Pesa payment initiated', payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/bank-transfer', authenticate, async (req, res) => {
  try {
    const { orderId, accountName, accountNumber, bankName, amount } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const payment = new Payment({
      transactionId: uuidv4(),
      order: orderId,
      amount,
      method: 'bank_transfer',
      status: 'processing',
      bankDetails: { accountName, accountNumber, bankName }
    });

    await payment.save();
    res.json({ message: 'Bank transfer initiated', payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/buy-goods', authenticate, async (req, res) => {
  try {
    const { orderId, phoneNumber, amount } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const payment = new Payment({
      transactionId: uuidv4(),
      order: orderId,
      amount,
      method: 'buy_goods',
      status: 'processing',
      buyGoodsDetails: {
        businessShortCode: process.env.MPESA_BUSINESS_SHORT_CODE,
        reference: orderId
      }
    });

    await payment.save();
    res.json({ message: 'Buy Goods payment initiated', payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/paybill', authenticate, async (req, res) => {
  try {
    const { orderId, phoneNumber, accountNumber, amount } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const payment = new Payment({
      transactionId: uuidv4(),
      order: orderId,
      amount,
      method: 'paybill',
      status: 'processing',
      paybillDetails: {
        businessShortCode: process.env.MPESA_BUSINESS_SHORT_CODE,
        accountNumber
      }
    });

    await payment.save();
    res.json({ message: 'Paybill payment initiated', payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/mpesa-callback', (req, res) => {
  try {
    const body = req.body.Body.stkCallback;
    const checkoutRequestId = body.CheckoutRequestID;
    const resultCode = body.ResultCode;

    if (resultCode === 0) {
      console.log('✅ M-Pesa payment successful');
    } else {
      console.log('❌ M-Pesa payment failed');
    }

    res.json({ ResultCode: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const payments = await Payment.find().populate('order');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;