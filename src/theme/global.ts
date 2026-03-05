export const breakpoints = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px',
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
  xxxl: '64px',
} as const;

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  round: '50%',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
} as const;

// ===========================================
// GLOBAL COLOR PALETTES
// ===========================================

export const colorPalettes = {
  // Teal - Primary Phlo branding theme
  teal: {
    50: '#DEF4F7',   // RGB: 222, 244, 247
    100: '#AEE5EB',  // RGB: 174, 229, 235
    200: '#7AD3DE',  // RGB: 122, 211, 222
    300: '#46C1D1',  // RGB: 70, 193, 209
    400: '#1FB5C7',  // RGB: 31, 181, 199
    500: '#00A9BE',  // RGB: 0, 169, 190
    600: '#0099AC',  // RGB: 0, 153, 172
    700: '#008593',  // RGB: 0, 133, 147
    800: '#086A74',  // RGB: 8, 106, 116
    900: '#044F53',  // RGB: 4, 79, 83
  },
  
  // Zeus - Main Phlo Connect theme
  zeus: {
    0: '#F1F9FF',    // RGB: 241, 249, 255
    50: '#E3F3FF',   // RGB: 227, 243, 255
    100: '#BBE0FF',  // RGB: 187, 224, 255
    200: '#8ECEFF',  // RGB: 142, 206, 255
    300: '#5CBAFF',  // RGB: 92, 186, 255
    400: '#31AAFF',  // RGB: 49, 170, 255
    500: '#009BFF',  // RGB: 0, 155, 255
    600: '#0C8CFF',  // RGB: 12, 140, 255
    700: '#1779F2',  // RGB: 23, 121, 242
    800: '#1C66E0',  // RGB: 28, 102, 224
    900: '#163FB9',  // RGB: 22, 63, 185
  },
  
  // Navy - Shared across all Phlo products
  navy: {
    50: '#E6E7ED',   // RGB: 230, 231, 237
    100: '#C0C4D3',  // RGB: 192, 196, 211
    200: '#989EB5',  // RGB: 152, 158, 181
    300: '#727998',  // RGB: 114, 121, 152
    400: '#575D84',  // RGB: 87, 93, 132
    500: '#3C4472',  // RGB: 60, 68, 114
    600: '#373D6A',  // RGB: 55, 61, 106
    700: '#2F345F',  // RGB: 47, 52, 95
    800: '#282B53',  // RGB: 40, 43, 83
    900: '#07073D',  // RGB: 7, 7, 61
    1000: '#01011A', // RGB: 1, 1, 26
  },
  
  // Athena - Neutral grays
  athena: {
    100: '#FCFAF6',  // RGB: 252, 250, 246
    200: '#F0EEEA',  // RGB: 240, 238, 234
    300: '#D0D0D0',  // RGB: 208, 208, 208
    500: '#9E9E9E',  // RGB: 158, 158, 158
  },
  
  // Info - Blue palette
  info: {
    50: '#E9EEFA',   // RGB: 233, 238, 250
    100: '#CDD4E5',  // RGB: 205, 212, 229
    200: '#98A7C4',  // RGB: 152, 167, 196
    300: '#6F88B6',  // RGB: 111, 136, 182
    400: '#4A6FAE',  // RGB: 74, 111, 174
    500: '#1C58A8',  // RGB: 28, 88, 168
    600: '#1350A0',  // RGB: 19, 80, 160
    700: '#1350A0',  // RGB: 7, 71, 147
    800: '#003D88',  // RGB: 0, 61, 136
    900: '#0E2B62',  // RGB: 14, 43, 98
  },
  
  // Error - Red palette
  error: {
    50: '#FDEBEE',   // RGB: 253, 235, 238
    100: '#FBCCD1',  // RGB: 251, 204, 209
    200: '#E89899',  // RGB: 232, 152, 153
    300: '#DC7173',  // RGB: 220, 113, 115
    400: '#E55251',  // RGB: 229, 82, 81
    500: '#E94238',  // RGB: 233, 66, 56
    600: '#DA3937',  // RGB: 218, 57, 55
    700: '#C82F31',  // RGB: 200, 47, 49
    800: '#BB292A',  // RGB: 187, 41, 42
    900: '#AC1F1F',  // RGB: 172, 31, 31
  },
  
  // Success - Green palette
  success: {
    50: '#E2FBF0',   // RGB: 226, 251, 240
    100: '#B8F4DA',  // RGB: 184, 244, 218
    200: '#83ECC3',  // RGB: 131, 236, 195
    300: '#29E5A9',  // RGB: 41, 229, 169
    400: '#00DD95',  // RGB: 0, 221, 149
    500: '#00D482',  // RGB: 0, 212, 130
    600: '#00C376',  // RGB: 0, 195, 118
    700: '#00B067',  // RGB: 0, 176, 103
    800: '#009E5A',  // RGB: 0, 158, 90
    900: '#007D42',  // RGB: 0, 125, 66
    1000: '#006B2E', // RGB: 0, 107, 46
  },
  
  // Warning - Orange palette
  warning: {
    50: '#FEF3E0',   // RGB: 254, 243, 224
    100: '#FCE0B3',  // RGB: 252, 224, 179
    200: '#FACD81',  // RGB: 250, 205, 129
    300: '#F9B84F',  // RGB: 249, 184, 79
    400: '#F8A929',  // RGB: 248, 169, 41
    500: '#F79A07',  // RGB: 247, 154, 7
    600: '#F38E04',  // RGB: 243, 142, 4
    700: '#ED7F02',  // RGB: 237, 127, 2
    800: '#E76F00',  // RGB: 231, 111, 0
    900: '#DE5600',  // RGB: 222, 86, 0
  },
} as const;

export const typography = {
  fontFamily: {
    primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"Fira Code", "Monaco", "Cascadia Code", "Roboto Mono", monospace',
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const; 