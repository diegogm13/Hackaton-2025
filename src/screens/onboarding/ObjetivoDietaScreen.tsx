import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Alert,
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
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'ObjetivoDieta'>;
};

const OBJETIVOS = [
  {
    id: 0,
    titulo: 'Bajar de peso',
    descripcion: 'Reducir grasa corporal con un déficit calórico controlado.',
    icon: '🔥',
  },
  {
    id: 1,
    titulo: 'Subir de peso (Volumen)',
    descripcion: 'Ganar masa muscular con superávit calórico y proteína.',
    icon: '💪',
  },
  {
    id: 2,
    titulo: 'Mejorar mis hábitos alimenticios',
    descripcion: 'Comer más saludable sin obsesión por las calorías.',
    icon: '🥗',
  },
];

export default function ObjetivoDietaScreen({ navigation }: Props) {
  const [selected, setSelected] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const { data, updateData, resetData } = useOnboarding();
  const { setUser } = useUser();
  const rootNav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleFinish = async () => {
    setSaving(true);
    try {
      const result = await AuthService.register({
        nombre: data.nombre ?? '',
        email: data.email ?? '',
        password: data.password ?? '',
        plan: data.plan ?? 2,
        metaEjercicio: data.metaEjercicio ?? 0,
        lugarEntrenamiento: data.lugarEntrenamiento ?? 0,
        metaNutricional: data.metaNutricional ?? 0,
        controlCalorias: data.controlCalorias ?? 0,
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
        togglesSalud: data.togglesSalud ?? [false, false, false, false],
        condicionesMedicas: data.condicionesMedicas ?? [],
        medicamentos: data.medicamentos ?? [],
        objetivoDieta: selected,
      });

      if (!result.success) {
        setSaving(false);
        Alert.alert('Error', result.error ?? 'No se pudo crear la cuenta. Intenta de nuevo.');
        return;
      }

      setUser(result.user!);
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      resetData();
      rootNav.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'MainApp' }] })
      );
    } catch (e: any) {
      setSaving(false);
      Alert.alert('Error', e?.message ?? 'Ocurrió un error inesperado.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>

        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.stepText}>Paso 5 de 5</Text>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>

        <Text style={styles.title}>Objetivo de Dieta</Text>
        <Text style={styles.subtitle}>¿Cuál es tu meta principal con la alimentación?</Text>

        <View style={styles.cards}>
          {OBJETIVOS.map(obj => (
            <TouchableOpacity
              key={obj.id}
              style={[styles.card, selected === obj.id && styles.cardActive]}
              onPress={() => setSelected(obj.id)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>{obj.icon}</Text>
                <View style={[styles.radio, selected === obj.id && styles.radioActive]}>
                  {selected === obj.id && <View style={styles.radioDot} />}
                </View>
              </View>
              <Text style={[styles.cardTitle, selected === obj.id && styles.cardTitleActive]}>
                {obj.titulo}
              </Text>
              <Text style={styles.cardDesc}>{obj.descripcion}</Text>
            </TouchableOpacity>
          ))}
        </View>

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
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 32 },
  cards: { gap: 16, marginBottom: 32 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16, padding: 20,
    borderWidth: 2, borderColor: Colors.border,
  },
  cardActive: { borderColor: Colors.accent, backgroundColor: Colors.accentDark },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardIcon: { fontSize: 32 },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: Colors.accent },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: Colors.accent },
  cardTitle: { fontSize: 17, fontWeight: '800', color: Colors.white, marginBottom: 6 },
  cardTitleActive: { color: Colors.accent },
  cardDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  btn: {
    height: Spacing.buttonHeight,
    backgroundColor: Colors.accent,
    borderRadius: Spacing.buttonRadius,
    alignItems: 'center', justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontSize: 16, fontWeight: '800', color: Colors.bg },
});
