import { Goals } from '../types';

export const Colors = {
  background: '#0F1117',
  card: '#1A1D27',
  cardAlt: '#222535',
  accent: '#6C63FF',
  green: '#22C55E',
  orange: '#F97316',
  blue: '#38BDF8',
  pink: '#EC4899',
  red: '#EF4444',
  white: '#FFFFFF',
  textPrimary: '#F1F5F9',
  textSecondary: '#6B7280',
  border: '#2A2D3A',
} as const;

export const defaultGoals: Goals = {
  calories: 1200,
  protein: 110,
  carbs: 120,
  fat: 45,
  waterBottles: 3,
};
