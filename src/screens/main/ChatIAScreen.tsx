import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView,
  KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../../context/UserContext';
import { GeminiService } from '../../services/GeminiService';
import { Colors, Spacing } from '../../theme';

type Mensaje = {
  id: string;
  from: 'user' | 'ia' | 'typing';
  text: string;
};

const SUGERENCIAS = [
  '¿Qué como hoy según mi dieta?',
  'Dame una rutina para hoy',
  '¿Cómo voy en mis metas?',
  '¿Cuántas proteínas necesito?',
];

const SALUDO_GENERICO = 'Hola 👋 Soy tu asistente FitAI. Puedes preguntarme sobre tu entrenamiento, nutrición y salud. ¿En qué te ayudo hoy?';

export default function ChatIAScreen() {
  const { user } = useUser();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState('');
  const [cargando, setCargando] = useState(false);
  const [escuchando, setEscuchando] = useState(false);
  const [iaLista, setIaLista] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (user) {
      try {
        GeminiService.initChat(user);
        setIaLista(true);
        const saludo = `Hola ${user.nombre} 👋 Soy tu asistente FitAI. Conozco tu perfil completo: tu objetivo de ${['ejercicio', 'nutrición', 'plan completo'][user.plan ?? 2]}, tu peso de ${user.peso || '?'} kg y tus condiciones de salud. ¿En qué te ayudo hoy?`;
        setMensajes([{ id: '0', from: 'ia', text: saludo }]);
      } catch {
        setMensajes([{ id: '0', from: 'ia', text: SALUDO_GENERICO }]);
      }
    } else {
      setMensajes([{ id: '0', from: 'ia', text: SALUDO_GENERICO }]);
    }
  }, [user?.id]);

  const scrollAbajo = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  };

  const enviarMensaje = async (msg: string) => {
    if (!msg.trim() || cargando) return;
    setTexto('');

    const userMsg: Mensaje = { id: Date.now().toString(), from: 'user', text: msg };
    const typingId = `typing_${Date.now()}`;
    setMensajes(prev => [...prev, userMsg, { id: typingId, from: 'typing', text: '' }]);
    scrollAbajo();
    setCargando(true);

    try {
      let respuesta: string;
      if (iaLista && GeminiService.isReady()) {
        respuesta = await GeminiService.sendMessage(msg);
      } else {
        await new Promise(r => setTimeout(r, 1000));
        respuesta = 'No tengo conexión con la IA en este momento. Asegúrate de configurar tu API key en src/config/gemini.ts.';
      }

      setMensajes(prev => [
        ...prev.filter(m => m.id !== typingId),
        { id: `ia_${Date.now()}`, from: 'ia', text: respuesta },
      ]);
    } catch {
      setMensajes(prev => [
        ...prev.filter(m => m.id !== typingId),
        { id: `ia_${Date.now()}`, from: 'ia', text: 'Ocurrió un error al conectar con la IA. Revisa tu API key e intenta de nuevo.' },
      ]);
    } finally {
      setCargando(false);
      scrollAbajo();
    }
  };

  const pulsar = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  };

  const detenerPulso = () => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  };

  const toggleMic = () => {
    if (escuchando) {
      setEscuchando(false);
      detenerPulso();
    } else {
      setEscuchando(true);
      pulsar();
      setTimeout(() => {
        setEscuchando(false);
        detenerPulso();
        enviarMensaje('¿Qué como hoy según mi dieta?');
      }, 3000);
    }
  };

  const mostrarOrbe = mensajes.length <= 1;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.headerDot, iaLista && styles.headerDotActive]} />
          <Text style={styles.headerTitle}>FitAI Assistant</Text>
          <Text style={[styles.headerStatus, iaLista && styles.headerStatusActive]}>
            {iaLista ? 'Personalizado' : 'Sin conexión'}
          </Text>
        </View>

        {/* Orbe (solo cuando no hay chat) */}
        {mostrarOrbe && (
          <View style={styles.orbeWrap}>
            <Animated.View style={[styles.orbeOuter, { transform: [{ scale: pulseAnim }] }]}>
              <LinearGradient
                colors={escuchando
                  ? ['#00E776', '#00B8D9', '#7B61FF']
                  : ['#1E1E1E', '#2A2A2A', '#1A1A2E']}
                style={styles.orbeGradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              >
                <LinearGradient
                  colors={['#00E776', '#00B8D9', '#7B61FF', '#FF61AB']}
                  style={styles.orbeInner}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                />
              </LinearGradient>
            </Animated.View>
            <Text style={styles.orbeLabel}>
              {escuchando ? 'Escuchando...' : 'Tu IA conoce tu perfil completo'}
            </Text>
          </View>
        )}

        {/* Mensajes */}
        <ScrollView
          ref={scrollRef}
          style={styles.chat}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {mensajes.map((m) => {
            if (m.from === 'typing') return (
              <View key={m.id} style={[styles.bubble, styles.bubbleIA]}>
                <LinearGradient colors={['#00E776', '#00B8D9']} style={styles.iaAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={styles.iaAvatarText}>IA</Text>
                </LinearGradient>
                <View style={[styles.bubbleContent, styles.bubbleContentIA]}>
                  <TypingDots />
                </View>
              </View>
            );

            return (
              <View key={m.id} style={[styles.bubble, m.from === 'user' ? styles.bubbleUser : styles.bubbleIA]}>
                {m.from === 'ia' && (
                  <LinearGradient colors={['#00E776', '#00B8D9']} style={styles.iaAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Text style={styles.iaAvatarText}>IA</Text>
                  </LinearGradient>
                )}
                <View style={[styles.bubbleContent, m.from === 'user' ? styles.bubbleContentUser : styles.bubbleContentIA]}>
                  <Text style={[styles.bubbleText, m.from === 'user' && styles.bubbleTextUser]}>
                    {m.text}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Sugerencias rápidas */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sugerencias}
          contentContainerStyle={{ paddingHorizontal: Spacing.screen, gap: 8 }}
        >
          {SUGERENCIAS.map((s) => (
            <TouchableOpacity key={s} style={styles.sugerenciaChip} onPress={() => enviarMensaje(s)} disabled={cargando}>
              <Text style={styles.sugerenciaText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input + Mic */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Pregúntale a tu IA personalizada..."
            placeholderTextColor={Colors.placeholder}
            value={texto}
            onChangeText={setTexto}
            multiline
            editable={!cargando}
            onSubmitEditing={() => enviarMensaje(texto)}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!texto.trim() || cargando) && styles.sendBtnDisabled]}
            onPress={() => enviarMensaje(texto)}
            disabled={!texto.trim() || cargando}
          >
            <Ionicons name="send" size={18} color={Colors.bg} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.micBtn, escuchando && styles.micBtnActive]}
            onPress={toggleMic}
            disabled={cargando}
          >
            <Ionicons name={escuchando ? 'mic' : 'mic-outline'} size={22} color={escuchando ? Colors.bg : Colors.accent} />
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function TypingDots() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -5, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      );
    Animated.parallel([anim(dot1, 0), anim(dot2, 150), anim(dot3, 300)]).start();
  }, []);

  return (
    <View style={styles.typingWrap}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View key={i} style={[styles.typingDot, { transform: [{ translateY: dot }] }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.screen, paddingTop: 16, paddingBottom: 12,
    gap: 10, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.placeholder },
  headerDotActive: { backgroundColor: Colors.accent },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.white, flex: 1 },
  headerStatus: { fontSize: 12, color: Colors.placeholder },
  headerStatusActive: { color: Colors.accent },

  orbeWrap: { alignItems: 'center', paddingVertical: 40 },
  orbeOuter: {
    width: 160, height: 160, borderRadius: 80, padding: 8,
    shadowColor: '#00E776', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 30, elevation: 20,
  },
  orbeGradient: { flex: 1, borderRadius: 76, padding: 6, alignItems: 'center', justifyContent: 'center' },
  orbeInner: { width: 100, height: 100, borderRadius: 50 },
  orbeLabel: { marginTop: 20, fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },

  chat: { flex: 1 },
  chatContent: { padding: Spacing.screen, gap: 12, paddingBottom: 20 },

  bubble: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  bubbleUser: { justifyContent: 'flex-end' },
  bubbleIA: { justifyContent: 'flex-start' },

  iaAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  iaAvatarText: { fontSize: 11, fontWeight: '800', color: Colors.bg },

  bubbleContent: { maxWidth: '78%', borderRadius: 18, padding: 14 },
  bubbleContentUser: { backgroundColor: Colors.accent, borderBottomRightRadius: 4 },
  bubbleContentIA: { backgroundColor: Colors.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors.border },
  bubbleText: { fontSize: 14, color: Colors.white, lineHeight: 21 },
  bubbleTextUser: { color: Colors.bg, fontWeight: '600' },

  typingWrap: { flexDirection: 'row', gap: 5, alignItems: 'center', height: 20 },
  typingDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.accent },

  sugerencias: { maxHeight: 48, marginBottom: 8 },
  sugerenciaChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: Colors.surface,
    borderRadius: 20, borderWidth: 1, borderColor: Colors.border,
  },
  sugerenciaText: { fontSize: 13, color: Colors.textLabel, fontWeight: '600' },

  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    gap: 8, paddingHorizontal: Spacing.screen, paddingBottom: 16,
  },
  input: {
    flex: 1, minHeight: 46, maxHeight: 120,
    backgroundColor: Colors.surface,
    borderRadius: 23, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 18, paddingVertical: 12,
    color: Colors.white, fontSize: 15,
  },
  sendBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  micBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  micBtnActive: { backgroundColor: Colors.accent },
});
