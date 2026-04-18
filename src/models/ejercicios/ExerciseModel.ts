export type MetaEjercicio = 'Tonificación muscular' | 'Fuerza y potencia' | 'Resistencia cardio' | 'Flexibilidad y movilidad';
export type LugarEjercicio = 'Gimnasio' | 'En casa' | 'Al aire libre' | 'Mixto';
export type NivelActividad = 'Principiante' | 'Intermedio' | 'Avanzado';
export type FrecuenciaDias = '1-2 días' | '3-4 días' | '5-6 días' | 'Todos los días';

export interface PerfilActividadInicialDto {
    hace_ejercicio: boolean;
    dias_por_semana: FrecuenciaDias;
    nivel_actual: NivelActividad;
}

export interface PreferenciasEjercicioInicialDto {
    meta_principal: MetaEjercicio;
    lugar_preferido: LugarEjercicio;
}

export interface SolicitudPlanEjercicioDto {
    usuario_id: string;
    perfil_actividad: PerfilActividadInicialDto;
    preferencias_ejercicio: PreferenciasEjercicioInicialDto;
}

export interface DetalleEjercicio {
    ejercicio: string;
    series: number;
    repeticiones: string;
    descanso_segundos: number;
}

export interface PlanEjercicioGenerado {
    rutina_semanal: Record<string, DetalleEjercicio[]>;
    resumen_volumen_semanal: string;
    recomendaciones_personalizadas: string[];
}

export interface RespuestaPlanEjercicioDto {
    plan_generado: PlanEjercicioGenerado;
    id_guardado: string;
}

export type FuenteOnboardingEjercicio = {
    userId?: string;
    metaEjercicio?: number;
    lugarEntrenamiento?: number;
    nivelActual?: number;
    diasEntrenamiento?: number;
};

export type OpcionesMapeoEjercicio = {
    usuarioId?: string; // Prioridad sobre el de la fuente si se provee
};

export interface SolicitudPlanEjercicioDto {
    usuario_id: string;
    perfil_actividad: {
        hace_ejercicio: boolean;
        dias_por_semana: FrecuenciaDias;
        nivel_actual: NivelActividad;
    };
    preferencias_ejercicio: {
        meta_principal: MetaEjercicio;
        lugar_preferido: LugarEjercicio;
    };
}

export interface RespuestaPlanEjercicioDto {
    plan_generado: PlanEjercicioGenerado;
    id_guardado: string;
}