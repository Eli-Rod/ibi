// src/config/env.ts
import Constants from 'expo-constants';

export const ENV = {
  YT_KEY:
    process.env.EXPO_PUBLIC_YOUTUBE_API_KEY ??
    (Constants?.expoConfig?.extra?.YOUTUBE_API_KEY as string),
  YT_CHANNEL_ID:
    process.env.EXPO_PUBLIC_YOUTUBE_CHANNEL_ID ??
    (Constants?.expoConfig?.extra?.YOUTUBE_CHANNEL_ID as string | undefined),
};