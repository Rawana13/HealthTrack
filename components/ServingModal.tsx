import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors } from '../constants/theme';
import { FoodItem, FoodLogEntry } from '../types';
import { genId } from '../constants/foods';

const SERVING_OPTIONS = [
  { label: '1 serving', multiplier: 1.0 },
  { label: '½ serving', multiplier: 0.5 },
  { label: '¼ serving', multiplier: 0.25 },
  { label: '2× servings', multiplier: 2.0 },
  { label: '1 tbsp', multiplier: 0.0625 },
  { label: '1 tsp', multiplier: 0.021 },
];

const MEALS = ['Meal 1', 'Meal 2', 'Meal 3', 'Added'];

interface Props {
  visible: boolean;
  food: FoodItem | null;
  onAdd: (entry: FoodLogEntry) => void;
  onClose: () => void;
  editingEntry?: FoodLogEntry | null;
  onEdit?: (updated: FoodLogEntry) => void;
}

export default function ServingModal({ visible, food, onAdd, onClose, editingEntry, onEdit }: Props) {
  const [selectedServing, setSelectedServing] = useState(0);
  const [customMultiplier, setCustomMultiplier] = useState('1');
  const [isCustom, setIsCustom] = useState(false);
  const [meal, setMeal] = useState('Meal 1');

  useEffect(() => {
    if (visible) {
      if (editingEntry) {
        const idx = SERVING_OPTIONS.findIndex(
          (o) => o.multiplier === editingEntry.multiplier,
        );
        if (idx >= 0) {
          setSelectedServing(idx);
          setIsCustom(false);
          setCustomMultiplier(String(editingEntry.multiplier));
        } else {
          setIsCustom(true);
          setCustomMultiplier(String(editingEntry.multiplier));
          setSelectedServing(0);
        }
        setMeal(editingEntry.meal);
      } else {
        setSelectedServing(0);
        setCustomMultiplier('1');
        setIsCustom(false);
        setMeal('Meal 1');
      }
    }
  }, [visible, editingEntry]);

  if (!food) return null;

  const multiplier = isCustom
    ? parseFloat(customMultiplier) || 1
    : SERVING_OPTIONS[selectedServing].multiplier;

  const servingLabel = isCustom
    ? `${customMultiplier}× serving`
    : SERVING_OPTIONS[selectedServing].label;

  const calc = (val: number) => Math.round(val * multiplier * 10) / 10;

  const handle = () => {
    if (editingEntry && onEdit) {
      const updated: FoodLogEntry = {
        ...editingEntry,
        multiplier,
        servingLabel,
        meal,
        calories: Math.round(food.calories * multiplier),
        protein: calc(food.protein),
        carbs: calc(food.carbs),
        fat: calc(food.fat),
      };
      onEdit(updated);
    } else {
      const entry: FoodLogEntry = {
        id: genId(),
        food,
        multiplier,
        servingLabel,
        meal,
        calories: Math.round(food.calories * multiplier),
        protein: calc(food.protein),
        carbs: calc(food.carbs),
        fat: calc(food.fat),
        timestamp: Date.now(),
      };
      onAdd(entry);
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.sheet}>
            <View style={styles.handle} />

            <Text style={styles.foodName}>{food.name}</Text>
            <Text style={styles.baseServing}>Per {food.serving}</Text>

            {/* Preview */}
            <View style={styles.preview}>
              <MacroChip label="Cal" value={Math.round(food.calories * multiplier)} color={Colors.accent} />
              <MacroChip label="P" value={calc(food.protein)} color={Colors.pink} unit="g" />
              <MacroChip label="C" value={calc(food.carbs)} color={Colors.orange} unit="g" />
              <MacroChip label="F" value={calc(food.fat)} color={Colors.blue} unit="g" />
            </View>

            {/* Serving options */}
            <Text style={styles.sectionLabel}>Serving Size</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.servingScroll}>
              {SERVING_OPTIONS.map((opt, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.chip, !isCustom && selectedServing === i && styles.chipActive]}
                  onPress={() => {
                    setSelectedServing(i);
                    setIsCustom(false);
                  }}
                >
                  <Text style={[styles.chipTxt, !isCustom && selectedServing === i && styles.chipTxtActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.chip, isCustom && styles.chipActive]}
                onPress={() => setIsCustom(true)}
              >
                <Text style={[styles.chipTxt, isCustom && styles.chipTxtActive]}>Custom</Text>
              </TouchableOpacity>
            </ScrollView>

            {isCustom && (
              <View style={styles.customRow}>
                <TextInput
                  style={styles.customInput}
                  value={customMultiplier}
                  onChangeText={setCustomMultiplier}
                  keyboardType="decimal-pad"
                  placeholder="1.0"
                  placeholderTextColor={Colors.textSecondary}
                  selectTextOnFocus
                />
                <Text style={styles.customUnit}>× serving</Text>
              </View>
            )}

            {/* Meal */}
            <Text style={styles.sectionLabel}>Add to Meal</Text>
            <View style={styles.mealRow}>
              {MEALS.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.mealChip, meal === m && styles.mealChipActive]}
                  onPress={() => setMeal(m)}
                >
                  <Text style={[styles.mealChipTxt, meal === m && styles.mealChipTxtActive]}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.addBtn} onPress={handle}>
              <Text style={styles.addBtnTxt}>{editingEntry ? 'Update Entry' : 'Add to Log'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function MacroChip({
  label,
  value,
  color,
  unit = '',
}: {
  label: string;
  value: number;
  color: string;
  unit?: string;
}) {
  return (
    <View style={chip.wrap}>
      <Text style={[chip.val, { color }]}>
        {value}
        {unit}
      </Text>
      <Text style={chip.label}>{label}</Text>
    </View>
  );
}

const chip = StyleSheet.create({
  wrap: { alignItems: 'center', flex: 1 },
  val: { fontSize: 18, fontWeight: '800' },
  label: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
});

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 44,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  foodName: { color: Colors.white, fontSize: 22, fontWeight: '800', textAlign: 'center' },
  baseServing: { color: Colors.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 4, marginBottom: 20 },
  preview: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 24,
  },
  sectionLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 },
  servingScroll: { marginBottom: 16 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: Colors.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipTxt: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },
  chipTxtActive: { color: Colors.white },
  customRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  customInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Colors.white,
    fontSize: 17,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  customUnit: { color: Colors.textSecondary, marginLeft: 12, fontSize: 14 },
  mealRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  mealChip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mealChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  mealChipTxt: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  mealChipTxtActive: { color: Colors.white },
  addBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  addBtnTxt: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  cancelBtn: { alignItems: 'center', paddingVertical: 10 },
  cancelTxt: { color: Colors.textSecondary, fontSize: 15 },
});
