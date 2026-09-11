import { StyleSheet, useWindowDimensions } from 'react-native';

/**
 * Responsive layout tokens.
 *
 * The app is mobile-first: on a phone it keeps the full-bleed app look, and on
 * wider viewports it reads as a normal website — content capped and centred,
 * card rows becoming grids, navigation moving to the top.
 */
export const breakpoints = {
  tablet: 768,
  desktop: 1024,
};

/** Widest the page content ever gets, regardless of viewport. */
export const CONTENT_MAX = 1120;
/** Forms stay narrow so inputs never stretch across a desktop screen. */
export const FORM_MAX = 460;

export function useLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= breakpoints.desktop;
  const isTablet = width >= breakpoints.tablet && width < breakpoints.desktop;

  return {
    width,
    isDesktop,
    isTablet,
    isPhone: width < breakpoints.tablet,
    /** Columns for card grids. */
    columns: isDesktop ? 4 : isTablet ? 3 : 2,
    /** Columns for the wider vendor cards. */
    vendorColumns: isDesktop ? 3 : isTablet ? 2 : 1,
  };
}

export const layout = StyleSheet.create({
  /** Caps and centres a page's scroll content. */
  page: {
    width: '100%',
    maxWidth: CONTENT_MAX,
    alignSelf: 'center',
  },
  /** Caps and centres a form column. */
  form: {
    width: '100%',
    maxWidth: FORM_MAX,
    alignSelf: 'center',
  },
  /** Card row that wraps into a grid instead of scrolling sideways. */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
});
