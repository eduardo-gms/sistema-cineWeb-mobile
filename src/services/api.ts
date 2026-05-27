import axios from 'axios';
import { Platform } from 'react-native';
import storage from './storage';
import { useAuthStore } from '../store/useAuthStore';

// URL base padrão da API.
// No Android Emulator, localhost é mapeado para 10.0.2.2.
// Em dispositivo físico ou iOS Simulator, usamos localhost ou o IP de desenvolvimento.
const DEFAULT_API_URL = Platform.select({
  android: 'http://10.0.2.2:3000',
  ios: 'http://localhost:3000',
  default: 'http://localhost:3000',
});

const api = axios.create({
  baseURL: DEFAULT_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

/**
 * Interceptor de Requisição (Request)
 * Adiciona o token JWT do SecureStore em todas as requisições privadas.
 */
api.interceptors.request.use(
  async (config: any) => {
    const token = await storage.getSecureToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de Resposta (Response)
 * Intercepta erros globais, em especial 401 Unauthorized para logout automático.
 */
api.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    // Se o servidor retornar 401 (Token Expirado ou Inválido)
    if (error.response && error.response.status === 401) {
      console.warn('Sessão expirada ou inválida. Executando logout automático...');
      
      // Limpa a store do Zustand de autenticação (desloga o usuário e limpa o token)
      useAuthStore.getState().logout();
    }
    
    return Promise.reject(error);
  }
);

export default api;
