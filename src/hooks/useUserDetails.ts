import { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import type { UserProfile } from '../types';

export function useUserDetails() {
  const { user, updateUserDetails } = useUserStore();
  const [needsDetails, setNeedsDetails] = useState(false);

  useEffect(() => {
    if (user && !user.age) {
      setNeedsDetails(true);
    }
  }, [user]);

  const handleDetailsSubmit = (details: Partial<UserProfile>) => {
    updateUserDetails(details);
    setNeedsDetails(false);
  };

  return { needsDetails, handleDetailsSubmit };
}