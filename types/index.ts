export interface FoodItem {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
  isCustom?: boolean;
}

export interface FoodLogEntry {
  id: string;
  food: FoodItem;
  multiplier: number;
  servingLabel: string;
  meal: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: number;
}

export interface WorkoutEntry {
  id: string;
  type: string;
  emoji: string;
  duration: number;
  caloriesBurned: number;
  notes: string;
  timestamp: number;
}

export interface WeightEntry {
  id: string;
  weight: number;
  date: string;
  timestamp: number;
}

export interface Goals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterBottles: number;
}
