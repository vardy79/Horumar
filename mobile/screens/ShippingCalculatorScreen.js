import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Picker, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';

const API_URL = 'http://your-backend-url:5000/api';

export default function ShippingCalculatorScreen() {
  const [region, setRegion] = useState('Nairobi');
  const [weight, setWeight] = useState('1');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const regions = ['Nairobi', 'Kenya', 'Somalia', 'International'];

  const calculateShipping = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/shipping-zones/calculate`, {
        region,
        weight: parseFloat(weight)
      });
      setResult(response.data);
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRegionIcon = (r) => {
    const icons = { 'Nairobi': 'map-marker', 'Kenya': 'map', 'Somalia': 'globe', 'International': 'airplane' };
    return icons[r] || 'map';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="truck" size={24} color="#27AE60" />
        <Text style={styles.headerText}>Shipping Calculator</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>🌍 Select Region</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={region} onValueChange={setRegion}>
            {regions.map((r) => <Picker.Item key={r} label={r} value={r} />)}
          </Picker>
        </View>

        <Text style={styles.label}>⚖️ Weight (kg)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter weight in kg"
          keyboardType="decimal-pad"
          value={weight}
          onChangeText={setWeight}
        />

        <TouchableOpacity 
          style={[styles.calculateBtn, loading && styles.buttonDisabled]}
          onPress={calculateShipping}
          disabled={loading}
        >
          <MaterialCommunityIcons name="calculator" size={18} color="#fff" />
          <Text style={styles.calculateText}>{loading ? 'Calculating...' : 'Calculate Cost'}</Text>
        </TouchableOpacity>
      </View>

      {result && (
        <View style={styles.resultCard}>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Base Fee:</Text>
            <Text style={styles.resultValue}>KES {result.baseFee}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Weight Fee:</Text>
            <Text style={styles.resultValue}>KES {result.weightFee.toFixed(2)}</Text>
          </View>
          <View style={styles.resultDivider} />
          <View style={styles.resultRow}>
            <Text style={styles.resultLabelTotal}>TOTAL COST:</Text>
            <Text style={styles.resultValueTotal}>KES {result.totalCost.toFixed(2)}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Est. Days:</Text>
            <Text style={styles.resultValue}>{result.estimatedDays} days</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerText: { fontSize: 20, fontWeight: 'bold', marginLeft: 8, color: '#27AE60' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, elevation: 1 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' },
  pickerContainer: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, marginBottom: 15, overflow: 'hidden' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 6, marginBottom: 15, fontSize: 16 },
  calculateBtn: { backgroundColor: '#27AE60', flexDirection: 'row', padding: 12, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  calculateText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  resultCard: { backgroundColor: '#fff', padding: 15, borderRadius: 8, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#27AE60' },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  resultLabel: { fontSize: 13, color: '#666' },
  resultValue: { fontSize: 13, fontWeight: '600', color: '#333' },
  resultLabelTotal: { fontSize: 14, fontWeight: 'bold', color: '#27AE60' },
  resultValueTotal: { fontSize: 18, fontWeight: 'bold', color: '#27AE60' },
  resultDivider: { height: 1, backgroundColor: '#eee', marginVertical: 8 }
});
