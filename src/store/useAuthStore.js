import { create } from 'zustand';
import storage from '../services/storage';
export const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    /**
     * Efetua o login do cliente
     * Armazena o token JWT de forma segura e atualiza o estado global.
     */
    login: async (token, user) => {
        set({ isLoading: true });
        try {
            await storage.saveSecureToken(token);
            set({ user, isAuthenticated: true, isLoading: false });
        }
        catch (error) {
            console.error('Erro ao processar login na store:', error);
            set({ isLoading: false });
        }
    },
    /**
     * Efetua o logout do cliente
     * Remove o token de segurança, limpa dados locais em cache e limpa o estado.
     */
    logout: async () => {
        set({ isLoading: true });
        try {
            await storage.deleteSecureToken();
            await storage.clearAllCache();
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
        catch (error) {
            console.error('Erro ao efetuar logout na store:', error);
            set({ isLoading: false });
        }
    },
    /**
     * Restaura a sessão ao abrir o aplicativo
     * Verifica se há um token persistido no hardware e reconstrói o estado reativo.
     */
    restoreSession: async () => {
        set({ isLoading: true });
        try {
            const token = await storage.getSecureToken();
            if (token) {
                // Em um cenário de produção real, faríamos um GET /auth/me na API para buscar
                // o perfil do usuário mais recente com o token ativo.
                // Simulamos o restabelecimento do perfil do cliente.
                const mockUser = {
                    id: 'user-client-123',
                    nome: 'Fulano de Tal',
                    email: 'cliente@cineweb.com.br',
                    perfil: 'CUSTOMER',
                };
                set({ user: mockUser, isAuthenticated: true, isLoading: false });
            }
            else {
                set({ user: null, isAuthenticated: false, isLoading: false });
            }
        }
        catch (error) {
            console.error('Erro ao restaurar sessão na store:', error);
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },
    /**
     * Atualiza os dados de perfil do usuário sob demanda
     */
    updateUser: (user) => {
        set({ user });
    },
}));
export default useAuthStore;
