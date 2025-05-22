import axios from 'axios';
import type { UserProfile } from '../../types';

interface GoogleUserInfo {
  sub: string;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email: string;
  email_verified?: boolean;
  locale?: string;
  hd?: string; // Hosted domain (for Google Workspace users)
}

export async function fetchEnhancedGoogleProfile(accessToken: string): Promise<Partial<UserProfile>> {
  try {
    const { data: userInfo } = await axios.get<GoogleUserInfo>(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    // Get user's timezone based on browser
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return {
      id: userInfo.sub,
      name: userInfo.name,
      email: userInfo.email,
      picture: userInfo.picture,
      given_name: userInfo.given_name,
      family_name: userInfo.family_name,
      language: userInfo.locale?.split('-')[0], // Primary language code
      locale: userInfo.locale,
      email_verified: userInfo.email_verified,
      timezone,
      last_login: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching Google profile:', error);
    throw error;
  }
}