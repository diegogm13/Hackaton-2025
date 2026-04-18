import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { AuthStackParamList, RootStackParamList } from '../../navigation';
import { Colors, Spacing } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Registro'>;
};

export default function RegistroScreen({ navigation }: Props) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const rootNav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleRegistro = () => {
    rootNav.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'Onboarding' }] })
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Empieza tu transformación hoy</Text>

          <View style={styles.form}>
            <TextInput style={styles.input} placeholder="Nombre completo"
              placeholderTextColor={Colors.placeholder} value={nombre} onChangeText={setNombre} />
            <TextInput style={styles.input} placeholder="Correo electrónico"
              placeholderTextColor={Colors.placeholder} value={email} onChangeText={setEmail}
              keyboardType="email-address" autoCapitalize="none" />
            <View style={styles.passwordWrap}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Contraseña"
                placeholderTextColor={Colors.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(v => !v)}>
                <Ionicons
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color={showPassword ? Colors.accent : Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.passwordWrap}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirmar contraseña"
                placeholderTextColor={Colors.placeholder}
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry={!showConfirm}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirm(v => !v)}>
                <Ionicons
                  name={showConfirm ? 'eye' : 'eye-off'}
                  size={20}
                  color={showConfirm ? Colors.accent : Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.termsRow} onPress={() => setAceptaTerminos(!aceptaTerminos)}>
              <View style={[styles.checkbox, aceptaTerminos && styles.checkboxActive]}>
                {aceptaTerminos && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>Acepto los </Text>
              <Text style={styles.termsLink}>Términos y Condiciones</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleRegistro}>
              <Text style={styles.primaryBtnText}>Crear Cuenta</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: { flexGrow: 1, paddingHorizontal: Spacing.screen, paddingBottom: 40 },
  back: { marginTop: 20, marginBottom: 16 },
  backArrow: { fontSize: 24, color: Colors.white },
  title: { fontSize: 28, fontWeight: '800', color: Colors.white, marginBottom: 6 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 32 },
  form: { gap: 14 },
  input: {
    height: Spacing.fieldHeight,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.fieldRadius,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 20, color: Colors.white, fontSize: 15,
  },
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Spacing.fieldRadius,
    borderWidth: 1, borderColor: Colors.border,
    height: Spacing.fieldHeight,
    paddingHorizontal: 20,
  },
  passwordInput: { flex: 1, color: Colors.white, fontSize: 15 },
  eyeBtn: { padding: 4 },
  termsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  checkbox: {
    width: 20, height: 20, borderRadius: 4,
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  checkboxActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  checkMark: { fontSize: 12, fontWeight: '800', color: Colors.bg },
  termsText: { fontSize: 13, color: Colors.textSecondary },
  termsLink: { fontSize: 13, fontWeight: '700', color: Colors.accent },
  primaryBtn: {
    height: Spacing.buttonHeight,
    backgroundColor: Colors.accent,
    borderRadius: Spacing.buttonRadius,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 6,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '800', color: Colors.bg },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  loginText: { color: Colors.textSecondary, fontSize: 14 },
  loginLink: { color: Colors.accent, fontSize: 14, fontWeight: '700' },
});
