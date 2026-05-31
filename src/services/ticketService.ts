import api from './api';
import storage from './storage';
import { Ingresso, Pedido } from '../@types';

export interface SyncTicketsResult {
  data: Pedido[];
  isOfflineData: boolean;
  error?: string;
}

export const ticketService = {
  /**
   * Sincronização inteligente de Ingressos (DB Sync)
   * Tenta carregar os ingressos da API NestJS. Se houver sucesso, salva localmente para fins offline.
   * Se houver falha de rede (offline), recupera silenciosamente a cópia salva no storage local.
   */
  async syncTickets(): Promise<SyncTicketsResult> {
    try {
      // 1. Busca os pedidos do usuário autenticado na API
      const response = await api.get<Pedido[]>('/pedidos/meus', { timeout: 8000 });
      const pedidos = response.data;

      // 2. Salva no cache local para acesso offline (agora salva Pedidos inteiros)
      await storage.saveTicketsCache(pedidos);

      return {
        data: pedidos,
        isOfflineData: false,
      };
    } catch (error) {
      console.warn('Falha ao conectar com a API CineWeb. Iniciando modo offline (DB Sync)...');

      // 3. Em caso de falha, recupera o cache local
      const cachedPedidos = await storage.getTicketsCache<Pedido>();

      if (cachedPedidos && cachedPedidos.length > 0) {
        return {
          data: cachedPedidos,
          isOfflineData: true,
        };
      }

      // Sem dados na API e sem cache
      return {
        data: [],
        isOfflineData: true,
        error: 'Sem conexão de rede e sem ingressos armazenados offline neste dispositivo.',
      };
    }
  },

  /**
   * Sincroniza operações pendentes na fila offline.
   * Chamado quando a conectividade é restaurada.
   */
  async syncPendingOperations(): Promise<void> {
    const queue = await storage.getSyncQueue<any>();
    if (queue.length === 0) return;

    console.log(`Sincronizando ${queue.length} operação(ões) pendente(s)...`);

    const failedOps: any[] = [];

    for (const operation of queue) {
      try {
        switch (operation.type) {
          case 'CREATE_PEDIDO':
            await api.post('/pedidos', operation.data);
            break;
          default:
            console.warn('Operação desconhecida na fila de sync:', operation.type);
        }
      } catch (error) {
        console.error('Falha ao sincronizar operação:', operation.type, error);
        failedOps.push(operation);
      }
    }

    // Salva apenas as operações que falharam para nova tentativa
    await storage.saveSyncQueue(failedOps);

    if (failedOps.length === 0) {
      console.log('Todas as operações offline foram sincronizadas com sucesso!');
    } else {
      console.warn(`${failedOps.length} operação(ões) falharam e serão reenviadas.`);
    }
  },
};
export default ticketService;
