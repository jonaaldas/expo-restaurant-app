// Brand Colors
const brandColors = {
  primary: '#FF6B35',      // Vibrant Orange
  secondary: '#192A56',    // Navy Blue
  accent: '#FFFFFF',       // White
  gray: '#7B8794',         // Subtle Gray
};

// Theme-based colors
const tintColorLight = brandColors.primary;
const tintColorDark = brandColors.accent;

export default {
  // Brand colors (theme-independent)
  brand: brandColors,
  
  // Semantic colors
  colors: {
    primary: brandColors.primary,
    secondary: brandColors.secondary,
    white: brandColors.accent,
    navy: brandColors.secondary,
    orange: brandColors.primary,
    gray: brandColors.gray,
    
    // Overlay variations
    navyOverlay: 'rgba(25, 42, 86, 0.7)',
    whiteTransparent: 'rgba(255, 255, 255, 0.1)',
    
    // Shadow colors
    orangeShadow: brandColors.primary,
  },
  
  // Original theme structure (updated with brand colors)
  light: {
    text: brandColors.secondary,
    background: brandColors.accent,
    tint: tintColorLight,
    tabIconDefault: brandColors.gray,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: brandColors.accent,
    background: brandColors.secondary,
    tint: tintColorDark,
    tabIconDefault: brandColors.gray,
    tabIconSelected: tintColorDark,
  },
};
