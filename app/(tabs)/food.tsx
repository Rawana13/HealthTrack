import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHealth } from '../../context/HealthContext';
import { Colors } from '../../constants/theme';
import { FOOD_DATABASE, CATEGORIES, FoodCategory, genId } from '../../constants/foods';
import { FoodItem, FoodLogEntry } from '../../types';
import ServingModal from '../../components/ServingModal';
import ScanLabelModal from '../../components/ScanLabelModal';
import FlashMessage from '../../components/FlashMessage';

// All category tabs — "My Foods" is injected first after "All"
const DISPLAY_CATEGORIES = [
  'All',
  'My Foods',
  ...CATEGORIES.filter((c) => c !== 'All'),
] as const;
type DisplayCategory = (typeof DISPLAY_CATEGORIES)[number];

export default function FoodTab() {
  const { top } = useSafeAreaInsets();
  const {
    addFood, editFood, foodLog, removeFood, clearFoodLog, flashMsg,
    customFoods, addCustomFood, removeCustomFood,
  } = useHealth();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<DisplayCategory>('All');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [editingEntry, setEditingEntry] = useState<FoodLogEntry | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [showScan, setShowScan] = useState(false);

  // Custom food form
  const [customName, setCustomName] = useState('');
  const [customCal, setCustomCal] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');

  // Merge custom foods (first) with the built-in database
  const allFoods = useMemo(
    () => [...customFoods, ...FOOD_DATABASE],
    [customFoods],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allFoods.filter((f) => {
      const matchCat =
        category === 'All'      ? true :
        category === 'My Foods' ? !!f.isCustom :
                                  f.category === category && !f.isCustom;
      const matchQ = !q || f.name.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [allFoods, search, category]);

  // Group food log by meal
  const grouped = useMemo(() => {
    const map: Record<string, FoodLogEntry[]> = {};
    foodLog.forEach((e) => {
      if (!map[e.meal]) map[e.meal] = [];
      map[e.meal].push(e);
    });
    return map;
  }, [foodLog]);

  const mealOrder = ['Meal 1', 'Meal 2', 'Meal 3', 'Added'];
  const activeMeals = mealOrder.filter((m) => grouped[m]?.length);

  const logTotals = foodLog.reduce(
    (a, e) => ({
      cal: a.cal + e.calories,
      p: a.p + e.protein,
      c: a.c + e.carbs,
      f: a.f + e.fat,
    }),
    { cal: 0, p: 0, c: 0, f: 0 },
  );

  const handleAddCustomForm = () => {
    if (!customName.trim()) {
      Alert.alert('Name required', 'Please enter a food name.');
      return;
    }
    const food: FoodItem = {
      id: genId(),
      name: customName.trim(),
      category: 'My Foods',
      isCustom: true,
      calories: parseFloat(customCal) || 0,
      protein: parseFloat(customProtein) || 0,
      carbs: parseFloat(customCarbs) || 0,
      fat: parseFloat(customFat) || 0,
      serving: '1 serving',
    };
    // Save to food bank so it appears in My Foods for future use
    addCustomFood(food);
    const entry: FoodLogEntry = {
      id: genId(),
      food,
      multiplier: 1,
      servingLabel: '1 serving',
      meal: 'Added',
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      timestamp: Date.now(),
    };
    addFood(entry);
    setCustomName('');
    setCustomCal('');
    setCustomProtein('');
    setCustomCarbs('');
    setCustomFat('');
    setShowCustom(false);
  };

  return (
    <View style={[styles.root, { paddingTop: top }]}>
      <FlashMessage message={flashMsg} />

      <View style={styles.headerBar}>
        <Text style={styles.title}>Food Log</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.scanBtn} onPress={() => setShowScan(true)}>
            <Ionicons name="camera" size={16} color={Colors.white} />
            <Text style={styles.scanBtnTxt}>Scan Label</Text>
          </TouchableOpacity>
          {foodLog.length > 0 && (
            <TouchableOpacity
              onPress={() =>
                Alert.alert('Clear log?', "This removes all today's food entries.", [
                  { text: 'Cancel' },
                  { text: 'Clear', style: 'destructive', onPress: clearFoodLog },
                ])
              }
            >
              <Text style={styles.clearTxt}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <>
              {/* Search */}
              <View style={styles.searchWrap}>
                <Ionicons name="search" size={18} color={Colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search 140+ foods…"
                  placeholderTextColor={Colors.textSecondary}
                  value={search}
                  onChangeText={setSearch}
                  returnKeyType="search"
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch('')}>
                    <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Category filter */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.catScroll}
                contentContainerStyle={styles.catContent}
              >
                {DISPLAY_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.catChip,
                      category === cat && styles.catChipActive,
                      cat === 'My Foods' && styles.catChipMyFoods,
                      cat === 'My Foods' && category === cat && styles.catChipMyFoodsActive,
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[styles.catTxt, category === cat && styles.catTxtActive]}>
                      {cat === 'My Foods'
                        ? `⭐ My Foods${customFoods.length ? ` (${customFoods.length})` : ''}`
                        : cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.sectionHeader}>
                {category === 'All' ? 'All Foods' : category} · {filtered.length} items
              </Text>
            </>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.foodRow, item.isCustom && styles.foodRowCustom]}
              onPress={() => setSelectedFood(item)}
              activeOpacity={0.7}
            >
              <View style={styles.foodLeft}>
                {item.isCustom && (
                  <Text style={styles.myFoodsTag}>⭐ MY FOODS</Text>
                )}
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.foodMeta}>
                  {item.serving} ·{' '}
                  <Text style={{ color: Colors.pink }}>P:{item.protein}g</Text>
                  {'  '}
                  <Text style={{ color: Colors.orange }}>C:{item.carbs}g</Text>
                  {'  '}
                  <Text style={{ color: Colors.blue }}>F:{item.fat}g</Text>
                </Text>
              </View>
              <View style={styles.foodRight}>
                <Text style={styles.foodCal}>{item.calories}</Text>
                <Text style={styles.foodCalUnit}>kcal</Text>
              </View>
              {item.isCustom && (
                <TouchableOpacity
                  style={styles.deleteBankBtn}
                  onPress={() =>
                    Alert.alert(
                      'Remove from My Foods?',
                      `"${item.name}" will be removed from your food bank.`,
                      [
                        { text: 'Cancel' },
                        {
                          text: 'Remove',
                          style: 'destructive',
                          onPress: () => removeCustomFood(item.id),
                        },
                      ],
                    )
                  }
                >
                  <Ionicons name="trash-outline" size={15} color={Colors.red} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setSelectedFood(item)}
              >
                <Ionicons name="add" size={20} color={Colors.white} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            <>
              {/* Custom Food */}
              <TouchableOpacity
                style={styles.customToggle}
                onPress={() => setShowCustom((v) => !v)}
              >
                <Ionicons
                  name={showCustom ? 'chevron-up' : 'add-circle-outline'}
                  size={18}
                  color={Colors.accent}
                />
                <Text style={styles.customToggleTxt}>
                  {showCustom ? 'Hide' : 'Add Custom Food'}
                </Text>
              </TouchableOpacity>

              {showCustom && (
                <View style={styles.customCard}>
                  <Text style={styles.sectionHeader}>Custom Food Entry</Text>
                  <TextInput
                    style={styles.customInput}
                    placeholder="Food name"
                    placeholderTextColor={Colors.textSecondary}
                    value={customName}
                    onChangeText={setCustomName}
                  />
                  <View style={styles.customRow}>
                    <CustomNumInput label="Calories" value={customCal} onChange={setCustomCal} unit="kcal" />
                    <CustomNumInput label="Protein" value={customProtein} onChange={setCustomProtein} unit="g" />
                    <CustomNumInput label="Carbs" value={customCarbs} onChange={setCustomCarbs} unit="g" />
                    <CustomNumInput label="Fat" value={customFat} onChange={setCustomFat} unit="g" />
                  </View>
                  <TouchableOpacity style={styles.customAddBtn} onPress={handleAddCustomForm}>
                    <Text style={styles.customAddTxt}>Add to Log</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Food Log */}
              {foodLog.length > 0 && (
                <View style={styles.logSection}>
                  <View style={styles.logHeader}>
                    <Text style={styles.sectionHeader}>Today's Log</Text>
                    <Text style={styles.logTotal}>
                      <Text style={{ color: Colors.green }}>{logTotals.cal} kcal</Text>
                      {'  '}
                      <Text style={{ color: Colors.pink }}>P:{Math.round(logTotals.p)}g</Text>
                      {'  '}
                      <Text style={{ color: Colors.orange }}>C:{Math.round(logTotals.c)}g</Text>
                      {'  '}
                      <Text style={{ color: Colors.blue }}>F:{Math.round(logTotals.f)}g</Text>
                    </Text>
                  </View>

                  {activeMeals.map((m) => (
                    <View key={m} style={styles.mealGroup}>
                      <Text style={styles.mealTitle}>{m}</Text>
                      {grouped[m].map((e) => (
                        <View key={e.id} style={styles.logItem}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.logName}>
                              {e.food.name}
                              <Text style={styles.logServing}> ({e.servingLabel})</Text>
                            </Text>
                            <Text style={styles.logMacros}>
                              <Text style={{ color: Colors.pink }}>P:{e.protein}g</Text>
                              {'  '}
                              <Text style={{ color: Colors.orange }}>C:{e.carbs}g</Text>
                              {'  '}
                              <Text style={{ color: Colors.blue }}>F:{e.fat}g</Text>
                            </Text>
                          </View>
                          <Text style={styles.logCal}>{e.calories} kcal</Text>
                          <TouchableOpacity
                            style={styles.editBtn}
                            onPress={() => setEditingEntry(e)}
                          >
                            <Ionicons name="pencil-outline" size={15} color={Colors.accent} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.deleteBtn}
                            onPress={() => removeFood(e.id)}
                          >
                            <Ionicons name="trash-outline" size={16} color={Colors.red} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              )}

              <View style={{ height: 32 }} />
            </>
          }
        />
      </KeyboardAvoidingView>

      <ServingModal
        visible={selectedFood !== null || editingEntry !== null}
        food={selectedFood ?? editingEntry?.food ?? null}
        onAdd={addFood}
        onClose={() => { setSelectedFood(null); setEditingEntry(null); }}
        editingEntry={editingEntry}
        onEdit={(updated) => { editFood(updated); setEditingEntry(null); }}
      />

      <ScanLabelModal
        visible={showScan}
        onAdd={addFood}
        onSaveFood={addCustomFood}
        onClose={() => setShowScan(false)}
      />
    </View>
  );
}

function CustomNumInput({
  label,
  value,
  onChange,
  unit,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit: string;
}) {
  return (
    <View style={cni.wrap}>
      <Text style={cni.label}>{label}</Text>
      <TextInput
        style={cni.input}
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        placeholder="0"
        placeholderTextColor={Colors.textSecondary}
      />
      <Text style={cni.unit}>{unit}</Text>
    </View>
  );
}

const cni = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', marginHorizontal: 4 },
  label: { color: Colors.textSecondary, fontSize: 11, marginBottom: 4 },
  input: {
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unit: { color: Colors.textSecondary, fontSize: 10, marginTop: 3 },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: { color: Colors.white, fontSize: 24, fontWeight: '900' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  scanBtnTxt: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  clearTxt: { color: Colors.red, fontSize: 14, fontWeight: '600' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: Colors.white, fontSize: 15 },
  catScroll: { marginBottom: 12 },
  catContent: { paddingHorizontal: 16 },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  catChipMyFoods: { borderColor: Colors.orange + '66' },
  catChipMyFoodsActive: { backgroundColor: Colors.orange, borderColor: Colors.orange },
  catTxt: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  catTxtActive: { color: Colors.white },
  sectionHeader: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: 4,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    paddingVertical: 14,
    paddingLeft: 16,
    paddingRight: 12,
  },
  foodRowCustom: {
    borderWidth: 1,
    borderColor: Colors.orange + '44',
  },
  myFoodsTag: {
    color: Colors.orange,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  deleteBankBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.red + '18',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  foodLeft: { flex: 1 },
  foodName: { color: Colors.white, fontSize: 15, fontWeight: '600', marginBottom: 4 },
  foodMeta: { fontSize: 12 },
  foodRight: { alignItems: 'flex-end', marginRight: 12 },
  foodCal: { color: Colors.green, fontWeight: '800', fontSize: 16 },
  foodCalUnit: { color: Colors.textSecondary, fontSize: 10 },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 16,
    marginTop: 8,
  },
  customToggleTxt: { color: Colors.accent, fontSize: 15, fontWeight: '600' },
  customCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  customInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Colors.white,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  customRow: { flexDirection: 'row', marginBottom: 16 },
  customAddBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  customAddTxt: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  logSection: { marginHorizontal: 16 },
  logHeader: { marginBottom: 8 },
  logTotal: { fontSize: 12, marginTop: 4 },
  mealGroup: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
  },
  mealTitle: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.cardAlt,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logName: { color: Colors.white, fontSize: 14, fontWeight: '600' },
  logServing: { color: Colors.textSecondary, fontWeight: '400' },
  logMacros: { fontSize: 12, marginTop: 3 },
  logCal: { color: Colors.green, fontWeight: '700', fontSize: 14, marginRight: 8 },
  editBtn: { padding: 4, marginRight: 4 },
  deleteBtn: { padding: 4 },
});
