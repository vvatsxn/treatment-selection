import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { pippTheme } from '../theme/pipp';

interface AnswerCardProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

const AnswerCard: React.FC<AnswerCardProps> = ({ label, selected, onPress }) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && styles.containerSelected
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Radio button with 42x42 touch target */}
      <View style={styles.radioTouchArea}>
        <View style={[
          styles.radioOuter,
          selected && styles.radioOuterSelected
        ]}>
          {selected && <View style={styles.radioInner} />}
        </View>
      </View>

      {/* Label text */}
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: pippTheme.colors.surface.default,
    borderWidth: 1,
    borderColor: pippTheme.colors.border.default,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  containerSelected: {
    backgroundColor: pippTheme.colors.surface.selected,
    borderWidth: 2,
    borderColor: pippTheme.colors.border.primary,
    paddingHorizontal: 7,
    paddingVertical: 9,
  },
  radioTouchArea: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: pippTheme.colors.border.alt,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  radioOuterSelected: {
    borderColor: pippTheme.colors.icon.brand,
  },
  radioInner: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: pippTheme.colors.icon.brand,
    top: '50%',
    left: '50%',
    transform: [{ translateX: -4.5 }, { translateY: -4.5 }],
  },
  label: {
    flex: 1,
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body1,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.primary,
  },
});

export default AnswerCard;
