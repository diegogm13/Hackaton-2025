import React from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../../theme';
import Monito from '../../components/Monito';

const METRICAS = [
  { label: 'Peso', value: '72 kg', icon: '⚖️', delta: '-2.4 kg' },
  { label: 'Grasa', value: '22%', icon: '🔥', delta: '-3%' },
  { label: 'Músculo', value: '38%', icon: '💪', delta: '+4%' },
  { label: 'Agua', value: '1.8 L', icon: '💧', delta: '+0.3 L' },
];

const AJUSTES = [
  { label: 'Mi plan actual', icon: 'fitness-outline' },
  { label: 'Notificaciones', icon: 'notifications-outline' },
  { label: 'Conectar smartwatch', icon: 'watch-outline' },
  { label: 'Exportar PDF', icon: 'document-outline' },
  { label: 'Foro de dietas', icon: 'people-outline' },
  { label: 'Privacidad', icon: 'shield-outline' },
];

export default function PerfilScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header perfil */}
        <View style={styles.header}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>DG</Text>
          </View>
          <View>
            <Text style={styles.userName}>Diego García</Text>
            <Text style={styles.userEmail}>diego@fitai.com</Text>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="pencil-outline" size={18} color={Colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Plan activo */}
        <View style={styles.planCard}>
          <Text style={styles.planLabel}>Plan activo</Text>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>⚡ Plan Completo</Text>
          </View>
          <Text style={styles.planSub}>Semana 3 de 14 · 78% completado esta semana</Text>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: '78%' }]} />
          </View>
        </View>

        {/* Métricas */}
        <Text style={styles.sectionTitle}>Mis métricas</Text>
        <View style={styles.metricasGrid}>
          {METRICAS.map((m) => (
            <View key={m.label} style={styles.metricaCard}>
              <Text style={styles.metricaIcon}>{m.icon}</Text>
              <Text style={styles.metricaValue}>{m.value}</Text>
              <Text style={styles.metricaLabel}>{m.label}</Text>
              <Text style={[
                styles.metricaDelta,
                { color: m.delta.startsWith('+') ? Colors.accent : '#FF6B6B' },
              ]}>
                {m.delta}
              </Text>
            </View>
          ))}
        </View>

        {/* Mini monito */}
        <View style={styles.monitoPreview}>
          <Text style={styles.sectionTitle}>Mi cuerpo</Text>
          <View style={styles.monitoRow}>
            <Monito size={90} grasa={22} musculo={38} color={Colors.accent} />
            <View style={styles.monitoMeta}>
              <Text style={styles.monitoMetaTitle}>Progreso físico</Text>
              <Text style={styles.monitoMetaText}>Has reducido 3% de grasa y ganado 4% de músculo desde que empezaste.</Text>
              <TouchableOpacity>
                <Text style={styles.monitoMetaLink}>Ver comparativa completa →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Ajustes */}
        <Text style={styles.sectionTitle}>Configuración</Text>
        <View style={styles.ajustesCard}>
          {AJUSTES.map((a, i) => (
            <TouchableOpacity
              key={a.label}
              style={[styles.ajusteRow, i < AJUSTES.length - 1 && styles.ajusteRowBorder]}
            >
              <Ionicons name={a.icon as any} size={20} color={Colors.textLabel} style={{ marginRight: 14 }} />
              <Text style={styles.ajusteLabel}>{a.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.placeholder} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Cerrar sesión */}
        <TouchableOpacity style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: { paddingHorizontal: Spacing.screen, paddingBottom: 40 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingTop: 20, marginBottom: 24 },
  avatarWrap: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '800', color: Colors.bg },
  userName: { fontSize: 20, fontWeight: '800', color: Colors.white },
  userEmail: { fontSize: 13, color: Colors.textSecondary },
  editBtn: {
    marginLeft: 'auto',
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.accentDark,
    alignItems: 'center', justifyContent: 'center',
  },

  planCard: {
    backgroundColor: Colors.surface, borderRadius: Spacing.cardRadius,
    borderWidth: 1, borderColor: Colors.border,
    padding: 18, marginBottom: 24,
  },
  planLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600', marginBottom: 8 },
  planBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accentDark,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 12,
  },
  planBadgeText: { fontSize: 14, fontWeight: '700', color: Colors.accent },
  planSub: { fontSize: 13, color: Colors.textSecondary, marginBottom: 12 },
  progressBg: { height: 6, backgroundColor: '#262626', borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: Colors.accent, borderRadius: 3 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.white, marginBottom: 14 },

  metricasGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  metricaCard: {
    width: '47%', backgroundColor: Colors.surface,
    borderRadius: 14, borderWidth: 1, borderColor: Colors.border,
    padding: 16, alignItems: 'flex-start',
  },
  metricaIcon: { fontSize: 22, marginBottom: 8 },
  metricaValue: { fontSize: 22, fontWeight: '800', color: Colors.white },
  metricaLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  metricaDelta: { fontSize: 12, fontWeight: '700', marginTop: 6 },

  monitoPreview: { marginBottom: 24 },
  monitoRow: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  monitoMeta: { flex: 1 },
  monitoMetaTitle: { fontSize: 14, fontWeight: '700', color: Colors.white, marginBottom: 6 },
  monitoMetaText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19, marginBottom: 10 },
  monitoMetaLink: { fontSize: 13, color: Colors.accent, fontWeight: '700' },

  ajustesCard: { backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, marginBottom: 16 },
  ajusteRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  ajusteRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  ajusteLabel: { flex: 1, fontSize: 14, color: Colors.white },

  logoutBtn: { alignItems: 'center', padding: 16 },
  logoutText: { fontSize: 14, color: '#FF6B6B', fontWeight: '700' },
});
