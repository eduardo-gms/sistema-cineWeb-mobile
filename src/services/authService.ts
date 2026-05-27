import api from './api';
import { AuthResponse, TokenRefreshResponse, Usuario } from '../@types';

export const authService = {
  /**
   * Efetua login com e-mail e senha
   */
  async login(email: string, senha: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, senha });
      return response.data;
    } catch (error: any) {
      const apiMessage = error.response?.data?.message || 'Falha na conexão com o servidor.';
      throw new Error(apiMessage);
    }
  },

  /**
   * Registra um novo usuário cliente
   */
  async register(nome: string, email: string, senha: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', { nome, email, senha });
      return response.data;
    } catch (error: any) {
      const apiMessage = error.response?.data?.message || 'Falha ao registrar novo cliente.';
      throw new Error(apiMessage);
    }
  },

  /**
   * Renova os tokens usando o Refresh Token
   */
  async refreshTokens(refreshToken: string): Promise<TokenRefreshResponse> {
    try {
      const response = await api.post<TokenRefreshResponse>('/auth/refresh', { refreshToken });
      return response.data;
    } catch (error: any) {
      const apiMessage = error.response?.data?.message || 'Falha ao renovar sessão.';
      throw new Error(apiMessage);
    }
  },

  /**
   * Obtém o perfil do usuário autenticado
   */
  async getProfile(): Promise<Usuario> {
    try {
      const response = await api.get<Usuario>('/auth/me');
      return response.data;
    } catch (error: any) {
      const apiMessage = error.response?.data?.message || 'Falha ao obter perfil.';
      throw new Error(apiMessage);
    }
  },

  /**
   * Efetua logout (revoga refresh token no servidor)
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error: any) {
      // Ignora erro de logout (token pode já estar expirado)
      console.warn('Erro ao efetuar logout no servidor:', error.message);
    }
  },
};
export default authService;
