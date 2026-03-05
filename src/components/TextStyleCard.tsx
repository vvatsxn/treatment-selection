import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TextStyleCardProps {
  label: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight?: number;
  letterSpacing?: number;
}

const TextStyleCard: React.FC<TextStyleCardProps> = ({
  label,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.specs}>
          <Text style={styles.specText}>
            {fontFamily} • {fontSize}px • {fontWeight === 400 ? 'Regular' : fontWeight === 600 ? 'SemiBold' : 'Bold'}
          </Text>
          {lineHeight && <Text style={styles.specText}>Line height: {lineHeight}px</Text>}
          {letterSpacing && <Text style={styles.specText}>Letter spacing: {letterSpacing}</Text>}
        </View>
      </View>
      <Text
        style={[
          styles.sample,
          {
            fontFamily,
            fontSize,
            fontWeight: fontWeight.toString() as any,
            lineHeight,
            letterSpacing,
          },
        ]}
      >
        The quick brown fox jumps over the lazy dog
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  infoContainer: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e7',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#18181b',
    marginBottom: 4,
  },
  specs: {
    gap: 2,
  },
  specText: {
    fontSize: 12,
    color: '#71717a',
    fontFamily: 'monospace',
  },
  sample: {
    color: '#18181b',
  },
});

export default TextStyleCard;
