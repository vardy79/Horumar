import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';

const API_URL = 'http://your-backend-url:5000/api';

export default function BrowseScreen() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchText, selectedCategory]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchText) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchText.toLowerCase()) ||
        p.category.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
      </View>

      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.categoryTag, selectedCategory === item && styles.categoryTagActive]}
            onPress={() => setSelectedCategory(selectedCategory === item ? null : item)}
          >
            <Text style={[styles.categoryTagText, selectedCategory === item && styles.categoryTagTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
        style={styles.categoriesList}
      />

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>KES {item.price}/{item.unit}</Text>
              <Text style={styles.productCategory}>{item.category}</Text>
            </View>
            <TouchableOpacity style={styles.addButton}>
              <MaterialCommunityIcons name="plus" size={20} color="#fff" />
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
  container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 12, borderRadius: 8, marginBottom: 15, elevation: 1 },
  searchInput: { flex: 1, paddingVertical: 10, paddingLeft: 8, fontSize: 16 },
  categoriesList: { marginBottom: 10, maxHeight: 50 },
  categoryTag: { marginHorizontal: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  categoryTagActive: { backgroundColor: '#27AE60', borderColor: '#27AE60' },
  categoryTagText: { color: '#666', fontSize: 12, fontWeight: '500' },
  categoryTagTextActive: { color: '#fff' },
  productCard: { backgroundColor: '#fff', padding: 15, marginBottom: 10, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
  productInfo: { flex: 1 },
  productName: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  productPrice: { fontSize: 14, color: '#27AE60', fontWeight: '600', marginBottom: 2 },
  productCategory: { fontSize: 12, color: '#999' },
  addButton: { backgroundColor: '#27AE60', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }
});