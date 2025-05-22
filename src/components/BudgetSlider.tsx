import React from 'react';
import { View, Text, StyleSheet, Slider } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface BudgetSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function BudgetSlider({ value, onChange }: BudgetSliderProps) {
  const formatBudget = (amount: number) => {
    if (amount === 0) return 'Any budget';
    return `$${amount}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Feather name="dollar-sign" size={20} color="#6b7280" />
        <Text style={styles.title}>Your Budget</Text>
      </View>
      
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={200}
          step={10}
          value={value}
          onValueChange={onChange}
          minimumTrackTintColor="#6366f1"
          maximumTrackTintColor="#e5e7eb"
          thumbTintColor="#6366f1"
        />
        
        <View style={styles.labels}>
          <Text style={styles.labelText}>Any budget</Text>
          <Text style={styles.labelText}>$200+</Text>
        </View>

        <View style={styles.valueContainer}>
          <Text style={styles.valueText}>
            {formatBudget(value)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  sliderContainer: {
    marginTop: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  labelText: {
    fontSize: 12,
    color: '#6b7280',
  },
  valueContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  valueText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
});