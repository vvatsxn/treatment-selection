import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ColorCardProps {
  colorName: string;
  colorValue: string;
  hexValue?: string;
}

const ColorCard: React.FC<ColorCardProps> = ({ colorName, colorValue, hexValue }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.colorBox, { backgroundColor: colorValue }]} />
      <View style={styles.textContainer}>
        <Text style={styles.colorName}>{colorName}</Text>
        <Text style={styles.colorValue}>{hexValue || colorValue}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  colorBox: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  textContainer: {
    flex: 1,
  },
  colorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#18181b',
    marginBottom: 4,
  },
  colorValue: {
    fontSize: 12,
    color: '#71717a',
    fontFamily: 'monospace',
  },
});

export default ColorCard;
