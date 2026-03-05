import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { pippTheme } from '../theme/pipp';
import UnitToggle from './UnitToggle';
import MeasurementInput from './MeasurementInput';

interface MeasurementSectionProps {
  title: string;
  leftUnit: string;
  rightUnit: string;
  selectedUnit: 'left' | 'right';
  onUnitToggle: (unit: 'left' | 'right') => void;
  inputs: Array<{
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    error?: string;
  }>;
}

const MeasurementSection: React.FC<MeasurementSectionProps> = ({
  title,
  leftUnit,
  rightUnit,
  selectedUnit,
  onUnitToggle,
  inputs,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <UnitToggle
          leftOption={leftUnit}
          rightOption={rightUnit}
          selected={selectedUnit}
          onToggle={onUnitToggle}
        />
      </View>

      <View style={styles.inputsContainer}>
        {inputs.map((input, index) => (
          <MeasurementInput
            key={index}
            label={input.label}
            value={input.value}
            onChangeText={input.onChangeText}
            placeholder={input.placeholder}
            error={input.error}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: pippTheme.fontFamily.body,
    fontSize: pippTheme.fontSize.body1,
    fontWeight: pippTheme.fontWeight.semiBold.toString() as any,
    color: pippTheme.colors.text.secondary,
    lineHeight: pippTheme.lineHeight[24],
  },
  inputsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
});

export default MeasurementSection;
