import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView,
  KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing } from '../../theme';

type Mensaje = {
  id: string;
  from: 'user' | 'ia';
  text: string;
};

const SUGERENCIAS = [
  '¿Qué me toca comer hoy?',
  'Inicia mi rutina',
  'Muéstrame mi progreso',
  '¿Cuántas calorías llevo?',
];

const RESPUESTAS_IA: Record<string, string> = {
  '¿Qué me toca comer hoy?': 'Claro 🍽️ Tu dieta para hoy incluye:\n• Desayuno: Avena con frutas (380 kcal)\n• Almuerzo: Pechuga a la plancha + arroz integral (520 kcal)\n• Cena: Ensalada con atún (350 kcal)\nTotal: 1,250 kcal de tus 1,850 objetivo.',
  'Inicia mi rutina': 'Preparando tu rutina de hoy 💪\nHoy toca Pecho + Espalda:\n1. Press de banca 4x10\n2. Sentadilla 4x12\n3. Peso muerto 3x8\n4. Remo con barra 4x10\n¡A por ello! Duración estimada: 55 min.',
  'Muéstrame mi progreso': 'Tu progreso esta semana 📊\n• Grasa corporal: 22% (↓0.5%)\n• Masa muscular: 38% (↑0.8%)\n• Peso: 72 kg (↓0.4 kg)\nVas muy bien, sigue así.',
  '¿Cuántas calorías llevo?': 'Llevas 1,205 kcal de tus 1,850 objetivo 🔥\nTe quedan 645 kcal disponibles. Te recomiendo una cena ligera rica en proteínas.',
};

export default function ChatIAScreen() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    { id: '0', from: 'ia', text: 'Hola 👋 Soy tu asistente FitAI. Puedes hablarme por voz o texto. ¿En qué te ayudo hoy?' },
  ]);
  const [texto, setTexto] = useState('');
  const [escuchando, setEscuchando] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollRef = useRef<ScrollView>(null);

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

  const enviarMensaje = (msg: string) => {
    if (!msg.trim()) return;
    const userMsg: Mensaje = { id: Date.now().toString(), from: 'user', text: msg };
    const respuesta = RESPUESTAS_IA[msg] || 'Entendido 👍 Estoy procesando tu solicitud. Dame un momento para preparar tu respuesta personalizada.';
    const iaMsg: Mensaje = { id: (Date.now() + 1).toString(), from: 'ia', text: respuesta };

    setMensajes((prev) => [...prev, userMsg, iaMsg]);
    setTexto('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const toggleMic = () => {
    if (escuchando) {
      setEscuchando(false);
      detenerPulso();
    } else {
      setEscuchando(true);
      pulsar();
      // Simula escucha por 3 segundos
      setTimeout(() => {
        setEscuchando(false);
        detenerPulso();
        enviarMensaje('¿Qué me toca comer hoy?');
      }, 3000);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerDot} />
          <Text style={styles.headerTitle}>FitAI Assistant</Text>
          <Text style={styles.headerStatus}>En línea</Text>
        </View>

        {/* Orbe central (estilo Siri) */}
        {mensajes.length <= 1 && (
          <View style={styles.orbeWrap}>
            <Animated.View style={[styles.orbeOuter, { transform: [{ scale: pulseAnim }] }]}>
              <LinearGradient
                colors={escuchando
                  ? ['#00E776', '#00B8D9', '#7B61FF']
                  : ['#1E1E1E', '#2A2A2A', '#1A1A2E']}
                style={styles.orbeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <LinearGradient
                  colors={['#00E776', '#00B8D9', '#7B61FF', '#FF61AB']}
                  style={styles.orbeInner}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
              </LinearGradient>
            </Animated.View>
            <Text style={styles.orbeLabel}>
              {escuchando ? 'Escuchando...' : 'Toca el micrófono para hablar'}
            </Text>
          </View>
        )}

        {/* Chat */}
        <ScrollView
          ref={scrollRef}
          style={styles.chat}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {mensajes.map((m) => (
            <View key={m.id} style={[styles.bubble, m.from === 'user' ? styles.bubbleUser : styles.bubbleIA]}>
              {m.from === 'ia' && (
                <LinearGradient
                  colors={['#00E776', '#00B8D9']}
                  style={styles.iaAvatar}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.iaAvatarText}>IA</Text>
                </LinearGradient>
              )}
              <View style={[styles.bubbleContent, m.from === 'user' ? styles.bubbleContentUser : styles.bubbleContentIA]}>
                <Text style={styles.bubbleText}>{m.text}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Sugerencias rápidas */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sugerencias} contentContainerStyle={{ paddingHorizontal: Spacing.screen, gap: 8 }}>
          {SUGERENCIAS.map((s) => (
            <TouchableOpacity key={s} style={styles.sugerenciaChip} onPress={() => enviarMensaje(s)}>
              <Text style={styles.sugerenciaText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input + Mic */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Escribe o habla con tu IA..."
            placeholderTextColor={Colors.placeholder}
            value={texto}
            onChangeText={setTexto}
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={() => enviarMensaje(texto)}>
            <Ionicons name="send" size={18} color={Colors.bg} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.micBtn, escuchando && styles.micBtnActive]}
            onPress={toggleMic}
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
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.screen, paddingTop: 16, paddingBottom: 12, gap: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.accent },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.white, flex: 1 },
  headerStatus: { fontSize: 12, color: Colors.accent },

  orbeWrap: { alignItems: 'center', paddingVertical: 40 },
  orbeOuter: {
    width: 160, height: 160, borderRadius: 80,
    padding: 8,
    shadowColor: '#00E776', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 30, elevation: 20,
  },
  orbeGradient: { flex: 1, borderRadius: 76, padding: 6, alignItems: 'center', justifyContent: 'center' },
  orbeInner: { width: 100, height: 100, borderRadius: 50 },
  orbeLabel: { marginTop: 20, fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },

  chat: { flex: 1 },
  chatContent: { padding: Spacing.screen, gap: 12 },

  bubble: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  bubbleUser: { justifyContent: 'flex-end' },
  bubbleIA: { justifyContent: 'flex-start' },

  iaAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  iaAvatarText: { fontSize: 11, fontWeight: '800', color: Colors.bg },

  bubbleContent: { maxWidth: '78%', borderRadius: 18, padding: 14 },
  bubbleContentUser: { backgroundColor: Colors.accent, borderBottomRightRadius: 4 },
  bubbleContentIA: { backgroundColor: Colors.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors.border },
  bubbleText: { fontSize: 14, color: Colors.white, lineHeight: 20 },

  sugerencias: { maxHeight: 48, marginBottom: 8 },
  sugerenciaChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: Colors.surface,
    borderRadius: 20, borderWidth: 1, borderColor: Colors.border,
  },
  sugerenciaText: { fontSize: 13, color: Colors.textLabel, fontWeight: '600' },

  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: Spacing.screen, paddingBottom: 16 },
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
  micBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  micBtnActive: { backgroundColor: Colors.accent },
});
