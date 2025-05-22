import React from 'react';
import { Users, Clock, Check, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface InvitationCardProps {
  groupName: string;
  invitedBy: string;
  memberCount: number;
  expiresAt: string;
  recentMembers?: Array<{ email: string; status: string }>;
  onAccept: () => void;
  onDecline: () => void;
  isLoading?: boolean;
}

export function InvitationCard({
  groupName,
  invitedBy,
  memberCount,
  expiresAt,
  recentMembers = [],
  onAccept,
  onDecline,
  isLoading
}: InvitationCardProps) {
  const expiresIn = new Date(expiresAt).getTime() - Date.now();
  const daysLeft = Math.ceil(expiresIn / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{groupName}</h3>
          <p className="text-sm text-gray-600">
            Invited by {invitedBy}
          </p>
          
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Expires in {daysLeft} days</span>
            </div>
          </div>

          {recentMembers.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Recent members:</p>
              <div className="space-y-1">
                {recentMembers.map((member, index) => (
                  <p key={index} className="text-sm text-gray-600">
                    {member.email}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onAccept}
            disabled={isLoading}
            className={cn(
              "p-2 rounded-full transition-all duration-200",
              "bg-green-100 text-green-600 hover:bg-green-200",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            title="Accept invitation"
          >
            <Check className="w-5 h-5" />
          </button>
          <button
            onClick={onDecline}
            disabled={isLoading}
            className={cn(
              "p-2 rounded-full transition-all duration-200",
              "bg-red-100 text-red-600 hover:bg-red-200",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            title="Decline invitation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}