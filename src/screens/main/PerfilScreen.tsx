import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Modal,
  ActivityIndicator, KeyboardAvoidingView, Platform, Linking, Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';
import { AuthService } from '../../services/AuthService';
import { userProfileApi } from '../../services/userProfileApi';
import { useUser } from '../../context/UserContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { Colors, Spacing } from '../../theme';
import Monito from '../../components/Monito';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const PLAN_LABELS = ['Plan de Ejercicio', 'Plan Nutricional', 'Plan Completo'];
const PLAN_ICONS = ['🏋️', '🥗', '⚡'];
const META_EJERCICIO = ['Tonificación muscular', 'Fuerza y potencia', 'Resistencia cardio', 'Flexibilidad'];
const LUGAR = ['Gimnasio', 'En casa', 'Al aire libre', 'Mixto'];
const META_NUTRICION = ['Déficit calórico', 'Superávit calórico', 'Mantenimiento', 'Mejorar digestión'];
const CONTROL_CAL = ['Sí, activamente', 'A veces', 'Quiero empezar', 'Sin contar calorías'];
const OBJETIVO_DIETA = ['Bajar de peso', 'Subir de peso (Volumen)', 'Mejorar hábitos alimenticios'];
const DIET_PLAN_STORAGE_KEY = '@plan_dieta_generado';

const buildUserScopedKey = (baseKey: string, userId: string) => `${baseKey}:${userId}`;

type ModalType = 'plan' | 'notificaciones' | 'privacidad' | null;

