import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserProfile = {
  id: string;
  nombre: string;
  email: string;
  password: string;
  // Personalizacion
  plan: number; // 0: Ejercicio, 1: Nutricional, 2: Completo
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
  condicionesSalud: string;
  createdAt: string;
  updatedAt: string;
};

const USERS_KEY = '@all_users';
const CURRENT_USER_KEY = '@current_user_id';

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

export const AuthService = {
  async login(
    email: string,
    password: string,
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    await delay();
    const users = await getUsers();
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    );
    if (!user) return { success: false, error: 'Correo o contraseña incorrectos' };
    await AsyncStorage.setItem(CURRENT_USER_KEY, user.id);
    return { success: true, user };
  },

  async register(
    userData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    await delay();
    const users = await getUsers();
    const exists = users.some(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (exists) return { success: false, error: 'Este correo ya está registrado' };

    const newUser: UserProfile = {
      ...userData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(newUser);
    await saveUsers(users);
    await AsyncStorage.setItem(CURRENT_USER_KEY, newUser.id);
    return { success: true, user: newUser };
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
    await AsyncStorage.removeItem('hasCompletedOnboarding');
  },
};
