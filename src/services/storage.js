import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
const JWT_KEY = 'cineweb_jwt_token';
const TICKETS_CACHE_KEY = 'cineweb_tickets_cache';
export const storage = {
    /**
     * Armazenamento Seguro (JWT e dados sensíveis)
     * Utiliza expo-secure-store que criptografa os valores no Keychain/Keystore do hardware.
     */
    async saveSecureToken(token) {
        try {
            await SecureStore.setItemAsync(JWT_KEY, token);
        }
        catch (error) {
            console.error('Erro ao salvar token de forma segura:', error);
        }
    },
    async getSecureToken() {
        try {
            return await SecureStore.getItemAsync(JWT_KEY);
        }
        catch (error) {
            console.error('Erro ao recuperar token seguro:', error);
            return null;
        }
    },
    async deleteSecureToken() {
        try {
            await SecureStore.deleteItemAsync(JWT_KEY);
        }
        catch (error) {
            console.error('Erro ao deletar token seguro:', error);
        }
    },
    /**
     * Armazenamento Comum (Cache de Ingressos, preferências não sensíveis)
     * Utiliza AsyncStorage.
     */
    async getTicketsCache() {
        try {
            const data = await AsyncStorage.getItem(TICKETS_CACHE_KEY);
            return data ? JSON.parse(data) : null;
        }
        catch (error) {
            console.error('Erro ao obter cache de ingressos:', error);
            return null;
        }
    },
    async saveTicketsCache(tickets) {
        try {
            await AsyncStorage.setItem(TICKETS_CACHE_KEY, JSON.stringify(tickets));
        }
        catch (error) {
            console.error('Erro ao salvar cache de ingressos:', error);
        }
    },
    async clearAllCache() {
        try {
            await AsyncStorage.removeItem(TICKETS_CACHE_KEY);
        }
        catch (error) {
            console.error('Erro ao limpar cache:', error);
        }
    }
};
export default storage;
