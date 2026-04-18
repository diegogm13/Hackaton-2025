import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation';
import { Colors, Spacing } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={styles.logoWrap}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>FIT</Text>
            </View>
          </View>

          <Text style={styles.appTitle}>FitAI</Text>
          <Text style={styles.appSubtitle}>Tu entrenador personal con IA</Text>

          {/* Campos */}
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor={Colors.placeholder}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor={Colors.placeholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.forgotWrap}>
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => navigation.navigate('DatosEstadisticos')}
            >
              <Text style={styles.primaryBtnText}>Iniciar Sesión</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.divLine} />
              <Text style={styles.divText}>o continúa con</Text>
              <View style={styles.divLine} />
            </View>

            <TouchableOpacity style={styles.googleBtn}>
              <Text style={styles.googleBtnText}>Continuar con Google</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
              <Text style={styles.registerLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: { flexGrow: 1, alignItems: 'center', paddingHorizontal: Spacing.screen, paddingBottom: 40 },
  logoWrap: { marginTop: 60, marginBottom: 16 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: 22, fontWeight: '800', color: Colors.bg },
  appTitle: { fontSize: 32, fontWeight: '800', color: Colors.white, marginBottom: 6 },
  appSubtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 40 },
  form: { width: '100%', gap: 14 },
  input: {
    width: '100%', height: Spacing.fieldHeight,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.fieldRadius,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 20,
    color: Colors.white, fontSize: 15,
  },
  forgotWrap: { alignSelf: 'flex-end', marginTop: -4 },
  forgotText: { color: Colors.accent, fontSize: 13 },
  primaryBtn: {
    width: '100%', height: Spacing.buttonHeight,
    backgroundColor: Colors.accent,
    borderRadius: Spacing.buttonRadius,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 6,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '800', color: Colors.bg },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  divLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  divText: { fontSize: 13, color: Colors.textSecondary },
  googleBtn: {
    width: '100%', height: Spacing.fieldHeight,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.fieldRadius,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  googleBtnText: { fontSize: 15, fontWeight: '600', color: Colors.white },
  registerRow: { flexDirection: 'row', marginTop: 32 },
  registerText: { color: Colors.textSecondary, fontSize: 14 },
  registerLink: { color: Colors.accent, fontSize: 14, fontWeight: '700' },
});
