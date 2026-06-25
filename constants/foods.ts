import { FoodItem } from '../types';

export const CATEGORIES = [
  'All',
  'Breakfast',
  'Proteins',
  'Carbs & Grains',
  'Vegetables',
  'Fruits',
  'Dairy & Snacks',
  'Meals',
] as const;

export type FoodCategory = (typeof CATEGORIES)[number];

export const FOOD_DATABASE: FoodItem[] = [
  // ── Breakfast ─────────────────────────────────────────────────────────────
  { id: 'b1',  name: 'Eggs (2 large)',       category: 'Breakfast', calories: 143, protein: 12, carbs: 1,  fat: 10,  serving: '2 eggs' },
  { id: 'b2',  name: 'Oatmeal',              category: 'Breakfast', calories: 147, protein: 5,  carbs: 25, fat: 3,   serving: '1 cup cooked' },
  { id: 'b3',  name: 'Greek Yogurt',         category: 'Breakfast', calories: 130, protein: 17, carbs: 9,  fat: 4,   serving: '1 cup' },
  { id: 'b4',  name: 'Whole Wheat Toast',    category: 'Breakfast', calories: 80,  protein: 4,  carbs: 15, fat: 1,   serving: '1 slice' },
  { id: 'b5',  name: 'Protein Shake',        category: 'Breakfast', calories: 150, protein: 25, carbs: 8,  fat: 3,   serving: '1 scoop' },
  { id: 'b6',  name: 'Pancakes',             category: 'Breakfast', calories: 175, protein: 5,  carbs: 28, fat: 5,   serving: '2 medium' },
  { id: 'b7',  name: 'Granola',              category: 'Breakfast', calories: 120, protein: 3,  carbs: 20, fat: 4,   serving: '¼ cup' },
  { id: 'b8',  name: 'Cottage Cheese',       category: 'Breakfast', calories: 110, protein: 13, carbs: 4,  fat: 5,   serving: '½ cup' },
  { id: 'b9',  name: 'Bagel',                category: 'Breakfast', calories: 270, protein: 11, carbs: 55, fat: 2,   serving: '1 medium' },
  { id: 'b10', name: 'Smoothie Bowl',        category: 'Breakfast', calories: 350, protein: 10, carbs: 55, fat: 10,  serving: '1 bowl' },
  { id: 'b11', name: 'Avocado Toast',        category: 'Breakfast', calories: 220, protein: 6,  carbs: 22, fat: 13,  serving: '1 slice' },
  { id: 'b12', name: 'Banana Pancakes',      category: 'Breakfast', calories: 190, protein: 6,  carbs: 32, fat: 5,   serving: '2 pancakes' },

  // ── Proteins ───────────────────────────────────────────────────────────────
  { id: 'p1',  name: 'Chicken Breast',       category: 'Proteins',  calories: 165, protein: 31, carbs: 0,  fat: 4,   serving: '100g' },
  { id: 'p2',  name: 'Salmon',               category: 'Proteins',  calories: 208, protein: 20, carbs: 0,  fat: 13,  serving: '100g' },
  { id: 'p3',  name: 'Tuna (canned)',        category: 'Proteins',  calories: 130, protein: 28, carbs: 0,  fat: 1,   serving: '100g' },
  { id: 'p4',  name: 'Turkey Breast',        category: 'Proteins',  calories: 135, protein: 30, carbs: 0,  fat: 1,   serving: '100g' },
  { id: 'p5',  name: 'Shrimp',               category: 'Proteins',  calories: 99,  protein: 24, carbs: 0,  fat: 0,   serving: '100g' },
  { id: 'p6',  name: 'Steak (sirloin)',      category: 'Proteins',  calories: 250, protein: 26, carbs: 0,  fat: 15,  serving: '100g' },
  { id: 'p7',  name: 'Tofu',                 category: 'Proteins',  calories: 76,  protein: 8,  carbs: 2,  fat: 4,   serving: '100g' },
  { id: 'p8',  name: 'Tempeh',               category: 'Proteins',  calories: 193, protein: 19, carbs: 9,  fat: 11,  serving: '100g' },
  { id: 'p9',  name: 'Black Beans',          category: 'Proteins',  calories: 114, protein: 8,  carbs: 20, fat: 1,   serving: '½ cup' },
  { id: 'p10', name: 'Lentils',              category: 'Proteins',  calories: 115, protein: 9,  carbs: 20, fat: 0,   serving: '½ cup' },
  { id: 'p11', name: 'Cod',                  category: 'Proteins',  calories: 82,  protein: 18, carbs: 0,  fat: 1,   serving: '100g' },
  { id: 'p12', name: 'Egg Whites (3)',       category: 'Proteins',  calories: 51,  protein: 11, carbs: 1,  fat: 0,   serving: '3 whites' },

  // ── Carbs & Grains ─────────────────────────────────────────────────────────
  { id: 'c1',  name: 'Brown Rice',           category: 'Carbs & Grains', calories: 215, protein: 5,  carbs: 45, fat: 2,  serving: '1 cup cooked' },
  { id: 'c2',  name: 'White Rice',           category: 'Carbs & Grains', calories: 205, protein: 4,  carbs: 45, fat: 0,  serving: '1 cup cooked' },
  { id: 'c3',  name: 'Pasta',                category: 'Carbs & Grains', calories: 200, protein: 7,  carbs: 40, fat: 1,  serving: '1 cup cooked' },
  { id: 'c4',  name: 'Quinoa',               category: 'Carbs & Grains', calories: 222, protein: 8,  carbs: 39, fat: 4,  serving: '1 cup cooked' },
  { id: 'c5',  name: 'Sweet Potato',         category: 'Carbs & Grains', calories: 103, protein: 2,  carbs: 24, fat: 0,  serving: '1 medium' },
  { id: 'c6',  name: 'White Potato',         category: 'Carbs & Grains', calories: 161, protein: 4,  carbs: 37, fat: 0,  serving: '1 medium' },
  { id: 'c7',  name: 'Whole Wheat Bread',    category: 'Carbs & Grains', calories: 80,  protein: 3,  carbs: 15, fat: 1,  serving: '1 slice' },
  { id: 'c8',  name: 'Flour Tortilla',       category: 'Carbs & Grains', calories: 90,  protein: 2,  carbs: 18, fat: 2,  serving: '1 medium' },
  { id: 'c9',  name: 'Couscous',             category: 'Carbs & Grains', calories: 176, protein: 6,  carbs: 36, fat: 0,  serving: '1 cup cooked' },
  { id: 'c10', name: 'Pita Bread',           category: 'Carbs & Grains', calories: 165, protein: 5,  carbs: 33, fat: 1,  serving: '1 medium' },
  { id: 'c11', name: 'Oat Bran',             category: 'Carbs & Grains', calories: 88,  protein: 7,  carbs: 25, fat: 2,  serving: '½ cup dry' },
  { id: 'c12', name: 'Barley',               category: 'Carbs & Grains', calories: 193, protein: 4,  carbs: 44, fat: 1,  serving: '1 cup cooked' },

  // ── Vegetables ─────────────────────────────────────────────────────────────
  { id: 'v1',  name: 'Broccoli',             category: 'Vegetables', calories: 55,  protein: 4,  carbs: 11, fat: 1,  serving: '1 cup' },
  { id: 'v2',  name: 'Spinach',              category: 'Vegetables', calories: 7,   protein: 1,  carbs: 1,  fat: 0,  serving: '1 cup raw' },
  { id: 'v3',  name: 'Mixed Green Salad',    category: 'Vegetables', calories: 20,  protein: 1,  carbs: 4,  fat: 0,  serving: '2 cups' },
  { id: 'v4',  name: 'Bell Pepper',          category: 'Vegetables', calories: 31,  protein: 1,  carbs: 7,  fat: 0,  serving: '1 medium' },
  { id: 'v5',  name: 'Carrots',              category: 'Vegetables', calories: 25,  protein: 1,  carbs: 6,  fat: 0,  serving: '1 medium' },
  { id: 'v6',  name: 'Cucumber',             category: 'Vegetables', calories: 16,  protein: 1,  carbs: 4,  fat: 0,  serving: '1 cup sliced' },
  { id: 'v7',  name: 'Tomato',               category: 'Vegetables', calories: 22,  protein: 1,  carbs: 5,  fat: 0,  serving: '1 medium' },
  { id: 'v8',  name: 'Zucchini',             category: 'Vegetables', calories: 21,  protein: 2,  carbs: 4,  fat: 0,  serving: '1 cup' },
  { id: 'v9',  name: 'Kale',                 category: 'Vegetables', calories: 33,  protein: 2,  carbs: 7,  fat: 1,  serving: '1 cup raw' },
  { id: 'v10', name: 'Asparagus',            category: 'Vegetables', calories: 27,  protein: 3,  carbs: 5,  fat: 0,  serving: '1 cup' },
  { id: 'v11', name: 'Cauliflower',          category: 'Vegetables', calories: 25,  protein: 2,  carbs: 5,  fat: 0,  serving: '1 cup' },
  { id: 'v12', name: 'Green Beans',          category: 'Vegetables', calories: 31,  protein: 2,  carbs: 7,  fat: 0,  serving: '1 cup' },

  // ── Fruits ─────────────────────────────────────────────────────────────────
  { id: 'f1',  name: 'Banana',               category: 'Fruits',    calories: 105, protein: 1,  carbs: 27, fat: 0,  serving: '1 medium' },
  { id: 'f2',  name: 'Apple',                category: 'Fruits',    calories: 95,  protein: 0,  carbs: 25, fat: 0,  serving: '1 medium' },
  { id: 'f3',  name: 'Orange',               category: 'Fruits',    calories: 62,  protein: 1,  carbs: 15, fat: 0,  serving: '1 medium' },
  { id: 'f4',  name: 'Strawberries',         category: 'Fruits',    calories: 49,  protein: 1,  carbs: 12, fat: 1,  serving: '1 cup' },
  { id: 'f5',  name: 'Blueberries',          category: 'Fruits',    calories: 84,  protein: 1,  carbs: 21, fat: 1,  serving: '1 cup' },
  { id: 'f6',  name: 'Mango',                category: 'Fruits',    calories: 107, protein: 1,  carbs: 25, fat: 1,  serving: '1 cup' },
  { id: 'f7',  name: 'Grapes',               category: 'Fruits',    calories: 104, protein: 1,  carbs: 27, fat: 0,  serving: '1 cup' },
  { id: 'f8',  name: 'Watermelon',           category: 'Fruits',    calories: 46,  protein: 1,  carbs: 12, fat: 0,  serving: '1 cup' },
  { id: 'f9',  name: 'Pineapple',            category: 'Fruits',    calories: 82,  protein: 1,  carbs: 22, fat: 0,  serving: '1 cup' },
  { id: 'f10', name: 'Avocado',              category: 'Fruits',    calories: 120, protein: 2,  carbs: 6,  fat: 11, serving: '½ medium' },
  { id: 'f11', name: 'Raspberries',          category: 'Fruits',    calories: 64,  protein: 1,  carbs: 15, fat: 1,  serving: '1 cup' },
  { id: 'f12', name: 'Peach',                category: 'Fruits',    calories: 58,  protein: 1,  carbs: 14, fat: 0,  serving: '1 medium' },

  // ── Dairy & Snacks ─────────────────────────────────────────────────────────
  { id: 'd1',  name: 'Whole Milk',           category: 'Dairy & Snacks', calories: 150, protein: 8,  carbs: 12, fat: 8,  serving: '1 cup' },
  { id: 'd2',  name: 'Cheddar Cheese',       category: 'Dairy & Snacks', calories: 110, protein: 7,  carbs: 0,  fat: 9,  serving: '1 oz' },
  { id: 'd3',  name: 'Almonds',              category: 'Dairy & Snacks', calories: 164, protein: 6,  carbs: 6,  fat: 14, serving: '1 oz (23 nuts)' },
  { id: 'd4',  name: 'Peanut Butter',        category: 'Dairy & Snacks', calories: 190, protein: 8,  carbs: 6,  fat: 16, serving: '2 tbsp' },
  { id: 'd5',  name: 'Hummus',               category: 'Dairy & Snacks', calories: 50,  protein: 2,  carbs: 6,  fat: 3,  serving: '2 tbsp' },
  { id: 'd6',  name: 'Rice Cakes',           category: 'Dairy & Snacks', calories: 70,  protein: 1,  carbs: 15, fat: 0,  serving: '2 cakes' },
  { id: 'd7',  name: 'Protein Bar',          category: 'Dairy & Snacks', calories: 200, protein: 20, carbs: 22, fat: 7,  serving: '1 bar' },
  { id: 'd8',  name: 'Dark Chocolate',       category: 'Dairy & Snacks', calories: 170, protein: 2,  carbs: 14, fat: 12, serving: '1 oz' },
  { id: 'd9',  name: 'String Cheese',        category: 'Dairy & Snacks', calories: 80,  protein: 7,  carbs: 0,  fat: 6,  serving: '1 stick' },
  { id: 'd10', name: 'Low-Fat Greek Yogurt', category: 'Dairy & Snacks', calories: 100, protein: 17, carbs: 6,  fat: 0,  serving: '1 cup' },
  { id: 'd11', name: 'Cashews',              category: 'Dairy & Snacks', calories: 157, protein: 5,  carbs: 9,  fat: 12, serving: '1 oz' },
  { id: 'd12', name: 'Skim Milk',            category: 'Dairy & Snacks', calories: 83,  protein: 8,  carbs: 12, fat: 0,  serving: '1 cup' },

  // ── Meals ──────────────────────────────────────────────────────────────────
  { id: 'm1',  name: 'Burger',               category: 'Meals',     calories: 450, protein: 25, carbs: 40, fat: 20, serving: '1 medium' },
  { id: 'm2',  name: 'Chicken Sandwich',     category: 'Meals',     calories: 400, protein: 30, carbs: 38, fat: 15, serving: '1 sandwich' },
  { id: 'm3',  name: 'Caesar Salad',         category: 'Meals',     calories: 350, protein: 15, carbs: 20, fat: 25, serving: '1 serving' },
  { id: 'm4',  name: 'Burrito Bowl',         category: 'Meals',     calories: 650, protein: 35, carbs: 70, fat: 22, serving: '1 bowl' },
  { id: 'm5',  name: 'Veggie Stir Fry',      category: 'Meals',     calories: 300, protein: 20, carbs: 25, fat: 12, serving: '1 cup' },
  { id: 'm6',  name: 'Sushi (8 pieces)',     category: 'Meals',     calories: 320, protein: 15, carbs: 58, fat: 4,  serving: '8 pieces' },
  { id: 'm7',  name: 'Pizza Slice',          category: 'Meals',     calories: 285, protein: 12, carbs: 36, fat: 10, serving: '1 slice' },
  { id: 'm8',  name: 'Vegetable Soup',       category: 'Meals',     calories: 80,  protein: 4,  carbs: 15, fat: 1,  serving: '1 cup' },
  { id: 'm9',  name: 'Tacos',                category: 'Meals',     calories: 350, protein: 20, carbs: 30, fat: 15, serving: '2 corn tacos' },
  { id: 'm10', name: 'Grilled Chicken Salad',category: 'Meals',     calories: 300, protein: 35, carbs: 15, fat: 12, serving: '1 serving' },
  { id: 'm11', name: 'Salmon Bowl',          category: 'Meals',     calories: 480, protein: 32, carbs: 45, fat: 16, serving: '1 bowl' },
  { id: 'm12', name: 'Turkey Wrap',          category: 'Meals',     calories: 380, protein: 28, carbs: 35, fat: 12, serving: '1 wrap' },
];

export const genId = () =>
  `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
