import { breakpoints, spacing, borderRadius, shadows, typography, colorPalettes } from './global';

export const pippTheme = {
  name: 'PIPP',
  description: 'Patient-facing app theme',

  colors: {
    // ===========================================
    // TEXT COLORS
    // ===========================================
    text: {
      primary: colorPalettes.navy[900],
      secondary: colorPalettes.navy[700],
      subtle: colorPalettes.navy[400],
      disabled: colorPalettes.navy[200],
      action: colorPalettes.teal[800],
      actionHover: colorPalettes.teal[900],
      inverse: '#FFFFFF', // Background/pure-white
      primaryCtaInverse: '#FFFFFF', // Background/pure-white
      link: colorPalettes.teal[800],
      linkHover: colorPalettes.teal[800],
      linkPressed: colorPalettes.teal[700],
      error: colorPalettes.error[900],
      success: colorPalettes.success[900],
      info: colorPalettes.info[800],
      warning: colorPalettes.warning[900],
      strong: colorPalettes.navy[1000],
      secondaryCta: colorPalettes.navy[900],
    },

    // ===========================================
    // BACKGROUND COLORS
    // ===========================================
    background: {
      primary: '#FFFFFF', // Background/pure-white
      secondary: '#F1F8FC', // Background/light-blue
      tertiary: '#F9F9F9', // Background/light-grey
      inverse: colorPalettes.navy[900],
    },

    // ===========================================
    // BORDER COLORS
    // ===========================================
    border: {
      default: colorPalettes.navy[50],
      alt: colorPalettes.navy[200],
      primary: colorPalettes.teal[800],
      primaryHover: colorPalettes.teal[800],
      error: colorPalettes.error[800],
      success: colorPalettes.success[900],
      warning: colorPalettes.warning[900],
      disabled: colorPalettes.navy[50],
    },

    // ===========================================
    // BUTTON COLORS - SOLID
    // ===========================================
    button: {
      solid: colorPalettes.teal[800],
      solidPrimaryHover: colorPalettes.teal[700],
      solidPrimaryPressed: colorPalettes.teal[900],
      solidPositive: colorPalettes.success[900],
      solidPositiveHover: colorPalettes.success[800],
      solidPositivePressed: colorPalettes.success[1000],
      solidDestructive: colorPalettes.error[800],
      solidDestructiveHover: colorPalettes.error[700],
      solidDestructivePressed: colorPalettes.error[900],

      // PIPP-specific button colors
      solidPipp: colorPalettes.navy[900],
      solidPippPrimaryHover: colorPalettes.navy[700],
      solidPippPrimaryPressed: colorPalettes.navy[1000],

      // Outlined
      outlined: '#FFFFFF', // Background/pure-white
      outlinedBorderDefault: colorPalettes.teal[800],
      outlinedPrimaryHover: colorPalettes.teal[50],
      outlinedPrimaryPressed: colorPalettes.teal[100],
      outlinedDestructiveHover: colorPalettes.error[50],
      outlinedDestructivePressed: colorPalettes.error[100],
      outlinedBorderDark: colorPalettes.navy[900],

      // Ghost
      ghost: 'transparent',
      ghostHover: colorPalettes.teal[50],
      ghostPressed: 'transparent',

      // Icon buttons
      solidIconBtn: '#E6E7ED', // bg/bg-tertiary (navy-50)
      solidHoverIconBtn: colorPalettes.teal[50],
      solidPressedIconBtn: colorPalettes.teal[100],
    },

    // ===========================================
    // PILL/TAB COLORS
    // ===========================================
    pill: {
      default: '#FFFFFF', // Background/pure-white
      hover: colorPalettes.navy[50],
      pressed: colorPalettes.teal[50],
      active: colorPalettes.teal[50],
      activeHover: colorPalettes.teal[100],
      text: colorPalettes.navy[900],
      outline: colorPalettes.navy[200],
      solidPipp: colorPalettes.navy[900],
      solidPippPrimaryHover: colorPalettes.navy[700],
      solidPippPrimaryPressed: colorPalettes.navy[1000],
    },

    // ===========================================
    // SURFACE COLORS
    // ===========================================
    surface: {
      default: '#FFFFFF', // Background/pure-white
      alt: '#E6E7ED', // Background/light-grey (navy-50)
      hover: '#E6E7ED', // Background/light-grey (navy-50)
      altHover: colorPalettes.teal[100],
      selected: '#F1F9FF', // Background/light-blue (zeus-0)
      success: colorPalettes.success[50],
      warning: colorPalettes.warning[50],
      warningStrong: colorPalettes.warning[100],
      info: colorPalettes.info[50],
      infoDark: colorPalettes.info[900],
      error: colorPalettes.error[50],
      neutral: colorPalettes.navy[50],
      dark: colorPalettes.navy[900],
      accent: colorPalettes.teal[50],
      brand: colorPalettes.teal[800],
      brandDark: colorPalettes.navy[900],
    },

    // ===========================================
    // ICON COLORS
    // ===========================================
    icon: {
      subtle: colorPalettes.navy[100],
      default: colorPalettes.navy[900],
      brand: colorPalettes.teal[800],
      brand2: colorPalettes.teal[900],
      error: colorPalettes.error[800],
      warning: colorPalettes.warning[800],
      success: colorPalettes.success[800],
      info: colorPalettes.info[800],
      inverse: '#FFFFFF', // Background/pure-white
      primaryCtaInverse: '#FFFFFF', // Background/pure-white
      disabled: colorPalettes.navy[200],
    },

    // ===========================================
    // SHARED COLOR PALETTES (from global)
    // ===========================================
    ...colorPalettes,
  },

  // ===========================================
  // ICON BUTTON HEIGHT
  // ===========================================
  iconButtonHeight: {
    medium: spacing.xxxl, // 48px
    heightSmall: spacing.xl, // 32px
    heightXSmall: spacing.lg, // 24px
    tiny: spacing.md, // 20px (using closest value)
  },

  // ===========================================
  // BUTTON HEIGHT
  // ===========================================
  buttonHeight: spacing.xxxl, // 48px

  // ===========================================
  // RADIUS
  // ===========================================
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '360px',
    button: '360px',
  },

  // ===========================================
  // PADDING
  // ===========================================
  padding: {
    0: '0px',
    2: '2px',
    4: '4px',
    8: '8px',
    12: '12px',
    16: '16px',
    20: '20px',
    24: '24px',
    32: '32px',
    40: '40px',
    48: '48px',
    default: '16px',
  },

  // ===========================================
  // GAP
  // ===========================================
  gap: {
    0: '0px',
    2: '2px',
    4: '4px',
    8: '8px',
    12: '12px',
    16: '16px',
    20: '20px',
    24: '24px',
    buttonGroup: '12px',
  },

  // ===========================================
  // MARGIN
  // ===========================================
  margin: {
    pageXs: '20px',
    pageSm: '20px',
    pageMd: '32px',
    pageLg: '40px',
    pageXl: '60px',
  },

  // ===========================================
  // FONT FAMILY
  // ===========================================
  fontFamily: {
    heading: "'Work Sans', sans-serif",
    body: "'Inter', sans-serif",
    button: "'Inter', sans-serif",
  },

  // ===========================================
  // FONT WEIGHT
  // ===========================================
  fontWeight: {
    regular: 400,
    semiBold: 600,
    bold: 700,
  },

  // ===========================================
  // FONT SIZE
  // ===========================================
  fontSize: {
    header1: 32,
    header2: 28,
    header3: 24,
    header4: 20,
    body1: 16,
    body2: 14,
    label: 12,
    small: 10,
  },

  // ===========================================
  // LINE HEIGHT
  // ===========================================
  lineHeight: {
    40: 40,
    36: 36,
    32: 32,
    28: 28,
    24: 24,
    22: 22,
    20: 20,
    12: 12,
  },

  // ===========================================
  // LETTER SPACING
  // ===========================================
  letterSpacing: {
    header1: -0.08,
  },

  // ===========================================
  // ACCESSIBILITY
  // ===========================================
  accessibility: {
    focus: colorPalettes.teal[900],
  },

  // Inherit global tokens
  breakpoints,
  spacing,
  borderRadius,
  shadows,
  typography,
} as const; 