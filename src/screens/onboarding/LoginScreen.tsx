import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { AuthStackParamList, RootStackParamList } from '../../navigation';
import { AuthService } from '../../services/AuthService';
import { useUser } from '../../context/UserContext';
import { Colors, Spacing } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const rootNav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setUser } = useUser();

  const handleLogin = async () => {
    if (loading) return;

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) { setError('Completa todos los campos'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) { setError('Ingresa un correo electrónico válido'); return; }

    setError('');
    setLoading(true);

    try {
      const result = await AuthService.login(normalizedEmail, password);
      if (!result.success || !result.user) {
        setError(result.error ?? 'Error al iniciar sesión');
        return;
      }

      setUser(result.user);
      rootNav.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'MainApp' }] })
      );
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

          <View style={styles.logoWrap}>
            <Image source={require('../../../assets/icon.png')} style={styles.logoImg} resizeMode="contain" />
          </View>

          <Text style={styles.appTitle}>Holos</Text>
          <Text style={styles.appSubtitle}>Tu entrenador personal con IA</Text>

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
            <View style={styles.passwordWrap}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Contraseña"
                placeholderTextColor={Colors.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(v => !v)}
              >
                <Ionicons
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color={showPassword ? Colors.accent : Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotWrap}>
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.primaryBtnText}>
                {loading ? 'Verificando...' : 'Iniciar Sesión'}
              </Text>
            </TouchableOpacity>

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
  logoWrap: { marginTop: 60, marginBottom: 16, alignItems: 'center' },
  logoImg: { width: 110, height: 110, borderRadius: 24 },
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
  errorText: { fontSize: 13, color: '#FF6B6B', textAlign: 'center', marginTop: -4 },
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
