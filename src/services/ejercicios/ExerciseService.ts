import axios, { AxiosError } from 'axios';
import { 
    FuenteOnboardingEjercicio, 
    OpcionesMapeoEjercicio, 
    SolicitudPlanEjercicioDto,
    RespuestaPlanEjercicioDto,
    MetaEjercicio,
    LugarEjercicio,
    NivelActividad,
    FrecuenciaDias
} from '../../models/ejercicios/ExerciseModel';

const api = axios.create({
    baseURL: 'https://resources-services.onrender.com/',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export class ApiError extends Error {
    status?: number;
    data?: unknown;

    constructor(message: string, status?: number, data?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

function toApiError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
        const err = error as AxiosError;
        const status = err.response?.status;
        const data = err.response?.data;
        const message =
            (typeof data === 'object' &&
                data !== null &&
                'message' in data &&
                String((data as { message?: unknown }).message)) ||
            err.message ||
            'Error de red';

        return new ApiError(message, status, data);
    }

    return new ApiError('Error inesperado');
}

const METAS: MetaEjercicio[] = ['Tonificación muscular', 'Fuerza y potencia', 'Resistencia cardio', 'Flexibilidad y movilidad'];
const LUGARES: LugarEjercicio[] = ['Gimnasio', 'En casa', 'Al aire libre', 'Mixto'];
const NIVELES: NivelActividad[] = ['Principiante', 'Intermedio', 'Avanzado'];
const FRECUENCIAS: FrecuenciaDias[] = ['1-2 días', '3-4 días', '5-6 días', 'Todos los días'];

export function mapearOnboardingAEjercicio(
    source: FuenteOnboardingEjercicio,
    options?: OpcionesMapeoEjercicio
): SolicitudPlanEjercicioDto {
    // Extraer el ID buscando en opciones primero, luego en la fuente
    const finalUserId = options?.usuarioId || source.userId || 'guest_user';

    return {
        usuario_id: finalUserId,
        perfil_actividad: {
            hace_ejercicio: true,
            dias_por_semana: FRECUENCIAS[source.diasEntrenamiento ?? 1],
            nivel_actual: NIVELES[source.nivelActual ?? 0],
        },
        preferencias_ejercicio: {
            meta_principal: METAS[source.metaEjercicio ?? 0],
            lugar_preferido: LUGARES[source.lugarEntrenamiento ?? 0],
        },
    };
}

function normalizarPlanEjercicio(data: RespuestaPlanEjercicioDto): RespuestaPlanEjercicioDto {
    const nombres = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const rutinaOriginal = data.plan_generado.rutina_semanal;
    const rutinaLimpia: Record<string, any> = {};

    Object.keys(rutinaOriginal).forEach((key, index) => {
        // Si el backend envía dia_1, usamos Lunes. Si envía algo desconocido, mantenemos la key.
        const label = nombres[index] || key;
        rutinaLimpia[label] = rutinaOriginal[key];
    });

    return {
        ...data,
        plan_generado: {
            ...data.plan_generado,
            rutina_semanal: rutinaLimpia
        }
    };
}

export async function obtenerPlanEjercicioPorUsuario(
    userId: string,
    token?: string
): Promise<RespuestaPlanEjercicioDto> {
    try {
        const response = await api.get<RespuestaPlanEjercicioDto>(
            `/rest/exercise-plan/usuario/${userId}`,
            { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
        );

        // Normalizamos la respuesta antes de entregarla al componente
        return normalizarPlanEjercicio(response.data);
    } catch (error) {
        throw toApiError(error);
    }
}

export async function generarPlanEjercicioDesdeOnboarding(
    source: FuenteOnboardingEjercicio,
    token?: string,
    options?: OpcionesMapeoEjercicio
): Promise<RespuestaPlanEjercicioDto> {
    try {
        const body = mapearOnboardingAEjercicio(source, options);
        
        const response = await api.post<RespuestaPlanEjercicioDto>(
            '/rest/exercise-plan/ejercicios/gemini',
            body,
            { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
        );

        // Transformación de nombres de días (dia_1 -> Lunes)
        const nombres = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
        const rutinaOriginal = response.data.plan_generado.rutina_semanal;
        const rutinaLimpia: Record<string, any> = {};

        Object.keys(rutinaOriginal).forEach((key, index) => {
            const label = nombres[index] || key;
            rutinaLimpia[label] = rutinaOriginal[key];
        });

        response.data.plan_generado.rutina_semanal = rutinaLimpia;

        return response.data;
    } catch (error) {
        throw toApiError(error); // Asumiendo que usas la misma lógica de DietService
    }
}