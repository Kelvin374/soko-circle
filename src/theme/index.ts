export const spacing = {
  marginMobile: 16,
  marginDesktop: 32,
  unit: 4,
  stackGap: 12,
  gutter: 16,
  sectionPadding: 24,
};

export const radii = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

export const shadows = {
  card: {
    shadowColor: '#152a4a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 32,
    elevation: 3,
  },
  navbar: {
    shadowColor: '#152a4a',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 10,
  },
};

export default { spacing, radii, shadows };