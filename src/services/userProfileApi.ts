import axios from 'axios';

const api = axios.create({
    baseURL: 'https://resources-services.onrender.com/',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});

export type UserProfileResponse = {
    id: string;
    username: string;
    email: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
};

export type UpdateUserProfilePayload = {
    email?: string;
    username?: string;
};

export type ClinicalProfileResponse = {
    id: string;
    userId: string;
    pesoKg: string | null;
    alturaCm: string | null;
    edad: number | null;
    sexo: string | null;
    nivelActividad: string | null;
    objetivo: string | null;
    condicionFemenina: Record<string, unknown>;
    enfermedades: unknown[];
    alergias: unknown[];
    medicamentos: unknown[];
    biomarcadores: Record<string, unknown>;
    preferenciasLogistica: Record<string, unknown>;
    updatedAt: string;
};

export type DietPlanResponse = {
    _id: string;
    usuario_id: string;
    plan_diario: Record<string, unknown>;
    resumen_calorico_diario: number;
    recomendaciones_personalizadas: string[];
    advertencias_ingredientes: string[];
    createdAt?: string;
    updatedAt?: string;
};

export const userProfileApi = {
    async getUserById(userId: string) {
        const { data } = await api.get<UserProfileResponse>(`/auth/users/${userId}`);
        return data;
    },

    async updateUserProfile(userId: string, payload: UpdateUserProfilePayload) {
        const { data } = await api.patch<UserProfileResponse>(`/auth/users/${userId}`, payload);
        return data;
    },

    async getClinicalProfile(userId: string) {
        const { data } = await api.get<ClinicalProfileResponse>(
            `/auth/users/${userId}/clinical-profile`,
        );
        return data;
    },

    async getUserDiet(userId: string) {
        const { data } = await api.get<DietPlanResponse>(`/auth/users/${userId}/diet`);
        return data;
    },
};
