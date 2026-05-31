import api from './api';
import { Sessao } from '../@types';

export const sessionService = {
  async getSessoes(): Promise<Sessao[]> {
    const response = await api.get<Sessao[]>('/sessoes');
    return response.data;
  },

  async getSessaoById(id: string): Promise<Sessao> {
    const response = await api.get<Sessao>(`/sessoes/${id}`);
    return response.data;
  }
};

export default sessionService;
