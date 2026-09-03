import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';

const API_URL = 'http://your-backend-url:5000/api';

export default function AIAssistantScreen() {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/ai-assistant/pending-orders`);
      setPendingOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewOrder = async () => {
    setGenerating(true);
    try {
      const response = await axios.post(`${API_URL}/ai-assistant/generate-order`);
      setPendingOrders([response.data.aiOrder, ...pendingOrders]);
    } catch (error) {
      alert('Error generating order: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const confirmOrder = async (orderId) => {
    try {
      await axios.post(`${API_URL}/ai-assistant/${orderId}/confirm`);
      setPendingOrders(pendingOrders.filter(o => o._id !== orderId));
      alert('✅ Order confirmed!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const rejectOrder = async (orderId) => {
    try {
      await axios.post(`${API_URL}/ai-assistant/${orderId}/reject`, { reason: 'Not needed' });
      setPendingOrders(pendingOrders.filter(o => o._id !== orderId));
      alert('❌ Order rejected');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="robot" size={28} color="#27AE60" />
        <Text style={styles.headerText}>AI Shop Assistant</Text>
      </View>

      <TouchableOpacity 
        style={[styles.generateButton, generating && styles.buttonDisabled]}
        onPress={generateNewOrder}
        disabled={generating}
      >
        <MaterialCommunityIcons name="plus-circle" size={18} color="#fff" />
        <Text style={styles.generateText}>
          {generating ? 'Designing...' : 'Generate Order'}
        </Text>
      </TouchableOpacity>

      {pendingOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="inbox" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No pending orders</Text>
          <Text style={styles.emptySubtext}>AI will design orders while you sleep</Text>
        </View>
      ) : (
        <FlatList
          data={pendingOrders}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderTitle}>AI-Designed Order</Text>
                  <Text style={styles.confidence}>Confidence: {item.confidence}%</Text>
                </View>
                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceText}>{item.confidence}%</Text>
                </View>
              </View>

              <Text style={styles.reason}>{item.reason}</Text>
              <Text style={styles.amount}>KES {item.totalAmount}</Text>
              <Text style={styles.itemCount}>{item.items.length} items selected</Text>

              <View style={styles.itemsList}>
                {item.items.map((itemData, idx) => (
                  <Text key={idx} style={styles.itemLine}>
                    • {itemData.product?.name || 'Product'} x{itemData.quantity}
                  </Text>
                ))}
              </View>

              <View style={styles.actions}>
                <TouchableOpacity 
                  style={styles.rejectBtn}
                  onPress={() => rejectOrder(item._id)}
                >
                  <MaterialCommunityIcons name="close" size={16} color="#E74C3C" />
                  <Text style={styles.rejectText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.confirmBtn}
                  onPress={() => confirmOrder(item._id)}
                >
                  <MaterialCommunityIcons name="check" size={16} color="#fff" />
                  <Text style={styles.confirmText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          onRefresh={fetchPendingOrders}
          refreshing={loading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  headerText: { fontSize: 20, fontWeight: 'bold', marginLeft: 8, color: '#27AE60' },
  generateButton: { backgroundColor: '#27AE60', flexDirection: 'row', padding: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  buttonDisabled: { opacity: 0.6 },
  generateText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  orderCard: { backgroundColor: '#fff', padding: 15, marginBottom: 12, borderRadius: 8, elevation: 2 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  orderTitle: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  confidence: { fontSize: 12, color: '#999', marginTop: 2 },
  confidenceBadge: { backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4 },
  confidenceText: { color: '#27AE60', fontWeight: 'bold', fontSize: 12 },
  reason: { fontSize: 12, color: '#666', marginBottom: 8, fontStyle: 'italic' },
  amount: { fontSize: 16, color: '#27AE60', fontWeight: 'bold', marginBottom: 4 },
  itemCount: { fontSize: 12, color: '#999', marginBottom: 8 },
  itemsList: { backgroundColor: '#f9f9f9', padding: 10, borderRadius: 6, marginBottom: 10 },
  itemLine: { fontSize: 12, color: '#333', marginBottom: 4 },
  actions: { flexDirection: 'row', gap: 10 },
  rejectBtn: { flex: 1, flexDirection: 'row', borderWidth: 1, borderColor: '#E74C3C', paddingVertical: 8, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  rejectText: { color: '#E74C3C', fontWeight: 'bold', marginLeft: 6, fontSize: 12 },
  confirmBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#27AE60', paddingVertical: 8, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: 'bold', marginLeft: 6, fontSize: 12 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#999', marginTop: 12, fontWeight: '500' },
  emptySubtext: { fontSize: 12, color: '#bbb', marginTop: 4 }
});
