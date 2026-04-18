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
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'DatosEstiloVida'>;
};

const ALERGIAS_LISTA = [
  'Lactosa', 'Gluten', 'Mariscos', 'Frutos Secos', 'Maní', 'Huevo',
  'Soya', 'Fructosa', 'Legumbres', 'Pescado', 'Fresa', 'Melocotón', 'Ninguna',
];

export default function DatosEstiloVidaScreen({ navigation }: Props) {
  const [rutina, setRutina] = useState(1);
  const [disponibilidad, setDisponibilidad] = useState(1);
  const [dieta, setDieta] = useState(0);
  const [habitos, setHabitos] = useState([false, false, false]);
  const [alergiasSeleccionadas, setAlergiasSeleccionadas] = useState<string[]>([]);

  const RUTINAS = ['Nunca', '1-2x/sem', '3-4x/sem', '5+/sem'];
  const DISPONIBILIDAD = ['30 min', '1 hora', '2 horas', 'Flexible'];
  const DIETAS = ['Omnívoro', 'Vegano', 'Vegetariano', 'Keto'];
  const HABITOS = ['Consume alcohol', 'Fuma tabaco', 'Usa suplementos'];

  const toggleHabito = (i: number) => {
    const next = [...habitos];
    next[i] = !next[i];
    setHabitos(next);
  };

  const toggleAlergia = (alg: string) => {
    if (alg === 'Ninguna') {
      setAlergiasSeleccionadas(['Ninguna']);
      return;
    }
    setAlergiasSeleccionadas(prev => {
      const filtered = prev.filter(a => a !== 'Ninguna');
      if (filtered.includes(alg)) {
        return filtered.filter(a => a !== alg);
      }
      return [...filtered, alg];
    });
  };

  const ChipRow = ({
    options, selected, onSelect,
  }: { options: string[]; selected: number; onSelect: (i: number) => void }) => (
    <View style={styles.chipRow}>
      {options.map((o, i) => (
        <TouchableOpacity
          key={o}
          style={[styles.chip, i === selected && styles.chipActive]}
          onPress={() => onSelect(i)}
        >
          <Text style={[styles.chipText, i === selected && styles.chipTextActive]}>{o}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.stepText}>Paso 3 de 3</Text>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>

        <Text style={styles.title}>Estilo de Vida</Text>
        <Text style={styles.subtitle}>Cuéntanos cómo es tu día a día</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rutina de entrenamiento</Text>
          <ChipRow options={RUTINAS} selected={rutina} onSelect={setRutina} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Disponibilidad diaria</Text>
          <ChipRow options={DISPONIBILIDAD} selected={disponibilidad} onSelect={setDisponibilidad} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hábitos de consumo</Text>
          {HABITOS.map((h, i) => (
            <View key={h} style={styles.habitRow}>
              <Text style={styles.habitText}>{h}</Text>
              <TouchableOpacity onPress={() => toggleHabito(i)}>
                <View style={[styles.toggleBg, habitos[i] && styles.toggleActive]}>
                  <View style={[styles.toggleDot, habitos[i] && styles.toggleDotActive]} />
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dieta preferida</Text>
          <ChipRow options={DIETAS} selected={dieta} onSelect={setDieta} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alergias alimentarias</Text>
          <View style={styles.chipsContainer}>
            {ALERGIAS_LISTA.map((a) => {
              const isSelected = alergiasSeleccionadas.includes(a);
              return (
                <TouchableOpacity
                  key={a}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => toggleAlergia(a)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{a}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Personalizacion')}>
          <Text style={styles.btnText}>Continuar →</Text>
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
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.textLabel, marginBottom: 12 },
  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 10, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.textLabel },
  chipTextActive: { color: Colors.bg },
  habitRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surface, borderRadius: 10, padding: 14, marginBottom: 8,
  },
  habitText: { fontSize: 14, color: Colors.white },
  toggleBg: {
    width: 44, height: 24, borderRadius: 12,
    backgroundColor: Colors.toggleOff, justifyContent: 'center', padding: 3,
  },
  toggleActive: { backgroundColor: Colors.accent },
  toggleDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: Colors.white },
  toggleDotActive: { alignSelf: 'flex-end' },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  btn: {
    height: Spacing.buttonHeight,
    backgroundColor: Colors.accent,
    borderRadius: Spacing.buttonRadius,
    alignItems: 'center', justifyContent: 'center',
  },
  btnText: { fontSize: 16, fontWeight: '800', color: Colors.bg },
});
