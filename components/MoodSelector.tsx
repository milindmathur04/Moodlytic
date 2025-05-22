import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Smile, Heart, Coffee, Frown, Activity, Battery, Zap, Edit3, AlertTriangle, Sun, Clock, Shuffle } from 'lucide-react-native';
import type { Mood } from '@/lib/types';

interface MoodSelectorProps {
  selectedMood: Mood | null;
  onMoodSelect: (mood: Mood) => void;
  disabled?: boolean;
}

const moods: { type: Mood; icon: React.ReactNode; label: string; color: string; bgColor: string }[] = [
  { 
    type: 'happy', 
    icon: <Smile size={24} color="#d97706" />, 
    label: 'Happy',
    color: '#d97706',
    bgColor: '#fef3c7'
  },
  { 
    type: 'excited', 
    icon: <Heart size={24} color="#db2777" />, 
    label: 'Excited',
    color: '#db2777',
    bgColor: '#fce7f3'
  },
  { 
    type: 'peaceful', 
    icon: <Coffee size={24} color="#0284c7" />, 
    label: 'Peaceful',
    color: '#0284c7',
    bgColor: '#e0f2fe'
  },
  { 
    type: 'sad', 
    icon: <Frown size={24} color="#2563eb" />, 
    label: 'Sad',
    color: '#2563eb',
    bgColor: '#dbeafe'
  },
  { 
    type: 'anxious', 
    icon: <Activity size={24} color="#7c3aed" />, 
    label: 'Anxious',
    color: '#7c3aed',
    bgColor: '#ede9fe'
  },
  { 
    type: 'tired', 
    icon: <Battery size={24} color="#4b5563" />, 
    label: 'Tired',
    color: '#4b5563',
    bgColor: '#f3f4f6'
  },
  { 
    type: 'energetic', 
    icon: <Zap size={24} color="#ea580c" />, 
    label: 'Energetic',
    color: '#ea580c',
    bgColor: '#ffedd5'
  },
  { 
    type: 'creative', 
    icon: <Edit3 size={24} color="#4f46e5" />, 
    label: 'Creative',
    color: '#4f46e5',
    bgColor: '#e0e7ff'
  },
  { 
    type: 'stressed', 
    icon: <AlertTriangle size={24} color="#dc2626" />, 
    label: 'Stressed',
    color: '#dc2626',
    bgColor: '#fee2e2'
  },
  { 
    type: 'relaxed', 
    icon: <Sun size={24} color="#16a34a" />, 
    label: 'Relaxed',
    color: '#16a34a',
    bgColor: '#dcfce7'
  },
  { 
    type: 'bored', 
    icon: <Clock size={24} color="#b45309" />, 
    label: 'Bored',
    color: '#b45309',
    bgColor: '#fef3c7'
  },
  { 
    type: 'surprise', 
    icon: <Shuffle size={24} color="#6366f1" />, 
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
            {icon}
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