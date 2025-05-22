import React, { useState } from 'react';
import { cn } from '../lib/utils';

interface UserDetailsFormProps {
  onSubmit: (details: {
    age?: number;
    gender?: string;
    language?: string;
    nationality?: string;
  }) => void;
}

export function UserDetailsForm({ onSubmit }: UserDetailsFormProps) {
  const [details, setDetails] = useState({
    age: '',
    gender: '',
    language: '',
    nationality: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      age: details.age ? parseInt(details.age, 10) : undefined,
      gender: details.gender || undefined,
      language: details.language || undefined,
      nationality: details.nationality || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto">
      <div>
        <label htmlFor="age" className="block text-sm font-medium text-gray-700">
          Age
        </label>
        <input
          type="number"
          id="age"
          value={details.age}
          onChange={(e) => setDetails({ ...details, age: e.target.value })}
          className={cn(
            'mt-1 block w-full rounded-md border-gray-300 shadow-sm',
            'focus:border-blue-500 focus:ring-blue-500'
          )}
        />
      </div>

      <div>
        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
          Gender
        </label>
        <select
          id="gender"
          value={details.gender}
          onChange={(e) => setDetails({ ...details, gender: e.target.value })}
          className={cn(
            'mt-1 block w-full rounded-md border-gray-300 shadow-sm',
            'focus:border-blue-500 focus:ring-blue-500'
          )}
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer-not-to-say">Prefer not to say</option>
        </select>
      </div>

      <div>
        <label htmlFor="language" className="block text-sm font-medium text-gray-700">
          Preferred Language
        </label>
        <input
          type="text"
          id="language"
          value={details.language}
          onChange={(e) => setDetails({ ...details, language: e.target.value })}
          className={cn(
            'mt-1 block w-full rounded-md border-gray-300 shadow-sm',
            'focus:border-blue-500 focus:ring-blue-500'
          )}
        />
      </div>

      <div>
        <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">
          Nationality
        </label>
        <input
          type="text"
          id="nationality"
          value={details.nationality}
          onChange={(e) => setDetails({ ...details, nationality: e.target.value })}
          className={cn(
            'mt-1 block w-full rounded-md border-gray-300 shadow-sm',
            'focus:border-blue-500 focus:ring-blue-500'
          )}
        />
      </div>

      <button
        type="submit"
        className={cn(
          'w-full px-4 py-2 rounded-md bg-blue-500 text-white',
          'hover:bg-blue-600 transition-colors'
        )}
      >
        Save Details
      </button>
    </form>
  );
}