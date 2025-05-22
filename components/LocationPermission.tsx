import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { MapPin } from 'lucide-react-native';

interface LocationPermissionProps {
  onRequestLocation: () => Promise<void>;
  onManualLocation: (city: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function LocationPermission({
  onRequestLocation,
  onManualLocation,
  isLoading,
  error,
}: LocationPermissionProps) {
  const [city, setCity] = useState('');

  const handleManualSubmit = () => {
    if (city.trim()) {
      onManualLocation(city.trim());
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MapPin size={24} color="#6366f1" />
        <View style={styles.headerText}>
          <Text style={styles.title}>Location Access</Text>
          <Text style={styles.subtitle}>
            To provide personalized recommendations and find events near you, we need your location.
          </Text>
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubtext}>
            Don't worry! You can still use the app by manually entering your city below.
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={onRequestLocation}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Share Location</Text>
        )}
      </TouchableOpacity>

      {error && (
        <>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter your city"
              value={city}
              onChangeText={setCity}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[styles.submitButton, (!city.trim() || isLoading) && styles.buttonDisabled]}
              onPress={handleManualSubmit}
              disabled={!city.trim() || isLoading}
            >
              <MapPin size={20} color="white" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#b91c1c',
    marginBottom: 4,
  },
  errorSubtext: {
    fontSize: 12,
    color: '#ef4444',
  },
  button: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#6b7280',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 12,
  },
});