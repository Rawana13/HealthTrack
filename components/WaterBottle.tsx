import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Path } from 'react-native-svg';
import { Colors } from '../constants/theme';

interface Props {
  filled: boolean;
  onPress: () => void;
  label?: string;
}

export default function WaterBottle({ filled, onPress, label = '40oz' }: Props) {
  const bodyFill = filled ? Colors.blue : '#1E293B';
  const capFill = filled ? '#0EA5E9' : '#374151';
  const neckFill = filled ? '#0EA5E9' : '#374151';
  const highlightOpacity = filled ? 0.28 : 0;

  return (
    <TouchableOpacity onPress={onPress} style={styles.wrap} activeOpacity={0.75}>
      <Svg width={64} height={116} viewBox="0 0 64 116">
        {/* Cap */}
        <Rect x="20" y="2" width="24" height="10" rx="4" fill={capFill} />
        {/* Neck */}
        <Rect x="23" y="12" width="18" height="10" rx="3" fill={neckFill} />
        {/* Body */}
        <Path
          d="M8 26 Q8 22 12 22 H52 Q56 22 56 26 V102 Q56 114 44 114 H20 Q8 114 8 102 Z"
          fill={bodyFill}
        />
        {/* Shine highlight */}
        <Rect
          x="13"
          y="28"
          width="10"
          height="74"
          rx="5"
          fill="white"
          opacity={highlightOpacity}
        />
        {/* Label line */}
        <Rect x="16" y="82" width="32" height="2" rx="1" fill="rgba(255,255,255,0.15)" />
      </Svg>
      <Text style={[styles.label, { color: filled ? Colors.blue : Colors.textSecondary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  label: { fontSize: 12, fontWeight: '700', marginTop: 6 },
});
