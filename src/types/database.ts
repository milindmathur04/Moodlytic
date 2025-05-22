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