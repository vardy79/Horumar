import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';

const API_URL = 'http://your-backend-url:5000/api';

export default function DeliveryTrackingScreen() {
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock delivery data - replace with actual order ID
    mockDeliveryData();
  }, []);

  const mockDeliveryData = () => {
    setDelivery({
      status: 'in_transit',
      location: 'Nairobi, Kenya',
      estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleTimeString(),
      deliveryFee: 250,
      trackingUpdates: [
        { status: 'delivered', timestamp: '10:30 AM', location: 'Distribution center', notes: 'Picked from warehouse' },
        { status: 'in_transit', timestamp: '11:15 AM', location: 'On the way', notes: 'Driver started delivery' },
        { status: 'pending', timestamp: '09:00 AM', location: 'Nairobi', notes: 'Order confirmed' }
      ]
    });
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: 'clock',
      in_transit: 'truck-fast',
      delivered: 'check-circle',
      failed: 'close-circle'
    };
    return icons[status] || 'package';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#F39C12',
      in_transit: '#3498DB',
      delivered: '#27AE60',
      failed: '#E74C3C'
    };
    return colors[status] || '#999';
  };

  return (
    <ScrollView style={styles.container}>
      {delivery && (
        <>
          <View style={styles.statusContainer}>
            <View style={[styles.statusIcon, { backgroundColor: getStatusColor(delivery.status) }]}>
              <MaterialCommunityIcons 
                name={getStatusIcon(delivery.status)} 
                size={32} 
                color="#fff"
              />
            </View>
            <Text style={styles.statusTitle}>{delivery.status.replace(/_/g, ' ').toUpperCase()}</Text>
            <Text style={styles.estimatedTime}>Estimated: {delivery.estimatedDelivery}</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker" size={18} color="#27AE60" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Current Location</Text>
                <Text style={styles.infoValue}>{delivery.location}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="currency-ksh" size={18} color="#27AE60" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Delivery Fee</Text>
                <Text style={styles.infoValue}>KES {delivery.deliveryFee}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tracking History</Text>
            {delivery.trackingUpdates.map((update, index) => (
              <View key={index} style={styles.trackingItem}>
                <View style={styles.trackingTimeline}>
                  <View style={[styles.timelineIcon, { backgroundColor: getStatusColor(update.status) }]}>
                    <MaterialCommunityIcons 
                      name={getStatusIcon(update.status)} 
                      size={14} 
                      color="#fff"
                    />
                  </View>
                  {index < delivery.trackingUpdates.length - 1 && <View style={styles.timelineLine} />}
                </View>
                <View style={styles.trackingContent}>
                  <Text style={styles.trackingTime}>{update.timestamp}</Text>
                  <Text style={styles.trackingStatus}>{update.status.replace(/_/g, ' ').toUpperCase()}</Text>
                  <Text style={styles.trackingNotes}>{update.notes}</Text>
                  <Text style={styles.trackingLocation}>
                    <MaterialCommunityIcons name="map-marker" size={12} color="#999" /> {update.location}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.contactButton}>
            <MaterialCommunityIcons name="phone" size={18} color="#fff" />
            <Text style={styles.contactText}>Contact Delivery Driver</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  statusContainer: { backgroundColor: '#fff', padding: 30, alignItems: 'center', marginBottom: 15, elevation: 1 },
  statusIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  statusTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  estimatedTime: { fontSize: 13, color: '#999' },
  infoCard: { backgroundColor: '#fff', marginHorizontal: 15, marginBottom: 15, borderRadius: 8, elevation: 1, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', padding: 15, alignItems: 'flex-start' },
  infoContent: { marginLeft: 12, flex: 1 },
  infoLabel: { fontSize: 12, color: '#999', marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  divider: { height: 1, backgroundColor: '#eee' },
  section: { paddingHorizontal: 15, marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  trackingItem: { flexDirection: 'row', marginBottom: 20 },
  trackingTimeline: { alignItems: 'center', marginRight: 15 },
  timelineIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  timelineLine: { width: 2, height: 40, backgroundColor: '#ddd', marginTop: 4 },
  trackingContent: { flex: 1, paddingTop: 2 },
  trackingTime: { fontSize: 12, fontWeight: 'bold', color: '#27AE60' },
  trackingStatus: { fontSize: 13, fontWeight: '600', color: '#333', marginTop: 2 },
  trackingNotes: { fontSize: 12, color: '#666', marginTop: 4 },
  trackingLocation: { fontSize: 11, color: '#999', marginTop: 4 },
  contactButton: { backgroundColor: '#27AE60', margin: 15, padding: 14, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  contactText: { color: '#fff', fontWeight: 'bold', marginLeft: 8, fontSize: 15 }
});