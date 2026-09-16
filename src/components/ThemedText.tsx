import { Text as RNText, TextProps } from 'react-native';
import { colors } from '../theme/colors';
import { type } from '../theme/typography';

type Props = TextProps & {
  variant?: keyof typeof type;
  color?: string;
};

export default function Text({ variant = 'bodyMd', color = colors.onSurface, style, ...rest }: Props) {
  return <RNText {...rest} style={[type[variant], { color }, style]} />;
}