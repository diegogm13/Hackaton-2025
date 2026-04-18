import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation';
import { AuthService } from '../services/AuthService';
import { useUser } from '../context/UserContext';
import { Colors } from '../theme';

export default function SplashScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { setUser } = useUser();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  const navigateTo = (routeName: keyof RootStackParamList) => {
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: routeName }] })
    );
  };

  const fadeOutAndNavigate = (routeName: keyof RootStackParamList) => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => navigateTo(routeName));
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    const verify = async () => {
      try {
        const value = await AsyncStorage.getItem('hasCompletedOnboarding');
        if (value === 'true') {
          const currentUser = await AuthService.getCurrentUser();
          if (currentUser) setUser(currentUser);
          setTimeout(() => fadeOutAndNavigate('MainApp'), 1800);
        } else {
          setTimeout(() => fadeOutAndNavigate('Auth'), 1800);
        }
      } catch {
        setTimeout(() => fadeOutAndNavigate('Auth'), 1800);
      }
    };

    verify();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <Image
          source={require('../../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 140,
    height: 140,
  },
});
