import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ColorCard from './ColorCard';

interface ColorPaletteProps {
  title: string;
  description?: string;
  colors: { [key: string]: string };
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ title, description, colors }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      <View style={styles.colorsContainer}>
        {Object.entries(colors).map(([name, value]) => (
          <ColorCard
            key={`${title}-${name}`}
            colorName={name}
            colorValue={value}
            hexValue={value}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  header: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#e4e4e7',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#18181b',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#71717a',
    fontStyle: 'italic',
  },
  colorsContainer: {
    marginTop: 8,
  },
});

export default ColorPalette;
