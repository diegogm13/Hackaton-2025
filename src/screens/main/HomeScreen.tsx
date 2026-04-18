import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, DimensionValue,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useUser } from '../../context/UserContext';
import { GeminiService } from '../../services/GeminiService';
import { Colors, Spacing } from '../../theme';
import Monito from '../../components/Monito';

const MACROS = [
  { label: 'Calorías', value: '1,850', unit: 'kcal', color: '#FF6B6B' },
  { label: 'Proteínas', value: '145', unit: 'g', color: '#4ECDC4' },
  { label: 'Carbos', value: '210', unit: 'g', color: '#FFE66D' },
];

const DIET_PLAN_STORAGE_KEY = '@plan_dieta_generado';
const EXERCISE_PLAN_STORAGE_KEY = '@plan_ejercicio_generado';
const EXERCISE_DONE_STORAGE_KEY = '@rutina_done';

type StoredDietPlan = {
  plan_diario: Record<string, unknown>;
  resumen_calorico_diario: number;
  recomendaciones_personalizadas: string[];
  advertencias_ingredientes: string[];
};

type StoredExerciseItem = {
  ejercicio: string;
  series: number;
  repeticiones: string;
  descanso_segundos: number;
};

type StoredExercisePlan = {
  rutina_semanal: Record<string, StoredExerciseItem[]>;
  resumen_volumen_semanal?: string;
  recomendaciones_personalizadas?: string[];
};

function stringifyValue(value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => stringifyValue(item)).join(', ');
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return '-';
}

