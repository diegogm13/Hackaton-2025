import React from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing } from '../../theme';
import Monito from '../../components/Monito';

const STATS_ACTUAL = { peso: '72 kg', grasa: '22%', musculo: '38%', imc: '23.4' };
const STATS_OBJETIVO = { peso: '68 kg', grasa: '14%', musculo: '48%', imc: '21.9' };

export default function FisicoDetalleScreen() {
  const navigation = useNavigation();

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
            <Monito size={130} grasa={22} musculo={38} color={Colors.accent} />
            <View style={styles.statsBox}>
              {Object.entries(STATS_ACTUAL).map(([k, v]) => (
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
            <Monito size={130} grasa={14} musculo={48} color="#7B61FF" />
            <View style={styles.statsBox}>
              {Object.entries(STATS_OBJETIVO).map(([k, v]) => (
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
              <Text style={{ color: Colors.accent, fontWeight: '700' }}>14 semanas</Text>.
              Vas bien encaminado. ¡Sigue así!
            </Text>
          </View>
        </View>

        {/* Métricas de progreso */}
        <Text style={styles.sectionTitle}>Progreso por métrica</Text>

        {[
          { label: 'Reducción de grasa', current: 22, target: 14, max: 30, unit: '%', color: '#FF6B6B' },
          { label: 'Ganancia muscular', current: 38, target: 48, max: 60, unit: '%', color: '#4ECDC4' },
          { label: 'Pérdida de peso', current: 72, target: 68, max: 80, unit: 'kg', color: Colors.accent },
        ].map((m) => {
          const progress = ((m.current - (m.max - m.current)) / (m.target - (m.max - m.current))) * 100;
          const pct = Math.min(Math.max((m.current / m.max) * 100, 0), 100);
          const tgtPct = Math.min(Math.max((m.target / m.max) * 100, 0), 100);
          return (
            <View key={m.label} style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricLabel}>{m.label}</Text>
                <Text style={[styles.metricValue, { color: m.color }]}>
                  {m.current}{m.unit} → {m.target}{m.unit}
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
