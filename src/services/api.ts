import axios from 'axios';
import { Platform } from 'react-native';
import storage from './storage';
import { useAuthStore } from '../store/useAuthStore';
import { TokenRefreshResponse } from '../@types';

// URL base padrão da API.
// No Android Emulator, localhost é mapeado para 10.0.2.2.
// Em dispositivo físico, configure REACT_NATIVE_PACKAGER_HOSTNAME ou substitua pelo IP local.
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
 * Adiciona o Access Token do SecureStore em todas as requisições.
 */
api.interceptors.request.use(
  async (config: any) => {
    const token = await storage.getAccessToken();
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
 * Implementa renovação automática de token (refresh) ao receber 401.
 * Usa fila para evitar múltiplos refreshes simultâneos.
 */
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const originalRequest = error.config;

    // Se 401 e não é retry nem rota de auth
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        // Enfileira enquanto o refresh está em andamento
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = await storage.getRefreshToken();
      if (!refreshToken) {
        isRefreshing = false;
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      try {
        // Faz refresh usando axios puro (sem interceptors) para evitar loop
        const response = await axios.post<TokenRefreshResponse>(
          `${api.defaults.baseURL}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

        // Salva novos tokens no SecureStore
        await storage.saveTokens(newAccessToken, newRefreshToken);

        processQueue(null, newAccessToken);

        // Refaz a requisição original com o novo token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh falhou — logout forçado
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
