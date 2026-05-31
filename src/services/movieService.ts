import api from './api';
import { Filme } from '../@types';

export const movieService = {
  async getFilmes(): Promise<Filme[]> {
    const response = await api.get<Filme[]>('/filmes');
    return response.data;
  },

  async getFilmeById(id: string): Promise<Filme> {
    const response = await api.get<Filme>(`/filmes/${id}`);
    return response.data;
  }
};

export default movieService;
