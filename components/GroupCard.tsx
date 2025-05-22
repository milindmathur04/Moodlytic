import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { UserPlus, X } from 'lucide-react-native';
import type { GroupWithMembers } from '@/lib/types/groups';

interface GroupCardProps {
  group: GroupWithMembers;
  onAddMember: () => void;
  onRemoveMember: (memberId: string) => void;
}

export function GroupCard({ group, onAddMember, onRemoveMember }: GroupCardProps) {
  const handleRemoveMember = (memberId: string, email: string) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${email} from this group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => onRemoveMember(memberId)
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{group.name}</Text>
          <Text style={styles.subtitle}>
            {group.members?.length || 0} member{(group.members?.length || 0) !== 1 ? 's' : ''}
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddMember}
        >
          <UserPlus size={16} color="#6366f1" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {Array.isArray(group.members) && group.members.length > 0 && (
        <FlatList
          data={group.members}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.memberItem}>
              <View>
                <Text style={styles.memberEmail}>{item.email}</Text>
                <Text style={styles.memberStatus}>
                  {item.status === 'pending' ? 'Invitation Pending' : 'Active'}
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveMember(item.id, item.email)}
              >
                <X size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>
          )}
          scrollEnabled={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#6366f1',
    fontWeight: '500',
    marginLeft: 6,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  memberEmail: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  memberStatus: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
});