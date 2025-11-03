import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ServerListScreen from './src/screens/ServerListScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// API Service
import {setAuthToken} from './src/services/api';

const Stack = createNativeStackNavigator();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        setAuthToken(token);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.log('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (token) => {
    await AsyncStorage.setItem('auth_token', token);
    setAuthToken(token);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('auth_token');
    setAuthToken(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return null; // You can add a loading screen here
  }

  return (
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
        }}>
        {!isAuthenticated ? (
          // Auth screens
          <>
            <Stack.Screen
              name="Login"
              options={{title: 'ModernVPN Login'}}>
              {props => <LoginScreen {...props} onLogin={handleLogin} />}
            </Stack.Screen>
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{title: 'Create Account'}}
            />
          </>
        ) : (
          // Main app screens
          <>
            <Stack.Screen
              name="Dashboard"
              options={{title: 'ModernVPN'}}>
              {props => <DashboardScreen {...props} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen
              name="ServerList"
              component={ServerListScreen}
              options={{title: 'Select Server'}}
            />
            <Stack.Screen
              name="Settings"
              options={{title: 'Settings'}}>
              {props => <SettingsScreen {...props} onLogout={handleLogout} />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;