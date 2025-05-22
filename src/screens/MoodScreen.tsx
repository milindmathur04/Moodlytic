import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../store/userStore';
import { MoodSelector } from '../components/MoodSelector';
import { BudgetSlider } from '../components/BudgetSlider';
import { RecommendationCard } from '../components/RecommendationCard';
import { LocationPermission } from '../components/LocationPermission';
import { useRecommendations } from '../hooks/useRecommendations';
import { useLocation } from '../hooks/useLocation';
import { Feather } from '@expo/vector-icons';
import type { Mood } from '../types';

export default function MoodScreen() {
  const { user } = useUserStore();
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [budget, setBudget] = useState(50);
  const { recommendation, error, isLoading, fetchRecommendation } = useRecommendations();
  const { 
    needsLocation, 
    isLoading: locationLoading, 
    error: locationError, 
    handleLocationSubmit,
    handleManualLocation 
  } = useLocation();

  useEffect(() => {
    if (!user?.location) {
      handleLocationSubmit();
    }
  }, [user?.location, handleLocationSubmit]);

  const handleMoodSelect = async (mood: Mood) => {
    if (!user?.location) {
      await handleLocationSubmit();
      if (!user?.location) return;
    }
    
    setSelectedMood(mood);
    
    if (user) {
      try {
        await fetchRecommendation(mood, user, budget);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Hello, {user?.given_name || user?.email?.split('@')[0] || 'there'}
          </Text>
          <Text style={styles.title}>How are you feeling today?</Text>
        </View>

        {needsLocation && (
          <LocationPermission
            onRequestLocation={handleLocationSubmit}
            onManualLocation={handleManualLocation}
            isLoading={locationLoading}
            error={locationError}
          />
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Set Your Budget</Text>
          <BudgetSlider value={budget} onChange={setBudget} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Your Mood</Text>
          <MoodSelector
            selectedMood={selectedMood}
            onMoodSelect={handleMoodSelect}
            disabled={isLoading || locationLoading}
          />
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>Finding the perfect recommendations...</Text>
          </View>
        )}

        {recommendation && selectedMood && user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Recommendations</Text>
            <RecommendationCard
              recommendation={recommendation}
              mood={selectedMood}
              userId={user.id}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
});