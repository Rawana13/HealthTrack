import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHealth } from '../../context/HealthContext';
import { Colors } from '../../constants/theme';
import { WeightEntry } from '../../types';
import { genId } from '../../constants/foods';
import WeightChart from '../../components/WeightChart';
import FlashMessage from '../../components/FlashMessage';

const START_WEIGHT = 101.4;
const KG_TO_LBS = 2.20462;

const fmt = (date: string) => {
  const d = new Date(date + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function WeightTab() {
  const { top } = useSafeAreaInsets();
  const { weightLog, addWeight, removeWeight, flashMsg } = useHealth();
  const [input, setInput] = useState('');

  const current = weightLog[0]?.weight ?? START_WEIGHT;
  const totalLost = +(START_WEIGHT - current).toFixed(2);
  const lastChange =
    weightLog.length >= 2
      ? +(weightLog[0].weight - weightLog[1].weight).toFixed(2)
      : 0;

  const handleLog = () => {
    const w = parseFloat(input);
    if (isNaN(w) || w <= 0 || w > 500) {
      Alert.alert('Invalid weight', 'Please enter a valid weight in kg.');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    const entry: WeightEntry = {
      id: genId(),
      weight: Math.round(w * 10) / 10,
      date: today,
      timestamp: Date.now(),
    };
    addWeight(entry);
    setInput('');
  };

  return (
    <View style={[styles.root, { paddingTop: top }]}>
      <FlashMessage message={flashMsg} />
      <Text style={styles.title}>Weight</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Log input */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Log Today's Weight</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              keyboardType="decimal-pad"
              placeholder={`e.g. ${current}`}
              placeholderTextColor={Colors.textSecondary}
              returnKeyType="done"
              onSubmitEditing={handleLog}
            />
            <Text style={styles.inputUnit}>kg</Text>
            <TouchableOpacity style={styles.logBtn} onPress={handleLog}>
              <Text style={styles.logBtnTxt}>Log</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4 stat cards */}
        <View style={styles.statsGrid}>
          <StatCard
            label="Current"
            value={`${current} kg`}
            sub={`${(current * KG_TO_LBS).toFixed(1)} lbs`}
            color={Colors.accent}
          />
          <StatCard
            label="Starting"
            value={`${START_WEIGHT} kg`}
            sub={`${(START_WEIGHT * KG_TO_LBS).toFixed(1)} lbs`}
            color={Colors.textSecondary}
          />
          <StatCard
            label="Total Lost"
            value={totalLost >= 0 ? `-${totalLost} kg` : `+${Math.abs(totalLost)} kg`}
            sub={`${(Math.abs(totalLost) * KG_TO_LBS).toFixed(1)} lbs`}
            color={totalLost >= 0 ? Colors.green : Colors.red}
          />
          <StatCard
            label="Last Change"
            value={
              lastChange === 0
                ? '— kg'
                : lastChange < 0
                ? `${lastChange} kg`
                : `+${lastChange} kg`
            }
            sub={weightLog.length >= 2 ? 'vs prev entry' : 'no prev entry'}
            color={lastChange < 0 ? Colors.green : lastChange > 0 ? Colors.red : Colors.textSecondary}
          />
        </View>

        {/* Chart */}
        {weightLog.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Weight Trend</Text>
            <Text style={styles.chartSub}>Last {Math.min(weightLog.length, 30)} entries</Text>
            <WeightChart data={weightLog} />
          </View>
        )}

        {/* History */}
        <View style={styles.histCard}>
          <Text style={styles.sectionTitle}>
            History{' '}
            <Text style={{ color: Colors.textSecondary, fontWeight: '400', fontSize: 13 }}>
              ({weightLog.length} entries)
            </Text>
          </Text>
          {weightLog.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyTxt}>No weight entries yet. Log your first weight!</Text>
            </View>
          )}
          {weightLog.map((e, idx) => {
            const lbs = (e.weight * KG_TO_LBS).toFixed(1);
            const diff =
              idx < weightLog.length - 1
                ? +(e.weight - weightLog[idx + 1].weight).toFixed(2)
                : null;
            return (
              <View key={e.id} style={[styles.histRow, idx === 0 && styles.histRowFirst]}>
                <View>
                  <Text style={styles.histDate}>{fmt(e.date)}</Text>
                  {diff !== null && (
                    <Text
                      style={[
                        styles.histDiff,
                        { color: diff < 0 ? Colors.green : diff > 0 ? Colors.red : Colors.textSecondary },
                      ]}
                    >
                      {diff < 0 ? `↓ ${Math.abs(diff)} kg` : diff > 0 ? `↑ ${diff} kg` : 'no change'}
                    </Text>
                  )}
                </View>
                <View style={{ flex: 1 }} />
                <View style={styles.histWeights}>
                  <Text style={styles.histKg}>{e.weight} kg</Text>
                  <Text style={styles.histLbs}>{lbs} lbs</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() =>
                    Alert.alert('Delete entry?', `Remove ${e.weight} kg from ${fmt(e.date)}?`, [
                      { text: 'Cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => removeWeight(e.id) },
                    ])
                  }
                >
                  <Ionicons name="trash-outline" size={16} color={Colors.red} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <View style={sc.card}>
      <Text style={sc.label}>{label}</Text>
      <Text style={[sc.value, { color }]}>{value}</Text>
      <Text style={sc.sub}>{sub}</Text>
    </View>
  );
}

const sc = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  label: { color: Colors.textSecondary, fontSize: 11, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 },
  value: { fontSize: 20, fontWeight: '800', marginBottom: 3 },
  sub: { color: Colors.textSecondary, fontSize: 12 },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  title: { color: Colors.white, fontSize: 24, fontWeight: '900', paddingHorizontal: 20, paddingBottom: 14 },
  scroll: { paddingHorizontal: 16 },
  inputCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  inputLabel: { color: Colors.textSecondary, fontSize: 13, marginBottom: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.white,
    fontSize: 22,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputUnit: { color: Colors.textSecondary, fontSize: 15, fontWeight: '600' },
  logBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  logBtnTxt: { color: Colors.white, fontWeight: '800', fontSize: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 6 },
  chartCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: { color: Colors.white, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  chartSub: { color: Colors.textSecondary, fontSize: 12, marginBottom: 16 },
  histCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
  },
  histRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  histRowFirst: { borderTopWidth: 0 },
  histDate: { color: Colors.white, fontSize: 14, fontWeight: '600' },
  histDiff: { fontSize: 12, marginTop: 3 },
  histWeights: { alignItems: 'flex-end', marginRight: 12 },
  histKg: { color: Colors.white, fontWeight: '800', fontSize: 16 },
  histLbs: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  deleteBtn: { padding: 8 },
  empty: { paddingVertical: 20, alignItems: 'center' },
  emptyTxt: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
