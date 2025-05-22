export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          picture?: string;
          age?: number;
          gender?: string;
          nationality?: string;
          language?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          picture?: string;
          age?: number;
          gender?: string;
          nationality?: string;
          language?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          picture?: string;
          age?: number;
          gender?: string;
          nationality?: string;
          language?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}