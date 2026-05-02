import { Color } from 'expo-router';
import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: Platform.select({
      android: (Platform.Version as number) >= 31 ? Color.android.system_neutral1_10 : '#ffffff',
      default: '#ffffff',
    }),
    backgroundElement: Platform.select({
      android: (Platform.Version as number) >= 31 ? Color.android.system_neutral1_50 : '#F0F0F3',
      default: '#F0F0F3',
    }),
    backgroundSelected: Platform.select({
      android: (Platform.Version as number) >= 31 ? Color.android.system_neutral1_100 : '#E0E1E6',
      default: '#E0E1E6',
    }),
    textSecondary: '#60646C',
    accent: Platform.select({
      android: (Platform.Version as number) >= 31 ? Color.android.system_accent1_500 : '#0a7ea4',
      default: '#0a7ea4',
    }),
  },
  dark: {
    text: '#ffffff',
    background: Platform.select({
      android: (Platform.Version as number) >= 31 ? Color.android.system_neutral1_900 : '#000000',
      default: '#000000',
    }),
    backgroundElement: Platform.select({
      android: (Platform.Version as number) >= 31 ? Color.android.system_neutral1_800 : '#212225',
      default: '#212225',
    }),
    backgroundSelected: Platform.select({
      android: (Platform.Version as number) >= 31 ? Color.android.system_neutral1_700 : '#2E3135',
      default: '#2E3135',
    }),
    textSecondary: '#B0B4BA',
    accent: Platform.select({
      android: (Platform.Version as number) >= 31 ? Color.android.system_accent1_200 : '#4A98E9',
      default: '#4A98E9',
    }),
  },
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  android: { // <-- Add this explicitly
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
});