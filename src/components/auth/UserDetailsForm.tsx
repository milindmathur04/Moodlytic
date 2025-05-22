import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { COUNTRIES } from '../../constants/countries';
import { LANGUAGES } from '../../constants/languages';
import type { UserProfile } from '../../types';

interface UserDetailsFormProps {
  initialData?: Partial<UserProfile>;
  onSubmit: (details: Partial<UserProfile>) => Promise<void>;
}

export function UserDetailsForm({ initialData, onSubmit }: UserDetailsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [details, setDetails] = useState({
    age: initialData?.age?.toString() || '',
    gender: initialData?.gender || '',
    nationality: initialData?.nationality || '',
    language: initialData?.language || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        age: details.age ? parseInt(details.age) : undefined,
        gender: details.gender || undefined,
        nationality: details.nationality || undefined,
        language: details.language || undefined
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Age"
          type="number"
          value={details.age}
          onChange={(e) => setDetails({ ...details, age: e.target.value })}
          min="13"
          max="120"
          required
        />

        <Select
          label="Gender"
          value={details.gender}
          onChange={(e) => setDetails({ ...details, gender: e.target.value })}
          required
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
          onChange={(e) => setDetails({ ...details, nationality: e.target.value })}
          required
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
          onChange={(e) => setDetails({ ...details, language: e.target.value })}
          required
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
        >
          Continue
        </Button>
      </form>
    </Card>
  );
}