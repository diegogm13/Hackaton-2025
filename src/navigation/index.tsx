import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme';

// Screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/onboarding/LoginScreen';
import RegistroScreen from '../screens/onboarding/RegistroScreen';
import PersonalizacionScreen from '../screens/onboarding/PersonalizacionScreen';
import DatosEstadisticosScreen from '../screens/onboarding/DatosEstadisticosScreen';
import DatosEstiloVidaScreen from '../screens/onboarding/DatosEstiloVidaScreen';
import DatosSaludScreen from '../screens/onboarding/DatosSaludScreen';
import ObjetivoDietaScreen from '../screens/onboarding/ObjetivoDietaScreen';
import PreguntasEjercicioScreen from '../screens/onboarding/PreguntasEjercicioScreen';
import PreguntasNutricionScreen from '../screens/onboarding/PreguntasNutricionScreen';
import HomeScreen from '../screens/main/HomeScreen';
import ChatIAScreen from '../screens/main/ChatIAScreen';
import PerfilScreen from '../screens/main/PerfilScreen';
import FisicoDetalleScreen from '../screens/main/FisicoDetalleScreen';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Onboarding: undefined;
  MainApp: undefined;
  FisicoDetalle: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Registro: undefined;
};

export type OnboardingStackParamList = {
  Personalizacion: undefined;
  PreguntasEjercicio: undefined;
  PreguntasNutricion: undefined;
  DatosEstadisticos: undefined;
  DatosEstiloVida: undefined;
  DatosSalud: undefined;
  ObjetivoDieta: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  ChatIA: undefined;
  Perfil: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Registro" component={RegistroScreen} />
    </AuthStack.Navigator>
  );
}

function OnboardingNavigator() {
  return (
    <OnboardingStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <OnboardingStack.Screen name="Personalizacion" component={PersonalizacionScreen} />
      <OnboardingStack.Screen name="PreguntasEjercicio" component={PreguntasEjercicioScreen} />
      <OnboardingStack.Screen name="PreguntasNutricion" component={PreguntasNutricionScreen} />
      <OnboardingStack.Screen name="DatosEstadisticos" component={DatosEstadisticosScreen} />
      <OnboardingStack.Screen name="DatosEstiloVida" component={DatosEstiloVidaScreen} />
      <OnboardingStack.Screen name="DatosSalud" component={DatosSaludScreen} />
      <OnboardingStack.Screen name="ObjetivoDieta" component={ObjetivoDietaScreen} />
    </OnboardingStack.Navigator>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
          paddingTop: 10,
        },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.placeholder,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'ChatIA') iconName = focused ? 'mic' : 'mic-outline';
          else if (route.name === 'Perfil') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabel:
          route.name === 'Home' ? 'Inicio' :
          route.name === 'ChatIA' ? 'IA' : 'Perfil',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="ChatIA" component={ChatIAScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        <RootStack.Screen name="Splash" component={SplashScreen} />
        <RootStack.Screen name="Auth" component={AuthNavigator} />
        <RootStack.Screen name="Onboarding" component={OnboardingNavigator} />
        <RootStack.Screen name="MainApp" component={MainTabNavigator} />
        <RootStack.Screen name="FisicoDetalle" component={FisicoDetalleScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
