import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { pippTheme } from '../theme/pipp';

interface UnitToggleProps {
  leftOption: string;
  rightOption: string;
  selected: 'left' | 'right';
  onToggle: (option: 'left' | 'right') => void;
}

const UnitToggle: React.FC<UnitToggleProps> = ({ leftOption, rightOption, selected, onToggle }) => {
  const slideAnim = React.useRef(new Animated.Value(selected === 'left' ? 0 : 1)).current;

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: selected === 'left' ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [selected]);

  const circlePosition = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 20],
  });

  return (
    <View style={styles.container}>
      <Text style={[styles.text, selected === 'left' && styles.textSelected]}>
        {leftOption}
      </Text>
      <TouchableOpacity
        style={styles.toggleTrack}
        onPress={() => onToggle(selected === 'left' ? 'right' : 'left')}
        activeOpacity={1}
      >
        <Animated.View style={[styles.toggleCircle, { left: circlePosition }]} />
      </TouchableOpacity>
      <Text style={[styles.text, selected === 'right' && styles.textSelected]}>
        {rightOption}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleTrack: {
    width: 46,
    height: 28,
    backgroundColor: pippTheme.colors.surface.brand,
    borderRadius: 360,
    position: 'relative',
    justifyContent: 'center',
  },
  toggleCircle: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: pippTheme.colors.surface.default,
  },
  text: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body1,
    fontWeight: pippTheme.fontWeight.regular.toString() as any,
    color: pippTheme.colors.text.secondary,
  },
  textSelected: {
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
  },
});

export default UnitToggle;
