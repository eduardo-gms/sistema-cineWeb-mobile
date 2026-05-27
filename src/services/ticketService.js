import storage from './storage';
export const ticketService = {
    /**
     * Sincronização inteligente de Ingressos (DB Sync)
     * Tenta carregar os ingressos da API NestJS. Se houver sucesso, salva localmente para fins offline.
     * Se houver falha de rede (offline), recupera silenciosamente a cópia salva no storage local.
     */
    async syncTickets() {
        try {
            // 1. Tenta buscar da API REST (com timeout curto para detecção ágil de offline)
            // Em produção real, o endpoint pode ser '/ingressos/meus' ou '/pedidos/meus':
            // const response = await api.get<Ingresso[]>('/ingressos/meus', { timeout: 4000 });
            // const tickets = response.data;
            // Para fins de demonstração robusta, simulamos a requisição de API com sucesso:
            const tickets = await this._fetchMockTicketsFromAPI();
            // 2. Sincroniza salvando a lista atualizada localmente no cache seguro
            await storage.saveTicketsCache(tickets);
            return {
                data: tickets,
                isOfflineData: false,
            };
        }
        catch (error) {
            console.warn('Falha ao conectar com a API CineWeb. Iniciando modo offline (DB Sync)...');
            // 3. Em caso de falha de conexão, recupera o cache local no dispositivo
            const cachedTickets = await storage.getTicketsCache();
            if (cachedTickets && cachedTickets.length > 0) {
                return {
                    data: cachedTickets,
                    isOfflineData: true,
                };
            }
            // Se não há dados na API e nem no cache
            return {
                data: [],
                isOfflineData: true,
                error: 'Sem conexão de rede e sem ingressos armazenados offline neste dispositivo.',
            };
        }
    },
    /**
     * Mock auxiliar para simular retorno de rede da API
     */
    _fetchMockTicketsFromAPI() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: 'ticket-001-avengers',
                        pedidoId: 'pedido-987',
                        sessaoId: 'sessao-11',
                        poltrona: 'G-12',
                        tipo: 'Inteira',
                        valorPago: 32.0,
                        sessao: {
                            id: 'sessao-11',
                            filmeId: 'filme-avengers',
                            salaId: 'sala-3',
                            data: new Date().toISOString(), // Hoje
                            horario: '20:30',
                            valorIngresso: 32.0,
                            filme: {
                                id: 'filme-avengers',
                                titulo: 'Vingadores: Ultimato',
                                duracao: 181,
                                sinopse: 'Após Thanos eliminar metade das criaturas vivas, os Vingadores devem se reunir para reverter suas ações e restaurar a harmonia no universo.',
                                elenco: 'Robert Downey Jr., Chris Evans, Mark Ruffalo, Chris Hemsworth',
                                generoId: 'genero-acao',
                                classificacaoEtaria: '14 Anos',
                                dataInicioExibicao: '2026-04-01',
                                dataFimExibicao: '2026-06-30',
                                status: 'Em Cartaz',
                                genero: { id: 'genero-acao', nome: 'Ação / Ficção' }
                            },
                            sala: {
                                id: 'sala-3',
                                numero: 3,
                                capacidade: 180
                            }
                        }
                    },
                    {
                        id: 'ticket-002-dune',
                        pedidoId: 'pedido-988',
                        sessaoId: 'sessao-12',
                        poltrona: 'E-08',
                        tipo: 'Meia',
                        valorPago: 18.0,
                        sessao: {
                            id: 'sessao-12',
                            filmeId: 'filme-dune',
                            salaId: 'sala-1',
                            data: new Date(Date.now() + 86400000).toISOString(), // Amanhã
                            horario: '17:00',
                            valorIngresso: 36.0,
                            filme: {
                                id: 'filme-dune',
                                titulo: 'Duna: Parte Dois',
                                duracao: 166,
                                sinopse: 'Paul Atreides se une a Chani e aos Fremen enquanto busca vingança contra os conspiradores que destruíram sua família.',
                                elenco: 'Timothée Chalamet, Zendaya, Rebecca Ferguson',
                                generoId: 'genero-sci-fi',
                                classificacaoEtaria: '12 Anos',
                                dataInicioExibicao: '2026-05-01',
                                dataFimExibicao: '2026-07-15',
                                status: 'Em Cartaz',
                                genero: { id: 'genero-sci-fi', nome: 'Ficção Científica' }
                            },
                            sala: {
                                id: 'sala-1',
                                numero: 1,
                                capacidade: 220
                            }
                        }
                    }
                ]);
            }, 1500); // Latência simulada de rede
        });
    }
};
export default ticketService;
