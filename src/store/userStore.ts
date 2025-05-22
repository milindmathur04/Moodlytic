import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '../types';

interface UserState {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  updateUserLocation: (latitude: number, longitude: number, address?: string) => void;
  updateUserDetails: (details: Partial<UserProfile>) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      updateUserLocation: (latitude, longitude, address) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                location: { latitude, longitude, address },
              }
            : null,
        })),
      updateUserDetails: (details) =>
        set((state) => {
          if (!state.user) return state;
          return {
            user: {
              ...state.user,
              ...details,
            }
          };
        }),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);