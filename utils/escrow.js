const Order = require('../models/Order');

class EscrowManager {
  static async holdPayment(orderId, amount) {
    try {
      const order = await Order.findById(orderId);
      if (!order) throw new Error('Order not found');

      order.escrow.status = 'held';
      order.escrow.heldAt = new Date();
      order.escrow.releaseAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      order.paymentStatus = 'completed';
      await order.save();

      return { success: true, message: 'Payment held securely' };
    } catch (error) {
      throw error;
    }
  }

  static async releasePayment(orderId) {
    try {
      const order = await Order.findById(orderId);
      if (!order) throw new Error('Order not found');
      if (order.escrow.status !== 'held') throw new Error('Payment not in escrow');

      order.escrow.status = 'released';
      order.escrow.releasedAt = new Date();
      order.status = 'delivered';
      await order.save();

      await this.disburseMerchant(order);

      return { success: true, message: 'Payment released to merchant' };
    } catch (error) {
      throw error;
    }
  }

  static async refundPayment(orderId, reason) {
    try {
      const order = await Order.findById(orderId);
      if (!order) throw new Error('Order not found');

      order.escrow.status = 'refunded';
      order.paymentStatus = 'refunded';
      order.status = 'cancelled';
      await order.save();

      await this.disburseCustomer(order);

      return { success: true, message: 'Refund processed' };
    } catch (error) {
      throw error;
    }
  }

  static async disburseMerchant(order) {
    console.log(`💰 Disbursing KES ${order.totalAmount} to merchant`);
  }

  static async disburseCustomer(order) {
    console.log(`💳 Refunding KES ${order.totalAmount} to customer`);
  }
}

module.exports = EscrowManager;
