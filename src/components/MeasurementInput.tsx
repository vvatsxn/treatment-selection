import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Animated, Image } from 'react-native';
import { pippTheme } from '../theme/pipp';
// @ts-ignore
import ErrorOutlineIcon from '../theme/icons/error-outline.svg';

interface MeasurementInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
}

const MeasurementInput: React.FC<MeasurementInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder = '',
  error
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const labelAnim = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelTop = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [12, -8],
  });

  const labelFontSize = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [pippTheme.fontSize.body1, pippTheme.fontSize.label],
  });

  const showSwingLabel = isFocused || value;
  const hasError = !!error;

  return (
    <View style={styles.container}>
      {showSwingLabel && (
        <Animated.Text
          style={[
            styles.label,
            hasError && styles.labelError,
            {
              top: labelTop,
              fontSize: labelFontSize,
            },
          ]}
        >
          {label}
        </Animated.Text>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            isFocused && styles.inputFocused,
            hasError && styles.inputError,
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={!showSwingLabel ? placeholder : ''}
          placeholderTextColor={pippTheme.colors.text.secondary}
          keyboardType="numeric"
        />
        {hasError && (
          <Image
            source={ErrorOutlineIcon}
            style={styles.errorIcon}
          />
        )}
      </View>
      {hasError && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: pippTheme.colors.navy[100],
    borderRadius: 4,
    backgroundColor: pippTheme.colors.background.primary,
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingRight: 40,
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body1,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.secondary,
    outlineStyle: 'none',
    textAlign: 'left',
    height: 48,
    overflow: 'visible',
    verticalAlign: 'middle',
  },
  inputFocused: {
    borderColor: pippTheme.accessibility.focus,
    borderWidth: 2,
    paddingHorizontal: 11,
    paddingVertical: 11,
    paddingRight: 39,
  },
  inputError: {
    borderColor: pippTheme.colors.border.error,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingRight: 40,
  },
  label: {
    position: 'absolute',
    left: 12,
    backgroundColor: pippTheme.colors.background.primary,
    paddingHorizontal: 4,
    fontFamily: pippTheme.fontFamily.body,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.secondary,
    zIndex: 1,
    pointerEvents: 'none',
    overflow: 'visible',
  },
  labelError: {
    color: pippTheme.colors.text.error,
  },
  errorIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 24,
    height: 24,
    tintColor: pippTheme.colors.icon.error,
  },
  errorText: {
    marginTop: 4,
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.label,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.error,
  },
});

export default MeasurementInput;
