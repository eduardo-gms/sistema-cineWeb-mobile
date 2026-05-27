import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from './src/store/useAuthStore';
import LoginScreen from './src/screens/auth/LoginScreen';
import MyTicketsScreen from './src/screens/tickets/MyTicketsScreen';
import TicketReceiptScreen from './src/screens/tickets/TicketReceiptScreen';

// Tipagem de rotas
export type RootStackParamList = {
  Login: undefined;
  MyTickets: undefined;
  TicketReceipt: { ticket: any };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Opções de header padrão (tema dark)
const screenOptions = {
  headerStyle: {
    backgroundColor: '#0F0F13',
  },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: {
    fontWeight: 'bold' as const,
  },
  contentStyle: {
    backgroundColor: '#0F0F13',
  },
};

export default function App() {
  const restoreSession = useAuthStore((state: any) => state.restoreSession);
  const isLoading = useAuthStore((state: any) => state.isLoading);
  const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated);

  useEffect(() => {
    // Restaura a sessão do usuário via Refresh Token na inicialização
    restoreSession();
  }, [restoreSession]);

  if (isLoading) {
    // Tela de splash durante restauração do JWT
    return null; 
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F13" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={screenOptions}>
          {!isAuthenticated ? (
            // ─── Telas de Autenticação ───
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ title: 'CineWeb', headerShown: false }}
            />
          ) : (
            // ─── Telas do App Autenticado ───
            <>
              <Stack.Screen 
                name="MyTickets" 
                component={MyTicketsScreen} 
                options={{ title: 'Meus Ingressos' }}
              />
              <Stack.Screen 
                name="TicketReceipt" 
                component={TicketReceiptScreen as any} 
                options={{ title: 'Comprovante' }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
