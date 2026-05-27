import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'cineweb_access_token';
const REFRESH_TOKEN_KEY = 'cineweb_refresh_token';
const TICKETS_CACHE_KEY = 'cineweb_tickets_cache';
const SYNC_QUEUE_KEY = 'cineweb_sync_queue';

export const storage = {
  // ================================================
  // Armazenamento Seguro (JWT — expo-secure-store)
  // Criptografa valores no Keychain/Keystore do dispositivo.
  // ================================================

  async saveAccessToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
    } catch (error) {
      console.error('Erro ao salvar access token:', error);
    }
  },

  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Erro ao recuperar access token:', error);
      return null;
    }
  },

  async deleteAccessToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Erro ao deletar access token:', error);
    }
  },

  async saveRefreshToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Erro ao salvar refresh token:', error);
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Erro ao recuperar refresh token:', error);
      return null;
    }
  },

  async deleteRefreshToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Erro ao deletar refresh token:', error);
    }
  },

  // Atalho: salva ambos os tokens de uma vez
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await this.saveAccessToken(accessToken);
    await this.saveRefreshToken(refreshToken);
  },

  // Atalho: limpa ambos os tokens
  async deleteAllTokens(): Promise<void> {
    await this.deleteAccessToken();
    await this.deleteRefreshToken();
  },

  // Retrocompatibilidade
  async saveSecureToken(token: string): Promise<void> {
    return this.saveAccessToken(token);
  },
  async getSecureToken(): Promise<string | null> {
    return this.getAccessToken();
  },
  async deleteSecureToken(): Promise<void> {
    return this.deleteAccessToken();
  },

  // ================================================
  // Armazenamento Comum (Cache — AsyncStorage)
  // Para dados não sensíveis: ingressos em cache, fila de sync.
  // ================================================

  async getTicketsCache<T>(): Promise<T[] | null> {
    try {
      const data = await AsyncStorage.getItem(TICKETS_CACHE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erro ao obter cache de ingressos:', error);
      return null;
    }
  },

  async saveTicketsCache<T>(tickets: T[]): Promise<void> {
    try {
      await AsyncStorage.setItem(TICKETS_CACHE_KEY, JSON.stringify(tickets));
    } catch (error) {
      console.error('Erro ao salvar cache de ingressos:', error);
    }
  },

  // Fila de sincronização offline
  async getSyncQueue<T>(): Promise<T[]> {
    try {
      const data = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao obter fila de sync:', error);
      return [];
    }
  },

  async saveSyncQueue<T>(queue: T[]): Promise<void> {
    try {
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Erro ao salvar fila de sync:', error);
    }
  },

  async clearSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
    } catch (error) {
      console.error('Erro ao limpar fila de sync:', error);
    }
  },

  async clearAllCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TICKETS_CACHE_KEY);
      await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
  }
};
export default storage;
