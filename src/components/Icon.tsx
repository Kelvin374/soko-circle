import Svg, { Path } from 'react-native-svg';
import { StyleProp, ViewStyle } from 'react-native';
import { HEROICONS, HeroIconName } from '../icons/heroicons';

export type IconName = HeroIconName;

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  /** 'solid' = filled glyph (like Material Symbols FILL 1), 'outline' = stroked glyph (FILL 0) */
  variant?: 'outline' | 'solid';
  style?: StyleProp<ViewStyle>;
};

export default function Icon({
  name,
  size = 24,
  color = '#000',
  variant = 'outline',
  style,
}: Props) {
  const paths = HEROICONS[name][variant];
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      {variant === 'solid'
        ? paths.map((p, i) => (
            <Path
              key={i}
              d={p.d}
              fill={color}
              fillRule={p.fillRule}
            />
          ))
        : paths.map((p, i) => (
            <Path
              key={i}
              d={p.d}
              stroke={color}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ))}
    </Svg>
  );
}