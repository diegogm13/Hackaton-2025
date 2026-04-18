import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView, Modal,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';
import { AuthService } from '../../services/AuthService';
import { useUser } from '../../context/UserContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { Colors, Spacing } from '../../theme';
import Monito from '../../components/Monito';

const PLAN_LABELS = ['Plan de Ejercicio', 'Plan Nutricional', 'Plan Completo'];
const PLAN_ICONS = ['🏋️', '🥗', '⚡'];

const AJUSTES = [
  { label: 'Mi plan actual', icon: 'fitness-outline' },
  { label: 'Notificaciones', icon: 'notifications-outline' },
  { label: 'Conectar smartwatch', icon: 'watch-outline' },
  { label: 'Exportar PDF', icon: 'document-outline' },
  { label: 'Foro de dietas', icon: 'people-outline' },
  { label: 'Privacidad', icon: 'shield-outline' },
];

export default function PerfilScreen() {
  const rootNav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, setUser, updateUser } = useUser();
  const { resetData } = useOnboarding();

  const [modalVisible, setModalVisible] = useState(false);
  const [editNombre, setEditNombre] = useState('');
  const [editPeso, setEditPeso] = useState('');
  const [editAltura, setEditAltura] = useState('');
  const [editPlan, setEditPlan] = useState(0);
  const [saving, setSaving] = useState(false);

  const handleOpenEdit = () => {
    setEditNombre(user?.nombre ?? '');
    setEditPeso(user?.peso ?? '');
    setEditAltura(user?.altura ?? '');
    setEditPlan(user?.plan ?? 2);
    setModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!user) return;
    setSaving(true);
    const result = await AuthService.updateProfile(user.id, {
      nombre: editNombre,
      peso: editPeso,
      altura: editAltura,
      plan: editPlan,
    });
    setSaving(false);
    if (result.success && result.user) {
      updateUser(result.user);
    }
    setModalVisible(false);
  };

  const handleLogout = async () => {
    await AuthService.logout();
    resetData();
    setUser(null);
    rootNav.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'Auth' }] })
    );
  };

  const initials = user?.nombre
    ? user.nombre.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'FIT';
  const planLabel = PLAN_LABELS[user?.plan ?? 2];
  const planIcon = PLAN_ICONS[user?.plan ?? 2];

  const METRICAS = [
    { label: 'Peso', value: user?.peso ? `${user.peso} kg` : '-- kg', icon: '⚖️' },
    { label: 'Grasa', value: user?.grasa ? `${user.grasa}%` : '--%', icon: '🔥' },
    { label: 'Músculo', value: user?.musculo ? `${user.musculo}%` : '--%', icon: '💪' },
    { label: 'Altura', value: user?.altura ? `${user.altura} cm` : '-- cm', icon: '📏' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header perfil */}
        <View style={styles.header}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.userName}>{user?.nombre ?? 'Usuario'}</Text>
            <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={handleOpenEdit}>
            <Ionicons name="pencil-outline" size={18} color={Colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Plan activo */}
        <View style={styles.planCard}>
          <Text style={styles.planLabel}>Plan activo</Text>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>{planIcon} {planLabel}</Text>
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
            </View>
          ))}
        </View>

        {/* Mini monito */}
        <View style={styles.monitoPreview}>
          <Text style={styles.sectionTitle}>Mi cuerpo</Text>
          <View style={styles.monitoRow}>
            <Monito
              size={90}
              grasa={parseFloat(user?.grasa ?? '22')}
              musculo={parseFloat(user?.musculo ?? '38')}
              color={Colors.accent}
            />
            <View style={styles.monitoMeta}>
              <Text style={styles.monitoMetaTitle}>Progreso físico</Text>
              <Text style={styles.monitoMetaText}>
                Tus métricas físicas actualizadas según tu perfil de entrenamiento.
              </Text>
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
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Modal de Edición */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar perfil</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <Text style={styles.fieldLabel}>Nombre completo</Text>
              <TextInput
                style={styles.modalInput}
                value={editNombre}
                onChangeText={setEditNombre}
                placeholderTextColor={Colors.placeholder}
                placeholder="Tu nombre"
              />

              <Text style={styles.fieldLabel}>Peso (kg)</Text>
              <TextInput
                style={styles.modalInput}
                value={editPeso}
                onChangeText={setEditPeso}
                placeholderTextColor={Colors.placeholder}
                placeholder="Ej. 72"
                keyboardType="numeric"
              />

              <Text style={styles.fieldLabel}>Altura (cm)</Text>
              <TextInput
                style={styles.modalInput}
                value={editAltura}
                onChangeText={setEditAltura}
                placeholderTextColor={Colors.placeholder}
                placeholder="Ej. 175"
                keyboardType="numeric"
              />

              <Text style={styles.fieldLabel}>Objetivo</Text>
              <View style={styles.planChips}>
                {PLAN_LABELS.map((label, i) => (
                  <TouchableOpacity
                    key={label}
                    style={[styles.planChip, editPlan === i && styles.planChipActive]}
                    onPress={() => setEditPlan(i)}
                  >
                    <Text style={[styles.planChipText, editPlan === i && styles.planChipTextActive]}>
                      {PLAN_ICONS[i]} {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleSaveEdit}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color={Colors.bg} />
                : <Text style={styles.saveBtnText}>Guardar cambios</Text>
              }
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  headerInfo: { flex: 1 },
  userName: { fontSize: 20, fontWeight: '800', color: Colors.white },
  userEmail: { fontSize: 13, color: Colors.textSecondary },
  editBtn: {
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

  monitoPreview: { marginBottom: 24 },
  monitoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1,
    borderColor: Colors.border, padding: 16,
  },
  monitoMeta: { flex: 1 },
  monitoMetaTitle: { fontSize: 14, fontWeight: '700', color: Colors.white, marginBottom: 6 },
  monitoMetaText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19, marginBottom: 10 },
  monitoMetaLink: { fontSize: 13, color: Colors.accent, fontWeight: '700' },

  ajustesCard: {
    backgroundColor: Colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 16,
  },
  ajusteRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  ajusteRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  ajusteLabel: { flex: 1, fontSize: 14, color: Colors.white },

  logoutBtn: { alignItems: 'center', padding: 16 },
  logoutText: { fontSize: 14, color: '#FF6B6B', fontWeight: '700' },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.screen, paddingBottom: 36,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center', marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 24,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.white },
  modalForm: { gap: 14, marginBottom: 24 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.textLabel, marginBottom: 6 },
  modalInput: {
    height: Spacing.fieldHeight,
    backgroundColor: Colors.bg,
    borderRadius: Spacing.fieldRadius,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 16, color: Colors.white, fontSize: 15,
  },
  planChips: { gap: 8 },
  planChip: {
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 12, backgroundColor: Colors.bg,
    borderWidth: 1, borderColor: Colors.border,
  },
  planChipActive: { backgroundColor: Colors.accentDark, borderColor: Colors.accent },
  planChipText: { fontSize: 14, fontWeight: '600', color: Colors.textLabel },
  planChipTextActive: { color: Colors.accent },
  saveBtn: {
    height: Spacing.buttonHeight,
    backgroundColor: Colors.accent,
    borderRadius: Spacing.buttonRadius,
    alignItems: 'center', justifyContent: 'center',
  },
  saveBtnText: { fontSize: 16, fontWeight: '800', color: Colors.bg },
});
