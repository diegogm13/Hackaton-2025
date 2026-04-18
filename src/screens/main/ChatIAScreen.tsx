import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, Animated, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { useUser } from '../../context/UserContext';
import { GeminiService } from '../../services/GeminiService';
import { SpeechService } from '../../services/SpeechService';
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

const SALUDO_GENERICO = 'Hola 👋 Soy tu asistente FitAI. ¿En qué te ayudo hoy?';

export default function ChatIAScreen() {
  const { user } = useUser();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState('');
  const [cargando, setCargando] = useState(false);
  const [escuchando, setEscuchando] = useState(false);
  const [iaLista, setIaLista] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (user) {
      try {
        GeminiService.initChat(user);
        setIaLista(true);
        const saludo = `Hola ${user.nombre} 👋 Soy tu asistente FitAI. Estoy listo para escucharte. ¿En qué te ayudo hoy?`;
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
    setTexto(''); // Limpiar input

    const userMsg: Mensaje = { id: Date.now().toString(), from: 'user', text: msg };
    const typingId = `typing_${Date.now()}`;
    setMensajes(prev => [...prev, userMsg, { id: typingId, from: 'typing', text: '' }]);
    scrollAbajo();
    setCargando(true);

    try {
      let respuesta = '';
      if (iaLista && GeminiService.isReady()) {
        respuesta = await GeminiService.sendMessage(msg);
      } else {
        await new Promise(r => setTimeout(r, 1000));
        respuesta = 'Sin conexión con la IA.';
      }

      setMensajes(prev => [
        ...prev.filter(m => m.id !== typingId),
        { id: `ia_${Date.now()}`, from: 'ia', text: respuesta },
      ]);
    } catch (err) {
      setMensajes(prev => [
        ...prev.filter(m => m.id !== typingId),
        { id: `ia_${Date.now()}`, from: 'ia', text: 'Error al procesar.' },
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

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setEscuchando(true);
      pulsar();
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setEscuchando(false);
    detenerPulso();

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        setCargando(true);
        // 1. Transcribir (Speech-to-Text usando Gemini que es más flexible)
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
        const transcript = await GeminiService.transcribeAudio(base64);
        
        if (transcript && transcript.length > 0) {
          // 2. Aparecer en el input
          setTexto(transcript);
          // 3. Enviarse automáticamente
          enviarMensaje(transcript);
        } else {
          setCargando(false);
        }
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
      setCargando(false);
    }
  };

  const toggleMic = () => {
    if (escuchando) stopRecording();
    else startRecording();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.headerDot, iaLista && styles.headerDotActive]} />
          <Text style={styles.headerTitle}>FitAI Assistant</Text>
          <Text style={[styles.headerStatus, iaLista && styles.headerStatusActive]}>
            {iaLista ? 'Conectado' : 'Desconectado'}
          </Text>
        </View>

        {/* Orbe */}
        {mensajes.length <= 1 && (
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
              {escuchando ? 'Escuchando...' : 'Pulsa el micrófono para hablar'}
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
          {mensajes.map((m) => (
            <View key={m.id} style={[styles.bubble, m.from === 'user' ? styles.bubbleUser : styles.bubbleIA]}>
              {m.from === 'ia' && (
                <LinearGradient colors={['#00E776', '#00B8D9']} style={styles.iaAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={styles.iaAvatarText}>IA</Text>
                </LinearGradient>
              )}
              <View style={[styles.bubbleContent, m.from === 'user' ? styles.bubbleContentUser : styles.bubbleContentIA]}>
                {m.from === 'typing' ? (
                  <Text style={styles.bubbleText}>...</Text>
                ) : (
                  <Text style={[styles.bubbleText, m.from === 'user' && styles.bubbleTextUser]}>
                    {m.text}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={escuchando ? "Grabando..." : "Escribe o habla..."}
            placeholderTextColor={Colors.placeholder}
            value={texto}
            onChangeText={setTexto}
            multiline
            editable={!cargando && !escuchando}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!texto.trim() || cargando || escuchando) && styles.sendBtnDisabled]}
            onPress={() => enviarMensaje(texto)}
            disabled={!texto.trim() || cargando || escuchando}
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
  orbeOuter: { width: 160, height: 160, borderRadius: 80, padding: 8 },
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

  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: Spacing.screen, paddingBottom: 16 },
  input: { flex: 1, minHeight: 46, maxHeight: 120, backgroundColor: Colors.surface, borderRadius: 23, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 18, paddingVertical: 12, color: Colors.white },
  sendBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  micBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  micBtnActive: { backgroundColor: Colors.accent },
});
