import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHealth } from '../../context/HealthContext';
import { Colors } from '../../constants/theme';
import { WorkoutEntry } from '../../types';
import { genId } from '../../constants/foods';
import FlashMessage from '../../components/FlashMessage';

const WORKOUTS = [
  { type: 'Running',         emoji: '🏃', calPerMin: 11 },
  { type: 'Weight Training', emoji: '🏋️', calPerMin: 5 },
  { type: 'Cycling',         emoji: '🚴', calPerMin: 8 },
  { type: 'Swimming',        emoji: '🏊', calPerMin: 10 },
  { type: 'HIIT',            emoji: '⚡', calPerMin: 12 },
  { type: 'Yoga',            emoji: '🧘', calPerMin: 3 },
  { type: 'Walking',         emoji: '🚶', calPerMin: 5 },
  { type: 'Jump Rope',       emoji: '🪢', calPerMin: 12 },
];

export default function WorkoutTab() {
  const { top } = useSafeAreaInsets();
  const { addWorkout, removeWorkout, workoutLog, flashMsg } = useHealth();

  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  const workout = selectedType !== null ? WORKOUTS[selectedType] : null;
  const durationNum = parseInt(duration, 10) || 0;
  const estCalories = workout ? Math.round(workout.calPerMin * durationNum) : 0;

  const handleAdd = () => {
    if (!workout || durationNum <= 0) return;
    const entry: WorkoutEntry = {
      id: genId(),
      type: workout.type,
      emoji: workout.emoji,
      duration: durationNum,
      caloriesBurned: estCalories,
      notes: notes.trim(),
      timestamp: Date.now(),
    };
    addWorkout(entry);
    setSelectedType(null);
    setDuration('');
    setNotes('');
  };

  const totalBurned = workoutLog.reduce((s, w) => s + w.caloriesBurned, 0);

  return (
    <View style={[styles.root, { paddingTop: top }]}>
      <FlashMessage message={flashMsg} />
      <Text style={styles.title}>Workout</Text>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Workout Type Grid */}
          <Text style={styles.label}>Select Workout Type</Text>
          <View style={styles.grid}>
            {WORKOUTS.map((w, i) => (
              <TouchableOpacity
                key={w.type}
                style={[styles.workoutBtn, selectedType === i && styles.workoutBtnActive]}
                onPress={() => setSelectedType(i === selectedType ? null : i)}
                activeOpacity={0.75}
              >
                <Text style={styles.workoutEmoji}>{w.emoji}</Text>
                <Text style={[styles.workoutType, selectedType === i && styles.workoutTypeActive]}>
                  {w.type}
                </Text>
                <Text style={styles.workoutCal}>{w.calPerMin} cal/min</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Duration */}
          <Text style={styles.label}>Duration (minutes)</Text>
          <View style={styles.durationRow}>
            <TouchableOpacity
              style={styles.durationStep}
              onPress={() => setDuration((v) => String(Math.max((parseInt(v) || 0) - 5, 0)))}
            >
              <Ionicons name="remove" size={22} color={Colors.white} />
            </TouchableOpacity>
            <TextInput
              style={styles.durationInput}
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              placeholder="30"
              placeholderTextColor={Colors.textSecondary}
              textAlign="center"
            />
            <TouchableOpacity
              style={styles.durationStep}
              onPress={() => setDuration((v) => String((parseInt(v) || 0) + 5))}
            >
              <Ionicons name="add" size={22} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {/* Estimated calories */}
          {workout && durationNum > 0 && (
            <View style={styles.estCard}>
              <Text style={styles.estLabel}>Estimated Burn</Text>
              <Text style={styles.estValue}>
                <Text style={{ color: Colors.orange }}>{estCalories}</Text> kcal
              </Text>
              <Text style={styles.estSub}>
                {workout.emoji} {workout.type} · {durationNum} min
              </Text>
            </View>
          )}

          {/* Notes */}
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="How did it go?"
            placeholderTextColor={Colors.textSecondary}
            multiline
            numberOfLines={3}
          />

          {/* Add Button */}
          <TouchableOpacity
            style={[styles.addBtn, (!workout || durationNum <= 0) && styles.addBtnDisabled]}
            onPress={handleAdd}
            disabled={!workout || durationNum <= 0}
          >
            <Ionicons name="add-circle" size={22} color={Colors.white} style={{ marginRight: 8 }} />
            <Text style={styles.addBtnTxt}>Log Workout</Text>
          </TouchableOpacity>

          {/* Today's log */}
          {workoutLog.length > 0 && (
            <View style={styles.logSection}>
              <View style={styles.logHeader}>
                <Text style={styles.logTitle}>Today's Workouts</Text>
                <Text style={styles.logTotal}>
                  <Text style={{ color: Colors.orange }}>{totalBurned}</Text> kcal burned
                </Text>
              </View>
              {workoutLog.map((w) => (
                <View key={w.id} style={styles.logItem}>
                  <Text style={styles.logEmoji}>{w.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.logType}>{w.type}</Text>
                    <Text style={styles.logMeta}>
                      {w.duration} min · {w.caloriesBurned} kcal
                    </Text>
                    {w.notes ? <Text style={styles.logNotes}>{w.notes}</Text> : null}
                  </View>
                  <TouchableOpacity onPress={() => removeWorkout(w.id)} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={17} color={Colors.red} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  title: { color: Colors.white, fontSize: 24, fontWeight: '900', paddingHorizontal: 20, paddingBottom: 14 },
  scroll: { paddingHorizontal: 16 },
  label: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 4,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  workoutBtn: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    paddingVertical: 8,
  },
  workoutBtnActive: { borderColor: Colors.accent, backgroundColor: Colors.cardAlt },
  workoutEmoji: { fontSize: 22, marginBottom: 4 },
  workoutType: { color: Colors.textSecondary, fontSize: 9, fontWeight: '700', textAlign: 'center' },
  workoutTypeActive: { color: Colors.accent },
  workoutCal: { color: Colors.border, fontSize: 8, marginTop: 2 },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  durationStep: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: Colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationInput: {
    flex: 1,
    color: Colors.white,
    fontSize: 28,
    fontWeight: '800',
    paddingVertical: 18,
  },
  estCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.orange + '44',
  },
  estLabel: { color: Colors.textSecondary, fontSize: 12, marginBottom: 4 },
  estValue: { color: Colors.white, fontSize: 28, fontWeight: '800' },
  estSub: { color: Colors.textSecondary, fontSize: 13, marginTop: 4 },
  notesInput: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.white,
    fontSize: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  addBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  addBtnDisabled: { opacity: 0.45 },
  addBtnTxt: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  logSection: { backgroundColor: Colors.card, borderRadius: 16, overflow: 'hidden', marginBottom: 8 },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.cardAlt,
  },
  logTitle: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  logTotal: { color: Colors.white, fontSize: 13 },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logEmoji: { fontSize: 26, marginRight: 14 },
  logType: { color: Colors.white, fontSize: 15, fontWeight: '600' },
  logMeta: { color: Colors.textSecondary, fontSize: 13, marginTop: 3 },
  logNotes: { color: Colors.textSecondary, fontSize: 12, marginTop: 3, fontStyle: 'italic' },
  deleteBtn: { padding: 8 },
});
