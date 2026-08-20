import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';

const API_URL = 'http://your-backend-url:5000/api';

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/orders`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#F39C12',
      confirmed: '#3498DB',
      processing: '#9B59B6',
      shipped: '#1ABC9C',
      delivered: '#27AE60',
      cancelled: '#E74C3C'
    };
    return colors[status] || '#999';
  };

  return (
    <View style={styles.container}>
      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="package-variant-closed" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No orders yet</Text>
          <Text style={styles.emptySubtext}>Start shopping to place an order</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Order #{item.orderId.substring(0, 8).toUpperCase()}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
              </View>
              
              <View style={styles.orderDetails}>
                <Text style={styles.orderAmount}>KES {item.totalAmount}</Text>
                <Text style={styles.itemCount}>{item.items.length} item(s)</Text>
              </View>

              <View style={styles.escrowInfo}>
                <MaterialCommunityIcons name="lock" size={14} color="#27AE60" />
                <Text style={styles.escrowText}>Escrow: {item.escrow.status}</Text>
              </View>
              
              {item.status !== 'delivered' && item.status !== 'cancelled' && (
                <TouchableOpacity style={styles.confirmButton}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#fff" />
                  <Text style={styles.confirmText}>Confirm Delivery</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          onRefresh={fetchOrders}
          refreshing={loading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5' },
  orderCard: { backgroundColor: '#fff', padding: 15, marginBottom: 10, borderRadius: 8, elevation: 1 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  orderId: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  orderDetails: { marginBottom: 10 },
  orderAmount: { fontSize: 18, color: '#27AE60', fontWeight: 'bold' },
  itemCount: { fontSize: 12, color: '#999', marginTop: 2 },
  escrowInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, paddingVertical: 8, paddingHorizontal: 8, backgroundColor: '#F0FDF4', borderRadius: 4 },
  escrowText: { fontSize: 12, color: '#27AE60', marginLeft: 6, fontWeight: '500' },
  confirmButton: { backgroundColor: '#27AE60', flexDirection: 'row', padding: 10, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  confirmText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', marginLeft: 6 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#999', marginTop: 12, fontWeight: '500' },
  emptySubtext: { fontSize: 12, color: '#bbb', marginTop: 4 }
});