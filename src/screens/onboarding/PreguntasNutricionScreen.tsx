import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation';
import { useOnboarding } from '../../context/OnboardingContext';
import { Colors, Spacing } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'PreguntasNutricion'>;
};

const METAS_NUT = ['Déficit calórico', 'Superávit calórico', 'Mantenimiento', 'Mejorar digestión'];
const CONTROL_CAL = ['Sí, activamente', 'A veces', 'Quiero empezar', 'Sin contar calorías'];
const COMIDAS_DIA = ['1-2 comidas', '3 comidas', '4-5 comidas', 'Más de 5'];
const PREP_COMIDA = ['Cocino en casa', 'Comida preparada', 'Mixto', 'Casi siempre fuera'];

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

export default function PreguntasNutricionScreen({ navigation }: Props) {
  const [metaNut, setMetaNut] = useState(0);
  const [controlCal, setControlCal] = useState(0);
  const [comidasDia, setComidasDia] = useState(1);
  const [prepComida, setPrepComida] = useState(0);
  const { updateData } = useOnboarding();

  const handleNext = () => {
    updateData({ metaNutricional: metaNut, controlCalorias: controlCal });
    navigation.navigate('DatosEstadisticos');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.stepText}>Plan Nutricional</Text>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: '55%' }]} />
        </View>

        <Text style={styles.title}>🥗 Tu Plan Nutricional</Text>
        <Text style={styles.subtitle}>Diseña tu alimentación perfecta</Text>

        <View style={styles.section}>
          <Text style={styles.fieldLabel}>¿Cuál es tu meta nutricional?</Text>
          <ChipRow options={METAS_NUT} selected={metaNut} onSelect={setMetaNut} />
        </View>

        <View style={styles.section}>
          <Text style={styles.fieldLabel}>¿Llevas control de calorías?</Text>
          <ChipRow options={CONTROL_CAL} selected={controlCal} onSelect={setControlCal} />
        </View>

        <View style={styles.section}>
          <Text style={styles.fieldLabel}>¿Cuántas comidas haces al día?</Text>
          <ChipRow options={COMIDAS_DIA} selected={comidasDia} onSelect={setComidasDia} />
        </View>

        <View style={styles.section}>
          <Text style={styles.fieldLabel}>¿Cómo preparas tus comidas?</Text>
          <ChipRow options={PREP_COMIDA} selected={prepComida} onSelect={setPrepComida} />
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
