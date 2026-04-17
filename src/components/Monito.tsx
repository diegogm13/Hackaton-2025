import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Ellipse, Rect, Path, Circle } from 'react-native-svg';
import { Colors } from '../theme';

type Props = {
  size?: number;
  grasa?: number;   // 0-100
  musculo?: number; // 0-100
  color?: string;
  label?: string;
};

/**
 * Representación visual simplificada del físico (el "monito").
 * La anchura del torso varía según % de grasa; la amplitud de hombros según % músculo.
 */
export default function Monito({ size = 180, grasa = 20, musculo = 35, color = Colors.accent }: Props) {
  const scale = size / 200;

  // Torso más ancho con más grasa
  const torsoW = 52 + (grasa / 100) * 30;
  // Hombros más anchos con más músculo
  const shoulderW = 70 + (musculo / 100) * 30;
  // Cintura
  const waistW = torsoW * 0.75;

  return (
    <View style={{ width: size, height: size * 1.4 }}>
      <Svg width={size} height={size * 1.4} viewBox="0 0 200 280">
        {/* Cabeza */}
        <Circle cx={100} cy={30} r={22} fill={color} opacity={0.9} />

        {/* Cuello */}
        <Rect x={92} y={50} width={16} height={16} rx={4} fill={color} opacity={0.8} />

        {/* Hombros */}
        <Ellipse cx={100} cy={76} rx={shoulderW / 2} ry={14} fill={color} opacity={0.85} />

        {/* Torso */}
        <Path
          d={`M ${100 - shoulderW / 2} 76
              C ${100 - shoulderW / 2} 76 ${100 - torsoW / 2} 90 ${100 - waistW / 2} 130
              L ${100 + waistW / 2} 130
              C ${100 + torsoW / 2} 90 ${100 + shoulderW / 2} 76 ${100 + shoulderW / 2} 76 Z`}
          fill={color}
          opacity={0.8}
        />

        {/* Cadera */}
        <Ellipse cx={100} cy={130} rx={torsoW / 2 + 4} ry={14} fill={color} opacity={0.8} />

        {/* Pierna izquierda */}
        <Path
          d={`M ${100 - waistW / 2} 130 L ${100 - waistW / 2 - 8} 210 L ${100 - 6} 210 L ${100} 130 Z`}
          fill={color} opacity={0.75}
        />

        {/* Pierna derecha */}
        <Path
          d={`M ${100 + waistW / 2} 130 L ${100 + waistW / 2 + 8} 210 L ${100 + 6} 210 L ${100} 130 Z`}
          fill={color} opacity={0.75}
        />

        {/* Brazo izquierdo */}
        <Path
          d={`M ${100 - shoulderW / 2} 76 L ${100 - shoulderW / 2 - 14} 140 L ${100 - shoulderW / 2 - 4} 142 L ${100 - shoulderW / 2 + 10} 78 Z`}
          fill={color} opacity={0.7}
        />

        {/* Brazo derecho */}
        <Path
          d={`M ${100 + shoulderW / 2} 76 L ${100 + shoulderW / 2 + 14} 140 L ${100 + shoulderW / 2 + 4} 142 L ${100 + shoulderW / 2 - 10} 78 Z`}
          fill={color} opacity={0.7}
        />
      </Svg>
    </View>
  );
}
