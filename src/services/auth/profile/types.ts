import type { UserProfile } from '../../../types';

export interface ProfileRepository {
  getProfile(userId: string): Promise<UserProfile | null>;
  upsertProfile(profile: Partial<UserProfile>): Promise<UserProfile>;
}

export interface ProfileTransformer {
  toDbProfile(profile: Partial<UserProfile>): Partial<DbUserProfile>;
  fromDbProfile(dbProfile: DbUserProfile): UserProfile;
}

export interface DbUserProfile {
  id: string;
  email: string;
  given_name: string | null;
  family_name: string | null;
  picture: string | null;
  age: number | null;
  gender: string | null;
  nationality: string | null;
  language: string | null;
  locale: string | null;
  email_verified: boolean;
  timezone: string | null;
  last_login: string | null;
  created_at?: string;
  updated_at?: string;
}