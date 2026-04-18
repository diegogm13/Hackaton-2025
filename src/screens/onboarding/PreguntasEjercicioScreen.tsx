import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation';
import { useOnboarding } from '../../context/OnboardingContext';
import { Colors, Spacing } from '../../theme';
import { generarPlanEjercicioDesdeOnboarding, ApiError } from '../../services/ejercicios/ExerciseService';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'PreguntasEjercicio'>;
};

const METAS = ['Tonificación muscular', 'Fuerza y potencia', 'Resistencia cardio', 'Flexibilidad y movilidad'];
const LUGARES = ['Gimnasio', 'En casa', 'Al aire libre', 'Mixto'];
const NIVELES = ['Principiante', 'Intermedio', 'Avanzado'];
const DIAS = ['1-2 días', '3-4 días', '5-6 días', 'Todos los días'];

function ChipRow({ options, selected, onSelect }: { options: string[]; selected: number; onSelect: (i: number) => void }) {
  return (
    <View style={styles.chipRow}>
      {options.map((o, i) => (
        <TouchableOpacity key={o} style={[styles.chip, i === selected && styles.chipActive]} onPress={() => onSelect(i)}>
          <Text style={[styles.chipText, i === selected && styles.chipTextActive]}>{o}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function PreguntasEjercicioScreen({ navigation }: Props) {
  const [meta, setMeta] = useState(0);
  const [lugar, setLugar] = useState(0);
  const [nivel, setNivel] = useState(0);
  const [dias, setDias] = useState(1);
  const [loading, setLoading] = useState(false);
  const { data, updateData } = useOnboarding();

  const handleNext = async () => {
    try {
        setLoading(true);
        
        // El servicio buscará data.userId automáticamente
        const respuesta = await generarPlanEjercicioDesdeOnboarding(
            data, 
        );

        updateData({ planEjercicios: respuesta.plan_generado });
        
        // Navegación
        navigation.navigate(data.plan === 2 ? 'PreguntasNutricion' : 'DatosEstadisticos');
    } catch (error) {
        Alert.alert("Error", error instanceof ApiError ? error.message : "Error de conexión");
    } finally {
        setLoading(false);
    }
};

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.stepText}>Plan de Ejercicio</Text>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: '40%' }]} />
        </View>

        <Text style={styles.title}>🏋️ Tu Rutina de Ejercicio</Text>
        <Text style={styles.subtitle}>Personaliza tu entrenamiento ideal</Text>

        <View style={styles.section}>
          <Text style={styles.fieldLabel}>¿Cuál es tu meta principal?</Text>
          <ChipRow options={METAS} selected={meta} onSelect={setMeta} />
        </View>

        <View style={styles.section}>
          <Text style={styles.fieldLabel}>¿Dónde prefieres entrenar?</Text>
          <ChipRow options={LUGARES} selected={lugar} onSelect={setLugar} />
        </View>

        <View style={styles.section}>
          <Text style={styles.fieldLabel}>¿Cuál es tu nivel actual?</Text>
          <ChipRow options={NIVELES} selected={nivel} onSelect={setNivel} />
        </View>

        <View style={styles.section}>
          <Text style={styles.fieldLabel}>¿Cuántos días a la semana puedes entrenar?</Text>
          <ChipRow options={DIAS} selected={dias} onSelect={setDias} />
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
  stepText: { fontSize: 12, color: Colors.accent, fontWeight: '700' },
  progressBg: { height: 6, backgroundColor: '#262626', borderRadius: 3, marginTop: 8, marginBottom: 24 },
  progressFill: { height: 6, backgroundColor: Colors.accent, borderRadius: 3 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.white, marginBottom: 6 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 8 },
  section: { marginBottom: 20 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.textLabel, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  chipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: Colors.bg },
  btn: { height: Spacing.buttonHeight, backgroundColor: Colors.accent, borderRadius: Spacing.buttonRadius, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  btnText: { fontSize: 16, fontWeight: '800', color: Colors.bg },
});
