import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { pippTheme } from '../theme/pipp';
import { colorPalettes } from '../theme/global';
import ColorPalette from '../components/ColorPalette';
import TextStyleCard from '../components/TextStyleCard';

const ThemeShowcase: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.mainTitle}>PIPP Theme Showcase</Text>
          <Text style={styles.subtitle}>
            A comprehensive view of all colors and typography in the PIPP design system
          </Text>
        </View>

        {/* Typography Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Typography</Text>
          <Text style={styles.sectionDescription}>
            Font families, sizes, weights, and line heights
          </Text>

          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Headings (Work Sans)</Text>
            <TextStyleCard
              label="Header 1"
              fontFamily={pippTheme.fontFamily.heading}
              fontSize={pippTheme.fontSize.header1}
              fontWeight={pippTheme.fontWeight.bold}
              lineHeight={pippTheme.lineHeight[40]}
              letterSpacing={pippTheme.letterSpacing.header1}
            />
            <TextStyleCard
              label="Header 2"
              fontFamily={pippTheme.fontFamily.heading}
              fontSize={pippTheme.fontSize.header2}
              fontWeight={pippTheme.fontWeight.bold}
              lineHeight={pippTheme.lineHeight[36]}
            />
            <TextStyleCard
              label="Header 3"
              fontFamily={pippTheme.fontFamily.heading}
              fontSize={pippTheme.fontSize.header3}
              fontWeight={pippTheme.fontWeight.bold}
              lineHeight={pippTheme.lineHeight[32]}
            />
            <TextStyleCard
              label="Header 4"
              fontFamily={pippTheme.fontFamily.heading}
              fontSize={pippTheme.fontSize.header4}
              fontWeight={pippTheme.fontWeight.bold}
              lineHeight={pippTheme.lineHeight[28]}
            />
          </View>

          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Body Text (Inter)</Text>
            <TextStyleCard
              label="Body 1 - Regular"
              fontFamily={pippTheme.fontFamily.body}
              fontSize={pippTheme.fontSize.body1}
              fontWeight={pippTheme.fontWeight.regular}
              lineHeight={pippTheme.lineHeight[24]}
            />
            <TextStyleCard
              label="Body 1 - SemiBold"
              fontFamily={pippTheme.fontFamily.body}
              fontSize={pippTheme.fontSize.body1}
              fontWeight={pippTheme.fontWeight.semiBold}
              lineHeight={pippTheme.lineHeight[24]}
            />
            <TextStyleCard
              label="Body 1 - Bold"
              fontFamily={pippTheme.fontFamily.body}
              fontSize={pippTheme.fontSize.body1}
              fontWeight={pippTheme.fontWeight.bold}
              lineHeight={pippTheme.lineHeight[24]}
            />
            <TextStyleCard
              label="Body 2 - Regular"
              fontFamily={pippTheme.fontFamily.body}
              fontSize={pippTheme.fontSize.body2}
              fontWeight={pippTheme.fontWeight.regular}
              lineHeight={pippTheme.lineHeight[22]}
            />
            <TextStyleCard
              label="Body 2 - SemiBold"
              fontFamily={pippTheme.fontFamily.body}
              fontSize={pippTheme.fontSize.body2}
              fontWeight={pippTheme.fontWeight.semiBold}
              lineHeight={pippTheme.lineHeight[22]}
            />
            <TextStyleCard
              label="Label"
              fontFamily={pippTheme.fontFamily.body}
              fontSize={pippTheme.fontSize.label}
              fontWeight={pippTheme.fontWeight.semiBold}
              lineHeight={pippTheme.lineHeight[20]}
            />
            <TextStyleCard
              label="Small"
              fontFamily={pippTheme.fontFamily.body}
              fontSize={pippTheme.fontSize.small}
              fontWeight={pippTheme.fontWeight.regular}
              lineHeight={pippTheme.lineHeight[12]}
            />
          </View>

          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Button Text (Inter)</Text>
            <TextStyleCard
              label="Button - SemiBold"
              fontFamily={pippTheme.fontFamily.button}
              fontSize={pippTheme.fontSize.body1}
              fontWeight={pippTheme.fontWeight.semiBold}
              lineHeight={pippTheme.lineHeight[24]}
            />
          </View>
        </View>

        {/* PIPP Semantic Colors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PIPP Semantic Colors</Text>

          <ColorPalette
            title="Text Colors"
            description="Text colors for various UI states"
            colors={pippTheme.colors.text}
          />

          <ColorPalette
            title="Background Colors"
            description="Background colors for surfaces and containers"
            colors={pippTheme.colors.background}
          />

          <ColorPalette
            title="Border Colors"
            description="Border colors for inputs and dividers"
            colors={pippTheme.colors.border}
          />

          <ColorPalette
            title="Button Colors"
            description="Button background and state colors"
            colors={pippTheme.colors.button}
          />

          <ColorPalette
            title="Pill/Tab Colors"
            description="Pill and tab component colors"
            colors={pippTheme.colors.pill}
          />

          <ColorPalette
            title="Surface Colors"
            description="Surface colors for cards and containers"
            colors={pippTheme.colors.surface}
          />

          <ColorPalette
            title="Icon Colors"
            description="Icon colors for various states"
            colors={pippTheme.colors.icon}
          />
        </View>

        {/* Global Shared Color Palettes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Global Phlo Color Palettes</Text>
          <Text style={styles.sectionDescription}>
            Shared across all Phlo products
          </Text>

          <ColorPalette
            title="Teal"
            description="Primary Phlo branding theme"
            colors={colorPalettes.teal}
          />

          <ColorPalette
            title="Zeus"
            description="Main Phlo Connect theme"
            colors={colorPalettes.zeus}
          />

          <ColorPalette
            title="Navy"
            description="Shared across all Phlo products"
            colors={colorPalettes.navy}
          />

          <ColorPalette
            title="Athena"
            description="Neutral grays"
            colors={colorPalettes.athena}
          />

          <ColorPalette
            title="Info"
            description="Blue palette for informational states"
            colors={colorPalettes.info}
          />

          <ColorPalette
            title="Error"
            description="Red palette for error states"
            colors={colorPalettes.error}
          />

          <ColorPalette
            title="Success"
            description="Green palette for success states"
            colors={colorPalettes.success}
          />

          <ColorPalette
            title="Warning"
            description="Orange palette for warning states"
            colors={colorPalettes.warning}
          />
        </View>

        {/* Footer spacing */}
        <View style={styles.footer} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  content: {
    padding: 20,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  headerSection: {
    marginBottom: 32,
    paddingVertical: 24,
    borderBottomWidth: 3,
    borderBottomColor: '#14b8a6',
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#18181b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#52525b',
    lineHeight: 24,
  },
  section: {
    marginBottom: 48,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#18181b',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#71717a',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  subsection: {
    marginBottom: 32,
  },
  subsectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#18181b',
    marginBottom: 16,
  },
  footer: {
    height: 40,
  },
});

export default ThemeShowcase;
