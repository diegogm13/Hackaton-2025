import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, DimensionValue,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../../context/UserContext';
import { GeminiService } from '../../services/GeminiService';
import { Colors, Spacing } from '../../theme';
import Monito from '../../components/Monito';

const MACROS = [
  { label: 'Calorías', value: '1,850', unit: 'kcal', color: '#FF6B6B' },
  { label: 'Proteínas', value: '145', unit: 'g', color: '#4ECDC4' },
  { label: 'Carbos', value: '210', unit: 'g', color: '#FFE66D' },
];

const RUTINA = [
  { ejercicio: 'Press de banca', series: '4x10', peso: '60 kg', done: true },
  { ejercicio: 'Sentadilla', series: '4x12', peso: '80 kg', done: true },
  { ejercicio: 'Peso muerto', series: '3x8', peso: '100 kg', done: false },
  { ejercicio: 'Remo con barra', series: '4x10', peso: '55 kg', done: false },
];

function greeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Buenos días 👋';
  if (h >= 12 && h < 20) return 'Buenas tardes 👋';
  return 'Buenas noches 👋';
}

function SkeletonLine({ width, height = 14 }: { width: DimensionValue; height?: number }) {
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.8, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={{
      width, height, borderRadius: 6,
      backgroundColor: Colors.border, opacity,
    }} />
  );
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useUser();
  const [iaMsg, setIaMsg] = useState('');
  const [iaLoading, setIaLoading] = useState(false);

  const nombre = user?.nombre ?? 'Atleta';
  const peso = user?.peso ?? '--';
  const grasa = parseFloat(user?.grasa ?? '') || 22;
  const musculo = parseFloat(user?.musculo ?? '') || 38;

  useEffect(() => {
    if (!user) return;
    setIaLoading(true);
    GeminiService.getHomeSummary(user)
      .then(msg => setIaMsg(msg))
      .catch(() => setIaMsg(`¡Hola ${nombre}! Sigue tu plan de hoy y mantén la constancia. Cada sesión te acerca a tu objetivo.`))
      .finally(() => setIaLoading(false));
  }, [user?.id]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.name}>{nombre}</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* ── Card: Mensaje motivacional de la IA ── */}
        <LinearGradient
          colors={['#0D2E17', '#0A1F10']}
          style={styles.iaCard}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <View style={styles.iaCardHeader}>
            <View style={styles.iaDot} />
            <Text style={styles.iaCardLabel}>FitAI · Mensaje del día</Text>
          </View>
          {iaLoading ? (
            <View style={{ gap: 8 }}>
              <SkeletonLine width="92%" />
              <SkeletonLine width="75%" />
            </View>
          ) : (
            <Text style={styles.iaMessage}>{iaMsg}</Text>
          )}
          <TouchableOpacity onPress={() => navigation.navigate('ChatIA')} style={styles.iaChatLink}>
            <Text style={styles.iaChatLinkText}>Preguntarle más →</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* ── Card: Monito (progreso físico) ── */}
        <TouchableOpacity
          style={styles.monitoCard}
          onPress={() => navigation.navigate('FisicoDetalle')}
          activeOpacity={0.85}
        >
          <View style={styles.monitoCardHeader}>
            <Text style={styles.cardTitle}>Mi Progreso Físico</Text>
            <Text style={styles.cardLink}>Ver detalle →</Text>
          </View>
          <View style={styles.monitoRow}>
            <View style={styles.monitoInfo}>
              <Text style={styles.monitoStatLabel}>Peso actual</Text>
              <Text style={styles.monitoStatValue}>{peso} kg</Text>
              <Text style={styles.monitoStatLabel}>Grasa</Text>
              <Text style={styles.monitoStatValue}>{user?.grasa ?? '22'}%</Text>
              <Text style={styles.monitoStatLabel}>Músculo</Text>
              <Text style={styles.monitoStatValue}>{user?.musculo ?? '38'}%</Text>
            </View>
            <Monito size={120} grasa={grasa} musculo={musculo} color={Colors.accent} />
          </View>
        </TouchableOpacity>

        {/* ── Card: Macros del día ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Nutrición de hoy</Text>
          <View style={styles.macrosRow}>
            {MACROS.map((m) => (
              <View key={m.label} style={styles.macroItem}>
                <Text style={[styles.macroValue, { color: m.color }]}>{m.value}</Text>
                <Text style={styles.macroUnit}>{m.unit}</Text>
                <Text style={styles.macroLabel}>{m.label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: '65%' }]} />
          </View>
          <Text style={styles.progressText}>1,205 / 1,850 kcal consumidas</Text>
        </View>

        {/* ── Card: Rutina del día ── */}
        <View style={styles.card}>
          <View style={styles.cardRowHeader}>
            <Text style={styles.cardTitle}>Rutina de hoy</Text>
            <Text style={styles.cardBadge}>Pecho + Espalda</Text>
          </View>
          {RUTINA.map((r) => (
            <View key={r.ejercicio} style={styles.ejercicioRow}>
              <View style={[styles.doneCircle, r.done && styles.doneCircleActive]}>
                {r.done && <Ionicons name="checkmark" size={14} color={Colors.bg} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.ejercicioName, r.done && styles.ejercicioDone]}>
                  {r.ejercicio}
                </Text>
                <Text style={styles.ejercicioSub}>{r.series} · {r.peso}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Quick access ── */}
        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('ChatIA')}>
            <Ionicons name="mic" size={22} color={Colors.accent} />
            <Text style={styles.quickText}>Preguntarle a la IA</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn}>
            <Ionicons name="document-text-outline" size={22} color={Colors.accent} />
            <Text style={styles.quickText}>Ver plan semanal</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: { paddingHorizontal: Spacing.screen, paddingBottom: 24 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingTop: 20, marginBottom: 20,
  },
  greeting: { fontSize: 14, color: Colors.textSecondary },
  name: { fontSize: 26, fontWeight: '800', color: Colors.white },
  notifBtn: { padding: 8, backgroundColor: Colors.surface, borderRadius: 12 },

  // IA message card
  iaCard: {
    borderRadius: Spacing.cardRadius,
    borderWidth: 1, borderColor: '#1A4D2A',
    padding: 18, marginBottom: 16, gap: 10,
  },
  iaCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iaDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent },
  iaCardLabel: { fontSize: 11, fontWeight: '700', color: Colors.accent, letterSpacing: 0.5 },
  iaMessage: { fontSize: 14, color: Colors.white, lineHeight: 22, fontWeight: '500' },
  iaChatLink: { alignSelf: 'flex-start' },
  iaChatLinkText: { fontSize: 13, color: Colors.accent, fontWeight: '700' },

  monitoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.cardRadius,
    borderWidth: 1, borderColor: Colors.border,
    padding: 18, marginBottom: 16,
  },
  monitoCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  cardLink: { fontSize: 13, color: Colors.accent, fontWeight: '600' },
  monitoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monitoInfo: { gap: 4 },
  monitoStatLabel: { fontSize: 12, color: Colors.textSecondary },
  monitoStatValue: { fontSize: 20, fontWeight: '800', color: Colors.white },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.cardRadius,
    borderWidth: 1, borderColor: Colors.border,
    padding: 18, marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.white, marginBottom: 16 },
  cardRowHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  cardBadge: {
    fontSize: 11, fontWeight: '700', color: Colors.accent,
    backgroundColor: Colors.accentDark, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
  },

  macrosRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  macroItem: { alignItems: 'center' },
  macroValue: { fontSize: 22, fontWeight: '800' },
  macroUnit: { fontSize: 12, color: Colors.textSecondary },
  macroLabel: { fontSize: 12, color: Colors.textLabel, marginTop: 2 },

  progressBg: { height: 6, backgroundColor: '#262626', borderRadius: 3, marginBottom: 8 },
  progressFill: { height: 6, backgroundColor: Colors.accent, borderRadius: 3 },
  progressText: { fontSize: 12, color: Colors.textSecondary },

  ejercicioRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  doneCircle: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  doneCircleActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  ejercicioName: { fontSize: 14, fontWeight: '600', color: Colors.white },
  ejercicioDone: { color: Colors.textSecondary, textDecorationLine: 'line-through' },
  ejercicioSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  quickRow: { flexDirection: 'row', gap: 12 },
  quickBtn: {
    flex: 1, backgroundColor: Colors.surface,
    borderRadius: 14, borderWidth: 1, borderColor: Colors.border,
    padding: 16, alignItems: 'center', gap: 8,
  },
  quickText: { fontSize: 13, fontWeight: '600', color: Colors.white, textAlign: 'center' },
});
