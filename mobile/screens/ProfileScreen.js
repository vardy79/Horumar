import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://your-backend-url:5000/api';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      setUser(response.data);

      const subResponse = await axios.get(`${API_URL}/subscriptions/my-subscription`);
      setSubscription(subResponse.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('authToken');
    navigation.replace('Login');
  };

  return (
    <ScrollView style={styles.container}>
      {user && (
        <>
          <View style={styles.header}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons name="account" size={40} color="#27AE60" />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.email}>{user.email}</Text>
              <Text style={styles.role}>{user.role.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subscription</Text>
            {subscription ? (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{subscription.tier.toUpperCase()}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: subscription.tier === 'premium' ? '#27AE60' : '#3498DB' }]}>
                    <Text style={styles.statusBadgeText}>{subscription.status}</Text>
                  </View>
                </View>
                {subscription.tier === 'premium' && (
                  <Text style={styles.cardDetail}>KES {subscription.price}/month</Text>
                )}
                {subscription.tier === 'free' && (
                  <Text style={styles.cardDetail}>{subscription.message}</Text>
                )}
              </View>
            ) : null}
            {user.subscriptionTier === 'free' && (
              <TouchableOpacity style={styles.upgradeButton}>
                <MaterialCommunityIcons name="crown" size={16} color="#fff" />
                <Text style={styles.upgradeText}>Upgrade to Premium</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Settings</Text>
            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons name="pencil" size={18} color="#27AE60" />
              <Text style={styles.menuText}>Edit Profile</Text>
              <MaterialCommunityIcons name="chevron-right" size={18} color="#ccc" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons name="credit-card" size={18} color="#27AE60" />
              <Text style={styles.menuText}>Payment Methods</Text>
              <MaterialCommunityIcons name="chevron-right" size={18} color="#ccc" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons name="bell" size={18} color="#27AE60" />
              <Text style={styles.menuText}>Notifications</Text>
              <MaterialCommunityIcons name="chevron-right" size={18} color="#ccc" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons name="help-circle" size={18} color="#27AE60" />
              <Text style={styles.menuText}>Help & Support</Text>
              <MaterialCommunityIcons name="chevron-right" size={18} color="#ccc" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={18} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#27AE60', padding: 20, flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  userInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  email: { fontSize: 12, color: '#ecf0f1', marginTop: 2 },
  role: { fontSize: 11, color: '#bdc3c7', marginTop: 2 },
  section: { paddingHorizontal: 15, marginBottom: 20, marginTop: 15 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 14, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  cardDetail: { fontSize: 12, color: '#666' },
  upgradeButton: { backgroundColor: '#F39C12', flexDirection: 'row', padding: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  upgradeText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  menuItem: { backgroundColor: '#fff', padding: 15, marginBottom: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', elevation: 1 },
  menuText: { flex: 1, marginLeft: 12, fontSize: 14, color: '#333', fontWeight: '500' },
  logoutButton: { backgroundColor: '#E74C3C', margin: 15, padding: 14, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  logoutText: { color: '#fff', fontWeight: 'bold', marginLeft: 8, fontSize: 15 }
});