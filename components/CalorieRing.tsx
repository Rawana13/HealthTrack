import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../constants/theme';

const SIZE = 220;
const STROKE = 18;
const RADIUS = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * RADIUS;

interface Props {
  eaten: number;
  burned: number;
  goal: number;
}

export default function CalorieRing({ eaten, burned, goal }: Props) {
  const net = Math.max(eaten - burned, 0);
  const pct = Math.min(net / goal, 1);
  const offset = CIRC * (1 - pct);
  const remaining = goal - (eaten - burned);

  const ringColor =
    pct >= 1 ? Colors.red : pct >= 0.8 ? Colors.orange : Colors.accent;

  return (
    <View style={styles.wrap}>
      <Svg width={SIZE} height={SIZE}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={Colors.border}
          strokeWidth={STROKE}
          fill="none"
        />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={ringColor}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation="-90"
          originX={SIZE / 2}
          originY={SIZE / 2}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.net}>{net}</Text>
        <Text style={styles.sub}>of {goal} kcal</Text>
        <Text style={[styles.rem, { color: remaining < 0 ? Colors.red : Colors.green }]}>
          {remaining < 0
            ? `${Math.abs(remaining)} over`
            : `${remaining} left`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  center: { position: 'absolute', alignItems: 'center' },
  net: { fontSize: 38, fontWeight: '800', color: Colors.white },
  sub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  rem: { fontSize: 14, fontWeight: '600', marginTop: 5 },
});
