import React, { useMemo } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing } from '../../theme';
import Monito from '../../components/Monito';
import { useUser } from '../../context/UserContext';

const DEFAULT_WEIGHT = 70;
const DEFAULT_HEIGHT = 170;
const DEFAULT_FAT = 20;
const DEFAULT_MUSCLE = 40;

function toNumber(value: string | number | undefined, fallback: number): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback;
  }

  const parsed = Number(String(value ?? '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function formatMetric(value: number, unit: string, decimals = 0): string {
  return `${value.toFixed(decimals)}${unit}`;
}

function getTargetProfile(
  objective: number | undefined,
  weight: number,
  fat: number,
  muscle: number,
) {
  switch (objective) {
    case 0: // Bajar de peso
      return {
        targetWeight: weight * 0.92,
        targetFat: fat - 6,
        targetMuscle: muscle + 4,
      };
    case 1: // Subir de peso (volumen)
      return {
        targetWeight: weight * 1.08,
        targetFat: fat + 1,
        targetMuscle: muscle + 6,
      };
    default: // Mejorar habitos
      return {
        targetWeight: weight * 0.98,
        targetFat: fat - 3,
        targetMuscle: muscle + 3,
      };
  }
}

export default function FisicoDetalleScreen() {
  const navigation = useNavigation();
  const { user } = useUser();

  const data = useMemo(() => {
    const currentWeight = toNumber(user?.peso, DEFAULT_WEIGHT);
    const currentHeight = toNumber(user?.altura, DEFAULT_HEIGHT);
    const currentFat = toNumber(user?.grasa, DEFAULT_FAT);
    const currentMuscle = toNumber(user?.musculo, DEFAULT_MUSCLE);

    const targetProfile = getTargetProfile(user?.objetivoDieta, currentWeight, currentFat, currentMuscle);

    const safeHeightMeters = Math.max(currentHeight / 100, 0.1);
    const currentImc = currentWeight / (safeHeightMeters * safeHeightMeters);
    const targetWeight = clamp(targetProfile.targetWeight, 35, 220);
    const targetFat = clamp(targetProfile.targetFat, 6, 45);
    const targetMuscle = clamp(targetProfile.targetMuscle, 20, 70);
    const targetImc = targetWeight / (safeHeightMeters * safeHeightMeters);

    const kgDelta = Math.abs(currentWeight - targetWeight);
    const fatDelta = Math.abs(currentFat - targetFat);
    const estimatedWeeks = Math.max(4, Math.round(kgDelta * 1.6 + fatDelta * 0.7));

    return {
      currentWeight,
      currentFat,
      currentMuscle,
      currentImc,
      targetWeight,
      targetFat,
      targetMuscle,
      targetImc,
      estimatedWeeks,
      statsActual: {
        peso: formatMetric(currentWeight, ' kg'),
        grasa: formatMetric(currentFat, '%'),
        musculo: formatMetric(currentMuscle, '%'),
        imc: currentImc.toFixed(1),
      },
      statsTarget: {
        peso: formatMetric(targetWeight, ' kg'),
        grasa: formatMetric(targetFat, '%'),
        musculo: formatMetric(targetMuscle, '%'),
        imc: targetImc.toFixed(1),
      },
    };
  }, [user]);

  const metricas = useMemo(() => {
    const weightMax = Math.max(data.currentWeight, data.targetWeight) * 1.25;
    const fatMax = Math.max(data.currentFat, data.targetFat, 10) * 1.4;
    const muscleMax = Math.max(data.currentMuscle, data.targetMuscle, 20) * 1.35;

    return [
      {
        label: 'Reduccion de grasa',
        current: data.currentFat,
        target: data.targetFat,
        max: fatMax,
        unit: '%',
        color: '#FF6B6B',
      },
      {
        label: 'Ganancia muscular',
        current: data.currentMuscle,
        target: data.targetMuscle,
        max: muscleMax,
        unit: '%',
        color: '#4ECDC4',
      },
      {
        label: 'Peso corporal',
        current: data.currentWeight,
        target: data.targetWeight,
        max: weightMax,
        unit: 'kg',
        color: Colors.accent,
      },
    ];
  }, [data]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Físico Actual vs. Deseado</Text>
        <Text style={styles.subtitle}>Proyección generada por tu IA personal</Text>

        {/* Comparación de monitos */}
        <View style={styles.comparacion}>

          {/* Actual */}
          <View style={styles.lado}>
            <Text style={styles.ladoLabel}>HOY</Text>
            <Monito size={130} grasa={data.currentFat} musculo={data.currentMuscle} color={Colors.accent} />
            <View style={styles.statsBox}>
              {Object.entries(data.statsActual).map(([k, v]) => (
                <View key={k} style={styles.statRow}>
                  <Text style={styles.statKey}>{k.toUpperCase()}</Text>
                  <Text style={styles.statVal}>{v}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Separador */}
          <View style={styles.vsWrap}>
            <View style={styles.vsLine} />
            <View style={styles.vsBadge}>
              <Text style={styles.vsText}>VS</Text>
            </View>
            <View style={styles.vsLine} />
          </View>

          {/* Objetivo */}
          <View style={styles.lado}>
            <Text style={[styles.ladoLabel, { color: '#7B61FF' }]}>META</Text>
            <Monito size={130} grasa={data.targetFat} musculo={data.targetMuscle} color="#7B61FF" />
            <View style={styles.statsBox}>
              {Object.entries(data.statsTarget).map(([k, v]) => (
                <View key={k} style={styles.statRow}>
                  <Text style={styles.statKey}>{k.toUpperCase()}</Text>
                  <Text style={[styles.statVal, { color: '#7B61FF' }]}>{v}</Text>
                </View>
              ))}
            </View>
          </View>

        </View>

        {/* Mensaje motivacional de la IA */}
        <View style={styles.iaMessage}>
          <Text style={styles.iaIcon}>🤖</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.iaTitle}>Tu IA dice:</Text>
            <Text style={styles.iaText}>
              Con tu plan actual, alcanzarás tu físico objetivo en aproximadamente{' '}
              <Text style={{ color: Colors.accent, fontWeight: '700' }}>{data.estimatedWeeks} semanas</Text>.
              Vas bien encaminado. ¡Sigue así!
            </Text>
          </View>
        </View>

        {/* Métricas de progreso */}
        <Text style={styles.sectionTitle}>Progreso por métrica</Text>

        {metricas.map((m) => {
          const pct = Math.min(Math.max((m.current / m.max) * 100, 0), 100);
          const tgtPct = Math.min(Math.max((m.target / m.max) * 100, 0), 100);
          return (
            <View key={m.label} style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricLabel}>{m.label}</Text>
                <Text style={[styles.metricValue, { color: m.color }]}>
                  {m.current.toFixed(1)}{m.unit}{' -> '}{m.target.toFixed(1)}{m.unit}
                </Text>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: m.color }]} />
                <View style={[styles.targetMark, { left: `${tgtPct}%` }]} />
              </View>
            </View>
          );
        })}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: { paddingHorizontal: Spacing.screen, paddingBottom: 40 },
  back: { marginTop: 20, marginBottom: 8 },
  backArrow: { fontSize: 24, color: Colors.white },
  title: { fontSize: 24, fontWeight: '800', color: Colors.white, marginBottom: 6 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 28 },

  comparacion: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24 },
  lado: { flex: 1, alignItems: 'center' },
  ladoLabel: { fontSize: 12, fontWeight: '800', color: Colors.accent, letterSpacing: 2, marginBottom: 12 },

  vsWrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 8 },
  vsLine: { width: 1, height: 40, backgroundColor: Colors.border },
  vsBadge: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  vsText: { fontSize: 10, fontWeight: '800', color: Colors.textSecondary },

  statsBox: { marginTop: 12, width: '100%', gap: 6 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 },
  statKey: { fontSize: 10, color: Colors.textSecondary, fontWeight: '700', letterSpacing: 1 },
  statVal: { fontSize: 13, fontWeight: '800', color: Colors.white },

  iaMessage: {
    backgroundColor: Colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border,
    padding: 16, flexDirection: 'row', gap: 12,
    marginBottom: 24,
  },
  iaIcon: { fontSize: 28 },
  iaTitle: { fontSize: 12, fontWeight: '700', color: Colors.accent, marginBottom: 4 },
  iaText: { fontSize: 13, color: Colors.textLabel, lineHeight: 19 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.white, marginBottom: 14 },
  metricCard: {
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    padding: 16, marginBottom: 12,
  },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  metricLabel: { fontSize: 13, fontWeight: '600', color: Colors.textLabel },
  metricValue: { fontSize: 13, fontWeight: '700' },
  progressBg: { height: 8, backgroundColor: '#262626', borderRadius: 4 },
  progressFill: { height: 8, borderRadius: 4 },
  targetMark: { position: 'absolute', top: -2, width: 2, height: 12, backgroundColor: Colors.white, borderRadius: 1 },
});
