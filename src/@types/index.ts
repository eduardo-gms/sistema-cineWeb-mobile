export interface Genero {
  id: string;
  nome: string;
}

export interface Filme {
  id: string;
  titulo: string;
  duracao: number; // em minutos
  sinopse: string;
  elenco: string;
  generoId: string;
  classificacaoEtaria: string;
  dataInicioExibicao: string;
  dataFimExibicao: string;
  status: string;
  genero?: Genero;
}

export interface Sala {
  id: string;
  numero: number;
  capacidade: number;
}

export interface Sessao {
  id: string;
  filmeId: string;
  salaId: string;
  data: string; // ISO String
  horario: string; // "HH:MM"
  valorIngresso: number;
  filme?: Filme;
  sala?: Sala;
}

export interface LancheCombo {
  id: string;
  nome: string;
  descricao: string;
  valorUnitario: number;
  estoque: number;
}

export interface Ingresso {
  id: string;
  pedidoId: string;
  sessaoId: string;
  poltrona: string;
  tipo: 'Inteira' | 'Meia';
  valorPago: number;
  sessao?: Sessao;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: 'CUSTOMER';
}

export interface AuthResponse {
  token: string;
  user: Usuario;
}
