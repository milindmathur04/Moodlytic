import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { Mood } from '../types';

interface MoodSelectorProps {
  selectedMood: Mood | null;
  onMoodSelect: (mood: Mood) => void;
  disabled?: boolean;
}

const moods: { type: Mood; icon: string; label: string; color: string; bgColor: string }[] = [
  { 
    type: 'happy', 
    icon: 'smile', 
    label: 'Happy',
    color: '#d97706',
    bgColor: '#fef3c7'
  },
  { 
    type: 'excited', 
    icon: 'heart', 
    label: 'Excited',
    color: '#db2777',
    bgColor: '#fce7f3'
  },
  { 
    type: 'peaceful', 
    icon: 'coffee', 
    label: 'Peaceful',
    color: '#0284c7',
    bgColor: '#e0f2fe'
  },
  { 
    type: 'sad', 
    icon: 'frown', 
    label: 'Sad',
    color: '#2563eb',
    bgColor: '#dbeafe'
  },
  { 
    type: 'anxious', 
    icon: 'activity', 
    label: 'Anxious',
    color: '#7c3aed',
    bgColor: '#ede9fe'
  },
  { 
    type: 'tired', 
    icon: 'battery', 
    label: 'Tired',
    color: '#4b5563',
    bgColor: '#f3f4f6'
  },
  { 
    type: 'energetic', 
    icon: 'zap', 
    label: 'Energetic',
    color: '#ea580c',
    bgColor: '#ffedd5'
  },
  { 
    type: 'creative', 
    icon: 'edit-3', 
    label: 'Creative',
    color: '#4f46e5',
    bgColor: '#e0e7ff'
  },
  { 
    type: 'stressed', 
    icon: 'alert-triangle', 
    label: 'Stressed',
    color: '#dc2626',
    bgColor: '#fee2e2'
  },
  { 
    type: 'relaxed', 
    icon: 'sun', 
    label: 'Relaxed',
    color: '#16a34a',
    bgColor: '#dcfce7'
  },
  { 
    type: 'bored', 
    icon: 'clock', 
    label: 'Bored',
    color: '#b45309',
    bgColor: '#fef3c7'
  },
  { 
    type: 'surprise', 
    icon: 'shuffle', 
    label: 'Surprise Me!',
    color: '#6366f1',
    bgColor: '#e0e7ff'
  },
];

export function MoodSelector({ selectedMood, onMoodSelect, disabled }: MoodSelectorProps) {
  return (
    <ScrollView 
      horizontal={false} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <View style={styles.grid}>
        {moods.map(({ type, icon, label, color, bgColor }) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.moodButton,
              { backgroundColor: bgColor },
              selectedMood === type && styles.selectedButton,
              selectedMood === type && { borderColor: color },
              type === 'surprise' && styles.surpriseButton,
              disabled && styles.disabledButton
            ]}
            onPress={() => onMoodSelect(type)}
            disabled={disabled}
          >
            <Feather 
              name={icon as any} 
              size={24} 
              color={selectedMood === type ? color : '#6b7280'} 
            />
            <Text 
              style={[
                styles.moodLabel,
                selectedMood === type && { color }
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodButton: {
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedButton: {
    borderWidth: 2,
    transform: [{ scale: 1.05 }],
  },
  surpriseButton: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  moodLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  disabledButton: {
    opacity: 0.5,
  },
});