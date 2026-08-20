import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';

const API_URL = 'http://your-backend-url:5000/api';

export default function HomeScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products?limit=5`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="leaf" size={24} color="#27AE60" />
        <Text style={styles.headerText}>Welcome to Horumar</Text>
      </View>
      
      <Text style={styles.subtitle}>Featured Products</Text>
      
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <View style={styles.productHeader}>
              <Text style={styles.productName}>{item.name}</Text>
              {item.rating > 0 && (
                <View style={styles.rating}>
                  <MaterialCommunityIcons name="star" size={14} color="#F39C12" />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
              )}
            </View>
            <Text style={styles.productPrice}>KES {item.price}/{item.unit}</Text>
            <Text style={styles.productLocation}>
              <MaterialCommunityIcons name="map-marker" size={12} color="#777" /> {item.location}
            </Text>
            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.viewText}>View Details</Text>
            </TouchableOpacity>
          </View>
        )}
        onRefresh={fetchProducts}
        refreshing={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerText: { fontSize: 22, fontWeight: 'bold', marginLeft: 8, color: '#27AE60' },
  subtitle: { fontSize: 16, fontWeight: '600', marginBottom: 15, color: '#333' },
  productCard: { backgroundColor: '#fff', padding: 15, marginBottom: 12, borderRadius: 10, elevation: 2 },
  productHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  productName: { fontSize: 15, fontWeight: 'bold', color: '#333', flex: 1 },
  rating: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3E0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  ratingText: { marginLeft: 4, fontSize: 12, color: '#F39C12', fontWeight: 'bold' },
  productPrice: { fontSize: 16, color: '#27AE60', fontWeight: 'bold', marginBottom: 4 },
  productLocation: { fontSize: 12, color: '#777', marginBottom: 10 },
  viewButton: { backgroundColor: '#27AE60', padding: 10, borderRadius: 6, marginTop: 8 },
  viewText: { color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 14 }
});