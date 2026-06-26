import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FoodItem, FoodLogEntry, WorkoutEntry, WeightEntry, Goals } from '../types';
import { defaultGoals } from '../constants/theme';

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const makeKeys = (date: string) => ({
  FOOD_LOG: `@ht_food_${date}`,
  WORKOUT_LOG: `@ht_workout_${date}`,
  WATER: `@ht_water_${date}`,
  WEIGHT_LOG: '@ht_weight',
  GOALS: '@ht_goals',
  CUSTOM_FOODS: '@ht_custom_foods',
});

interface HealthContextType {
  customFoods: FoodItem[];
  addCustomFood: (food: FoodItem) => void;
  removeCustomFood: (id: string) => void;

  foodLog: FoodLogEntry[];
  addFood: (entry: FoodLogEntry) => void;
  editFood: (updated: FoodLogEntry) => void;
  removeFood: (id: string) => void;
  clearFoodLog: () => void;

  workoutLog: WorkoutEntry[];
  addWorkout: (entry: WorkoutEntry) => void;
  removeWorkout: (id: string) => void;

  waterCount: number;
  setWaterCount: (count: number) => void;

  weightLog: WeightEntry[];
  addWeight: (entry: WeightEntry) => void;
  removeWeight: (id: string) => void;

  goals: Goals;
  updateGoals: (goals: Goals) => void;

  flashMsg: string | null;
  showFlash: (msg: string) => void;

  totals: { calories: number; protein: number; carbs: number; fat: number };
  burnedCalories: number;
}

const HealthContext = createContext<HealthContextType | null>(null);

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);
  const [foodLog, setFoodLog] = useState<FoodLogEntry[]>([]);
  const [workoutLog, setWorkoutLog] = useState<WorkoutEntry[]>([]);
  const [waterCount, setWaterCountState] = useState(0);
  const [weightLog, setWeightLog] = useState<WeightEntry[]>([]);
  const [goals, setGoals] = useState<Goals>(defaultGoals);
  const [flashMsg, setFlashMsg] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const keys = makeKeys(today());
    try {
      const [fj, wj, wt, wl, gj, cfj] = await AsyncStorage.multiGet([
        keys.FOOD_LOG,
        keys.WORKOUT_LOG,
        keys.WATER,
        keys.WEIGHT_LOG,
        keys.GOALS,
        keys.CUSTOM_FOODS,
      ]);
      if (fj[1])  setFoodLog(JSON.parse(fj[1]));
      if (wj[1])  setWorkoutLog(JSON.parse(wj[1]));
      if (wt[1])  setWaterCountState(JSON.parse(wt[1]));
      if (wl[1])  setWeightLog(JSON.parse(wl[1]));
      if (gj[1])  setGoals(JSON.parse(gj[1]));
      if (cfj[1]) setCustomFoods(JSON.parse(cfj[1]));
    } catch (_) {}
  };

  const persist = async (key: string, value: unknown) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (_) {}
  };

  const addCustomFood = useCallback((food: FoodItem) => {
    setCustomFoods((prev) => {
      const next = [food, ...prev];
      persist(makeKeys(today()).CUSTOM_FOODS, next);
      return next;
    });
  }, []);

  const removeCustomFood = useCallback((id: string) => {
    setCustomFoods((prev) => {
      const next = prev.filter((f) => f.id !== id);
      persist(makeKeys(today()).CUSTOM_FOODS, next);
      return next;
    });
  }, []);

  const showFlash = useCallback((msg: string) => {
    setFlashMsg(msg);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlashMsg(null), 2500);
  }, []);

  const addFood = useCallback(
    (entry: FoodLogEntry) => {
      setFoodLog((prev) => {
        const next = [...prev, entry];
        persist(makeKeys(today()).FOOD_LOG, next);
        return next;
      });
      showFlash(`✓ Added ${entry.food.name}`);
    },
    [showFlash],
  );

  const editFood = useCallback(
    (updated: FoodLogEntry) => {
      setFoodLog((prev) => {
        const next = prev.map((e) => (e.id === updated.id ? updated : e));
        persist(makeKeys(today()).FOOD_LOG, next);
        return next;
      });
      showFlash(`✓ Updated ${updated.food.name}`);
    },
    [showFlash],
  );

  const removeFood = useCallback((id: string) => {
    setFoodLog((prev) => {
      const next = prev.filter((f) => f.id !== id);
      persist(makeKeys(today()).FOOD_LOG, next);
      return next;
    });
  }, []);

  const clearFoodLog = useCallback(() => {
    setFoodLog([]);
    AsyncStorage.removeItem(makeKeys(today()).FOOD_LOG).catch(() => {});
  }, []);

  const addWorkout = useCallback(
    (entry: WorkoutEntry) => {
      setWorkoutLog((prev) => {
        const next = [...prev, entry];
        persist(makeKeys(today()).WORKOUT_LOG, next);
        return next;
      });
      showFlash(`✓ Logged ${entry.type} (${entry.duration} min)`);
    },
    [showFlash],
  );

  const removeWorkout = useCallback((id: string) => {
    setWorkoutLog((prev) => {
      const next = prev.filter((w) => w.id !== id);
      persist(makeKeys(today()).WORKOUT_LOG, next);
      return next;
    });
  }, []);

  const setWaterCount = useCallback((count: number) => {
    setWaterCountState(count);
    persist(makeKeys(today()).WATER, count);
  }, []);

  const addWeight = useCallback(
    (entry: WeightEntry) => {
      setWeightLog((prev) => {
        const next = [entry, ...prev];
        persist(makeKeys(today()).WEIGHT_LOG, next);
        return next;
      });
      showFlash(`✓ Weight logged: ${entry.weight} kg`);
    },
    [showFlash],
  );

  const removeWeight = useCallback((id: string) => {
    setWeightLog((prev) => {
      const next = prev.filter((w) => w.id !== id);
      persist(makeKeys(today()).WEIGHT_LOG, next);
      return next;
    });
  }, []);

  const updateGoals = useCallback(
    (g: Goals) => {
      setGoals(g);
      persist(makeKeys(today()).GOALS, g);
      showFlash('✓ Goals updated');
    },
    [showFlash],
  );

  const totals = foodLog.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const burnedCalories = workoutLog.reduce((s, w) => s + w.caloriesBurned, 0);

  return (
    <HealthContext.Provider
      value={{
        customFoods,
        addCustomFood,
        removeCustomFood,
        foodLog,
        addFood,
        editFood,
        removeFood,
        clearFoodLog,
        workoutLog,
        addWorkout,
        removeWorkout,
        waterCount,
        setWaterCount,
        weightLog,
        addWeight,
        removeWeight,
        goals,
        updateGoals,
        flashMsg,
        showFlash,
        totals,
        burnedCalories,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
}

export const useHealth = () => {
  const ctx = useContext(HealthContext);
  if (!ctx) throw new Error('useHealth must be inside HealthProvider');
  return ctx;
};
