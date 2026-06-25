import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useHealth } from '../../context/HealthContext';
import { Colors } from '../../constants/theme';
import WaterBottle from '../../components/WaterBottle';
import FlashMessage from '../../components/FlashMessage';

const RING_SIZE = 200;
const RING_STROKE = 16;
const RING_R = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRC = 2 * Math.PI * RING_R;

const OZ_PER_BOTTLE = 40;
const ML_PER_OZ = 29.5735;

const TIPS = [
  '💧 Drink a glass of water first thing in the morning.',
  '🍋 Add lemon or cucumber to make water more enjoyable.',
  '⏰ Set reminders every 2 hours to take a water break.',
  '🥗 Eat water-rich foods like cucumbers, celery, and watermelon.',
  '🏃 Increase intake on days you exercise — aim for 16oz extra.',
  '☕ For every cup of coffee, drink an extra glass of water.',
];

export default function WaterTab() {
  const { top } = useSafeAreaInsets();
  const { waterCount, setWaterCount, goals, flashMsg } = useHealth();

  const totalOz = waterCount * OZ_PER_BOTTLE;
  const totalMl = Math.round(totalOz * ML_PER_OZ);
  const pct = Math.min(waterCount / goals.waterBottles, 1);
  const ringOffset = RING_CIRC * (1 - pct);

  const toggleBottle = (index: number) => {
    // Tap filled bottle to unfill, tap empty to fill up to that bottle
    if (index < waterCount) {
      setWaterCount(index);
    } else {
      setWaterCount(index + 1);
    }
  };

  const addBottle = () => {
    if (waterCount < goals.waterBottles) setWaterCount(waterCount + 1);
  };

  return (
    <View style={[styles.root, { paddingTop: top }]}>
      <FlashMessage message={flashMsg} />
      <Text style={styles.title}>Water</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Ring */}
        <View style={styles.ringWrap}>
          <Svg width={RING_SIZE} height={RING_SIZE}>
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_R}
              stroke={Colors.border}
              strokeWidth={RING_STROKE}
              fill="none"
            />
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_R}
              stroke={Colors.blue}
              strokeWidth={RING_STROKE}
              fill="none"
              strokeDasharray={RING_CIRC}
              strokeDashoffset={ringOffset}
              strokeLinecap="round"
              rotation="-90"
              originX={RING_SIZE / 2}
              originY={RING_SIZE / 2}
            />
          </Svg>
          <View style={styles.ringCenter}>
            <Text style={styles.ringCount}>
              <Text style={{ color: Colors.blue }}>{waterCount}</Text>
              <Text style={styles.ringGoal}> / {goals.waterBottles}</Text>
            </Text>
            <Text style={styles.ringLabel}>bottles</Text>
          </View>
        </View>

        {/* oz / ml */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: Colors.blue }]}>{totalOz}</Text>
            <Text style={styles.statUnit}>oz</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: Colors.blue }]}>{totalMl}</Text>
            <Text style={styles.statUnit}>ml</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: pct >= 1 ? Colors.green : Colors.textSecondary }]}>
              {Math.round(pct * 100)}%
            </Text>
            <Text style={styles.statUnit}>daily goal</Text>
          </View>
        </View>

        {/* Bottle icons */}
        <View style={styles.bottlesWrap}>
          {Array.from({ length: goals.waterBottles }).map((_, i) => (
            <WaterBottle
              key={i}
              filled={i < waterCount}
              onPress={() => toggleBottle(i)}
            />
          ))}
        </View>

        {/* + Finished a Bottle */}
        <TouchableOpacity
          style={[styles.addBtn, waterCount >= goals.waterBottles && styles.addBtnDone]}
          onPress={addBottle}
          disabled={waterCount >= goals.waterBottles}
        >
          <Ionicons
            name={waterCount >= goals.waterBottles ? 'checkmark-circle' : 'add-circle-outline'}
            size={22}
            color={Colors.white}
            style={{ marginRight: 10 }}
          />
          <Text style={styles.addBtnTxt}>
            {waterCount >= goals.waterBottles ? 'Daily goal reached! 🎉' : '+ Finished a Bottle'}
          </Text>
        </TouchableOpacity>

        {/* Reset */}
        {waterCount > 0 && (
          <TouchableOpacity style={styles.resetBtn} onPress={() => setWaterCount(0)}>
            <Text style={styles.resetTxt}>Reset</Text>
          </TouchableOpacity>
        )}

        {/* Hydration tips */}
        <Text style={styles.tipsTitle}>Hydration Tips</Text>
        <View style={styles.tipsCard}>
          {TIPS.map((tip, i) => (
            <View key={i} style={[styles.tipRow, i < TIPS.length - 1 && styles.tipBorder]}>
              <Text style={styles.tipTxt}>{tip}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  title: { color: Colors.white, fontSize: 24, fontWeight: '900', paddingHorizontal: 20, paddingBottom: 14 },
  scroll: { paddingHorizontal: 20, alignItems: 'center' },
  ringWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  ringCenter: { position: 'absolute', alignItems: 'center' },
  ringCount: { fontSize: 40, fontWeight: '900', color: Colors.white },
  ringGoal: { fontSize: 22, color: Colors.textSecondary, fontWeight: '400' },
  ringLabel: { color: Colors.textSecondary, fontSize: 14, marginTop: 4 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 28,
    width: '100%',
  },
  statBox: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 22, fontWeight: '800' },
  statUnit: { color: Colors.textSecondary, fontSize: 12, marginTop: 3 },
  divider: { width: 1, backgroundColor: Colors.border },
  bottlesWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 28,
  },
  addBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.blue,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 28,
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
    justifyContent: 'center',
  },
  addBtnDone: { backgroundColor: Colors.green },
  addBtnTxt: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  resetBtn: { marginBottom: 28 },
  resetTxt: { color: Colors.textSecondary, fontSize: 14, textDecorationLine: 'underline' },
  tipsTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  tipsCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    width: '100%',
    overflow: 'hidden',
    marginBottom: 8,
  },
  tipRow: { paddingHorizontal: 18, paddingVertical: 14 },
  tipBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  tipTxt: { color: Colors.textPrimary, fontSize: 14, lineHeight: 20 },
});
