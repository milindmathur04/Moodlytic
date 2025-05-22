import React, { useState } from 'react';
import { useUserStore } from '../../store/userStore';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { COUNTRIES } from '../../constants/countries';
import { LANGUAGES } from '../../constants/languages';
import { upsertProfile } from '../../services/auth/profile';
import { uploadAvatar } from '../../services/auth/auth';
import { AvatarSelector } from './AvatarSelector';
import type { UserProfile } from '../../types';
import { cn } from '../../lib/utils';

interface ProfileEditorProps {
  onClose: () => void;
  isRequired?: boolean;
}

interface EditableFields {
  age?: number;
  gender?: string;
  nationality?: string;
  language?: string;
  picture?: string;
}

export function ProfileEditor({ onClose, isRequired = false }: ProfileEditorProps) {
  const { user, setUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<EditableFields>({
    age: user?.age,
    gender: user?.gender,
    nationality: user?.nationality,
    language: user?.language,
    picture: user?.picture,
  });

  const handleAvatarSelect = (url: string) => {
    setFields(prev => ({ ...prev, picture: url }));
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const url = await uploadAvatar(file, user.id);
      setFields(prev => ({ ...prev, picture: url }));
    } catch (err) {
      setError('Failed to upload avatar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate required fields
    if (isRequired) {
      if (!fields.age || !fields.gender || !fields.nationality || !fields.language) {
        setError('Please fill in all required fields');
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const updatedProfile = await upsertProfile({
        ...user,
        ...fields
      });
      setUser(updatedProfile);
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <AvatarSelector
        selectedAvatar={fields.picture || null}
        onSelect={handleAvatarSelect}
        onFileUpload={handleAvatarUpload}
      />

      <Input
        label="Age"
        type="number"
        value={fields.age || ''}
        onChange={(e) => setFields({ ...fields, age: parseInt(e.target.value) || undefined })}
        min="13"
        max="120"
        required={isRequired}
        disabled={isLoading}
      />
      
      <Select
        label="Gender"
        value={fields.gender || ''}
        onChange={(e) => setFields({ ...fields, gender: e.target.value })}
        required={isRequired}
        disabled={isLoading}
      >
        <option value="">Select gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
        <option value="prefer-not-to-say">Prefer not to say</option>
      </Select>

      <Select
        label="Nationality"
        value={fields.nationality || ''}
        onChange={(e) => setFields({ ...fields, nationality: e.target.value })}
        required={isRequired}
        disabled={isLoading}
      >
        <option value="">Select nationality</option>
        {COUNTRIES.map(country => (
          <option key={country.code} value={country.code}>
            {country.name}
          </option>
        ))}
      </Select>

      <Select
        label="Language"
        value={fields.language || ''}
        onChange={(e) => setFields({ ...fields, language: e.target.value })}
        required={isRequired}
        disabled={isLoading}
      >
        <option value="">Select language</option>
        {LANGUAGES.map(language => (
          <option key={language.code} value={language.code}>
            {language.name}
          </option>
        ))}
      </Select>

      <div className="flex gap-3 pt-2">
        {!isRequired && (
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className={cn(
              "flex-1 h-[50px] rounded-xl font-medium transition-all duration-200",
              "bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "flex-1 h-[50px] rounded-xl font-medium transition-all duration-200",
            "bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600",
            "text-white shadow-lg hover:shadow-xl hover:scale-[1.02]",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
            "relative overflow-hidden"
          )}
        >
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            isRequired ? "Complete Profile" : "Save Changes"
          )}
        </button>
      </div>
    </form>
  );
}