const buildUserScopedKey = (baseKey: string, userId: string) => `${baseKey}:${userId}`;

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
  const [dietPlan, setDietPlan] = useState<StoredDietPlan | null>(null);
  const [exercisePlan, setExercisePlan] = useState<StoredExercisePlan | null>(null);
  const [routineDoneMap, setRoutineDoneMap] = useState<Record<string, boolean>>({});

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

  useEffect(() => {
    if (!user?.id) {
      setDietPlan(null);
      setExercisePlan(null);
      setRoutineDoneMap({});
      return;
    }

    const loadStoredPlans = async () => {
      try {
        const rawDietPlan = await AsyncStorage.getItem(
          buildUserScopedKey(DIET_PLAN_STORAGE_KEY, user.id),
        );
        const rawExercisePlan = await AsyncStorage.getItem(
          buildUserScopedKey(EXERCISE_PLAN_STORAGE_KEY, user.id),
        );

        if (!rawDietPlan) {
          setDietPlan(null);
        } else {
          const parsedDiet = JSON.parse(rawDietPlan) as StoredDietPlan;
          setDietPlan(parsedDiet);
        }

        if (!rawExercisePlan) {
          setExercisePlan(null);
        } else {
          const parsedExercise = JSON.parse(rawExercisePlan) as StoredExercisePlan;
          setExercisePlan(parsedExercise);
        }
      } catch {
        setDietPlan(null);
        setExercisePlan(null);
      }
    };

    loadStoredPlans();
  }, [user?.id]);

  const caloriesObjective = dietPlan?.resumen_calorico_diario
    ? `${dietPlan.resumen_calorico_diario}`
    : '1,850';

  const nutritionCards = dietPlan
    ? [
      { label: 'Calorías', value: caloriesObjective, unit: 'kcal', color: '#FF6B6B' },
      {
        label: 'Recomendaciones',
        value: `${dietPlan.recomendaciones_personalizadas?.length ?? 0}`,
        unit: 'items',
        color: '#4ECDC4',
      },
      {
        label: 'Advertencias',
        value: `${dietPlan.advertencias_ingredientes?.length ?? 0}`,
        unit: 'items',
        color: '#FFE66D',
      },
    ]
    : MACROS;

  const nutritionHint = dietPlan?.recomendaciones_personalizadas?.[0]
    ?? '1,205 / 1,850 kcal consumidas';

  const weekdayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const todayName = weekdayNames[new Date().getDay()];
  const todayRoutine = exercisePlan?.rutina_semanal?.[todayName] ?? [];
  const hasRealRoutine = todayRoutine.length > 0;
  const routineBadge = todayRoutine.length > 0 ? todayName : 'Pecho + Espalda';
  const routineItems = todayRoutine.length > 0
    ? todayRoutine.map((item, index) => {
      const routineId = `${todayName}-${index}-${item.ejercicio}`;
      return {
        id: routineId,
        ejercicio: item.ejercicio,
        series: `${item.series}x${item.repeticiones}`,
        peso: `Descanso ${item.descanso_segundos}s`,
        done: Boolean(routineDoneMap[routineId]),
      };
    })
    : RUTINA.map((item, index) => ({ ...item, id: `mock-${index}-${item.ejercicio}` }));

  useEffect(() => {
    if (!user?.id || !hasRealRoutine) {
      setRoutineDoneMap({});
      return;
    }

    const loadDoneState = async () => {
      try {
        const rawDoneState = await AsyncStorage.getItem(
          buildUserScopedKey(EXERCISE_DONE_STORAGE_KEY, `${user.id}:${todayName}`),
        );

        if (!rawDoneState) {
          setRoutineDoneMap({});
          return;
        }

        const parsed = JSON.parse(rawDoneState) as Record<string, boolean>;
        setRoutineDoneMap(parsed);
      } catch {
        setRoutineDoneMap({});
      }
    };

    loadDoneState();
  }, [user?.id, todayName, hasRealRoutine]);

  const toggleRoutineDone = async (routineId: string) => {
    if (!user?.id || !hasRealRoutine) return;

    const nextState = {
      ...routineDoneMap,
      [routineId]: !routineDoneMap[routineId],
    };

    setRoutineDoneMap(nextState);
    try {
      await AsyncStorage.setItem(
        buildUserScopedKey(EXERCISE_DONE_STORAGE_KEY, `${user.id}:${todayName}`),
        JSON.stringify(nextState),
      );
    } catch {
      // Si falla la persistencia, mantenemos al menos el estado en memoria.
    }
  };

  const handleExportWeeklyPlanPdf = async () => {
    if (!user) return;

    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    const ejercicioHtml = dias.map((dia) => {
      const ejercicios = exercisePlan?.rutina_semanal?.[dia] ?? [];
      if (!ejercicios.length) {
        return `<div class="day-card"><h4>${dia}</h4><p>Sin rutina registrada</p></div>`;
      }

      const items = ejercicios
        .map(
          (item) => `<li><strong>${item.ejercicio}</strong>: ${item.series}x${item.repeticiones} · Descanso ${item.descanso_segundos}s</li>`,
        )
        .join('');

      return `<div class="day-card"><h4>${dia}</h4><ul>${items}</ul></div>`;
    }).join('');

    const dietaHtml = dias.map((dia) => {
      const planDia = dietPlan?.plan_diario?.[dia.toLowerCase()] ?? dietPlan?.plan_diario?.[dia] ?? null;

      if (!planDia) {
        return `<div class="day-card"><h4>${dia}</h4><p>Sin plan nutricional registrado</p></div>`;
      }

      return `<div class="day-card"><h4>${dia}</h4><p>${stringifyValue(planDia)}</p></div>`;
    }).join('');

    const html = `
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <style>
          *{box-sizing:border-box}
          body{
            font-family:Helvetica,Arial,sans-serif;
            background:${Colors.bg};
            color:${Colors.white};
            padding:28px;
            margin:0;
          }
          .hero{
            background:linear-gradient(135deg, ${Colors.accentDark}, ${Colors.surface});
            border:1px solid ${Colors.border};
            border-radius:16px;
            padding:18px;
            margin-bottom:18px;
          }
          .title{
            font-size:30px;
            font-weight:800;
            color:${Colors.accent};
            letter-spacing:0.4px;
            margin-bottom:4px;
          }
          .subtitle{
            font-size:13px;
            color:${Colors.textLabel};
          }
          .meta-row{
            margin-top:12px;
            display:flex;
            gap:8px;
            flex-wrap:wrap;
          }
          .pill{
            display:inline-block;
            background:${Colors.bg};
            color:${Colors.textLabel};
            border:1px solid ${Colors.border};
            border-radius:999px;
            padding:6px 10px;
            font-size:11px;
            font-weight:600;
          }
          .kpis{
            display:flex;
            gap:10px;
            margin-bottom:18px;
          }
          .kpi{
            flex:1;
            background:${Colors.surface};
            border:1px solid ${Colors.border};
            border-radius:12px;
            padding:12px;
          }
          .kpi-label{
            font-size:11px;
            color:${Colors.textSecondary};
            text-transform:uppercase;
            letter-spacing:0.8px;
          }
          .kpi-value{
            margin-top:6px;
            font-size:22px;
            color:${Colors.accent};
            font-weight:800;
          }
          .section{
            margin-top:14px;
            background:${Colors.surface};
            border:1px solid ${Colors.border};
            border-radius:14px;
            padding:14px;
          }
          .section h3{
            margin:0 0 10px 0;
            color:${Colors.white};
            font-size:15px;
          }
          .section-sub{
            font-size:12px;
            color:${Colors.textSecondary};
            margin-bottom:10px;
            line-height:1.5;
          }
          .day-card{
            background:${Colors.bg};
            border:1px solid ${Colors.border};
            border-radius:10px;
            padding:10px;
            margin-bottom:10px;
          }
          .day-card h4{
            margin:0 0 8px 0;
            color:${Colors.accent};
            font-size:13px;
          }
          .day-card p,.day-card li{
            font-size:12px;
            color:${Colors.textLabel};
            line-height:1.5;
          }
          ul{
            padding-left:18px;
            margin:0;
          }
          .footer{
            margin-top:18px;
            text-align:center;
            font-size:11px;
            color:${Colors.placeholder};
          }
        </style>
      </head>
      <body>
        <div class="hero">
          <div class="title">Plan Semanal Holos</div>
          <div class="subtitle">Resumen personalizado de entrenamiento y nutrición</div>
          <div class="meta-row">
            <span class="pill">Usuario: ${user.nombre}</span>
            <span class="pill">Fecha: ${new Date().toLocaleDateString()}</span>
          </div>
        </div>

        <div class="kpis">
          <div class="kpi">
            <div class="kpi-label">Calorías objetivo</div>
            <div class="kpi-value">${dietPlan?.resumen_calorico_diario ?? '-'}</div>
          </div>
          <div class="kpi">
            <div class="kpi-label">Recomendaciones</div>
            <div class="kpi-value">${(dietPlan?.recomendaciones_personalizadas ?? []).length}</div>
          </div>
          <div class="kpi">
            <div class="kpi-label">Advertencias</div>
            <div class="kpi-value">${(dietPlan?.advertencias_ingredientes ?? []).length}</div>
          </div>
        </div>

        <div class="section">
          <h3>Resumen nutricional</h3>
          <div class="section-sub">Recomendaciones: ${(dietPlan?.recomendaciones_personalizadas ?? []).join(' | ') || '-'}</div>
          <div class="section-sub">Advertencias: ${(dietPlan?.advertencias_ingredientes ?? []).join(' | ') || '-'}</div>
        </div>

        <div class="section">
          <h3>Rutina de ejercicio semanal</h3>
          ${ejercicioHtml}
        </div>

        <div class="section">
          <h3>Plan de dieta semanal</h3>
          ${dietaHtml}
        </div>

        <div class="footer">Holos · Generado automáticamente</div>
      </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
      });
    } catch {
      // Si no se puede compartir, evitamos romper la pantalla.
    }
  };

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
            <Text style={styles.iaCardLabel}>Holos · Mensaje del día</Text>
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
            {nutritionCards.map((m) => (
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
          <Text style={styles.progressText}>{nutritionHint}</Text>
        </View>

        {/* ── Card: Rutina del día ── */}
        <View style={styles.card}>
          <View style={styles.cardRowHeader}>
            <Text style={styles.cardTitle}>Rutina de hoy</Text>
            <Text style={styles.cardBadge}>{routineBadge}</Text>
          </View>
          {routineItems.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={styles.ejercicioRow}
              onPress={() => toggleRoutineDone(r.id)}
              disabled={!hasRealRoutine}
              activeOpacity={0.8}
            >
              <View style={[styles.doneCircle, r.done && styles.doneCircleActive]}>
                {r.done && <Ionicons name="checkmark" size={14} color={Colors.bg} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.ejercicioName, r.done && styles.ejercicioDone]}>
                  {r.ejercicio}
                </Text>
                <Text style={styles.ejercicioSub}>{r.series} · {r.peso}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Quick access ── */}
        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('ChatIA')}>
            <Ionicons name="mic" size={22} color={Colors.accent} />
            <Text style={styles.quickText}>Preguntarle a la IA</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={handleExportWeeklyPlanPdf}>
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
