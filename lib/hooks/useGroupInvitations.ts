import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase/client';
import { acceptInvitation, declineInvitation } from '../services/groups/repository';

interface Invitation {
  invitation_id: string;
  group_name: string;
  invited_by: string;
  member_count: number;
  invitation_expires_at: string;
  recent_members: Array<{ email: string; status: string }>;
}

export function useGroupInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInvitations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error('User email not found');
      }

      const { data, error: fetchError } = await supabase
        .from('pending_invitations')
        .select('*')
        .eq('email', user.email);

      if (fetchError) throw fetchError;
      setInvitations(data || []);
    } catch (err) {
      console.error('Failed to load invitations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load invitations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      setError(null);
      await acceptInvitation(invitationId);
      await loadInvitations();
    } catch (err) {
      console.error('Failed to accept invitation:', err);
      throw err;
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      setError(null);
      await declineInvitation(invitationId);
      await loadInvitations();
    } catch (err) {
      console.error('Failed to decline invitation:', err);
      throw err;
    }
  };

  return {
    invitations,
    isLoading,
    error,
    acceptInvitation: handleAcceptInvitation,
    declineInvitation: handleDeclineInvitation,
    refresh: loadInvitations
  };
}