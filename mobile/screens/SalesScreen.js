import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';

const API_URL = 'http://your-backend-url:5000/api';

export default function SalesScreen() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(null);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await axios.get(`${API_URL}/sales`);
      setSales(response.data);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = selectedType 
    ? sales.filter(s => s.type === selectedType)
    : sales;

  const getSaleTypeColor = (type) => {
    const colors = {
      regular: '#3498DB',
      live: '#E74C3C',
      flash: '#F39C12'
    };
    return colors[type] || '#999';
  };

  const getSaleTypeIcon = (type) => {
    const icons = {
      regular: 'tag',
      live: 'fire',
      flash: 'lightning-bolt'
    };
    return icons[type] || 'tag';
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        {['regular', 'live', 'flash'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.filterButton, selectedType === type && styles.filterButtonActive]}
            onPress={() => setSelectedType(selectedType === type ? null : type)}
          >
            <MaterialCommunityIcons 
              name={getSaleTypeIcon(type)} 
              size={16} 
              color={selectedType === type ? '#fff' : getSaleTypeColor(type)}
            />
            <Text style={[styles.filterText, selectedType === type && styles.filterTextActive]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredSales}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const discount = item.discount || Math.round(((item.originalPrice - item.salePrice) / item.originalPrice) * 100);
          return (
            <View style={styles.saleCard}>
              <View style={styles.saleHeader}>
                <View style={[styles.saleBadge, { backgroundColor: getSaleTypeColor(item.type) }]}>
                  <MaterialCommunityIcons 
                    name={getSaleTypeIcon(item.type)} 
                    size={14} 
                    color="#fff"
                  />
                  <Text style={styles.saleTypeText}>{item.type.toUpperCase()}</Text>
                </View>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>-{discount}%</Text>
                </View>
              </View>
              
              <Text style={styles.saleTitle}>{item.title}</Text>
              
              <View style={styles.priceContainer}>
                <Text style={styles.originalPrice}>KES {item.originalPrice}</Text>
                <Text style={styles.salePrice}>KES {item.salePrice}</Text>
              </View>
              
              <Text style={styles.merchant}>{item.merchant.name}</Text>
              <Text style={styles.quantity}>Stock: {item.quantity} {item.product?.name}</Text>
              
              <TouchableOpacity style={styles.buyButton}>
                <MaterialCommunityIcons name="shopping-cart" size={16} color="#fff" />
                <Text style={styles.buyText}>Buy Now</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        onRefresh={fetchSales}
        refreshing={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5' },
  filterContainer: { flexDirection: 'row', marginBottom: 15, justifyContent: 'space-around' },
  filterButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  filterButtonActive: { backgroundColor: '#27AE60', borderColor: '#27AE60' },
  filterText: { marginLeft: 6, fontSize: 12, fontWeight: '500', color: '#666' },
  filterTextActive: { color: '#fff' },
  saleCard: { backgroundColor: '#fff', padding: 15, marginBottom: 10, borderRadius: 8, elevation: 2 },
  saleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  saleBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  saleTypeText: { color: '#fff', fontSize: 11, fontWeight: 'bold', marginLeft: 4 },
  discountBadge: { backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4 },
  discountText: { color: '#27AE60', fontSize: 12, fontWeight: 'bold' },
  saleTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  priceContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  originalPrice: { fontSize: 13, color: '#999', textDecorationLine: 'line-through', marginRight: 10 },
  salePrice: { fontSize: 16, color: '#27AE60', fontWeight: 'bold' },
  merchant: { fontSize: 12, color: '#666', marginBottom: 4 },
  quantity: { fontSize: 12, color: '#999', marginBottom: 10 },
  buyButton: { backgroundColor: '#27AE60', flexDirection: 'row', padding: 10, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  buyText: { color: '#fff', fontWeight: 'bold', marginLeft: 6 }
});