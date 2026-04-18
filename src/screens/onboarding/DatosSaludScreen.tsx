import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation';
import { Colors, Spacing } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'DatosSalud'>;
};

const PREGUNTAS = [
  '¿Tienes enfermedades crónicas?',
  '¿Tienes condiciones psicológicas?',
  '¿Tienes alguna discapacidad física?',
  '¿Estás en período reproductivo activo?',
];

const CONDICIONES_LISTA = [
  'Diabetes T1', 'Diabetes T2', 'Hipertensión', 'Asma', 'Hipotiroidismo',
  'Arritmia', 'Escoliosis', 'Hernia Discal', 'Ansiedad', 'Depresión',
  'Artritis', 'Anemia', 'Ninguna',
];

export default function DatosSaludScreen({ navigation }: Props) {
  const [toggles, setToggles] = useState<boolean[]>([false, false, false, false]);
  const [condicionesSeleccionadas, setCondicionesSeleccionadas] = useState<string[]>([]);

  const toggle = (i: number) => {
    const next = [...toggles];
    next[i] = !next[i];
    setToggles(next);
  };

  const toggleCondicion = (cond: string) => {
    if (cond === 'Ninguna') {
      setCondicionesSeleccionadas(['Ninguna']);
      return;
    }
    setCondicionesSeleccionadas(prev => {
      const filtered = prev.filter(c => c !== 'Ninguna');
      if (filtered.includes(cond)) {
        return filtered.filter(c => c !== cond);
      }
      return [...filtered, cond];
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.stepText}>Paso 2 de 3</Text>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: '66%' }]} />
        </View>

        <Text style={styles.title}>Historial de Salud</Text>
        <Text style={styles.subtitle}>Para personalizar tu plan de forma segura</Text>

        <View style={styles.questions}>
          {PREGUNTAS.map((q, i) => (
            <View key={q} style={styles.card}>
              <Text style={styles.question}>{q}</Text>
              <TouchableOpacity style={styles.toggleWrap} onPress={() => toggle(i)}>
                <View style={[styles.toggleBg, toggles[i] && styles.toggleActive]}>
                  <View style={[styles.toggleDot, toggles[i] && styles.toggleDotActive]} />
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <Text style={styles.fieldLabel}>Selecciona tus condiciones</Text>
        <View style={styles.chipsContainer}>
          {CONDICIONES_LISTA.map((c) => {
            const isSelected = condicionesSeleccionadas.includes(c);
            return (
              <TouchableOpacity
                key={c}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => toggleCondicion(c)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('DatosEstiloVida')}>
          <Text style={styles.btnText}>Siguiente →</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: { flexGrow: 1, paddingHorizontal: Spacing.screen, paddingBottom: 40 },
  back: { marginTop: 20, marginBottom: 8 },
  backArrow: { fontSize: 24, color: Colors.white },
  stepText: { fontSize: 12, color: Colors.textSecondary },
  progressBg: { height: 6, backgroundColor: '#262626', borderRadius: 3, marginTop: 8, marginBottom: 24 },
  progressFill: { height: 6, backgroundColor: Colors.accent, borderRadius: 3 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.white, marginBottom: 6 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 24 },
  questions: { gap: 12, marginBottom: 24 },
  card: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surface, borderRadius: 12, padding: 16,
  },
  question: { fontSize: 13, fontWeight: '600', color: Colors.textLabel, flex: 1, marginRight: 12 },
  toggleWrap: { padding: 4 },
  toggleBg: {
    width: 44, height: 24, borderRadius: 12,
    backgroundColor: Colors.toggleOff,
    justifyContent: 'center', padding: 3,
  },
  toggleActive: { backgroundColor: Colors.accent },
  toggleDot: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: Colors.white,
  },
  toggleDotActive: { alignSelf: 'flex-end' },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: Colors.textLabel, marginBottom: 12 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipText: { fontSize: 13, color: Colors.textLabel, fontWeight: '600' },
  chipTextActive: { color: Colors.bg },
  btn: {
    height: Spacing.buttonHeight,
    backgroundColor: Colors.accent,
    borderRadius: Spacing.buttonRadius,
    alignItems: 'center', justifyContent: 'center',
  },
  btnText: { fontSize: 16, fontWeight: '800', color: Colors.bg },
});
