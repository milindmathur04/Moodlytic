import axios from 'axios';
import type { UserProfile } from '../types';

export async function fetchUserInfo(accessToken: string): Promise<UserProfile> {
  const { data } = await axios.get(
    'https://www.googleapis.com/oauth2/v3/userinfo',
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  return {
    id: data.sub,
    name: data.name,
    email: data.email,
    picture: data.picture,
  };
}