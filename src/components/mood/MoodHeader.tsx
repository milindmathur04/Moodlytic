import React from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { ProfileMenu } from '../profile/ProfileMenu';
import { UserProfile } from '../../types';
import { capitalizeWords } from '../../utils/string';
import { ROUTES } from '../../constants/app';
import { cn } from '../../lib/utils';

interface MoodHeaderProps {
  user: UserProfile;
  appName: string;
}

export function MoodHeader({ user, appName }: MoodHeaderProps) {
  const displayName = user.given_name || user.email.split('@')[0];
  
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
          {appName}
        </h1>
        <p className="text-ios-body text-ios-gray mt-1">
          Hello, {capitalizeWords(displayName)}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Link
          to={ROUTES.GROUPS}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl",
            "bg-white/80 backdrop-blur-sm shadow-sm",
            "text-gray-700 hover:text-gray-900 transition-colors",
            "border border-gray-200"
          )}
        >
          <Users className="w-5 h-5" />
          <span className="hidden sm:inline">Group Recommendations</span>
        </Link>
        <ProfileMenu />
      </div>
    </div>
  );
}