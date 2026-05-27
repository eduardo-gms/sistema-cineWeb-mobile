import { create } from 'zustand';
import { Usuario } from '../@types';
import storage from '../services/storage';
import authService from '../services/authService';

interface AuthState {
  user: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  updateUser: (user: Usuario) => void;
}

export const useAuthStore = create<AuthState>((set: any) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  /**
   * Efetua o login do cliente
   * Chama a API, armazena ambos os tokens de forma segura e atualiza o estado global.
   */
  login: async (email: string, senha: string) => {
    set({ isLoading: true });
    try {
      const response = await authService.login(email, senha);
      
      // Salva Access Token e Refresh Token no SecureStore (expo-secure-store)
      await storage.saveTokens(response.accessToken, response.refreshToken);
      
      set({ user: response.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error; // Propaga para a tela de login tratar
    }
  },

  /**
   * Efetua o logout do cliente
   * Revoga refresh token no servidor, limpa tokens seguros e cache local.
   */
  logout: async () => {
    set({ isLoading: true });
    try {
      // Tenta revogar o refresh token no servidor
      await authService.logout();
    } catch (error) {
      console.warn('Erro ao revogar token no servidor:', error);
    } finally {
      // Sempre limpa localmente, independente do servidor
      await storage.deleteAllTokens();
      await storage.clearAllCache();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  /**
   * Restaura a sessão ao abrir o aplicativo
   * Usa o Refresh Token para obter novos tokens e buscar o perfil do usuário.
   */
  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const refreshToken = await storage.getRefreshToken();
      if (!refreshToken) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      // Tenta renovar os tokens
      const tokens = await authService.refreshTokens(refreshToken);
      await storage.saveTokens(tokens.accessToken, tokens.refreshToken);

      // Busca o perfil do usuário com o novo access token
      const user = await authService.getProfile();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.warn('Falha ao restaurar sessão. Token expirado ou inválido.');
      await storage.deleteAllTokens();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  /**
   * Atualiza os dados de perfil do usuário sob demanda
   */
  updateUser: (user: Usuario) => {
    set({ user });
  },
}));
export default useAuthStore;
