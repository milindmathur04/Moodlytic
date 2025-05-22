import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../store/userStore';
import { createGroup, getGroups, addGroupMember, removeGroupMember } from '../services/groups/repository';
import { GroupCard } from '../components/GroupCard';
import { GroupInvitations } from '../components/GroupInvitations';
import { CreateGroupModal } from '../components/CreateGroupModal';
import { AddMemberModal } from '../components/AddMemberModal';
import { Feather } from '@expo/vector-icons';
import type { GroupWithMembers } from '../types/groups';

export default function GroupsScreen() {
  const { user } = useUserStore();
  const [groups, setGroups] = useState<GroupWithMembers[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const loadGroups = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const userGroups = await getGroups(user.id);
      setGroups(userGroups || []);
    } catch (err) {
      console.error('Error loading groups:', err);
      setError('Failed to load groups. Please try again.');
      setGroups([]);
    } finally {
      setIsLoading(false);
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
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating group:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create group');
    }
  };

  const handleAddMember = async (email: string) => {
    if (!selectedGroupId) return;
    
    try {
      setError(null);
      await addGroupMember(selectedGroupId, email);
      await loadGroups();
      setShowAddMemberModal(false);
      setSelectedGroupId(null);
    } catch (err) {
      console.error('Error adding member:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to add member');
    }
  };

  const handleRemoveMember = async (groupId: string, memberId: string) => {
    try {
      setError(null);
      await removeGroupMember(groupId, memberId);
      await loadGroups();
    } catch (err) {
      console.error('Error removing member:', err);
      Alert.alert('Error', 'Failed to remove member. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Groups</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Feather name="plus" size={18} color="white" />
          <Text style={styles.createButtonText}>New Group</Text>
        </TouchableOpacity>
      </View>

      <GroupInvitations />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading groups...</Text>
        </View>
      ) : groups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="users" size={48} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Create Your First Group</Text>
          <Text style={styles.emptyText}>
            Get personalized recommendations for you and your friends!
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={styles.emptyButtonText}>Create Group</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GroupCard
              group={item}
              onAddMember={() => {
                setSelectedGroupId(item.id);
                setShowAddMemberModal(true);
              }}
              onRemoveMember={(memberId) => handleRemoveMember(item.id, memberId)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      <CreateGroupModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateGroup}
      />

      <AddMemberModal
        visible={showAddMemberModal}
        onClose={() => {
          setShowAddMemberModal(false);
          setSelectedGroupId(null);
        }}
        onSubmit={handleAddMember}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 8,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  listContent: {
    padding: 20,
  },
});