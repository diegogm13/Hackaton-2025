import React from 'react';
import { View } from 'react-native';
import Svg, { Ellipse, Rect, Path, Circle } from 'react-native-svg';
import { Colors } from '../theme';

type Props = {
  size?: number;
  grasa?: number;   // 0-100
  musculo?: number; // 0-100
  color?: string;
};

function safe(val: number | undefined, fallback: number): number {
  if (val === undefined || val === null || isNaN(val) || !isFinite(val)) return fallback;
  return Math.max(0, Math.min(100, val));
}

function n(val: number): string {
  const rounded = Math.round(val * 100) / 100;
  return isNaN(rounded) ? '0' : String(rounded);
}

export default function Monito({ size = 180, grasa, musculo, color = Colors.accent }: Props) {
  const g = safe(grasa, 20);
  const m = safe(musculo, 35);
  const scale = size / 200;

  const torsoW   = 52 + (g / 100) * 30;
  const shoulderW = 70 + (m / 100) * 30;
  const waistW   = torsoW * 0.75;

  const sW2 = shoulderW / 2;
  const tW2 = torsoW / 2;
  const wW2 = waistW / 2;

  return (
    <View style={{ width: size, height: size * 1.4 }}>
      <Svg width={size} height={size * 1.4} viewBox="0 0 200 280">
        {/* Cabeza */}
        <Circle cx={100} cy={30} r={22} fill={color} opacity={0.9} />

        {/* Cuello */}
        <Rect x={92} y={50} width={16} height={16} rx={4} fill={color} opacity={0.8} />

        {/* Hombros */}
        <Ellipse cx={100} cy={76} rx={sW2} ry={14} fill={color} opacity={0.85} />

        {/* Torso */}
        <Path
          d={`M ${n(100 - sW2)} 76 C ${n(100 - sW2)} 76 ${n(100 - tW2)} 90 ${n(100 - wW2)} 130 L ${n(100 + wW2)} 130 C ${n(100 + tW2)} 90 ${n(100 + sW2)} 76 ${n(100 + sW2)} 76 Z`}
          fill={color}
          opacity={0.8}
        />

        {/* Cadera */}
        <Ellipse cx={100} cy={130} rx={tW2 + 4} ry={14} fill={color} opacity={0.8} />

        {/* Pierna izquierda */}
        <Path
          d={`M ${n(100 - wW2)} 130 L ${n(100 - wW2 - 8)} 210 L ${n(100 - 6)} 210 L ${n(100)} 130 Z`}
          fill={color} opacity={0.75}
        />

        {/* Pierna derecha */}
        <Path
          d={`M ${n(100 + wW2)} 130 L ${n(100 + wW2 + 8)} 210 L ${n(100 + 6)} 210 L ${n(100)} 130 Z`}
          fill={color} opacity={0.75}
        />

        {/* Brazo izquierdo */}
        <Path
          d={`M ${n(100 - sW2)} 76 L ${n(100 - sW2 - 14)} 140 L ${n(100 - sW2 - 4)} 142 L ${n(100 - sW2 + 10)} 78 Z`}
          fill={color} opacity={0.7}
        />

        {/* Brazo derecho */}
        <Path
          d={`M ${n(100 + sW2)} 76 L ${n(100 + sW2 + 14)} 140 L ${n(100 + sW2 + 4)} 142 L ${n(100 + sW2 - 10)} 78 Z`}
          fill={color} opacity={0.7}
        />
      </Svg>
    </View>
  );
}
