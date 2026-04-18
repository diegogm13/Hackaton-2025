import axios, { AxiosError } from 'axios';
import {
    FrecuenciaEntrenamiento,
    HorasEntrenamientoDiario,
    ObjetivoDieta,
    RespuestaPlanGeminiDto,
    SexoBiologico,
    SolicitudPlanDietaDto,
    TipoDieta,
} from '../../models/dietas/DietModel';

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

export type FuenteOnboardingDieta = {
    id?: string;
    userId?: string;
    altura?: string | number;
    peso?: string | number;
    dieta?: number;
    rutina?: number;
    disponibilidad?: number;
    habitos?: boolean[];
    alergias?: string | string[];
    condicionesMedicas?: string[];
    medicamentos?: string[];
    objetivoDieta?: number;
    metaNutricional?: string | number;
    controlCalorias?: string | number;
    plan?: string | number;
};

export type OpcionesMapeoDieta = {
    usuarioId?: string;
    edad?: number;
    sexoBiologico?: SexoBiologico;
    comidasPorDia?: number;
};

const TIPO_DIETA_POR_INDEX: TipoDieta[] = [
    'omnivora',
    'vegana',
    'vegetariana',
    'keto',
    'mediterranea',
];

function parseNumber(value: string | number | undefined, fallback: number): number {
    const parsed = typeof value === 'number' ? value : Number(value ?? '');
    return Number.isFinite(parsed) ? parsed : fallback;
}

function mapObjetivoDieta(value?: number): ObjetivoDieta {
    if (value === 0) return 'bajar_peso';
    if (value === 1) return 'subir_peso';
    return 'mantener';
}

function mapFrecuencia(value?: number): FrecuenciaEntrenamiento {
    if (value === 2) return '3_4';
    if (value === 3) return '5_plus';
    return '1_2';
}

function mapHorasEntrenamiento(value?: number): HorasEntrenamientoDiario {
    if (value === 0) return '30min';
    if (value === 2) return '2hrs';
    if (value === 3) return 'flexible';
    return '1hr';
}

function normalizeAlergias(alergias?: string | string[]): string[] {
    if (Array.isArray(alergias)) {
        return alergias.map((a) => a.trim()).filter(Boolean);
    }

    if (typeof alergias === 'string') {
        return alergias
            .split(',')
            .map((a) => a.trim())
            .filter(Boolean);
    }

    return [];
}

export function mapOnboardingASolicitudPlanDieta(
    source: FuenteOnboardingDieta,
    options?: OpcionesMapeoDieta,
): SolicitudPlanDietaDto {
    const dietaIndex = source.dieta ?? 0;
    const tipoDieta = TIPO_DIETA_POR_INDEX[dietaIndex] ?? 'omnivora';
    const habitos = source.habitos ?? [];

    return {
        usuario_id: options?.usuarioId ?? source.id ?? source.userId ?? '',
        perfil_fisico: {
            edad: options?.edad ?? 25,
            peso_kg: parseNumber(source.peso, 70),
            altura_cm: parseNumber(source.altura, 170),
            sexo_biologico: options?.sexoBiologico ?? 'masculino',
        },
        perfil_clinico: {
            objetivo: mapObjetivoDieta(source.objetivoDieta),
            enfermedades_cronicas: source.condicionesMedicas ?? [],
            alergias: normalizeAlergias(source.alergias),
            medicamentos: source.medicamentos ?? [],
            fuma: Boolean(habitos[1]),
            consume_alcohol: Boolean(habitos[0]),
        },
        preferencias_dieta: {
            comidas_por_dia: options?.comidasPorDia ?? 4,
            tipo_dieta: tipoDieta,
            meta_nutricional: source.metaNutricional,
            control_calorias: source.controlCalorias,
            preparacion_comida: source.plan,
        },
        estilo_vida: {
            frecuencia_ejercicio_semana: mapFrecuencia(source.rutina),
            horas_entrenamiento_diario: mapHorasEntrenamiento(source.disponibilidad),
        },
    };
}

export async function generarPlanDietaConGemini(
    body: SolicitudPlanDietaDto,
    token?: string,
): Promise<RespuestaPlanGeminiDto> {
    try {
        const response = await api.post<RespuestaPlanGeminiDto>(
            '/rest/clinical-filter/plan/gemini',
            body,
            {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            },
        );

        return response.data;
    } catch (error) {
        throw toApiError(error);
    }
}

export async function generarPlanDietaDesdeOnboarding(
    source: FuenteOnboardingDieta,
    token?: string,
    options?: OpcionesMapeoDieta,
): Promise<RespuestaPlanGeminiDto> {
    const payload = mapOnboardingASolicitudPlanDieta(source, options);
    return generarPlanDietaConGemini(payload, token);
}