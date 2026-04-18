import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';

export type UserProfile = {
  id: string;
  nombre: string;
  email: string;
  password: string;
  // Personalizacion
  plan: number; // 0: Ejercicio, 1: Nutricional, 2: Completo
  metaEjercicio: number;
  lugarEntrenamiento: number;
  metaNutricional: number;
  controlCalorias: number;
  // DatosEstadisticos
  altura: string;
  peso: string;
  musculo: string;
  grasa: string;
  etnia: string;
  // DatosEstiloVida
  rutina: number;
  disponibilidad: number;
  dieta: number;
  habitos: boolean[];
  alergias: string;
  // DatosSalud
  togglesSalud: boolean[];
  condicionesMedicas: string[];
  medicamentos: string[];
  // ObjetivoDieta
  objetivoDieta: number;
  createdAt: string;
  updatedAt: string;
};

type BackendErrorResponse = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

type LoginDto = {
  email: string;
  password: string;
};

type LoginResponse = {
  access_token?: string;
  token?: string;
  user?: Partial<UserProfile>;
};

type RegisterUserDto = Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>;

type RegisterResponse = {
  access_token?: string;
  token?: string;
  user?: Partial<UserProfile>;
};

const api = axios.create({
  baseURL: process.env.API_URL ?? 'http://10.0.2.2:3000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export class ApiError extends Error {
  status?: number;
  data?: BackendErrorResponse | unknown;

  constructor(message: string, status?: number, data?: BackendErrorResponse | unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function parseAxiosError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<BackendErrorResponse>;
    const status = axiosErr.response?.status;
    const data = axiosErr.response?.data;

    let message = 'Error de red';
    if (data?.message) {
      message = Array.isArray(data.message) ? data.message.join(', ') : data.message;
    } else if (axiosErr.message) {
      message = axiosErr.message;
    }

    return new ApiError(message, status, data);
  }

  return new ApiError('Error inesperado');
}

const USERS_KEY = '@all_users';
const CURRENT_USER_KEY = '@current_user_id';
const AUTH_TOKEN_KEY = '@auth_token';

const delay = () => new Promise<void>(r => setTimeout(r, 800));

const generateId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).substring(2);

const getUsers = async (): Promise<UserProfile[]> => {
  const json = await AsyncStorage.getItem(USERS_KEY);
  return json ? JSON.parse(json) : [];
};

const saveUsers = async (users: UserProfile[]): Promise<void> => {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
};

function createDefaultUser(email: string, password: string): UserProfile {
  return {
    id: generateId(),
    nombre: email.split('@')[0],
    email: email.toLowerCase(),
    password,
    plan: 2,
    metaEjercicio: 0,
    lugarEntrenamiento: 0,
    metaNutricional: 0,
    controlCalorias: 0,
    altura: '170',
    peso: '70',
    musculo: '40',
    grasa: '20',
    etnia: 'Latina',
    rutina: 1,
    disponibilidad: 1,
    dieta: 0,
    habitos: [false, false, false],
    alergias: '',
    togglesSalud: [false, false, false, false],
    condicionesMedicas: [],
    medicamentos: [],
    objetivoDieta: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function normalizeUserProfile(
  payload: Partial<UserProfile> | undefined,
  fallback: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>,
  existing?: UserProfile,
): UserProfile {
  return {
    ...fallback,
    ...payload,
    id: payload?.id ?? existing?.id ?? generateId(),
    createdAt: payload?.createdAt ?? existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

async function persistCurrentSession(user: UserProfile, token?: string): Promise<void> {
  await AsyncStorage.setItem(CURRENT_USER_KEY, user.id);
  await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
  if (token) {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

async function registerUser(payload: RegisterUserDto): Promise<RegisterResponse> {
  try {
    const { data } = await api.post<RegisterResponse>('/auth/register', payload);
    return data;
  } catch (error) {
    throw parseAxiosError(error);
  }
}

async function loginUser(payload: LoginDto): Promise<LoginResponse> {
  try {
    const { data } = await api.post<LoginResponse>('/auth/login', payload);
    return data;
  } catch (error) {
    throw parseAxiosError(error);
  }
}

export const AuthService = {
  async login(
    email: string,
    password: string,
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    await delay();
    const normalizedEmail = email.trim().toLowerCase();
    const users = await getUsers();
    const existingUser = users.find(u => u.email.toLowerCase() === normalizedEmail);
    const localFallback = existingUser ?? createDefaultUser(normalizedEmail, password);

    try {
      const response = await loginUser({ email: normalizedEmail, password });
      const token = response.access_token ?? response.token;
      const merged = normalizeUserProfile(response.user, { ...localFallback, password }, existingUser);

      if (existingUser) {
        const index = users.findIndex(u => u.id === existingUser.id);
        users[index] = merged;
      } else {
        users.push(merged);
      }

      await saveUsers(users);
      await persistCurrentSession(merged, token);
      return { success: true, user: merged };
    } catch {
      // Fallback local para desarrollo offline o backend no disponible.
      if (!existingUser) {
        users.push(localFallback);
        await saveUsers(users);
      }
      await persistCurrentSession(localFallback);
      return { success: true, user: localFallback };
    }
  },

  async register(
    userData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    await delay();
    const users = await getUsers();
    const normalizedInput: RegisterUserDto = {
      ...userData,
      email: userData.email.toLowerCase(),
    };

    const existingIndex = users.findIndex(
      u => u.email.toLowerCase() === normalizedInput.email.toLowerCase(),
    );
    const existingUser = existingIndex >= 0 ? users[existingIndex] : undefined;

    try {
      const response = await registerUser(normalizedInput);
      const token = response.access_token ?? response.token;
      const merged = normalizeUserProfile(response.user, normalizedInput, existingUser);

      if (existingIndex >= 0) {
        users[existingIndex] = merged;
      } else {
        users.push(merged);
      }

      await saveUsers(users);
      await persistCurrentSession(merged, token);
      return { success: true, user: merged };
    } catch {
      // Fallback local para no romper flujo de onboarding en modo mock.
      const localUser: UserProfile = {
        ...normalizedInput,
        id: existingUser?.id ?? generateId(),
        createdAt: existingUser?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        users[existingIndex] = localUser;
      } else {
        users.push(localUser);
      }

      await saveUsers(users);
      await persistCurrentSession(localUser);
      return { success: true, user: localUser };
    }
  },

  async updateProfile(
    userId: string,
    data: Partial<UserProfile>,
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    await delay();
    const users = await getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return { success: false, error: 'Usuario no encontrado' };
    users[index] = { ...users[index], ...data, updatedAt: new Date().toISOString() };
    await saveUsers(users);
    return { success: true, user: users[index] };
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    const userId = await AsyncStorage.getItem(CURRENT_USER_KEY);
    if (!userId) return null;
    const users = await getUsers();
    return users.find(u => u.id === userId) ?? null;
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem('hasCompletedOnboarding');
  },
};
