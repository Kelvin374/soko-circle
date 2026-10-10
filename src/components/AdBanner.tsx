import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import ThemedText from './ThemedText';
import Icon from './Icon';
import { colors } from '../theme/colors';
import { radii, shadows } from '../theme';
import { rgba } from '../utils/color';

export type AdSlide = {
  id: string;
  badge?: string;
  title: string;
  subtitle: string;
  cta?: string;
  /** Background gradient (start -> end). */
  gradient: readonly [string, string];
  /** Copy colour; defaults to white (for dark gradients). */
  textColor?: string;
  /** Optional destination opened when the slide is tapped. */
  link?: string;
};

/**
 * Placeholder campaigns. Swap this array (or pass `ads`) for real inventory —
 * e.g. rows from an `ads` table — without touching the carousel logic.
 */
const PLACEHOLDER_ADS: AdSlide[] = [
  {
    id: 'grow-duka',
    badge: 'Sponsored',
    title: 'Grow your duka online',
    subtitle: 'Reach millions of traders and customers on SokoCircle.',
    cta: 'Learn more',
    gradient: ['#001533', '#152a4a'],
  },
  {
    id: 'gap-reports',
    badge: 'Featured',
    title: 'Unlock county market reports',
    subtitle: 'Real demand and saturation data in the Gap Map.',
    cta: 'Explore',
    gradient: ['#feba4e', '#e2a238'],
    textColor: '#291800',
  },
  {
    id: 'get-verified',
    badge: 'Sponsored',
    title: 'Get verified, sell more',
    subtitle: 'Join the Trusted Dealer network and stand out.',
    cta: 'Get started',
    gradient: ['#00311d', '#001a0d'],
  },
];

const ROTATE_MS = 4500;
const TRANSITION_MS = 550;

type Props = {
  ads?: AdSlide[];
  /** Milliseconds each slide stays on screen. */
  interval?: number;
};

export default function AdBanner({ ads = PLACEHOLDER_ADS, interval = ROTATE_MS }: Props) {
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState(0);

  const [index] = useState(() => new Animated.Value(0));
  const [entrance] = useState(() => new Animated.Value(0));
  const indexRef = useRef(0);

  const count = ads.length;
  const slides = count > 1 ? [...ads, ads[0]] : ads;

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  }, []);

  const goTo = useCallback(
    (next: number) => {
      indexRef.current = next;
      setActive(next % count);
      Animated.timing(index, {
        toValue: next,
        duration: TRANSITION_MS,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(({ finished }) => {
        // Reached the duplicate of slide 0 — snap back invisibly to loop.
        if (finished && next >= count) {
          index.setValue(0);
          indexRef.current = 0;
        }
      });
    },
    [count, index],
  );

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  useEffect(() => {
    if (width === 0 || count < 2) return;
    const id = setInterval(() => goTo(indexRef.current + 1), interval);
    return () => clearInterval(id);
  }, [width, count, interval, goTo]);

  if (count === 0) return null;

  const translateX = index.interpolate({
    inputRange: [0, count],
    outputRange: [0, -count * width],
    extrapolate: 'clamp',
  });

  const open = (ad: AdSlide) => {
    if (ad.link) void Linking.openURL(ad.link).catch(() => {});
  };

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          opacity: entrance,
          transform: [
            {
              translateY: entrance.interpolate({
                inputRange: [0, 1],
                outputRange: [8, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.viewport} onLayout={onLayout}>
        {width > 0 && (
          <Animated.View
            style={[
              styles.track,
              { width: width * slides.length, transform: [{ translateX }] },
            ]}
          >
            {slides.map((ad, i) => {
              const text = ad.textColor ?? '#ffffff';
              return (
                <View key={`${ad.id}-${i}`} style={{ width }}>
                  <Pressable
                    onPress={() => open(ad)}
                    disabled={!ad.link}
                    accessibilityRole={ad.link ? 'button' : 'text'}
                    accessibilityLabel={`${ad.title}. ${ad.subtitle}`}
                    style={styles.slide}
                  >
                    <LinearGradient
                      colors={ad.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.decor} pointerEvents="none" />

                    <View style={styles.copy}>
                      {ad.badge ? (
                        <View style={styles.badge}>
                          <ThemedText
                            variant="labelSm"
                            color={text}
                            style={styles.badgeText}
                          >
                            {ad.badge}
                          </ThemedText>
                        </View>
                      ) : null}

                      <ThemedText
                        variant="titleMd"
                        color={text}
                        numberOfLines={2}
                        style={styles.title}
                      >
                        {ad.title}
                      </ThemedText>

                      <ThemedText
                        variant="bodyMd"
                        color={rgba(text, 0.85)}
                        numberOfLines={2}
                        style={styles.subtitle}
                      >
                        {ad.subtitle}
                      </ThemedText>

                      {ad.cta ? (
                        <View style={[styles.cta, { backgroundColor: rgba(text, 0.16) }]}>
                          <ThemedText variant="labelSm" color={text} style={{ fontSize: 12 }}>
                            {ad.cta}
                          </ThemedText>
                          <Icon name="arrow-up-right" size={14} color={text} />
                        </View>
                      ) : null}
                    </View>
                  </Pressable>
                </View>
              );
            })}
          </Animated.View>
        )}
      </View>

      {count > 1 && (
        <View style={styles.dots} pointerEvents="none">
          {ads.map((ad, i) => (
            <View
              key={ad.id}
              style={[styles.dot, i === active && styles.dotActive]}
            />
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
    ...shadows.card,
  },
  viewport: {
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  track: {
    flexDirection: 'row',
  },
  slide: {
    height: 168,
    padding: 20,
    justifyContent: 'center',
  },
  decor: {
    position: 'absolute',
    right: -48,
    top: -48,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  copy: {
    gap: 6,
    maxWidth: '86%',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
    marginBottom: 2,
  },
  badgeText: {
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 19,
    lineHeight: 25,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  cta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginTop: 6,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.outlineVariant,
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.primary,
  },
});
