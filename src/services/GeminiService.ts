import { GoogleGenerativeAI, ChatSession } from '@google/generative-ai';
import { GEMINI_API_KEY, GEMINI_MODEL } from '../config/gemini';
import { UserProfile } from './AuthService';

const PLAN_LABELS = ['Plan de Ejercicio', 'Plan Nutricional', 'Plan Completo (Ejercicio + Nutrición)'];
const RUTINA_LABELS = ['Nunca entrena', '1-2 veces/semana', '3-4 veces/semana', '5 o más veces/semana'];
const DISPONIBILIDAD_LABELS = ['30 minutos al día', '1 hora al día', '2 horas al día', 'Tiempo flexible'];
const DIETA_LABELS = ['Omnívoro', 'Vegano', 'Vegetariano', 'Keto'];

function buildSystemPrompt(user: UserProfile): string {
  const habitos = ['consumo de alcohol', 'tabaquismo', 'uso de suplementos'];
  const habitosActivos = habitos.filter((_, i) => user.habitos?.[i]);

  const saludPreguntas = [
    'enfermedades crónicas',
    'condiciones psicológicas',
    'discapacidad física',
    'período reproductivo activo',
  ];
  const condicionesActivas = saludPreguntas.filter((_, i) => user.togglesSalud?.[i]);

  return `Eres FitAI, el entrenador personal con inteligencia artificial del usuario. Tienes acceso completo a su perfil biométrico y de salud. SIEMPRE responde en español, de forma concisa, cálida y personalizada.

=== PERFIL COMPLETO DEL USUARIO ===
Nombre: ${user.nombre}
Objetivo principal: ${PLAN_LABELS[user.plan ?? 2]}

DATOS FÍSICOS:
- Peso actual: ${user.peso || 'no especificado'} kg
- Altura: ${user.altura || 'no especificada'} cm
- Masa muscular estimada: ${user.musculo || 'no especificada'}%
- Grasa corporal estimada: ${user.grasa || 'no especificada'}%
- Etnia: ${user.etnia || 'no especificada'}

ESTILO DE VIDA:
- Frecuencia de entrenamiento: ${RUTINA_LABELS[user.rutina ?? 1]}
- Disponibilidad diaria: ${DISPONIBILIDAD_LABELS[user.disponibilidad ?? 1]}
- Dieta preferida: ${DIETA_LABELS[user.dieta ?? 0]}
- Hábitos de consumo: ${habitosActivos.length ? habitosActivos.join(', ') : 'ninguno'}
- Alergias alimentarias: ${user.alergias || 'ninguna'}

HISTORIAL DE SALUD:
- Condiciones activas: ${condicionesActivas.length ? condicionesActivas.join(', ') : 'ninguna'}
- Detalles adicionales: ${user.condicionesSalud || 'ninguno'}
=====================================

REGLAS:
1. Nunca ignores las condiciones de salud al dar consejos de ejercicio.
2. Adapta la nutrición según la dieta preferida y las alergias.
3. Si el usuario pregunta algo fuera del fitness/nutrición/salud, redirige amablemente.
4. Sé motivador pero realista. Usa el nombre del usuario cuando sea natural.
5. Respuestas máximo 3 párrafos o una lista corta. Nada de respuestas genéricas.`;
}

let chatSession: ChatSession | null = null;
let currentUserId: string | null = null;

export const GeminiService = {
  initChat(user: UserProfile): void {
    if (chatSession && currentUserId === user.id) return;
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: buildSystemPrompt(user),
    });
    chatSession = model.startChat({ history: [] });
    currentUserId = user.id;
  },

  resetChat(): void {
    chatSession = null;
    currentUserId = null;
  },

  async sendMessage(text: string): Promise<string> {
    if (!chatSession) throw new Error('Chat no inicializado');
    const result = await chatSession.sendMessage(text);
    return result.response.text();
  },

  isReady(): boolean {
    return chatSession !== null;
  },
};
