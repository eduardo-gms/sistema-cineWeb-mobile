import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from './src/store/useAuthStore';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import MyTicketsScreen from './src/screens/tickets/MyTicketsScreen';
import TicketReceiptScreen from './src/screens/tickets/TicketReceiptScreen';
import FilmesScreen from './src/screens/public/FilmesScreen';
import SessoesScreen from './src/screens/public/SessoesScreen';
import CheckoutScreen from './src/screens/checkout/CheckoutScreen';

export type RootStackParamList = {
  Main: undefined;
  LoginStack: { screen?: string };
  Register: undefined;
  ForgotPassword: undefined;
  Checkout: { sessao: any };
  TicketReceipt: { pedidoId: string | number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: '#0F0F13' },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: { fontWeight: 'bold' as const },
  contentStyle: { backgroundColor: '#0F0F13' },
};

function MainTabs() {
  const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'film';
          if (route.name === 'Filmes') iconName = 'film-outline';
          else if (route.name === 'Sessões') iconName = 'time-outline';
          else if (route.name === 'Minha Conta') iconName = 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#1E1E24',
          borderTopColor: '#333',
        },
        headerStyle: { backgroundColor: '#0F0F13' },
        headerTintColor: '#FFF',
      })}
    >
      <Tab.Screen name="Filmes" component={FilmesScreen} />
      <Tab.Screen name="Sessões" component={SessoesScreen} />
      <Tab.Screen 
        name="Minha Conta" 
        component={isAuthenticated ? MyTicketsScreen : LoginScreen} 
        options={{ title: isAuthenticated ? 'Minha Conta' : 'Entrar' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const restoreSession = useAuthStore((state: any) => state.restoreSession);
  const isLoading = useAuthStore((state: any) => state.isLoading);
  const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (isLoading) return null; 

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F13" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainTabs} />
          
          <Stack.Group screenOptions={screenOptions}>
            {!isAuthenticated && (
              <>
                <Stack.Screen name="LoginStack" component={LoginScreen} options={{ title: 'Entrar', headerShown: true }} />
                <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Cadastrar', headerShown: true }} />
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Recuperar Senha', headerShown: true }} />
              </>
            )}
            {isAuthenticated && (
              <>
                <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Finalizar Compra', headerShown: true }} />
                <Stack.Screen name="TicketReceipt" component={TicketReceiptScreen as any} options={{ title: 'Comprovante', headerShown: true }} />
              </>
            )}
          </Stack.Group>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
