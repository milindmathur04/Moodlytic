import React, { useState } from 'react';
import { Utensils, Coffee, Brain, ExternalLink, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import type { Mood } from '../../types';
import type { RecommendationResponse } from '../../types/api';
import { formatDate } from '../../utils/date';
import { formatCurrency } from '../../utils/currency';
import { trackInteraction } from '../../services/interactions/repository';
import { cn } from '../../lib/utils';
import { RecommendationPrompt } from '../RecommendationPrompt';

interface MoodRecommendationProps {
  mood: Mood;
  recommendation: RecommendationResponse;
  userId: string;
  onCustomize?: (prompts: {
    food?: string;
    activity?: string;
    entertainment?: string;
  }) => void;
}

function DetailBadge({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
      <Icon className="w-3 h-3" />
      <span>{text}</span>
    </span>
  );
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
  icon: Icon,
  title,
  item,
  iconColor,
  category,
  userId,
  mood,
  gradientFrom,
  gradientTo
}: {
  icon: React.ElementType;
  title: string;
  item: { text: string; distance: string | null };
  iconColor: string;
  category: 'food' | 'activity' | 'entertainment';
  userId: string;
  mood: Mood;
  gradientFrom: string;
  gradientTo: string;
}) {
  const details = extractRecommendationDetails(item.text);
  
  const handleLinkClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!details.name) {
      console.warn('No name found for recommendation:', details);
      return;
    }

    try {
      await trackInteraction({
        user_id: userId,
        type: 'click',
        category,
        item_name: details.name,
        url: details.linkUrl,
        mood,
        metadata: {
          venue: details.venue,
          distance: item.distance,
          description: details.description
        }
      });

      if (details.linkUrl) {
        window.open(details.linkUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Failed to track recommendation click:', error);
      if (details.linkUrl) {
        window.open(details.linkUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  return (
    <div className="flex items-start space-x-4">
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
        `bg-gradient-to-br ${gradientFrom} ${gradientTo}`
      )}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <div className="space-y-3 mt-2">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-900 font-medium">{details.name}</p>
                {details.venue && (
                  <p className="text-gray-700 text-sm mt-1">at {details.venue}</p>
                )}
                {details.description && (
                  <p className="text-gray-600 text-sm mt-2">{details.description}</p>
                )}
              </div>
              {details.linkUrl && (
                <button
                  type="button"
                  onClick={handleLinkClick}
                  className={cn(
                    "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm",
                    "transition-all duration-200 hover:scale-105",
                    `text-white bg-gradient-to-r ${gradientFrom} ${gradientTo}`
                  )}
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View</span>
                </button>
              )}
            </div>
          </div>
          
          {item.distance && (
            <div className="flex flex-wrap gap-2">
              <DetailBadge icon={Coffee} text={item.distance} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function MoodRecommendation({ mood, recommendation, userId, onCustomize }: MoodRecommendationProps) {
  const [isCustomizing, setIsCustomizing] = useState(false);

  const handleCustomize = (prompts: {
    food?: string;
    activity?: string;
    entertainment?: string;
  }) => {
    onCustomize?.(prompts);
    setIsCustomizing(false);
  };

  return (
    <div className="mt-6 sm:mt-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
          <span className="block sm:inline">Here's what we recommend</span>{' '}
          <span className="flex items-center gap-2 sm:inline-flex">
            <span>for your</span>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {mood}
            </span>
            <span>mood:</span>
          </span>
        </h2>
        
        <button
          onClick={() => setIsCustomizing(!isCustomizing)}
          className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span>Customize</span>
          {isCustomizing ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>
      
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-8 space-y-6 sm:space-y-8">
        {isCustomizing && (
          <div className="mb-6">
            <RecommendationPrompt
              onSubmit={handleCustomize}
              isLoading={false}
            />
          </div>
        )}

        <RecommendationItem
          icon={Utensils}
          title="Food Recommendation"
          item={recommendation.food}
          iconColor="text-orange-500"
          category="food"
          userId={userId}
          mood={mood}
          gradientFrom="from-orange-500"
          gradientTo="to-red-500"
        />

        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        <RecommendationItem
          icon={Coffee}
          title="Activity Suggestion"
          item={recommendation.activity}
          iconColor="text-green-500"
          category="activity"
          userId={userId}
          mood={mood}
          gradientFrom="from-green-500"
          gradientTo="to-emerald-500"
        />

        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        <RecommendationItem
          icon={Brain}
          title="Entertainment Pick"
          item={recommendation.entertainment}
          iconColor="text-purple-500"
          category="entertainment"
          userId={userId}
          mood={mood}
          gradientFrom="from-purple-500"
          gradientTo="to-indigo-500"
        />
      </div>
    </div>
  );
}