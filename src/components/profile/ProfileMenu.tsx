import React, { useState, useRef } from 'react';
import { LogOut, Settings, AlertTriangle } from 'lucide-react';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { useAuth } from '../../hooks/useAuth';
import { ProfileEditor } from './ProfileEditor';
import { EmailVerification } from './EmailVerification';
import { COUNTRIES } from '../../constants/countries';
import { LANGUAGES } from '../../constants/languages';
import { cn } from '../../lib/utils';

export function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  
  useOnClickOutside(menuRef, () => setIsOpen(false));

  if (!user) return null;

  const displayName = user.given_name || user.email.split('@')[0];
  const language = LANGUAGES.find(lang => lang.code === user.language)?.name || user.language;
  const nationality = COUNTRIES.find(country => country.code === user.nationality)?.name || user.nationality;

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 group"
      >
        <div className="relative w-10 h-10 rounded-full overflow-hidden">
          {user.picture ? (
            <img
              src={user.picture}
              alt={displayName}
              className="w-full h-full object-cover bg-gray-100"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.style.display = 'none';
                target.parentElement!.innerHTML = `<div class="w-full h-full bg-blue-500 flex items-center justify-center text-white">${displayName.charAt(0).toUpperCase()}</div>`;
              }}
            />
          ) : (
            <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          
          {!user.email_verified && (
            <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white">
              <AlertTriangle className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[9999]" aria-modal="true" role="dialog">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div 
            className={cn(
              "absolute right-0 mt-2 w-72 origin-top-right",
              "bg-white rounded-xl shadow-lg divide-y divide-gray-100",
              "max-h-[calc(100vh-6rem)] overflow-y-auto",
              "transform transition-all duration-200 ease-out"
            )}
            style={{
              top: menuRef.current ? menuRef.current.offsetHeight + 4 : 0
            }}
          >
            <div className="px-4 py-3">
              <p className="font-medium text-gray-900">{displayName}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>

            {!user.email_verified && (
              <div className="px-4 py-3">
                <EmailVerification email={user.email} />
              </div>
            )}

            {isEditing ? (
              <div className="p-4">
                <ProfileEditor onClose={() => setIsEditing(false)} />
              </div>
            ) : (
              <div className="px-4 py-3">
                <div className="space-y-2 text-sm">
                  <p>Language: {language || 'Not specified'}</p>
                  <p>Age: {user.age || 'Not specified'}</p>
                  <p>Gender: {user.gender || 'Not specified'}</p>
                  <p>Nationality: {nationality || 'Not specified'}</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-2 text-blue-500 hover:text-blue-600 flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Edit Profile
                  </button>
                </div>
              </div>
            )}

            <div className="px-2 py-2">
              <button
                onClick={logout}
                className="w-full px-2 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}