import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingStackParamList, RootStackParamList } from '../../navigation';
import { useOnboarding } from '../../context/OnboardingContext';
import { AuthService } from '../../services/AuthService';
import { useUser } from '../../context/UserContext';
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

export default function DatosSaludScreen({ navigation }: Props) {
  const [toggles, setToggles] = useState<boolean[]>([false, false, false, false]);
  const [condiciones, setCondiciones] = useState('');
  const [saving, setSaving] = useState(false);
  const { data, updateData, resetData } = useOnboarding();
  const { setUser } = useUser();
  const rootNav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const toggle = (i: number) => {
    const next = [...toggles];
    next[i] = !next[i];
    setToggles(next);
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const result = await AuthService.register({
        nombre: data.nombre ?? '',
        email: data.email ?? '',
        password: data.password ?? '',
        plan: data.plan ?? 2,
        altura: data.altura ?? '',
        peso: data.peso ?? '',
        musculo: data.musculo ?? '',
        grasa: data.grasa ?? '',
        etnia: data.etnia ?? '',
        rutina: data.rutina ?? 1,
        disponibilidad: data.disponibilidad ?? 1,
        dieta: data.dieta ?? 0,
        habitos: data.habitos ?? [false, false, false],
        alergias: data.alergias ?? '',
        togglesSalud: toggles,
        condicionesSalud: condiciones,
      });

      if (!result.success) {
        setSaving(false);
        return;
      }

      setUser(result.user!);
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      resetData();

      rootNav.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'MainApp' }] })
      );
    } catch {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.stepText}>Paso 4 de 4</Text>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: '100%' }]} />
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

        <Text style={styles.fieldLabel}>Detalla tus condiciones (opcional)</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Ej. diabetes tipo 2, hipertensión..."
          placeholderTextColor={Colors.placeholder}
          value={condiciones}
          onChangeText={setCondiciones}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={[styles.btn, saving && styles.btnDisabled]}
          onPress={handleFinish}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color={Colors.bg} />
            : <Text style={styles.btnText}>Comenzar mi plan ✓</Text>
          }
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
  toggleDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: Colors.white },
  toggleDotActive: { alignSelf: 'flex-end' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.textLabel, marginBottom: 8 },
  textArea: {
    backgroundColor: Colors.surface,
    borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    padding: 16, color: Colors.white, fontSize: 14,
    height: 100, textAlignVertical: 'top', marginBottom: 24,
  },
  btn: {
    height: Spacing.buttonHeight,
    backgroundColor: Colors.accent,
    borderRadius: Spacing.buttonRadius,
    alignItems: 'center', justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontSize: 16, fontWeight: '800', color: Colors.bg },
});
