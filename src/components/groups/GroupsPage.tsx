import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { Background } from '../ui/Background';
import { GroupList } from './GroupList';
import { PendingInvitations } from './PendingInvitations';
import { CreateGroupDialog } from './CreateGroupDialog';
import { AddMemberDialog } from './AddMemberDialog';
import { ProfileMenu } from '../profile/ProfileMenu';
import { createGroup, getGroups, addGroupMember, removeGroupMember } from '../../services/groups/repository';
import { getGroupRecommendations } from '../../services/api/recommendations/group';
import type { GroupWithMembers } from '../../types/groups';
import type { RecommendationResponse } from '../../types/api';
import { ROUTES, APP_NAME } from '../../constants/app';
import { cn } from '../../lib/utils';
import { capitalizeWords } from '../../utils/string';

export function GroupsPage() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [groups, setGroups] = useState<GroupWithMembers[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupWithMembers | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [budget, setBudget] = useState(50);

  const displayName = user?.given_name || user?.email?.split('@')[0] || '';

  const loadGroups = async () => {
    if (!user) return;
    
    try {
      setIsLoadingGroups(true);
      setError(null);
      const userGroups = await getGroups(user.id);
      setGroups(userGroups || []);
    } catch (err) {
      console.error('Error loading groups:', err);
      setError('Failed to load groups. Please try again.');
      setGroups([]);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadGroups();
    }
  }, [user]);

  const handleCreateGroup = async (name: string) => {
    if (!user) return;
    
    try {
      setError(null);
      await createGroup(name, user.id);
      await loadGroups();
      setShowCreateDialog(false);
    } catch (err) {
      console.error('Error creating group:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to create group');
    }
  };

  const handleAddMember = async (email: string) => {
    if (!selectedGroupId) return;
    
    try {
      setError(null);
      await addGroupMember(selectedGroupId, email);
      await loadGroups();
      setShowAddMemberDialog(false);
      setSelectedGroupId(null);
    } catch (err) {
      console.error('Error adding member:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to add member');
    }
  };

  const handleRemoveMember = async (groupId: string, memberId: string) => {
    try {
      setError(null);
      await removeGroupMember(groupId, memberId);
      await loadGroups();
    } catch (err) {
      console.error('Error removing member:', err);
      setError('Failed to remove member. Please try again.');
    }
  };

  const handleSelectGroup = async (group: GroupWithMembers) => {
    if (!user) return;

    // Toggle selection if clicking the same group
    if (selectedGroup?.id === group.id) {
      setSelectedGroup(null);
      setRecommendation(null);
      return;
    }

    try {
      setSelectedGroup(group);
      setIsLoadingRecommendations(true);
      setError(null);

      const result = await getGroupRecommendations(
        'peaceful',
        user,
        budget,
        undefined,
        recommendation
      );

      setRecommendation(result);
    } catch (err) {
      console.error('Error getting group recommendations:', err);
      setError('Failed to get recommendations. Please try again.');
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const handleBudgetChange = async (newBudget: number) => {
    setBudget(newBudget);
    if (selectedGroup && user) {
      try {
        setIsLoadingRecommendations(true);
        setError(null);

        const result = await getGroupRecommendations(
          'peaceful',
          user,
          newBudget,
          undefined,
          recommendation
        );

        setRecommendation(result);
      } catch (err) {
        console.error('Error updating recommendations:', err);
        setError('Failed to update recommendations. Please try again.');
      } finally {
        setIsLoadingRecommendations(false);
      }
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen ios-safe-area relative">
      <Background />
      
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 relative z-30">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(ROUTES.MOOD)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg",
                  "text-gray-700 hover:text-gray-900 transition-colors",
                  "hover:bg-gray-100"
                )}
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back</span>
              </button>
              
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                  {APP_NAME}
                </h1>
                <p className="text-ios-body text-ios-gray mt-1">
                  Hello, {capitalizeWords(displayName)}
                </p>
              </div>
            </div>

            <div className="relative z-40">
              <ProfileMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8 relative z-20">
        <PendingInvitations />

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {isLoadingGroups ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
            <p className="mt-4 text-gray-600">Loading groups...</p>
          </div>
        ) : (
          <GroupList
            groups={groups}
            onCreateGroup={() => setShowCreateDialog(true)}
            onSelectGroup={handleSelectGroup}
            onAddMember={(groupId) => {
              setSelectedGroupId(groupId);
              setShowAddMemberDialog(true);
            }}
            onRemoveMember={handleRemoveMember}
            selectedGroup={selectedGroup}
            isLoadingRecommendations={isLoadingRecommendations}
            recommendation={recommendation}
            userId={user.id}
            budget={budget}
            onBudgetChange={handleBudgetChange}
          />
        )}

        {/* Modals with higher z-index */}
        <div className="relative z-50">
          <CreateGroupDialog
            isOpen={showCreateDialog}
            onClose={() => setShowCreateDialog(false)}
            onSubmit={handleCreateGroup}
          />

          <AddMemberDialog
            isOpen={showAddMemberDialog}
            onClose={() => {
              setShowAddMemberDialog(false);
              setSelectedGroupId(null);
            }}
            onSubmit={handleAddMember}
          />
        </div>
      </main>
    </div>
  );
}