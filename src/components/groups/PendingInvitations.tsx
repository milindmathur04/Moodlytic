import React from 'react';
import { useGroupInvitations } from '../../hooks/useGroupInvitations';
import { InvitationCard } from './InvitationCard';

export function PendingInvitations() {
  const { 
    invitations, 
    isLoading, 
    error,
    acceptInvitation,
    declineInvitation
  } = useGroupInvitations();

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mx-auto" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!invitations.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">
        Pending Invitations
      </h2>
      <div className="space-y-4">
        {invitations.map((invitation) => (
          <InvitationCard
            key={invitation.invitation_id}
            groupName={invitation.group_name}
            invitedBy={invitation.invited_by}
            memberCount={invitation.member_count}
            expiresAt={invitation.invitation_expires_at}
            recentMembers={invitation.recent_members}
            onAccept={() => acceptInvitation(invitation.invitation_id)}
            onDecline={() => declineInvitation(invitation.invitation_id)}
          />
        ))}
      </div>
    </div>
  );
}