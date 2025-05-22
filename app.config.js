module.exports = {
  name: 'Moodlytic',
  slug: 'moodlytic-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.moodlytic.app",
    infoPlist: {
      NSLocationWhenInUseUsageDescription: "We need your location to provide personalized recommendations based on your area."
    }
  },
  android: {
    package: "com.moodlytic.app",
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    permissions: [
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION"
    ]
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: "metro"
  },
  plugins: [
    [
      'expo-router',
      {
        origin: "https://moodlytic.app"
      }
    ],
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: "Allow Moodlytic to use your location to provide personalized recommendations."
      }
    ]
  ],
  scheme: 'moodlytic',
  extra: {
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || "https://cemqnzfkadoyumfhldgw.supabase.co",
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlbXFuemZrYWRveXVtZmhsZGd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NjUyOTEsImV4cCI6MjA1MTI0MTI5MX0.a7B4frz4naZMuF5wHw7F_uTBTM3a_1L1YrbNO8gKn5Q",
    eas: {
      projectId: "your-project-id"
    }
  }
};