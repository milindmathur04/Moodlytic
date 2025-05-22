import axios from 'axios';
import type { UserProfile } from '../../types';

const GOOGLE_USER_INFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

export async function fetchUserInfo(accessToken: string): Promise<UserProfile> {
  try {
    const { data } = await axios.get(GOOGLE_USER_INFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    return {
      id: data.sub,
      name: data.name || '',
      email: data.email || '',
      picture: data.picture || '',
      language: data.locale || undefined
    };
  } catch (error) {
    console.error('Failed to fetch user info:', error);
    throw new Error('Failed to get user information');
  }
}