import type { UserProfile } from '../../../types';
import type { DbUserProfile, ProfileTransformer } from './types';

export const profileTransformer: ProfileTransformer = {
  toDbProfile(profile: Partial<UserProfile>): Partial<DbUserProfile> {
    // Create the initial profile with all fields
    const dbProfile: Partial<DbUserProfile> = {
      id: profile.id,
      email: profile.email,
      given_name: profile.given_name ?? null,
      family_name: profile.family_name ?? null,
      picture: profile.picture ?? null,
      age: profile.age ?? null,
      gender: profile.gender ?? null,
      nationality: profile.nationality ?? null,
      language: profile.language ?? null,
      locale: profile.locale ?? null,
      email_verified: profile.email_verified ?? false,
      timezone: profile.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      last_login: new Date().toISOString()
    };

    // Remove undefined values and ensure proper null handling
    return Object.entries(dbProfile).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Partial<DbUserProfile>);
  },

  fromDbProfile(dbProfile: DbUserProfile): UserProfile {
    return {
      id: dbProfile.id,
      email: dbProfile.email,
      given_name: dbProfile.given_name ?? undefined,
      family_name: dbProfile.family_name ?? undefined,
      picture: dbProfile.picture ?? undefined,
      age: dbProfile.age ?? undefined,
      gender: dbProfile.gender ?? undefined,
      nationality: dbProfile.nationality ?? undefined,
      language: dbProfile.language ?? undefined,
      locale: dbProfile.locale ?? undefined,
      email_verified: dbProfile.email_verified,
      timezone: dbProfile.timezone ?? undefined,
      last_login: dbProfile.last_login ?? undefined
    };
  }
};