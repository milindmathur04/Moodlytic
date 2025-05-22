import React from 'react';
import { Users, Plus, UserPlus, X, ChevronDown, ChevronUp } from 'lucide-react';
import type { GroupWithMembers } from '../../types/groups';
import type { RecommendationResponse } from '../../types/api';
import { MoodRecommendation } from '../mood/MoodRecommendation';
import { BudgetSlider } from '../BudgetSlider';
import { cn } from '../../lib/utils';

interface GroupListProps {
  groups: GroupWithMembers[];
  onCreateGroup: () => void;
  onSelectGroup: (group: GroupWithMembers) => void;
  onAddMember: (groupId: string) => void;
  onRemoveMember: (groupId: string, memberId: string) => void;
  selectedGroup: GroupWithMembers | null;
  isLoadingRecommendations: boolean;
  recommendation: RecommendationResponse | null;
  userId?: string;
  budget: number;
  onBudgetChange: (value: number) => void;
}

export function GroupList({
  groups,
  onCreateGroup,
  onSelectGroup,
  onAddMember,
  onRemoveMember,
  selectedGroup,
  isLoadingRecommendations,
  recommendation,
  userId,
  budget,
  onBudgetChange
}: GroupListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between relative z-10">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Your Groups</h2>
        <button
          onClick={onCreateGroup}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl",
            "bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600",
            "text-white shadow-lg hover:shadow-xl hover:scale-[1.02]",
            "transition-all duration-200"
          )}
        >
          <Plus className="w-4 h-4" />
          <span>New Group</span>
        </button>
      </div>

      {!Array.isArray(groups) || groups.length === 0 ? (
        <div className="text-center py-8 bg-white/80 backdrop-blur-sm rounded-2xl">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Create Your First Group</h3>
          <p className="text-gray-600 mb-4">
            Get personalized recommendations for you and your friends!
          </p>
          <button
            onClick={onCreateGroup}
            className={cn(
              "px-6 py-2 rounded-xl",
              "bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600",
              "text-white shadow-lg hover:shadow-xl hover:scale-[1.02]",
              "transition-all duration-200"
            )}
          >
            Create Group
          </button>
        </div>
      ) : (
        <div className="space-y-4 relative z-0">
          {groups.map(group => (
            <div
              key={group.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 relative"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
                  <p className="text-sm text-gray-600">
                    {group.members?.length || 0} member{(group.members?.length || 0) !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onAddMember(group.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl",
                      "bg-gray-100 text-gray-900 hover:bg-gray-200",
                      "transition-colors"
                    )}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Member</span>
                  </button>
                  <button
                    onClick={() => onSelectGroup(group)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl",
                      "bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600",
                      "text-white shadow-lg hover:shadow-xl hover:scale-[1.02]",
                      "transition-all duration-200"
                    )}
                  >
                    {selectedGroup?.id === group.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                    <span>Get Recommendations</span>
                  </button>
                </div>
              </div>

              {Array.isArray(group.members) && group.members.length > 0 && (
                <div className="space-y-2">
                  {group.members.map(member => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{member.email}</p>
                        <p className="text-xs text-gray-500">
                          {member.status === 'pending' ? 'Invitation Pending' : 'Active'}
                        </p>
                      </div>
                      <button
                        onClick={() => onRemoveMember(group.id, member.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {selectedGroup?.id === group.id && (
                <div className="mt-6 relative">
                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Set Budget for Recommendations</h4>
                    <BudgetSlider value={budget} onChange={onBudgetChange} />
                  </div>

                  {isLoadingRecommendations && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                        <p className="text-sm text-gray-600">Getting recommendations...</p>
                      </div>
                    </div>
                  )}

                  {recommendation && userId && (
                    <div className={cn(
                      "transition-opacity duration-200",
                      isLoadingRecommendations ? "opacity-50" : "opacity-100"
                    )}>
                      <MoodRecommendation
                        mood="peaceful"
                        recommendation={recommendation}
                        userId={userId}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}