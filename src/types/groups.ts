export interface Group {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string | null;
  email: string;
  status: 'pending' | 'active';
  created_at: string;
  invitation_sent_at: string;
  invitation_expires_at: string;
  invitation_metadata: {
    invited_by: string;
    invited_at: string;
    activated_at?: string;
  };
}

export interface GroupWithMembers extends Group {
  members: GroupMember[];
}