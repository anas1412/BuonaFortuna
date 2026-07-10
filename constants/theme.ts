/**
 * BuonaFortuna design tokens
 * Aesthetic direction: "Ladybug" — glossy coccinelle red on warm cream/white,
 * grounded with deep near-black ink. Light theme only, editorial-market feel:
 * think a chic Italian mercato guide crossed with a modern marketplace app.
 */

export const colors = {
  // Core brand
  red: '#D8232A', // coccinelle shell red
  redDeep: '#A5161C', // pressed / shadow red
  redSoft: '#FBE1DF', // tint for chips, badges, subtle fills
  redSofter: '#FDF1F0',

  ink: '#1A1512', // near-black, warm not cold
  inkSoft: '#4A423E', // secondary text
  inkFaint: '#8A817C', // tertiary text / placeholders

  // Neutrals
  cream: '#FFFCF9', // app background, warm white
  paper: '#FFFFFF', // card background
  line: '#F0E7E1', // hairline borders
  lineStrong: '#E4D6CC',

  gold: '#E8A93A', // accent for ratings/highlights (ladybug spot warmth)
  green: '#2E7D5B', // success / open status
  amber: '#C97A1A', // warning / pending

  overlay: 'rgba(26, 21, 18, 0.55)',
  white: '#FFFFFF',
  black: '#1A1512',
};

export const gradients = {
  heroRed: ['#E4342B', '#A5161C'] as const,
  cardShade: ['transparent', 'rgba(26,21,18,0.75)'] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const typography = {
  display: {
    fontFamily: 'PlayfairDisplay_700Bold',
    letterSpacing: -0.5,
  },
  displaySemibold: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
  },
  body: {
    fontFamily: 'Inter_400Regular',
  },
  bodyMedium: {
    fontFamily: 'Inter_500Medium',
  },
  bodySemibold: {
    fontFamily: 'Inter_600SemiBold',
  },
  bodyBold: {
    fontFamily: 'Inter_700Bold',
  },
};

export const shadow = {
  card: {
    shadowColor: '#3A1210',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  soft: {
    shadowColor: '#3A1210',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  floating: {
    shadowColor: '#A5161C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 8,
  },
};
