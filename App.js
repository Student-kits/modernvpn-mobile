import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ServerListScreen from './src/screens/ServerListScreen';
import VPNStatusScreen from './src/screens/VPNStatusScreen';

// Services
import { AuthProvider } from './src/context/AuthContext';
import { VPNProvider } from './src/context/VPNContext';

const Stack = createStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null; // Add splash screen here
  }

  return (
    <AuthProvider>
      <VPNProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: '#2563eb',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            {isLoggedIn ? (
              // Authenticated screens
              <>
                <Stack.Screen 
                  name="Dashboard" 
                  component={DashboardScreen} 
                  options={{ title: 'ModernVPN' }}
                />
                <Stack.Screen 
                  name="ServerList" 
                  component={ServerListScreen} 
                  options={{ title: 'Select Server' }}
                />
                <Stack.Screen 
                  name="VPNStatus" 
                  component={VPNStatusScreen} 
                  options={{ title: 'VPN Status' }}
                />
              </>
            ) : (
              // Unauthenticated screens
              <>
                <Stack.Screen 
                  name="Login" 
                  component={LoginScreen} 
                  options={{ title: 'Login', headerShown: false }}
                />
                <Stack.Screen 
                  name="Register" 
                  component={RegisterScreen} 
                  options={{ title: 'Register' }}
                />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </VPNProvider>
    </AuthProvider>
  );
}