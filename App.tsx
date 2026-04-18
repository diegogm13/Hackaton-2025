import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation';
import { OnboardingProvider } from './src/context/OnboardingContext';
import { UserProvider } from './src/context/UserContext';

// Manejador de errores global para depuración en terminal
if (__DEV__) {
  const globalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error('--- ERROR CAPTURADO ---');
    console.error(error.message);
    console.error(error.stack);
    if (globalHandler) {
      globalHandler(error, isFatal);
    }
  });
}

export default function App() {
  return (
    <UserProvider>
      <OnboardingProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </OnboardingProvider>
    </UserProvider>
  );
}
