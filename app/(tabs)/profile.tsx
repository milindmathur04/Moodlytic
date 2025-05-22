import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '@/lib/store/userStore';
import { useAuth } from '@/lib/hooks/useAuth';
import { AlertTriangle, Edit2, LogOut } from 'lucide-react-native';
import { ProfileEditor } from '@/components/ProfileEditor';
import { COUNTRIES } from '@/lib/constants/countries';
import { LANGUAGES } from '@/lib/constants/languages';

export default function ProfileScreen() {
  const { user } = useUserStore();
  const { logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) return null;

  const displayName = user.given_name || user.email.split('@')[0] || '';
  const language = LANGUAGES.find(lang => lang.code === user.language)?.name || 'Not specified';
  const nationality = COUNTRIES.find(country => country.code === user.nationality)?.name || 'Not specified';

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {isEditing ? (
          <ProfileEditor
            onClose={() => setIsEditing(false)}
          />
        ) : (
          <>
            <View style={styles.profileCard}>
              <View style={styles.avatarContainer}>
                {user.picture ? (
                  <Image
                    source={{ uri: user.picture }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {displayName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.name}>{displayName}</Text>
              <Text style={styles.email}>{user.email}</Text>

              {!user.email_verified && (
                <View style={styles.verificationBanner}>
                  <AlertTriangle size={16} color="#b45309" />
                  <Text style={styles.verificationText}>
                    Email not verified. Please check your inbox.
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Edit2 size={16} color="#6366f1" />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.detailsCard}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Age</Text>
                <Text style={styles.detailValue}>{user.age || 'Not specified'}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Gender</Text>
                <Text style={styles.detailValue}>{user.gender || 'Not specified'}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Nationality</Text>
                <Text style={styles.detailValue}>{nationality}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Language</Text>
                <Text style={styles.detailValue}>{language}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <LogOut size={18} color="#ef4444" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  verificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  verificationText: {
    fontSize: 12,
    color: '#b45309',
    marginLeft: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#6366f1',
    borderRadius: 8,
  },
  editButtonText: {
    color: '#6366f1',
    fontWeight: '500',
    marginLeft: 8,
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: '500',
    marginLeft: 8,
  }
});