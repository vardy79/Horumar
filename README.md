# 🌾 Horumar - Agricultural Marketplace

> Connecting farmers, wholesalers, and customers with secure payments and live/flash sales

## ✨ Key Features

### 📱 **Free Sign Up** 
- No mandatory monthly subscription
- 3% commission on all sales

### 💰 **Pricing Model**
| Feature | Cost |
|---------|------|
| Sign Up | FREE |
| Regular Sales | FREE (3% commission) |
| Live/Flash Sales | FREE for 3 months, then 1000 KES/month |
| Delivery (Nairobi) | 200-300 KES |
| Delivery (Outside Nairobi) | 500-1000 KES |
| Premium Subscription | 1000 KES/month (optional) |

### 🛍️ **Sales System**
- Regular Sales (FREE)
- Live Sales (FREE 3 months → 1000 KES/month)
- Flash Sales (FREE 3 months → 1000 KES/month)
- Real-time discount tracking

### 🚚 **Delivery Tracking**
- Real-time location tracking
- Status updates
- Location-based pricing
- Delivery history

### 💳 **Payment Methods**
- M-Pesa (STK Push)
- Bank Transfer
- Buy Goods
- Paybill

### 🔒 **Hidden Escrow System**
- Secure payment holding during delivery
- Automatic release on confirmation
- Refund processing on disputes
- 7-day hold period

## 🏗️ Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Payments**: M-Pesa API
- **Security**: bcryptjs
- **Mobile**: React Native + Expo

## 🚀 Installation

```bash
npm install
```

## ⚙️ Configuration

Create `.env`:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/horumar
JWT_SECRET=your_jwt_secret_key_here
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_PASSKEY=your_mpesa_passkey
MPESA_BUSINESS_SHORT_CODE=174379
MPESA_CALLBACK_URL=https://your-domain.com/api/payments/mpesa-callback
NODE_ENV=development
```

## 🎯 Running

```bash
npm start          # Production
npm run dev        # Development with nodemon
```

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` - Register (FREE)
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user

### Products
- `GET /api/products` - List all
- `POST /api/products` - Create (merchant)
- `GET /api/products/:id` - Get details
- `PUT /api/products/:id` - Update (merchant)
- `DELETE /api/products/:id` - Delete (merchant)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - My orders
- `GET /api/orders/:id` - Order details
- `PUT /api/orders/:id/status` - Update status
- `POST /api/orders/:id/confirm-delivery` - Confirm delivery
- `POST /api/orders/:id/refund` - Request refund

### Sales
- `POST /api/sales` - Create sale (live/flash/regular)
- `GET /api/sales` - All sales
- `GET /api/sales/live/ongoing` - Live sales
- `GET /api/sales/flash/ongoing` - Flash sales
- `POST /api/sales/:id/end` - End sale

### Delivery
- `POST /api/delivery` - Create delivery
- `GET /api/delivery/order/:orderId` - Get delivery
- `PUT /api/delivery/:id/status` - Update status
- `GET /api/delivery/:id/track` - Track delivery

### Payments
- `POST /api/payments/mpesa` - M-Pesa
- `POST /api/payments/bank-transfer` - Bank transfer
- `POST /api/payments/buy-goods` - Buy Goods
- `POST /api/payments/paybill` - Paybill
- `GET /api/payments` - All payments

### Subscriptions
- `GET /api/subscriptions/tiers` - Subscription tiers
- `POST /api/subscriptions/subscribe` - Subscribe premium
- `GET /api/subscriptions/my-subscription` - My subscription
- `POST /api/subscriptions/upgrade` - Upgrade
- `POST /api/subscriptions/:id/cancel` - Cancel

## 📊 Database Schema

- **User**: Auth, profiles, subscription
- **Product**: Listings, merchant details
- **Order**: Orders with escrow tracking
- **Payment**: Payment records
- **Subscription**: User subscriptions
- **Sales**: Live/Flash/Regular sales
- **Delivery**: Delivery tracking & fees

## 🔐 Security

✅ Escrow system for payment safety
✅ JWT authentication
✅ bcryptjs password hashing
✅ Role-based access control
✅ Payment validation

## 📄 License

MIT License
