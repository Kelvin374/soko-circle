import React, { useState } from 'react';
import {
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Icon, { IconName } from '../../components/Icon';
import ThemedText from '../../components/ThemedText';
import { colors } from '../../theme/colors';
import { radii } from '../../theme';

type Props = {
  label: string;
  icon: IconName;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secure?: boolean;
  error?: string | null | undefined;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'email' | 'password' | 'name' | 'new-password';
  textContentType?:
    | 'none'
    | 'password'
    | 'emailAddress'
    | 'name'
    | 'newPassword'
    | 'oneTimeCode';
  returnKeyType?: 'done' | 'next' | 'go';
  onSubmitEditing?: () => void;
  editable?: boolean;
};

export default function AuthField({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  secure,
  error,
  keyboardType,
  autoCapitalize,
  autoComplete,
  textContentType,
  returnKeyType,
  onSubmitEditing,
  editable,
}: Props) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(Boolean(secure));
  const hasError = Boolean(error);

  return (
    <View style={styles.wrap}>
      <ThemedText variant="labelSm" color={colors.primary} style={styles.label}>
        {label}
      </ThemedText>
      <View
        style={[
          styles.inputRow,
          focused && styles.inputRowFocused,
          hasError && styles.inputRowError,
        ]}
      >
        <Icon
          name={icon}
          size={20}
          color={hasError ? colors.error : focused ? colors.primary : colors.outline}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? label}
          placeholderTextColor={colors.outline}
          secureTextEntry={secure && hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          autoComplete={autoComplete}
          textContentType={textContentType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {secure && (
          <Pressable
            hitSlop={10}
            style={styles.eyeBtn}
            onPress={() => setHidden((h) => !h)}
          >
            <Icon
              name={hidden ? 'eye' : 'eye-slash'}
              size={20}
              color={colors.outline}
            />
          </Pressable>
        )}
      </View>
      {hasError && (
        <ThemedText variant="labelSm" color={colors.error} style={styles.errorText}>
          {error}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: {
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: '#fff',
    borderRadius: radii.lg,
    paddingHorizontal: 14,
    height: 52,
  },
  inputRowFocused: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  inputRowError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: colors.onSurface,
    fontFamily: 'Inter_400Regular',
  },
  eyeBtn: {
    padding: 4,
  },
  errorText: {
    fontSize: 11,
  },
});