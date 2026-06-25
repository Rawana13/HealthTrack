import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHealth } from '../../context/HealthContext';
import { Colors } from '../../constants/theme';
import { FoodLogEntry } from '../../types';
import CalorieRing from '../../components/CalorieRing';
import MacroBar from '../../components/MacroBar';
import GoalsModal from '../../components/GoalsModal';
import ServingModal from '../../components/ServingModal';
import FlashMessage from '../../components/FlashMessage';

export default function Dashboard() {
  const { top } = useSafeAreaInsets();
  const { totals, burnedCalories, goals, waterCount, workoutLog, foodLog, flashMsg, updateGoals, editFood } =
    useHealth();
  const [showGoals, setShowGoals] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FoodLogEntry | null>(null);

  const net = totals.calories - burnedCalories;
  const remaining = goals.calories - net;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // Group food log preview (first 3 items)
  const preview = foodLog.slice(-3).reverse();

  return (
    <View style={[styles.root, { paddingTop: top }]}>
      <FlashMessage message={flashMsg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>HealthTrack</Text>
          <Text style={styles.date}>{today}</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => setShowGoals(true)}
        >
          <Ionicons name="settings-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Calorie Ring */}
        <View style={styles.card}>
          <CalorieRing eaten={totals.calories} burned={burnedCalories} goal={goals.calories} />

          {/* 4 Stat Cards */}
          <View style={styles.statsRow}>
            <StatCard label="Eaten" value={totals.calories} color={Colors.green} unit="kcal" />
            <StatCard label="Burned" value={burnedCalories} color={Colors.orange} unit="kcal" />
            <StatCard label="Goal" value={goals.calories} color={Colors.accent} unit="kcal" />
            <StatCard
              label="Left"
              value={Math.abs(remaining)}
              color={remaining < 0 ? Colors.red : Colors.blue}
              unit="kcal"
              prefix={remaining < 0 ? '-' : ''}
            />
          </View>
        </View>

        {/* Macros */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Macronutrients</Text>
          <MacroBar label="Protein" current={totals.protein} goal={goals.protein} color={Colors.pink} />
          <MacroBar label="Carbs" current={totals.carbs} goal={goals.carbs} color={Colors.orange} />
          <MacroBar label="Fat" current={totals.fat} goal={goals.fat} color={Colors.blue} />
        </View>

        {/* Water Summary */}
        <View style={[styles.card, styles.row]}>
          <View style={styles.summaryLeft}>
            <Text style={styles.sectionTitle}>Water</Text>
            <Text style={styles.summaryBig}>
              <Text style={{ color: Colors.blue }}>{waterCount}</Text>
              <Text style={styles.summaryOf}> / {goals.waterBottles}</Text>
            </Text>
            <Text style={styles.summaryUnit}>bottles · {waterCount * 40}oz</Text>
          </View>
          <View style={styles.bottleRow}>
            {Array.from({ length: goals.waterBottles }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.bottleDot,
                  { backgroundColor: i < waterCount ? Colors.blue : Colors.border },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Workout Summary */}
        <View style={[styles.card, styles.row]}>
          <View style={styles.summaryLeft}>
            <Text style={styles.sectionTitle}>Workouts</Text>
            <Text style={styles.summaryBig}>
              <Text style={{ color: Colors.orange }}>{workoutLog.length}</Text>
              <Text style={styles.summaryOf}> sessions</Text>
            </Text>
            <Text style={styles.summaryUnit}>{burnedCalories} kcal burned</Text>
          </View>
          <View style={styles.workoutList}>
            {workoutLog.slice(-3).map((w) => (
              <Text key={w.id} style={styles.workoutItem}>
                {w.emoji} {w.type} · {w.caloriesBurned} kcal
              </Text>
            ))}
            {workoutLog.length === 0 && (
              <Text style={styles.emptyTxt}>No workouts yet</Text>
            )}
          </View>
        </View>

        {/* Food Log Preview */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Today's Food</Text>
          {preview.length === 0 && (
            <Text style={styles.emptyTxt}>No food logged yet</Text>
          )}
          {preview.map((e) => (
            <TouchableOpacity
              key={e.id}
              style={styles.logRow}
              onPress={() => setEditingEntry(e)}
              activeOpacity={0.7}
            >
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
              <Ionicons name="pencil-outline" size={14} color={Colors.textSecondary} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          ))}
          {foodLog.length > 3 && (
            <Text style={styles.moreItems}>+{foodLog.length - 3} more items</Text>
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <GoalsModal
        visible={showGoals}
        goals={goals}
        onSave={updateGoals}
        onClose={() => setShowGoals(false)}
      />

      <ServingModal
        visible={editingEntry !== null}
        food={editingEntry?.food ?? null}
        onAdd={() => {}}
        onClose={() => setEditingEntry(null)}
        editingEntry={editingEntry}
        onEdit={(updated) => { editFood(updated); setEditingEntry(null); }}
      />
    </View>
  );
}

function StatCard({
  label,
  value,
  color,
  unit,
  prefix = '',
}: {
  label: string;
  value: number;
  color: string;
  unit: string;
  prefix?: string;
}) {
  return (
    <View style={stat.card}>
      <Text style={[stat.val, { color }]}>
        {prefix}
        {value}
      </Text>
      <Text style={stat.unit}>{unit}</Text>
      <Text style={stat.label}>{label}</Text>
    </View>
  );
}

const stat = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  val: { fontSize: 18, fontWeight: '800' },
  unit: { fontSize: 10, color: Colors.textSecondary, marginTop: 1 },
  label: { fontSize: 11, color: Colors.textSecondary, marginTop: 3 },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  appName: { color: Colors.white, fontSize: 24, fontWeight: '900' },
  date: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: { paddingHorizontal: 16 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
  },
  sectionTitle: { color: Colors.white, fontSize: 16, fontWeight: '700', marginBottom: 14 },
  statsRow: { flexDirection: 'row', marginTop: 16 },
  row: { flexDirection: 'row', alignItems: 'center' },
  summaryLeft: { flex: 1 },
  summaryBig: { fontSize: 28, fontWeight: '800', color: Colors.white },
  summaryOf: { fontSize: 16, color: Colors.textSecondary, fontWeight: '400' },
  summaryUnit: { color: Colors.textSecondary, fontSize: 13, marginTop: 4 },
  bottleRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  bottleDot: { width: 18, height: 32, borderRadius: 4 },
  workoutList: { flex: 1, alignItems: 'flex-end' },
  workoutItem: { color: Colors.textSecondary, fontSize: 12, marginBottom: 4 },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logName: { color: Colors.white, fontSize: 14, fontWeight: '600' },
  logServing: { color: Colors.textSecondary, fontWeight: '400' },
  logMacros: { fontSize: 12, marginTop: 3 },
  logCal: { color: Colors.green, fontWeight: '700', fontSize: 14 },
  moreItems: { color: Colors.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 12 },
  emptyTxt: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', paddingVertical: 8 },
});
