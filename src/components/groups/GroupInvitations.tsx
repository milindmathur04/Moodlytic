import React from 'react';
import { Check, X } from 'lucide-react';
import { useGroupInvitations } from '../../hooks/useGroupInvitations';
import { cn } from '../../lib/utils';

export function GroupInvitations() {
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
    <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Pending Invitations
      </h3>
      <div className="space-y-3">
        {invitations.map((invitation) => (
          <div 
            key={invitation.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
          >
            <div>
              <p className="font-medium text-gray-900">
                {invitation.groups?.name}
              </p>
              <p className="text-sm text-gray-600">
                You've been invited to join this group
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => acceptInvitation(invitation.id)}
                className={cn(
                  "p-2 rounded-full transition-all duration-200",
                  "bg-green-100 text-green-600 hover:bg-green-200"
                )}
                title="Accept invitation"
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                onClick={() => declineInvitation(invitation.id)}
                className={cn(
                  "p-2 rounded-full transition-all duration-200",
                  "bg-red-100 text-red-600 hover:bg-red-200"
                )}
                title="Decline invitation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}