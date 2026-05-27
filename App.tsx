import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from './src/store/useAuthStore';
import MyTicketsScreen from './src/screens/tickets/MyTicketsScreen';

// Criação do Stack Principal
const Stack = createNativeStackNavigator();

export default function App() {
  const restoreSession = useAuthStore((state: any) => state.restoreSession);
  const isLoading = useAuthStore((state: any) => state.isLoading);
  const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated);

  useEffect(() => {
    // Restaura a sessão do usuário de forma segura na inicialização
    restoreSession();
  }, [restoreSession]);

  if (isLoading) {
    // Exibição de tela de carregamento durante a restauração do token JWT
    return null; 
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F13" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#0F0F13',
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            contentStyle: {
              backgroundColor: '#0F0F13',
            },
          }}
        >
          {!isAuthenticated ? (
            // Grupo de Telas de Autenticação (Login fictício/Mock para demonstração)
            <Stack.Screen 
              name="MyTickets" 
              component={MyTicketsScreen} 
              options={{ title: 'CineWeb Ingressos (Modo de Demonstração)' }}
            />
          ) : (
            // Grupo de Telas Privadas do Aplicativo do Cliente
            <Stack.Screen 
              name="MyTickets" 
              component={MyTicketsScreen} 
              options={{ title: 'Meus Ingressos' }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
