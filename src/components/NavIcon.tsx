import { StyleProp, ViewStyle } from 'react-native';
import Icon, { IconName } from './Icon';

type Props = {
  /** heroicon name used when focused (solid/filled) */
  name: IconName;
  /** heroicon name used when not focused (outline) */
  outline: IconName;
  focused: boolean;
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
};

export default function NavIcon({
  name,
  outline,
  focused,
  size = 24,
  color,
  style,
}: Props) {
  return (
    <Icon
      name={focused ? name : outline}
      variant={focused ? 'solid' : 'outline'}
      size={size}
      color={color}
      style={style}
    />
  );
}