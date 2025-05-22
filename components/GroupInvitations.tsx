import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Check, X, Users } from 'lucide-react-native';
import { useGroupInvitations } from '@/lib/hooks/useGroupInvitations';

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#6366f1" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!invitations.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pending Invitations</Text>
      
      <FlatList
        data={invitations}
        keyExtractor={(item) => item.invitation_id}
        renderItem={({ item }) => (
          <View style={styles.invitationItem}>
            <View style={styles.invitationContent}>
              <Text style={styles.groupName}>{item.group_name}</Text>
              <Text style={styles.invitedBy}>
                Invited by {item.invited_by}
              </Text>
              
              <View style={styles.invitationDetails}>
                <View style={styles.detailItem}>
                  <Users size={14} color="#6b7280" />
                  <Text style={styles.detailText}>
                    {item.member_count} member{item.member_count !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => acceptInvitation(item.invitation_id)}
              >
                <Check size={16} color="#10b981" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.declineButton]}
                onPress={() => declineInvitation(item.invitation_id)}
              >
                <X size={16} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
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
  invitationItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  invitationContent: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  invitedBy: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  invitationDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  actionButtons: {
    justifyContent: 'center',
    marginLeft: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  acceptButton: {
    backgroundColor: '#d1fae5',
  },
  declineButton: {
    backgroundColor: '#fee2e2',
  },
});