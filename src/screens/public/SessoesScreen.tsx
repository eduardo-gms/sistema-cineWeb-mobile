import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import sessionService from '../../services/sessionService';
import { Sessao } from '../../@types';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuthStore } from '../../store/useAuthStore';

export default function SessoesScreen() {
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated);

  const filmeIdFiltro = route.params?.filmeId;

  useEffect(() => {
    carregarSessoes();
  }, []);

  const carregarSessoes = async () => {
    try {
      const data = await sessionService.getSessoes();
      setSessoes(data);
    } catch (error) {
      console.error('Erro ao buscar sessões:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComprar = (sessao: Sessao) => {
    if (!isAuthenticated) {
      navigation.navigate('LoginStack', { screen: 'Login' });
    } else {
      navigation.navigate('Checkout', { sessao });
    }
  };

  const renderSessao = ({ item }: { item: Sessao }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardBody}>
          <Text style={styles.title}>{item.filme?.titulo || 'Filme'}</Text>
          <Text style={styles.subtitle}>
            Sala {item.sala?.numero || '?'} - Capacidade: {item.sala?.capacidade || '?'}
          </Text>
          <Text style={styles.details}>
            Data: {new Date(item.data).toLocaleDateString()} às {item.horario}
          </Text>
          <Text style={styles.price}>
            Ingresso (Inteira): R$ {item.valorIngresso.toFixed(2)}
          </Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => handleComprar(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>COMPRAR</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  const sessoesExibidas = filmeIdFiltro ? sessoes.filter(s => String(s.filmeId) === String(filmeIdFiltro)) : sessoes;

  return (
    <View style={styles.container}>
      {filmeIdFiltro && (
        <View style={styles.filterBar}>
          <Text style={styles.filterText}>Mostrando apenas sessões do filme selecionado.</Text>
          <TouchableOpacity onPress={() => navigation.setParams({ filmeId: null })} style={styles.clearFilterButton}>
            <Text style={styles.clearFilterText}>Limpar</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={sessoesExibidas}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderSessao}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma sessão agendada.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F13',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0F13',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#1E1E24',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
  },
  cardBody: {
    padding: 16,
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#AAA',
    fontSize: 14,
    marginBottom: 8,
  },
  details: {
    color: '#CCC',
    fontSize: 14,
    marginBottom: 4,
  },
  price: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#FFF',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyText: {
    color: '#AAA',
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E1E24',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  filterText: {
    color: '#AAA',
    fontSize: 12,
    flex: 1,
  },
  clearFilterButton: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  clearFilterText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
