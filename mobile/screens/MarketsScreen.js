import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';

const API_URL = 'http://your-backend-url:5000/api';

export default function MarketsScreen() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState(null);

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    try {
      const response = await axios.get(`${API_URL}/market-sections`);
      setMarkets(response.data);
    } catch (error) {
      console.error('Error fetching markets:', error);
    } finally {
      setLoading(false);
    }
  };

  const marketIcons = {
    'Eastleigh CBD': 'store-24-hour',
    'Westlands': 'shopping-center',
    'Nakumatt': 'warehouse',
    'Sarit Center': 'mall',
    'Other': 'map-marker'
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏪 Market Sections</Text>
      <Text style={styles.subtitle}>Browse by market location</Text>

      <FlatList
        data={markets}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.marketCard}>
            <View style={styles.marketIcon}>
              <MaterialCommunityIcons 
                name={marketIcons[item.category] || 'store'} 
                size={24} 
                color="#27AE60" 
              />
            </View>
            <View style={styles.marketInfo}>
              <Text style={styles.marketName}>{item.name}</Text>
              <Text style={styles.marketLocation}>{item.location}</Text>
              <Text style={styles.merchantCount}>{item.merchants?.length || 0} merchants</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
          </TouchableOpacity>
        )}
        onRefresh={fetchMarkets}
        refreshing={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 5, color: '#333' },
  subtitle: { fontSize: 12, color: '#999', marginBottom: 15 },
  marketCard: { backgroundColor: '#fff', padding: 15, marginBottom: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', elevation: 1 },
  marketIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  marketInfo: { flex: 1 },
  marketName: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  marketLocation: { fontSize: 12, color: '#666', marginBottom: 4 },
  merchantCount: { fontSize: 11, color: '#27AE60', fontWeight: '600' }
});
