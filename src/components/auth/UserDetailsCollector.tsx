import React, { useState, useCallback } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { COUNTRIES } from '../../constants/countries';
import { LANGUAGES } from '../../constants/languages';
import type { UserProfile } from '../../types';

interface UserDetailsCollectorProps {
  onSubmit: (details: Partial<UserProfile>) => Promise<void>;
}

export function UserDetailsCollector({ onSubmit }: UserDetailsCollectorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState({
    age: '',
    gender: '',
    nationality: '',
    language: ''
  });

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!details.age || !details.gender || !details.nationality || !details.language) {
        throw new Error('Please fill in all required fields');
      }

      // Validate age
      const age = parseInt(details.age);
      if (isNaN(age) || age < 13 || age > 120) {
        throw new Error('Please enter a valid age between 13 and 120');
      }

      // Call onSubmit with validated data
      await onSubmit({
        age,
        gender: details.gender,
        nationality: details.nationality,
        language: details.language
      });
    } catch (err) {
      console.error('Failed to submit user details:', err);
      setError(err instanceof Error ? err.message : 'Failed to save details');
    } finally {
      setIsSubmitting(false);
    }
  }, [details, isSubmitting, onSubmit]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setDetails(prev => ({ ...prev, [field]: value }));
    setError(null); // Clear error when user makes changes
  }, []);

  return (
    <Card className="max-w-md mx-auto p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">
          Complete Your Profile
        </h2>
        <p className="text-gray-600 mt-2">
          Help us personalize your recommendations
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Age"
          type="number"
          value={details.age}
          onChange={(e) => handleInputChange('age', e.target.value)}
          min="13"
          max="120"
          required
          disabled={isSubmitting}
        />

        <Select
          label="Gender"
          value={details.gender}
          onChange={(e) => handleInputChange('gender', e.target.value)}
          required
          disabled={isSubmitting}
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer-not-to-say">Prefer not to say</option>
        </Select>

        <Select
          label="Nationality"
          value={details.nationality}
          onChange={(e) => handleInputChange('nationality', e.target.value)}
          required
          disabled={isSubmitting}
        >
          <option value="">Select nationality</option>
          {COUNTRIES.map(country => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </Select>

        <Select
          label="Preferred Language"
          value={details.language}
          onChange={(e) => handleInputChange('language', e.target.value)}
          required
          disabled={isSubmitting}
        >
          <option value="">Select language</option>
          {LANGUAGES.map(language => (
            <option key={language.code} value={language.code}>
              {language.name}
            </option>
          ))}
        </Select>

        <Button
          type="submit"
          fullWidth
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Continue to Preferences
        </Button>
      </form>
    </Card>
  );
}