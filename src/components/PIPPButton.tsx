import React, { useState } from 'react';
import { Text, StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import { pippTheme } from '../theme/pipp';

interface PIPPButtonProps {
  text?: string;
  title?: string; // Keep for backwards compatibility
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'destructive' | 'secondary';
  iconRight?: any;
}

const PIPPButton: React.FC<PIPPButtonProps> = ({
  text,
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  iconRight
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const buttonText = text || title || '';

  const getBackgroundColor = () => {
    if (variant === 'secondary') {
      return pippTheme.colors.background.primary; // white background
    }
    if (disabled) {
      return variant === 'destructive'
        ? pippTheme.colors.button.solidDestructive
        : pippTheme.colors.button.solidPipp;
    }
    if (variant === 'destructive') {
      if (isPressed) {
        return pippTheme.colors.button.solidDestructivePressed;
      }
      if (isHovered) {
        return pippTheme.colors.button.solidDestructiveHover;
      }
      return pippTheme.colors.button.solidDestructive;
    }
    // Primary variant
    if (isPressed) {
      return pippTheme.colors.button.solidPippPrimaryPressed;
    }
    if (isHovered) {
      return pippTheme.colors.button.solidPippPrimaryHover;
    }
    return pippTheme.colors.button.solidPipp;
  };

  const getBorderStyle = () => {
    if (variant === 'secondary') {
      return {
        borderWidth: 1,
        borderColor: pippTheme.colors.text.primary,
      };
    }
    return {};
  };

  const getTextColor = () => {
    if (variant === 'secondary') {
      return pippTheme.colors.text.primary;
    }
    return pippTheme.colors.text.primaryCtaInverse;
  };

  const getIconColor = () => {
    if (variant === 'secondary') {
      return pippTheme.colors.icon.default;
    }
    return pippTheme.colors.icon.inverse;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        getBorderStyle(),
        disabled && styles.buttonDisabled,
      ]}
      onPress={() => { setIsPressed(false); setIsHovered(false); onPress(); }}
      disabled={disabled}
      activeOpacity={1}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsPressed(false); }}
    >
      <View style={styles.content}>
        <Text style={[styles.text, { color: getTextColor() }]}>{buttonText}</Text>
        {iconRight && (
          <Image
            source={iconRight}
            style={[styles.iconRight, { tintColor: getIconColor() }]}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: pippTheme.radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontFamily: pippTheme.fontFamily.button,
    fontSize: pippTheme.fontSize.body1,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primaryCtaInverse,
    lineHeight: pippTheme.lineHeight[20],
  },
  iconRight: {
    width: 16,
    height: 16,
  },
});

export default PIPPButton;
