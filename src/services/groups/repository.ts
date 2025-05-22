import { supabase } from '../supabase/client';
import type { Group, GroupMember, GroupWithMembers } from '../../types/groups';

export async function createGroup(name: string, createdBy: string): Promise<Group> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      throw new Error('User email not found');
    }

    // First create the group
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert([{ 
        name: name.trim(), 
        created_by: createdBy 
      }])
      .select()
      .single();

    if (groupError) throw groupError;
    if (!group) throw new Error('Failed to create group');

    // Then add creator as first member
    const { error: memberError } = await supabase
      .from('group_members')
      .insert([{
        group_id: group.id,
        user_id: createdBy,
        email: user.email,
        status: 'active'
      }]);

    if (memberError) {
      // Cleanup if member creation fails
      await supabase.from('groups').delete().eq('id', group.id);
      throw memberError;
    }

    return group;
  } catch (error) {
    console.error('Group creation error:', error);
    throw error instanceof Error ? error : new Error('Failed to create group');
  }
}

export async function getGroups(userId: string): Promise<GroupWithMembers[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      throw new Error('User email not found');
    }

    const { data, error } = await supabase
      .from('groups')
      .select(`
        *,
        members:group_members(*)
      `);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching groups:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch groups');
  }
}

export async function addGroupMember(groupId: string, email: string): Promise<GroupMember> {
  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if member already exists
    const { data: existingMember } = await supabase
      .from('group_members')
      .select('id, status')
      .eq('group_id', groupId)
      .eq('email', normalizedEmail)
      .single();

    if (existingMember) {
      if (existingMember.status === 'active') {
        throw new Error('Member is already in this group');
      }
      throw new Error('Member has a pending invitation');
    }

    // Add new member
    const { data: member, error } = await supabase
      .from('group_members')
      .insert([{
        group_id: groupId,
        email: normalizedEmail,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;
    if (!member) throw new Error('Failed to add member');

    return member;
  } catch (error) {
    console.error('Error adding member:', error);
    throw error instanceof Error ? error : new Error('Failed to add member');
  }
}

export async function removeGroupMember(groupId: string, memberId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('id', memberId)
      .eq('group_id', groupId);

    if (error) throw error;
  } catch (error) {
    console.error('Error removing member:', error);
    throw error instanceof Error ? error : new Error('Failed to remove member');
  }
}

export async function acceptInvitation(invitationId: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) throw new Error('No authenticated user');

    // First get the invitation details
    const { data: invitation, error: fetchError } = await supabase
      .from('group_members')
      .select('id, group_id, email, status')
      .eq('id', invitationId)
      .eq('email', user.email)
      .eq('status', 'pending')
      .single();

    if (fetchError) throw fetchError;
    if (!invitation) throw new Error('Invitation not found');

    // Update the invitation status
    const { error: updateError } = await supabase
      .from('group_members')
      .update({ 
        status: 'active',
        user_id: user.id,
        invitation_metadata: {
          ...invitation.invitation_metadata,
          accepted_at: new Date().toISOString(),
          accepted_by: user.id
        }
      })
      .eq('id', invitationId)
      .eq('email', user.email)
      .eq('status', 'pending');

    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error accepting invitation:', error);
    throw error instanceof Error ? error : new Error('Failed to accept invitation');
  }
}

export async function declineInvitation(invitationId: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) throw new Error('No authenticated user');

    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('id', invitationId)
      .eq('email', user.email)
      .eq('status', 'pending');

    if (error) throw error;
  } catch (error) {
    console.error('Error declining invitation:', error);
    throw error instanceof Error ? error : new Error('Failed to decline invitation');
  }
}