export default function PerfilScreen() {
  const rootNav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const navigation = useNavigation();
  const { user, setUser, updateUser } = useUser();
  const { resetData } = useOnboarding();

  const [editModal, setEditModal] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editPeso, setEditPeso] = useState('');
  const [editAltura, setEditAltura] = useState('');
  const [editPlan, setEditPlan] = useState(0);
  const [saving, setSaving] = useState(false);
  const [notifEntrenamiento, setNotifEntrenamiento] = useState(true);
  const [notifNutricion, setNotifNutricion] = useState(true);
  const [notifProgreso, setNotifProgreso] = useState(false);
  const [notifTips, setNotifTips] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    let mounted = true;

    const hydrateRemoteProfile = async () => {
      const [userResult, clinicalResult, dietResult] = await Promise.allSettled([
        userProfileApi.getUserById(user.id),
        userProfileApi.getClinicalProfile(user.id),
        userProfileApi.getUserDiet(user.id),
      ]);

      if (!mounted) return;

      if (userResult.status === 'fulfilled') {
        updateUser({
          nombre: userResult.value.username || user?.nombre,
          email: userResult.value.email || user?.email,
        });
      }

      if (clinicalResult.status === 'fulfilled') {
        updateUser({
          peso: clinicalResult.value.pesoKg ?? user?.peso,
          altura: clinicalResult.value.alturaCm ?? user?.altura,
        });
      }

      if (dietResult.status === 'fulfilled') {
        const normalizedPlan = {
          plan_diario: dietResult.value.plan_diario,
          resumen_calorico_diario: dietResult.value.resumen_calorico_diario,
          recomendaciones_personalizadas: dietResult.value.recomendaciones_personalizadas,
          advertencias_ingredientes: dietResult.value.advertencias_ingredientes,
        };

        await AsyncStorage.setItem(
          buildUserScopedKey(DIET_PLAN_STORAGE_KEY, user.id),
          JSON.stringify(normalizedPlan),
        );
      }
    };

    hydrateRemoteProfile().catch(() => {
      // Pantalla de perfil debe seguir funcionando aunque fallen endpoints remotos.
    });

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const planLabel = PLAN_LABELS[user?.plan ?? 2];
  const planIcon = PLAN_ICONS[user?.plan ?? 2];
  const initials = user?.nombre
    ? user.nombre.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'FIT';

  const METRICAS = [
    { label: 'Peso', value: user?.peso ? `${user.peso} kg` : '-- kg', icon: '⚖️' },
    { label: 'Grasa', value: user?.grasa ? `${user.grasa}%` : '--%', icon: '🔥' },
    { label: 'Músculo', value: user?.musculo ? `${user.musculo}%` : '--%', icon: '💪' },
    { label: 'Altura', value: user?.altura ? `${user.altura} cm` : '-- cm', icon: '📏' },
  ];

  const AJUSTES = [
    { label: 'Mi plan actual', icon: 'fitness-outline' },
    { label: 'Notificaciones', icon: 'notifications-outline' },
    { label: 'Exportar PDF', icon: 'document-outline' },
    { label: 'Foro de dietas', icon: 'people-outline' },
    { label: 'Privacidad', icon: 'shield-outline' },
  ];

  const handleExportPDF = async () => {
    if (!user) return;
    const plan = PLAN_LABELS[user.plan ?? 2];
    const showEj = (user.plan ?? 2) === 0 || (user.plan ?? 2) === 2;
    const showNut = (user.plan ?? 2) === 1 || (user.plan ?? 2) === 2;
    const html = `
      <html><head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <style>
          body{font-family:Helvetica;background:#0D0D0D;color:#fff;padding:40px}
          .header{text-align:center;border-bottom:2px solid #00E776;padding-bottom:20px;margin-bottom:30px}
          .title{font-size:32px;font-weight:bold;color:#00E776}
          .subtitle{font-size:16px;color:#A0A0A0}
          .section{margin-bottom:24px;background:#1E1E1E;padding:20px;border-radius:15px;border:1px solid #383838}
          .section-title{font-size:18px;font-weight:bold;margin-bottom:14px;color:#00E776}
          .grid{display:flex;flex-wrap:wrap;gap:16px}
          .item{flex:1;min-width:100px}
          .label{font-size:11px;color:#A0A0A0;text-transform:uppercase;letter-spacing:1px}
          .value{font-size:20px;font-weight:bold;margin-top:4px}
          .tag{display:inline-block;background:#0D2E17;color:#00E776;padding:4px 12px;border-radius:20px;font-size:13px;margin:4px}
          .footer{text-align:center;font-size:11px;color:#666;margin-top:40px;border-top:1px solid #333;padding-top:20px}
        </style>
      </head><body>
        <div class="header">
          <div class="title">REPORTE FITAI</div>
          <div class="subtitle">Resumen de progreso físico y plan personalizado</div>
        </div>
        <div class="section">
          <div class="section-title">Datos del Usuario</div>
          <div class="grid">
            <div class="item"><div class="label">Nombre</div><div class="value">${user.nombre}</div></div>
            <div class="item"><div class="label">Plan Activo</div><div class="value">${plan}</div></div>
            <div class="item"><div class="label">Objetivo dieta</div><div class="value" style="font-size:14px">${OBJETIVO_DIETA[user.objetivoDieta ?? 0]}</div></div>
          </div>
        </div>
        <div class="section">
          <div class="section-title">Métricas Actuales</div>
          <div class="grid">
            <div class="item"><div class="label">Peso</div><div class="value">${user.peso} kg</div></div>
            <div class="item"><div class="label">Grasa Corporal</div><div class="value">${user.grasa}%</div></div>
            <div class="item"><div class="label">Masa Muscular</div><div class="value">${user.musculo}%</div></div>
            <div class="item"><div class="label">Altura</div><div class="value">${user.altura} cm</div></div>
          </div>
        </div>
        ${showEj ? `<div class="section">
          <div class="section-title">Objetivos de Ejercicio</div>
          <div><span class="tag">Meta: ${META_EJERCICIO[user.metaEjercicio ?? 0]}</span><span class="tag">Lugar: ${LUGAR[user.lugarEntrenamiento ?? 0]}</span></div>
        </div>` : ''}
        ${showNut ? `<div class="section">
          <div class="section-title">Objetivos Nutricionales</div>
          <div><span class="tag">Meta: ${META_NUTRICION[user.metaNutricional ?? 0]}</span><span class="tag">Calorías: ${CONTROL_CAL[user.controlCalorias ?? 0]}</span></div>
        </div>` : ''}
        ${(user.condicionesMedicas?.length ?? 0) > 0 ? `<div class="section">
          <div class="section-title">Condiciones Médicas</div>
          <div>${(user.condicionesMedicas ?? []).map((c: string) => `<span class="tag">${c}</span>`).join('')}</div>
        </div>` : ''}
        <div class="footer">Generado por Holos · ${new Date().toLocaleDateString()}</div>
      </body></html>`;
    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (e) { console.error(e); }
  };

  const handleAction = (label: string) => {
    if (label === 'Exportar PDF') handleExportPDF();
    else if (label === 'Mi plan actual') setActiveModal('plan');
    else if (label === 'Notificaciones') setActiveModal('notificaciones');
    else if (label === 'Privacidad') setActiveModal('privacidad');
    else if (label === 'Foro de dietas') Linking.openURL('https://www.reddit.com/r/nutrition/');
  };

  const handleOpenEdit = () => {
    setEditNombre(user?.nombre ?? '');
    setEditPeso(user?.peso ?? '');
    setEditAltura(user?.altura ?? '');
    setEditPlan(user?.plan ?? 2);
    setEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!user) return;
    setSaving(true);
    const result = await AuthService.updateProfile(user.id, { nombre: editNombre, peso: editPeso, altura: editAltura, plan: editPlan });
    setSaving(false);
    if (result.success && result.user) updateUser(result.user);
    setEditModal(false);
  };

  const handleLogout = async () => {
    await AuthService.logout();
    resetData();
    setUser(null);
    rootNav.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Auth' }] }));
  };

  const showEj = (user?.plan ?? 2) === 0 || (user?.plan ?? 2) === 2;
  const showNut = (user?.plan ?? 2) === 1 || (user?.plan ?? 2) === 2;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

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

        <View style={styles.planCard}>
          <Text style={styles.planLabel}>Plan activo</Text>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>{planIcon} {planLabel}</Text>
          </View>
          <Text style={styles.planSub}>Objetivo: {OBJETIVO_DIETA[user?.objetivoDieta ?? 0]}</Text>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: '78%' }]} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Mis métricas</Text>
        <View style={styles.metricasGrid}>
          {METRICAS.map(m => (
            <View key={m.label} style={styles.metricaCard}>
              <Text style={styles.metricaIcon}>{m.icon}</Text>
              <Text style={styles.metricaValue}>{m.value}</Text>
              <Text style={styles.metricaLabel}>{m.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.monitoPreview}>
          <Text style={styles.sectionTitle}>Mi cuerpo</Text>
          <View style={styles.monitoRow}>
            <Monito size={90} grasa={parseFloat(user?.grasa ?? '22')} musculo={parseFloat(user?.musculo ?? '38')} color={Colors.accent} />
            <View style={styles.monitoMeta}>
              <Text style={styles.monitoMetaTitle}>Progreso físico</Text>
              <Text style={styles.monitoMetaText}>Métricas actualizadas según tu perfil.</Text>
              <TouchableOpacity onPress={() => (navigation as any).navigate('FisicoDetalle')}>
                <Text style={styles.monitoMetaLink}>Ver comparativa completa →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Configuración</Text>
        <View style={styles.ajustesCard}>
          {AJUSTES.map((a, i) => (
            <TouchableOpacity
              key={a.label}
              style={[styles.ajusteRow, i < AJUSTES.length - 1 && styles.ajusteRowBorder]}
              onPress={() => handleAction(a.label)}
            >
              <Ionicons name={a.icon as any} size={20} color={Colors.textLabel} style={{ marginRight: 14 }} />
              <Text style={styles.ajusteLabel}>{a.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.placeholder} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Modal Mi plan actual */}
      <Modal visible={activeModal === 'plan'} animationType="slide" transparent onRequestClose={() => setActiveModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mi plan actual</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.planDetailBadge}>
                <Text style={styles.planDetailBadgeText}>{planIcon} {planLabel}</Text>
              </View>
              <Text style={styles.planDetailSub}>Objetivo de dieta: {OBJETIVO_DIETA[user?.objetivoDieta ?? 0]}</Text>
              {showEj && (
                <View style={styles.planSection}>
                  <Text style={styles.planSectionTitle}>🏋️ Ejercicio</Text>
                  <View style={styles.planRow}><Text style={styles.planRowLabel}>Meta</Text><Text style={styles.planRowValue}>{META_EJERCICIO[user?.metaEjercicio ?? 0]}</Text></View>
                  <View style={styles.planRow}><Text style={styles.planRowLabel}>Lugar</Text><Text style={styles.planRowValue}>{LUGAR[user?.lugarEntrenamiento ?? 0]}</Text></View>
                  <View style={styles.planRow}><Text style={styles.planRowLabel}>Frecuencia</Text><Text style={styles.planRowValue}>{['Nunca', '1-2x/sem', '3-4x/sem', '5+/sem'][user?.rutina ?? 1]}</Text></View>
                  <View style={styles.planRow}><Text style={styles.planRowLabel}>Disponibilidad</Text><Text style={styles.planRowValue}>{['30 min', '1 hora', '2 horas', 'Flexible'][user?.disponibilidad ?? 1]}</Text></View>
                </View>
              )}
              {showNut && (
                <View style={styles.planSection}>
                  <Text style={styles.planSectionTitle}>🥗 Nutrición</Text>
                  <View style={styles.planRow}><Text style={styles.planRowLabel}>Meta</Text><Text style={styles.planRowValue}>{META_NUTRICION[user?.metaNutricional ?? 0]}</Text></View>
                  <View style={styles.planRow}><Text style={styles.planRowLabel}>Calorías</Text><Text style={styles.planRowValue}>{CONTROL_CAL[user?.controlCalorias ?? 0]}</Text></View>
                  <View style={styles.planRow}><Text style={styles.planRowLabel}>Dieta</Text><Text style={styles.planRowValue}>{['Omnívoro', 'Vegano', 'Vegetariano', 'Keto'][user?.dieta ?? 0]}</Text></View>
                </View>
              )}
              {(user?.condicionesMedicas?.length ?? 0) > 0 && (
                <View style={styles.planSection}>
                  <Text style={styles.planSectionTitle}>🏥 Condiciones médicas</Text>
                  <View style={styles.chipsWrap}>
                    {(user?.condicionesMedicas ?? []).map((c: string) => (
                      <View key={c} style={styles.tagChip}><Text style={styles.tagChipText}>{c}</Text></View>
                    ))}
                  </View>
                </View>
              )}
              {(user?.medicamentos?.length ?? 0) > 0 && (
                <View style={styles.planSection}>
                  <Text style={styles.planSectionTitle}>💊 Medicamentos</Text>
                  <View style={styles.chipsWrap}>
                    {(user?.medicamentos ?? []).map((m: string) => (
                      <View key={m} style={styles.tagChip}><Text style={styles.tagChipText}>{m}</Text></View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Notificaciones */}
      <Modal visible={activeModal === 'notificaciones'} animationType="slide" transparent onRequestClose={() => setActiveModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notificaciones</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {[
              { label: 'Recordatorio de entrenamiento', value: notifEntrenamiento, set: setNotifEntrenamiento },
              { label: 'Recordatorio de nutrición', value: notifNutricion, set: setNotifNutricion },
              { label: 'Actualizaciones de progreso', value: notifProgreso, set: setNotifProgreso },
              { label: 'Tips y consejos diarios', value: notifTips, set: setNotifTips },
            ].map((n, i, arr) => (
              <View key={n.label} style={[styles.notifRow, i < arr.length - 1 && styles.notifRowBorder]}>
                <Text style={styles.notifLabel}>{n.label}</Text>
                <Switch value={n.value} onValueChange={n.set} trackColor={{ true: Colors.accent, false: Colors.toggleOff }} thumbColor={Colors.white} />
              </View>
            ))}
          </View>
        </View>
      </Modal>

      {/* Modal Privacidad */}
      <Modal visible={activeModal === 'privacidad'} animationType="slide" transparent onRequestClose={() => setActiveModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { maxHeight: '80%' }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Privacidad</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { titulo: '📊 Recopilación de datos', texto: 'Holos recopila únicamente los datos que tú proporcionas: métricas físicas, preferencias de entrenamiento y datos de salud. Esta información se almacena localmente en tu dispositivo.' },
                { titulo: '🔒 Seguridad', texto: 'Tus datos personales nunca se comparten con terceros. La información biométrica se usa exclusivamente para personalizar tu plan de fitness y nutrición.' },
                { titulo: '🤖 Inteligencia Artificial', texto: 'Holos utiliza modelos de IA de Google Gemini para generar respuestas personalizadas. Los mensajes del chat pueden procesarse en servidores externos para generar respuestas.' },
                { titulo: '🗑️ Eliminación de datos', texto: 'Puedes eliminar tu cuenta y todos tus datos en cualquier momento desde la sección de perfil. Al cerrar sesión, los datos de sesión se eliminan del dispositivo.' },
                { titulo: '📅 Última actualización', texto: 'Esta política de privacidad fue actualizada el 18 de abril de 2026.' },
              ].map(s => (
                <View key={s.titulo} style={styles.privacySection}>
                  <Text style={styles.privacyTitle}>{s.titulo}</Text>
                  <Text style={styles.privacyText}>{s.texto}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Editar perfil */}
      <Modal visible={editModal} animationType="slide" transparent onRequestClose={() => setEditModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar perfil</Text>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalForm}>
              <Text style={styles.fieldLabel}>Nombre completo</Text>
              <TextInput style={styles.modalInput} value={editNombre} onChangeText={setEditNombre} placeholderTextColor={Colors.placeholder} placeholder="Tu nombre" />
              <Text style={styles.fieldLabel}>Peso (kg)</Text>
              <TextInput style={styles.modalInput} value={editPeso} onChangeText={setEditPeso} placeholderTextColor={Colors.placeholder} placeholder="Ej. 72" keyboardType="numeric" />
              <Text style={styles.fieldLabel}>Altura (cm)</Text>
              <TextInput style={styles.modalInput} value={editAltura} onChangeText={setEditAltura} placeholderTextColor={Colors.placeholder} placeholder="Ej. 175" keyboardType="numeric" />
              <Text style={styles.fieldLabel}>Objetivo</Text>
              <View style={styles.planChips}>
                {PLAN_LABELS.map((label, i) => (
                  <TouchableOpacity key={label} style={[styles.planChip, editPlan === i && styles.planChipActive]} onPress={() => setEditPlan(i)}>
                    <Text style={[styles.planChipText, editPlan === i && styles.planChipTextActive]}>{PLAN_ICONS[i]} {label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSaveEdit} disabled={saving}>
              {saving ? <ActivityIndicator color={Colors.bg} /> : <Text style={styles.saveBtnText}>Guardar cambios</Text>}
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
  avatarWrap: { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '800', color: Colors.bg },
  headerInfo: { flex: 1 },
  userName: { fontSize: 20, fontWeight: '800', color: Colors.white },
  userEmail: { fontSize: 13, color: Colors.textSecondary },
  editBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.accentDark, alignItems: 'center', justifyContent: 'center' },
  planCard: { backgroundColor: Colors.surface, borderRadius: Spacing.cardRadius, borderWidth: 1, borderColor: Colors.border, padding: 18, marginBottom: 24 },
  planLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600', marginBottom: 8 },
  planBadge: { alignSelf: 'flex-start', backgroundColor: Colors.accentDark, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 8 },
  planBadgeText: { fontSize: 14, fontWeight: '700', color: Colors.accent },
  planSub: { fontSize: 13, color: Colors.textSecondary, marginBottom: 12 },
  progressBg: { height: 6, backgroundColor: '#262626', borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: Colors.accent, borderRadius: 3 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.white, marginBottom: 14 },
  metricasGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  metricaCard: { width: '47%', backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 16, alignItems: 'flex-start' },
  metricaIcon: { fontSize: 22, marginBottom: 8 },
  metricaValue: { fontSize: 22, fontWeight: '800', color: Colors.white },
  metricaLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
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
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: { backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.screen, paddingBottom: 36 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.white },
  modalForm: { gap: 14, marginBottom: 24 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.textLabel, marginBottom: 6 },
  modalInput: { height: Spacing.fieldHeight, backgroundColor: Colors.bg, borderRadius: Spacing.fieldRadius, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 16, color: Colors.white, fontSize: 15 },
  planChips: { gap: 8 },
  planChip: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border },
  planChipActive: { backgroundColor: Colors.accentDark, borderColor: Colors.accent },
  planChipText: { fontSize: 14, fontWeight: '600', color: Colors.textLabel },
  planChipTextActive: { color: Colors.accent },
  saveBtn: { height: Spacing.buttonHeight, backgroundColor: Colors.accent, borderRadius: Spacing.buttonRadius, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '800', color: Colors.bg },
  planDetailBadge: { alignSelf: 'flex-start', backgroundColor: Colors.accentDark, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginBottom: 8 },
  planDetailBadgeText: { fontSize: 15, fontWeight: '700', color: Colors.accent },
  planDetailSub: { fontSize: 13, color: Colors.textSecondary, marginBottom: 20 },
  planSection: { backgroundColor: Colors.bg, borderRadius: 12, padding: 14, marginBottom: 12 },
  planSectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.white, marginBottom: 10 },
  planRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.border },
  planRowLabel: { fontSize: 13, color: Colors.textSecondary },
  planRowValue: { fontSize: 13, fontWeight: '600', color: Colors.white },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: { backgroundColor: Colors.accentDark, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  tagChipText: { fontSize: 12, fontWeight: '600', color: Colors.accent },
  notifRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  notifRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  notifLabel: { flex: 1, fontSize: 14, color: Colors.white },
  privacySection: { marginBottom: 20 },
  privacyTitle: { fontSize: 14, fontWeight: '700', color: Colors.accent, marginBottom: 8 },
  privacyText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
});
