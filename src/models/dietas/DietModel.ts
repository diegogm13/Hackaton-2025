export type SexoBiologico = 'masculino' | 'femenino';
export type TipoDieta = 'omnivora' | 'vegetariana' | 'vegana' | 'mediterranea' | 'keto';
export type ObjetivoDieta = 'bajar_peso' | 'subir_peso' | 'mantener';
export type FrecuenciaEntrenamiento = '1_2' | '3_4' | '5_plus';
export type HorasEntrenamientoDiario = '30min' | '1hr' | '2hrs' | 'flexible';

export interface PerfilFisicoDto {
    edad: number;
    peso_kg: number;
    altura_cm: number;
    sexo_biologico: SexoBiologico;
}

export interface PerfilClinicoDto {
    objetivo?: ObjetivoDieta;
    enfermedades_cronicas?: string[];
    alergias?: string[];
    medicamentos?: string[];
    fuma?: boolean;
    consume_alcohol?: boolean;
    embarazo?: boolean;
    trimestre_embarazo?: 1 | 2 | 3;
    fase_menstrual?: 'folicular' | 'ovulatoria' | 'lutea' | 'menstrual' | 'none';
}

export interface EstiloVidaDto {
    frecuencia_ejercicio_semana: FrecuenciaEntrenamiento;
    horas_entrenamiento_diario: HorasEntrenamientoDiario;
}

export interface PreferenciasDietaDto {
    comidas_por_dia: number;
    excluir_ingredientes_gusto?: string[];
    tipo_dieta: TipoDieta;
    meta_nutricional?: string | number;
    control_calorias?: string | number;
    preparacion_comida?: string | number;
}

export interface SolicitudPlanDietaDto {
    usuario_id: string; // UUID v4
    perfil_fisico: PerfilFisicoDto;
    perfil_clinico?: PerfilClinicoDto | null;
    preferencias_dieta: PreferenciasDietaDto;
    estilo_vida?: EstiloVidaDto;
}

// Respuesta de /plan/gemini
export interface GeminiRequestPayload {
    model: string;
    system_instruction: string;
    contexto_string: string;
    prompt_usuario: string;
}

export interface RecetaDia {
    id: string;
    nombre_traducido: string;
    calorias: number;
    proteina: number;
    carbohidratos: number;
    grasas: number;
    sodio: number;
}

export interface ComidasDia {
    desayuno: RecetaDia[];
    comida: RecetaDia[];
    cena: RecetaDia[];
}

export interface PlanDiario {
    lunes: ComidasDia;
    martes: ComidasDia;
    miercoles: ComidasDia;
    jueves: ComidasDia;
    viernes: ComidasDia;
}

export interface PlanDietaGenerado {
    plan_diario: PlanDiario;
    resumen_calorico_diario: number;
    recomendaciones_personalizadas: string[];
    advertencias_ingredientes: string[];
}

export interface RespuestaPlanGeminiDto {
    payload_enviado_a_gemini: GeminiRequestPayload;
    plan_generado: PlanDietaGenerado;
}