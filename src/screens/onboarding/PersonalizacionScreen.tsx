import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { OnboardingStackParamList } from '../../navigation';
import { Colors, Spacing } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Personalizacion'>;
};

const OPCIONES = [
  {
    icon: '🏋️',
    titulo: 'Plan de Ejercicio',
    desc: 'Rutinas personalizadas\nsegún tu físico y metas',
  },
  {
    icon: '🥗',
    titulo: 'Plan Nutricional',
    desc: 'Macros, calorías y dietas\nadaptadas a tu cuerpo',
  },
  {
    icon: '⚡',
    titulo: 'Plan Completo',
    desc: 'Ejercicio + Nutrición\nLa transformación total',
  },
];

export default function PersonalizacionScreen({ navigation }: Props) {
  const [selected, setSelected] = useState(2);
  const rootNav = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>

        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>¿Cuál es tu objetivo?</Text>
        <Text style={styles.subtitle}>Personaliza tu experiencia FitAI</Text>

        <View style={styles.cards}>
          {OPCIONES.map((op, i) => (
            <TouchableOpacity
              key={op.titulo}
              style={[styles.card, i === selected && styles.cardSelected]}
              onPress={() => setSelected(i)}
              activeOpacity={0.8}
            >
              <Text style={styles.cardIcon}>{op.icon}</Text>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, i === selected && styles.cardTitleSelected]}>
                  {op.titulo}
                </Text>
                <Text style={styles.cardDesc}>{op.desc}</Text>
              </View>
              {i === selected && (
                <View style={styles.checkCircle}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => rootNav.reset({ index: 0, routes: [{ name: 'MainApp' }] })}
        >
          <Text style={styles.btnText}>Comenzar mi plan</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: { flexGrow: 1, paddingHorizontal: Spacing.screen, paddingBottom: 40 },
  back: { marginTop: 20, marginBottom: 16 },
  backArrow: { fontSize: 24, color: Colors.white },
  title: { fontSize: 28, fontWeight: '800', color: Colors.white, marginBottom: 8 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, marginBottom: 32 },
  cards: { gap: 16, flex: 1 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Spacing.cardRadius,
    borderWidth: 1, borderColor: Colors.border,
    padding: 20, gap: 14,
  },
  cardSelected: {
    backgroundColor: Colors.accentDark,
    borderColor: Colors.accent,
    borderWidth: 2,
  },
  cardIcon: { fontSize: 38 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: Colors.white, marginBottom: 4 },
  cardTitleSelected: { color: Colors.accent },
  cardDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  checkCircle: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  checkMark: { fontSize: 13, fontWeight: '800', color: Colors.bg },
  btn: {
    height: Spacing.buttonHeight,
    backgroundColor: Colors.accent,
    borderRadius: Spacing.buttonRadius,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 32,
  },
  btnText: { fontSize: 16, fontWeight: '800', color: Colors.bg },
});
