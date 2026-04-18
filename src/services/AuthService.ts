import AsyncStorage from '@react-native-async-storage/async-storage';

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
    // Buscar por email exacto primero
    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    // Si no existe, crear usuario de prueba con ese correo
    if (!user) {
      user = {
        id: generateId(),
        nombre: email.split('@')[0],
        email: email.toLowerCase(),
        password,
        plan: 2, metaEjercicio: 0, lugarEntrenamiento: 0, metaNutricional: 0, controlCalorias: 0,
        altura: '170', peso: '70', musculo: '40', grasa: '20', etnia: 'Latina',
        rutina: 1, disponibilidad: 1, dieta: 0,
        habitos: [false, false, false], alergias: '',
        togglesSalud: [false, false, false, false],
        condicionesMedicas: [], medicamentos: [], objetivoDieta: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      users.push(user);
      await saveUsers(users);
    }
    await AsyncStorage.setItem(CURRENT_USER_KEY, user.id);
    await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
    return { success: true, user };
  },

  async register(
    userData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    await delay();
    const users = await getUsers();
    // Si ya existe ese correo, sobreescribir para permitir pruebas
    const existingIndex = users.findIndex(u => u.email.toLowerCase() === userData.email.toLowerCase());
    const newUser: UserProfile = {
      ...userData,
      id: existingIndex >= 0 ? users[existingIndex].id : generateId(),
      createdAt: existingIndex >= 0 ? users[existingIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (existingIndex >= 0) {
      users[existingIndex] = newUser;
    } else {
      users.push(newUser);
    }
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
