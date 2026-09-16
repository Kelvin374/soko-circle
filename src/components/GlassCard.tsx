import { StyleSheet, View, ViewProps } from 'react-native';
import { colors } from '../theme/colors';
import { radii, shadows } from '../theme';
import { rgba } from '../utils/color';

export default function GlassCard({ style, children, ...rest }: ViewProps) {
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: 'rgba(255,255,255,0.6)',
          borderRadius: radii.xl,
          borderWidth: 1,
          borderColor: 'rgba(21,42,74,0.06)',
          padding: 24,
          ...shadows.card,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}