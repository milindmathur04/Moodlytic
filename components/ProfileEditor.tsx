import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useUserStore } from '@/lib/store/userStore';
import { upsertProfile } from '@/lib/services/auth/profile';
import { Picker } from './Picker';
import { COUNTRIES } from '@/lib/constants/countries';
import { LANGUAGES } from '@/lib/constants/languages';

interface ProfileEditorProps {
  onClose: () => void;
  isRequired?: boolean;
}

export function ProfileEditor({ onClose, isRequired = false }: ProfileEditorProps) {
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
    if (isRequired) {
      if (!details.age || !details.gender || !details.nationality || !details.language) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }
    }

    setIsLoading(true);

    try {
      const updatedProfile = await upsertProfile({
        ...user,
        age: details.age ? parseInt(details.age) : undefined,
        gender: details.gender || undefined,
        nationality: details.nationality || undefined,
        language: details.language || undefined,
      });

      setUser(updatedProfile);
      onClose();
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
    <View style={styles.container}>
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

      <View style={styles.buttonContainer}>
        {!isRequired && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[
            styles.submitButton,
            isLoading && styles.buttonDisabled,
            !isRequired ? { flex: 1 } : { width: '100%' }
          ]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isRequired ? 'Complete Profile' : 'Save Changes'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
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
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#4b5563',
    fontWeight: '500',
    fontSize: 16,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginLeft: 8,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});