import React, { useState } from 'react';
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
import { router } from 'expo-router';
import { useUserStore } from '@/lib/store/userStore';
import { upsertProfile } from '@/lib/services/auth/profile';
import { Picker } from '@/components/Picker';
import { COUNTRIES } from '@/lib/constants/countries';
import { LANGUAGES } from '@/lib/constants/languages';

export default function ProfileSetupScreen() {
  const { user, setUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [details, setDetails] = useState({
    age: user?.age?.toString() || '',
    gender: user?.gender || '',
    nationality: user?.nationality || '',
    language: user?.language || '',
  });

  const handleSubmit = async () => {
    if (!user) return;

    // Validate required fields
    if (!details.age || !details.gender || !details.nationality || !details.language) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Validate age
    const age = parseInt(details.age);
    if (isNaN(age) || age < 13 || age > 120) {
      Alert.alert('Error', 'Please enter a valid age between 13 and 120');
      return;
    }

    setIsLoading(true);

    try {
      const updatedProfile = await upsertProfile({
        ...user,
        age,
        gender: details.gender,
        nationality: details.nationality,
        language: details.language,
      });

      setUser(updatedProfile);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const genderOptions = [
    { label: 'Select gender', value: '' },
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
    { label: 'Prefer not to say', value: 'prefer-not-to-say' },
  ];

  const countryOptions = [
    { label: 'Select nationality', value: '' },
    ...COUNTRIES.map(country => ({
      label: country.name,
      value: country.code,
    })),
  ];

  const languageOptions = [
    { label: 'Select language', value: '' },
    ...LANGUAGES.map(language => ({
      label: language.name,
      value: language.code,
    })),
  ];

  const ageOptions = [
    { label: 'Select age', value: '' },
    ...Array.from({ length: 108 }, (_, i) => ({
      label: (i + 13).toString(),
      value: (i + 13).toString(),
    })),
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>Please provide some additional information to personalize your experience.</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Age</Text>
            <Picker
              selectedValue={details.age}
              onValueChange={(value) => setDetails({ ...details, age: value })}
              items={ageOptions}
              placeholder="Select your age"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Gender</Text>
            <Picker
              selectedValue={details.gender}
              onValueChange={(value) => setDetails({ ...details, gender: value })}
              items={genderOptions}
              placeholder="Select your gender"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nationality</Text>
            <Picker
              selectedValue={details.nationality}
              onValueChange={(value) => setDetails({ ...details, nationality: value })}
              items={countryOptions}
              placeholder="Select your nationality"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Preferred Language</Text>
            <Picker
              selectedValue={details.language}
              onValueChange={(value) => setDetails({ ...details, language: value })}
              items={languageOptions}
              placeholder="Select your language"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Continue to Preferences</Text>
            )}
          </TouchableOpacity>
        </View>
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
    alignItems: 'center',
    marginVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#a5b4fc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});