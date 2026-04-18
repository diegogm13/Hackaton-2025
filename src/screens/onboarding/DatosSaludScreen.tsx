import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation';
import { useOnboarding } from '../../context/OnboardingContext';
import { Colors, Spacing } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'DatosSalud'>;
};

const CONDICIONES_MEDICAS = [
  'Hipotiroidismo',
  'Hipertensión',
  'Síndrome de intestino irritable',
  'Enfermedad renal crónica',
  'Gota',
  'Diabetes tipo 2',
  'Síndrome de ovario poliquístico',
];

const MEDICAMENTOS = [
  'Anticoagulantes',
  'Estatinas',
  'Diuréticos ahorradores de potasio',
];

export default function DatosSaludScreen({ navigation }: Props) {
  const [condiciones, setCondiciones] = useState<string[]>([]);
  const [medicamentos, setMedicamentos] = useState<string[]>([]);
  const { updateData } = useOnboarding();

  const toggleCondicion = (item: string) =>
    setCondiciones(prev => prev.includes(item) ? prev.filter(c => c !== item) : [...prev, item]);

  const toggleMedicamento = (item: string) =>
    setMedicamentos(prev => prev.includes(item) ? prev.filter(m => m !== item) : [...prev, item]);

  const handleNext = () => {
    updateData({ condicionesMedicas: condiciones, medicamentos });
    navigation.navigate('ObjetivoDieta');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.stepText}>Paso 6 de 7</Text>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: '86%' }]} />
        </View>

        <Text style={styles.title}>Historial de Salud</Text>
        <Text style={styles.subtitle}>Para personalizar tu plan de forma segura</Text>

        {/* Condiciones médicas */}
        <Text style={styles.sectionTitle}>Condiciones Médicas</Text>
        <Text style={styles.sectionSubtitle}>Selecciona las que apliquen</Text>
        <View style={styles.chipsWrap}>
          {CONDICIONES_MEDICAS.map(item => (
            <TouchableOpacity
              key={item}
              style={[styles.chip, condiciones.includes(item) && styles.chipActive]}
              onPress={() => toggleCondicion(item)}
            >
              <Text style={[styles.chipText, condiciones.includes(item) && styles.chipTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Medicamentos */}
        <Text style={styles.sectionTitle}>Interacciones con Medicamentos</Text>
        <Text style={styles.sectionSubtitle}>Selecciona los que tomas</Text>
        <View style={styles.chipsWrap}>
          {MEDICAMENTOS.map(item => (
            <TouchableOpacity
              key={item}
              style={[styles.chip, medicamentos.includes(item) && styles.chipActive]}
              onPress={() => toggleMedicamento(item)}
            >
              <Text style={[styles.chipText, medicamentos.includes(item) && styles.chipTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleNext}>
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
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.white, marginBottom: 4 },
  sectionSubtitle: { fontSize: 12, color: Colors.textSecondary, marginBottom: 12 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  chipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: Colors.bg },
  btn: { height: Spacing.buttonHeight, backgroundColor: Colors.accent, borderRadius: Spacing.buttonRadius, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 16, fontWeight: '800', color: Colors.bg },
});
