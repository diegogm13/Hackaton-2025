import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation';
import { useOnboarding } from '../../context/OnboardingContext';
import { Colors, Spacing } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'DatosEstadisticos'>;
};

const ETNIAS = ['Latina', 'Caucásica', 'Asiática', 'Afrodescendiente', 'Otra'];

export default function DatosEstadisticosScreen({ navigation }: Props) {
  const [altura, setAltura] = useState('');
  const [peso, setPeso] = useState('');
  const [musculo, setMusculo] = useState('');
  const [grasa, setGrasa] = useState('');
  const [etnia, setEtnia] = useState('');
  const [showEtnias, setShowEtnias] = useState(false);
  const { updateData } = useOnboarding();

  const handleNext = () => {
    updateData({ altura, peso, musculo, grasa, etnia });
    navigation.navigate('DatosEstiloVida');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.stepText}>Paso 2 de 4</Text>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: '50%' }]} />
        </View>

        <Text style={styles.title}>Datos Estadísticos</Text>
        <Text style={styles.subtitle}>Cuéntanos sobre tu físico actual</Text>

        <View style={styles.form}>
          {[
            { label: 'Altura (cm)', value: altura, set: setAltura, placeholder: 'Ej. 175', keyType: 'numeric' as const },
            { label: 'Peso (kg)', value: peso, set: setPeso, placeholder: 'Ej. 70', keyType: 'numeric' as const },
            { label: 'Índice de masa muscular (%)', value: musculo, set: setMusculo, placeholder: 'Ej. 35', keyType: 'numeric' as const },
            { label: 'Índice de grasa corporal (%)', value: grasa, set: setGrasa, placeholder: 'Ej. 18', keyType: 'numeric' as const },
          ].map((f) => (
            <View key={f.label}>
              <Text style={styles.fieldLabel}>{f.label}</Text>
              <TextInput
                style={styles.input}
                placeholder={f.placeholder}
                placeholderTextColor={Colors.placeholder}
                value={f.value}
                onChangeText={f.set}
                keyboardType={f.keyType}
              />
            </View>
          ))}

          <View>
            <Text style={styles.fieldLabel}>Etnia</Text>
            <TouchableOpacity style={styles.select} onPress={() => setShowEtnias(!showEtnias)}>
              <Text style={etnia ? styles.selectValue : styles.selectPlaceholder}>
                {etnia || 'Selecciona tu etnia  ▾'}
              </Text>
            </TouchableOpacity>
            {showEtnias && (
              <View style={styles.dropdown}>
                {ETNIAS.map((e) => (
                  <TouchableOpacity key={e} style={styles.dropdownItem}
                    onPress={() => { setEtnia(e); setShowEtnias(false); }}>
                    <Text style={styles.dropdownText}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
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
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 28 },
  form: { gap: 18 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.textLabel, marginBottom: 8 },
  input: {
    height: Spacing.fieldHeight,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.fieldRadius,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 20, color: Colors.white, fontSize: 15,
  },
  select: {
    height: Spacing.fieldHeight,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.fieldRadius,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 20, justifyContent: 'center',
  },
  selectValue: { color: Colors.white, fontSize: 15 },
  selectPlaceholder: { color: Colors.placeholder, fontSize: 15 },
  dropdown: {
    backgroundColor: Colors.surface,
    borderRadius: 12, borderWidth: 1,
    borderColor: Colors.border, marginTop: 4,
  },
  dropdownItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  dropdownText: { color: Colors.white, fontSize: 15 },
  btn: {
    height: Spacing.buttonHeight,
    backgroundColor: Colors.accent,
    borderRadius: Spacing.buttonRadius,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 32,
  },
  btnText: { fontSize: 16, fontWeight: '800', color: Colors.bg },
});
