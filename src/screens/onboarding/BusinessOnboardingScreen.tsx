import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Icon, { IconName } from '../../components/Icon';
import ThemedText from '../../components/ThemedText';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { rgba } from '../../utils/color';
import AuthButton from '../auth/AuthButton';
import AuthField from '../auth/AuthField';
import AuthLayout from '../auth/AuthLayout';
import { AuthErrorBanner } from '../auth/AuthShared';

const BUSINESS_FIELDS: { label: string; icon: IconName }[] = [
  { label: 'Agriculture & Agro', icon: 'squares-2x2' },
  { label: 'Textiles & Mitumba', icon: 'shopping-bag' },
  { label: 'Kinyozi & Beauty', icon: 'scissors' },
  { label: 'Duka / Retail Kiosks', icon: 'building-storefront' },
  { label: 'Electronics & Tech', icon: 'device-phone-mobile' },
  { label: 'Hardware & Construction', icon: 'wrench-screwdriver' },
  { label: 'FMCG Food & Beverages', icon: 'cube' },
  { label: 'Other Business', icon: 'sparkles' },
];

const COUNTIES = [
  'Nairobi',
  'Mombasa',
  'Kisumu',
  'Nakuru',
  'Kiambu',
  'Eldoret',
  'Thika',
  'Machakos',
];

export default function BusinessOnboardingScreen() {
  const { fullName, email, completeOnboarding, signOut } = useAuth();
  const [name, setName] = useState(fullName);
  const [field, setField] = useState<string | null>(null);
  const [county, setCounty] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [countyError, setCountyError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSelectField = (label: string) => {
    setField(label);
    if (fieldError) setFieldError(null);
  };

  const handleSelectCounty = (c: string) => {
    setCounty(c);
    if (countyError) setCountyError(null);
  };

  const handleFinish = async () => {
    setFormError(null);
    const nameOk = name.trim().length >= 2;
    const fieldOk = field !== null;
    const countyOk = county !== null;
    setNameError(nameOk ? null : 'Enter your business or full name.');
    setFieldError(fieldOk ? null : 'Select your field of business.');
    setCountyError(countyOk ? null : 'Select a county.');
    if (!nameOk || !fieldOk || !countyOk) return;

    setSaving(true);
    const error = await completeOnboarding({
      fullName: name,
      businessType: field!,
      location: county!,
    });
    setSaving(false);
    if (error) setFormError(error);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', `Sign out of ${email}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => { void signOut(); } },
    ]);
  };

  return (
    <AuthLayout
      title="Your business profile"
      subtitle="Tell us your field of business so we can connect you with the right networks."
      footer={
        <Pressable
          style={styles.signOutRow}
          onPress={handleSignOut}
          hitSlop={8}
        >
          <Icon name="arrow-right-on-rectangle" size={16} color={colors.outline} />
          <ThemedText variant="labelSm" color={colors.outline} style={styles.signOutText}>
            Sign out of {email}
          </ThemedText>
        </Pressable>
      }
    >
      {formError && <AuthErrorBanner message={formError} />}

      <AuthField
        label="Business / Full Name"
        icon="user"
        value={name}
        onChangeText={(t) => {
          setName(t);
          if (nameError) setNameError(null);
          if (formError) setFormError(null);
        }}
        placeholder="e.g. Wanjiru Kamau Traders"
        autoCapitalize="words"
        returnKeyType="next"
        error={nameError}
      />

      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <ThemedText variant="labelSm" color={colors.primary} style={styles.sectionTitle}>
            Field of Business
          </ThemedText>
          <ThemedText variant="labelSm" color={colors.error}>
            *
          </ThemedText>
        </View>
        <View style={styles.grid}>
          {BUSINESS_FIELDS.map((f) => {
            const selected = field === f.label;
            return (
              <Pressable
                key={f.label}
                onPress={() => handleSelectField(f.label)}
                style={[styles.fieldCard, selected && styles.fieldCardSelected]}
              >
                <View style={[styles.fieldIcon, selected && styles.fieldIconSelected]}>
                  <Icon
                    name={f.icon}
                    size={20}
                    color={selected ? colors.onSecondaryContainer : colors.primary}
                    variant="solid"
                  />
                </View>
                <ThemedText
                  variant="labelSm"
                  color={selected ? colors.onSecondaryContainer : colors.onSurfaceVariant}
                  style={styles.fieldLabel}
                  numberOfLines={2}
                >
                  {f.label}
                </ThemedText>
                {selected && (
                  <View style={styles.fieldCheck}>
                    <Icon name="check-circle" size={14} color={colors.onPrimary} variant="solid" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
        {fieldError && (
          <ThemedText variant="labelSm" color={colors.error} style={styles.inlineError}>
            {fieldError}
          </ThemedText>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <ThemedText variant="labelSm" color={colors.primary} style={styles.sectionTitle}>
            Working County
          </ThemedText>
          <ThemedText variant="labelSm" color={colors.error}>
            *
          </ThemedText>
        </View>
        <View style={styles.countyWrap}>
          {COUNTIES.map((c) => {
            const selected = county === c;
            return (
              <Pressable
                key={c}
                onPress={() => handleSelectCounty(c)}
                style={[styles.countyChip, selected && styles.countyChipSelected]}
              >
                <ThemedText
                  variant="labelSm"
                  color={selected ? colors.onPrimary : colors.primary}
                  style={styles.countyLabel}
                >
                  {c}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
        {countyError && (
          <ThemedText variant="labelSm" color={colors.error} style={styles.inlineError}>
            {countyError}
          </ThemedText>
        )}
      </View>

      <AuthButton
        label="Finish Setup"
        icon="check-circle"
        onPress={handleFinish}
        loading={saving}
      />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  signOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  signOutText: {
    fontSize: 12,
    fontWeight: '600',
  },

  section: {
    gap: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sectionTitle: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  fieldCard: {
    width: '48%',
    minHeight: 84,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    backgroundColor: '#fff',
    padding: 12,
    gap: 8,
    position: 'relative',
  },
  fieldCardSelected: {
    borderColor: colors.secondary,
    backgroundColor: rgba(colors.secondaryContainer, 0.12),
  },
  fieldIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldIconSelected: {
    backgroundColor: colors.secondaryContainer,
  },
  fieldLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
  fieldCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  countyWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  countyChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    backgroundColor: '#fff',
  },
  countyChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  countyLabel: {
    fontSize: 12,
  },

  inlineError: {
    fontSize: 12,
  },
});