import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Coffee, Compass, Film } from 'lucide-react-native';
import type { Mood } from '@/lib/types';
import type { RecommendationResponse } from '@/lib/types/api';

interface RecommendationCardProps {
  recommendation: RecommendationResponse;
  mood: Mood;
  userId: string;
}

function extractRecommendationDetails(text: string) {
  // Extract name - look for text between quotes or before "at" or first comma
  let name = '';
  const quoteMatch = text.match(/"([^"]+)"/);
  if (quoteMatch) {
    name = quoteMatch[1];
  } else {
    // Try to extract name before "at" or first comma
    const beforeAt = text.split(/\s+at\s+/)[0];
    const beforeComma = text.split(',')[0];
    name = beforeAt.length < beforeComma.length ? beforeAt : beforeComma;
  }
  
  // Extract venue after "at"
  const atMatch = text.match(/at\s+\*\*([^*]+)\*\*/);
  const venue = atMatch ? atMatch[1].trim() : '';
  
  // Extract link - handle both markdown and plain URLs
  let linkText = '';
  let linkUrl = '';
  
  // Try markdown format first
  const markdownLinkMatch = text.match(/\[([^\]]+)\]\(([^)]+)\)/);
  if (markdownLinkMatch) {
    linkText = markdownLinkMatch[1];
    linkUrl = markdownLinkMatch[2];
  } else {
    // Try to find a plain URL
    const urlMatch = text.match(/https?:\/\/[^\s)]+/);
    if (urlMatch) {
      linkUrl = urlMatch[0];
      linkText = 'View Details';
    }
  }
  
  // Clean up remaining text for description
  let description = text
    .replace(quoteMatch?.[0] ?? '', '')
    .replace(atMatch?.[0] ?? '', '')
    .replace(markdownLinkMatch?.[0] ?? '', '')
    .replace(/[,.!?]?\s*$/, '')
    .replace(/\.{2,}/g, '.')
    .replace(/\s{2,}/g, ' ')
    .replace(/,\s*just\s*\./g, '.')
    .replace(/\s+just\s*\./g, '.')
    .trim();

  return {
    name: name.trim(),
    venue: venue.trim(),
    description: description.trim(),
    linkText: linkText.trim(),
    linkUrl: linkUrl.trim()
  };
}

function RecommendationItem({
  icon,
  title,
  item,
  iconColor,
  category,
  userId,
  mood,
}: {
  icon: React.ReactNode;
  title: string;
  item: { text: string; distance: string | null };
  iconColor: string;
  category: 'food' | 'activity' | 'entertainment';
  userId: string;
  mood: Mood;
}) {
  const details = extractRecommendationDetails(item.text);
  
  const handleLinkPress = async () => {
    if (!details.name) {
      console.warn('No name found for recommendation:', details);
      return;
    }

    try {
      // In a real app, you would track the interaction here
      console.log('Tracking interaction:', {
        user_id: userId,
        type: 'click',
        category,
        item_name: details.name,
        url: details.linkUrl,
        mood
      });

      if (details.linkUrl) {
        await Linking.openURL(details.linkUrl);
      }
    } catch (error) {
      console.error('Failed to open link:', error);
    }
  };

  return (
    <View style={styles.recommendationItem}>
      <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
        {icon}
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.itemTitle}>{title}</Text>
        
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{details.name}</Text>
          
          {details.venue ? (
            <Text style={styles.itemVenue}>at {details.venue}</Text>
          ) : null}
          
          {details.description ? (
            <Text style={styles.itemDescription}>{details.description}</Text>
          ) : null}
          
          {item.distance ? (
            <View style={styles.distanceBadge}>
              <Compass size={12} color="#6b7280" />
              <Text style={styles.distanceText}>{item.distance}</Text>
            </View>
          ) : null}
          
          {details.linkUrl ? (
            <TouchableOpacity 
              style={[styles.linkButton, { backgroundColor: iconColor }]}
              onPress={handleLinkPress}
            >
              <Text style={styles.linkButtonText}>View Details</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export function RecommendationCard({ recommendation, mood, userId }: RecommendationCardProps) {
  return (
    <View style={styles.container}>
      <RecommendationItem
        icon={<Coffee size={20} color="white" />}
        title="Food Recommendation"
        item={recommendation.food}
        iconColor="#f97316"
        category="food"
        userId={userId}
        mood={mood}
      />
      
      <View style={styles.divider} />
      
      <RecommendationItem
        icon={<Compass size={20} color="white" />}
        title="Activity Suggestion"
        item={recommendation.activity}
        iconColor="#10b981"
        category="activity"
        userId={userId}
        mood={mood}
      />
      
      <View style={styles.divider} />
      
      <RecommendationItem
        icon={<Film size={20} color="white" />}
        title="Entertainment Pick"
        item={recommendation.entertainment}
        iconColor="#8b5cf6"
        category="entertainment"
        userId={userId}
        mood={mood}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationItem: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  itemDetails: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  itemVenue: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  distanceText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  linkButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  linkButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 8,
  },
});