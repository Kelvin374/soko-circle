import { TextStyle } from 'react-native';

export const fonts = {
  display: 'DMSans_700Bold',
  headline: 'DMSans_700Bold',
  title: 'DMSans_600SemiBold',
  body: 'Inter_400Regular',
  bodySemiBold: 'Inter_600SemiBold',
  label: 'Inter_600SemiBold',
  medium: 'DMSans_500Medium',
};

export const type: Record<string, TextStyle> = {
  displayLg: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: -0.02 * 40,
    fontWeight: '700',
  },
  headlineLg: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.01 * 32,
    fontWeight: '700',
  },
  headline: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
  },
  titleMd: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  bodyLg: {
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400',
  },
  bodyMd: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  labelSm: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.05 * 13,
    fontWeight: '600',
  },
};

export default { fonts, type };