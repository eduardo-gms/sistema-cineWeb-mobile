import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import movieService from '../../services/movieService';
import { Filme } from '../../@types';

export default function FilmesScreen() {
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  useEffect(() => {
    carregarFilmes();
  }, []);

  const carregarFilmes = async () => {
    try {
      const data = await movieService.getFilmes();
      setFilmes(data);
    } catch (error) {
      console.error('Erro ao buscar filmes:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderFilme = ({ item }: { item: Filme }) => {
    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Sessões', { filmeId: item.id })}
      >
        <View style={styles.cardBody}>
          <Text style={styles.title}>{item.titulo}</Text>
          <Text style={styles.subtitle}>{item.genero?.nome || 'Gênero'} | {item.duracao} min</Text>
          <Text style={styles.details} numberOfLines={2}>
            {item.sinopse}
          </Text>
          <Text style={styles.details}>
            <Text style={styles.bold}>Exibição:</Text> {new Date(item.dataInicioExibicao).toLocaleDateString()} até {new Date(item.dataFimExibicao).toLocaleDateString()}
          </Text>
          <Text style={styles.badge}>{item.classificacaoEtaria}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filmes}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderFilme}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum filme em cartaz.</Text>}
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
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
    color: '#FFF',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#333',
    color: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    marginTop: 8,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#AAA',
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
  },
});
