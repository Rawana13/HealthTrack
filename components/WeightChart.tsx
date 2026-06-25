import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import { Colors } from '../constants/theme';
import { WeightEntry } from '../types';

const { width: SW } = Dimensions.get('window');
const W = SW - 64;
const H = 190;
const PAD = { t: 20, b: 40, l: 42, r: 16 };

interface Props {
  data: WeightEntry[];
}

export default function WeightChart({ data }: Props) {
  if (data.length < 2) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTxt}>Log at least 2 weights to see the chart</Text>
      </View>
    );
  }

  const sorted = [...data]
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-30);

  const weights = sorted.map((e) => e.weight);
  const minW = Math.min(...weights) - 0.5;
  const maxW = Math.max(...weights) + 0.5;
  const iW = W - PAD.l - PAD.r;
  const iH = H - PAD.t - PAD.b;

  const xOf = (i: number) =>
    PAD.l + (sorted.length === 1 ? iW / 2 : (i / (sorted.length - 1)) * iW);
  const yOf = (w: number) => PAD.t + ((maxW - w) / (maxW - minW)) * iH;

  let d = '';
  sorted.forEach((e, i) => {
    const x = xOf(i);
    const y = yOf(e.weight);
    d += i === 0 ? `M${x},${y}` : ` L${x},${y}`;
  });

  const gridWeights = [minW + 0, minW + (maxW - minW) * 0.25, minW + (maxW - minW) * 0.5, minW + (maxW - minW) * 0.75, maxW];

  return (
    <Svg width={W} height={H}>
      {gridWeights.map((gw, gi) => {
        const y = yOf(gw);
        return (
          <React.Fragment key={gi}>
            <Line
              x1={PAD.l}
              y1={y}
              x2={W - PAD.r}
              y2={y}
              stroke={Colors.border}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <SvgText
              x={PAD.l - 4}
              y={y + 4}
              textAnchor="end"
              fill={Colors.textSecondary}
              fontSize={10}
            >
              {gw.toFixed(1)}
            </SvgText>
          </React.Fragment>
        );
      })}

      {/* Line */}
      <Path d={d} stroke={Colors.accent} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Points */}
      {sorted.map((e, i) => (
        <Circle
          key={e.id}
          cx={xOf(i)}
          cy={yOf(e.weight)}
          r={4}
          fill={Colors.accent}
          stroke={Colors.background}
          strokeWidth={2}
        />
      ))}

      {/* X-axis labels: first & last */}
      {[0, sorted.length - 1].map((i) => (
        <SvgText
          key={i}
          x={xOf(i)}
          y={H - 6}
          textAnchor="middle"
          fill={Colors.textSecondary}
          fontSize={10}
        >
          {sorted[i]?.date.slice(5)}
        </SvgText>
      ))}
    </Svg>
  );
}

const styles = StyleSheet.create({
  empty: { height: 100, alignItems: 'center', justifyContent: 'center' },
  emptyTxt: { color: Colors.textSecondary, fontSize: 14 },
});
