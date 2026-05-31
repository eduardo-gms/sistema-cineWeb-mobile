import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Sessao, Pedido, LancheCombo } from '../../@types';
import api from '../../services/api';

interface IngressoCarrinho {
  sessaoId: string;
  tipo: 'Inteira' | 'Meia';
  poltrona: string;
  fila: number;
  numero: number;
  valorUnitario: number;
}

interface LancheCarrinho extends LancheCombo {
  quantidade: number;
  subTotal: number;
}

export default function CheckoutScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const sessao = route.params?.sessao as Sessao;

  const [pedidosRealizados, setPedidosRealizados] = useState<Pedido[]>([]);
  const [lanchesDisponiveis, setLanchesDisponiveis] = useState<LancheCombo[]>([]);

  const [ingressosCarrinho, setIngressosCarrinho] = useState<IngressoCarrinho[]>([]);
  const [lanchesCarrinho, setLanchesCarrinho] = useState<LancheCarrinho[]>([]);

  const [loadingData, setLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [resPedidos, resLanches] = await Promise.all([
        api.get('/pedidos'),
        api.get('/lanche-combos')
      ]);
      setPedidosRealizados(resPedidos.data);
      setLanchesDisponiveis(resLanches.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível carregar os dados da sessão.');
    } finally {
      setLoadingData(false);
    }
  };

  const getAssentosOcupados = () => {
    const ocupados: string[] = [];
    pedidosRealizados.forEach(p => {
      (p.ingressos || []).forEach((item: any) => {
        if (String(item.sessaoId) === String(sessao.id)) {
          ocupados.push(item.poltrona);
        }
      });
    });
    return ocupados;
  };

  const toggleAssento = (fila: number, numero: number) => {
    const jaNoCarrinho = ingressosCarrinho.find(i => i.fila === fila && i.numero === numero);
    if (jaNoCarrinho) {
      setIngressosCarrinho(prev => prev.filter(i => !(i.fila === fila && i.numero === numero)));
    } else {
      const novo: IngressoCarrinho = {
        sessaoId: String(sessao.id),
        tipo: 'Inteira',
        poltrona: `${fila}-${numero}`,
        fila,
        numero,
        valorUnitario: sessao.valorIngresso
      };
      setIngressosCarrinho(prev => [...prev, novo]);
    }
  };

  const setTipoIngresso = (index: number, tipo: 'Inteira' | 'Meia') => {
    setIngressosCarrinho(prev => prev.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          tipo,
          valorUnitario: tipo === 'Inteira' ? sessao.valorIngresso : sessao.valorIngresso / 2
        };
      }
      return item;
    }));
  };

  const addLanche = (lancheOriginal: LancheCombo) => {
    const idx = lanchesCarrinho.findIndex(l => String(l.id) === String(lancheOriginal.id));
    if (idx >= 0) {
      const currentQtd = lanchesCarrinho[idx].quantidade;
      if (currentQtd + 1 > lancheOriginal.estoque) {
        Alert.alert('Esgotado', 'Estoque insuficiente para este lanche.');
        return;
      }
      const newCarrinho = [...lanchesCarrinho];
      newCarrinho[idx].quantidade += 1;
      newCarrinho[idx].subTotal = newCarrinho[idx].quantidade * newCarrinho[idx].valorUnitario;
      setLanchesCarrinho(newCarrinho);
    } else {
      if (lancheOriginal.estoque < 1) {
        Alert.alert('Esgotado', 'Este lanche está esgotado.');
        return;
      }
      setLanchesCarrinho(prev => [...prev, {
        ...lancheOriginal,
        quantidade: 1,
        subTotal: lancheOriginal.valorUnitario
      }]);
    }
  };

  const removeLanche = (id: string | number) => {
    setLanchesCarrinho(prev => {
      const idx = prev.findIndex(l => String(l.id) === String(id));
      if (idx === -1) return prev;
      
      const newCarrinho = [...prev];
      if (newCarrinho[idx].quantidade > 1) {
        newCarrinho[idx].quantidade -= 1;
        newCarrinho[idx].subTotal = newCarrinho[idx].quantidade * newCarrinho[idx].valorUnitario;
        return newCarrinho;
      } else {
        return prev.filter(l => String(l.id) !== String(id));
      }
    });
  };

  const totalIngressos = ingressosCarrinho.reduce((acc, i) => acc + i.valorUnitario, 0);
  const totalLanches = lanchesCarrinho.reduce((acc, l) => acc + l.subTotal, 0);
  const totalGeral = totalIngressos + totalLanches;

  const handleFinalizarVenda = async () => {
    if (ingressosCarrinho.length === 0 && lanchesCarrinho.length === 0) {
      Alert.alert('Aviso', 'Adicione pelo menos um ingresso ou lanche ao carrinho.');
      return;
    }

    setIsSubmitting(true);
    try {
      const qtdInteira = ingressosCarrinho.filter(i => i.tipo === 'Inteira').length;
      const qtdMeia = ingressosCarrinho.filter(i => i.tipo === 'Meia').length;

      const pedido = {
        qtdInteira,
        qtdMeia,
        ingressos: ingressosCarrinho.map(i => ({
          sessaoId: i.sessaoId,
          poltrona: i.poltrona,
          tipo: i.tipo
        })),
        lanches: lanchesCarrinho.map(l => ({
          lancheComboId: l.id,
          quantidade: l.quantidade
        }))
      };

      await api.post('/pedidos', pedido);
      Alert.alert('Sucesso', 'Compra realizada com sucesso!', [
        { text: 'OK', onPress: () => navigation.navigate('Minha Conta') }
      ]);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Erro', error.response?.data?.message || 'Ocorreu um erro ao processar sua compra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  const ocupados = getAssentosOcupados();
  const seats = sessao.sala ? Array.from({ length: sessao.sala.capacidade }).map((_, i) => {
    const fila = Math.floor(i / 10) + 1;
    const numero = (i % 10) + 1;
    const key = `${fila}-${numero}`;
    const isOcupado = ocupados.includes(key);
    const isSelected = ingressosCarrinho.some(item => item.fila === fila && item.numero === numero);
    
    let backgroundColor = '#13131A';
    let borderColor = '#2D2D37';
    let textColor = '#8F8F9F';
    
    if (isOcupado) {
      backgroundColor = '#2D2D37';
      borderColor = '#2D2D37';
      textColor = '#5A5A6E';
    } else if (isSelected) {
      backgroundColor = '#FFF';
      borderColor = '#FFF';
      textColor = '#000';
    }

    return (
      <TouchableOpacity 
        key={key}
        style={[styles.seat, { backgroundColor, borderColor }]}
        disabled={isOcupado}
        onPress={() => toggleAssento(fila, numero)}
      >
        <Text style={[styles.seatText, { color: textColor, fontWeight: isSelected ? 'bold' : 'normal' }]}>
          {isOcupado ? 'X' : numero}
        </Text>
      </TouchableOpacity>
    );
  }) : [];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Info da Sessão */}
        <View style={styles.cardInfo}>
          <Text style={styles.title}>{sessao.filme?.titulo}</Text>
          <Text style={styles.subtitle}>
            Sala {sessao.sala?.numero} - {new Date(sessao.data).toLocaleDateString()} às {sessao.horario}
          </Text>
        </View>

        {/* Mapa de Poltronas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Selecione as Poltronas</Text>
          <Text style={styles.sectionSubtitle}>Tela do Cinema ↑</Text>
          
          <View style={styles.seatsGrid}>
            {seats}
          </View>
          
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}><View style={[styles.legendBox, { backgroundColor: '#13131A' }]} /><Text style={styles.legendText}>Livre</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendBox, { backgroundColor: '#FFF' }]} /><Text style={styles.legendText}>Sel.</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendBox, { backgroundColor: '#2D2D37' }]} /><Text style={styles.legendText}>Ocupado</Text></View>
          </View>
        </View>

        {/* Lista de Ingressos Selecionados */}
        {ingressosCarrinho.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingressos</Text>
            {ingressosCarrinho.map((ing, idx) => (
              <View key={`${ing.fila}-${ing.numero}`} style={styles.cartItem}>
                <View>
                  <Text style={styles.cartItemTitle}>Fila {ing.fila} - Assento {ing.numero}</Text>
                  <Text style={styles.cartItemSub}>R$ {ing.valorUnitario.toFixed(2)}</Text>
                </View>
                
                <View style={styles.toggleContainer}>
                  <TouchableOpacity 
                    style={[styles.toggleBtn, ing.tipo === 'Inteira' && styles.toggleBtnActive]}
                    onPress={() => setTipoIngresso(idx, 'Inteira')}
                  >
                    <Text style={[styles.toggleBtnText, ing.tipo === 'Inteira' && styles.toggleBtnTextActive]}>Int</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.toggleBtn, ing.tipo === 'Meia' && styles.toggleBtnActive]}
                    onPress={() => setTipoIngresso(idx, 'Meia')}
                  >
                    <Text style={[styles.toggleBtnText, ing.tipo === 'Meia' && styles.toggleBtnTextActive]}>Meia</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Lanches */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Adicione Combos e Lanches</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.snackScroll}>
            {lanchesDisponiveis.map(lanche => {
              const inCart = lanchesCarrinho.find(l => String(l.id) === String(lanche.id))?.quantidade || 0;
              return (
                <View key={lanche.id} style={styles.snackCard}>
                  <Text style={styles.snackTitle} numberOfLines={1}>{lanche.nome}</Text>
                  <Text style={styles.snackPrice}>R$ {lanche.valorUnitario.toFixed(2)}</Text>
                  <Text style={styles.snackStock}>{lanche.estoque > 0 ? `Disp: ${lanche.estoque}` : 'Esgotado'}</Text>
                  
                  <View style={styles.snackActions}>
                    <TouchableOpacity style={styles.snackBtn} onPress={() => removeLanche(lanche.id!)} disabled={inCart === 0}>
                      <Text style={styles.snackBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.snackQtd}>{inCart}</Text>
                    <TouchableOpacity style={styles.snackBtn} onPress={() => addLanche(lanche)} disabled={lanche.estoque === 0}>
                      <Text style={styles.snackBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

      </ScrollView>

      {/* Footer Fixo */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.totalLabel}>Total a Pagar</Text>
          <Text style={styles.totalValue}>R$ {totalGeral.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={[styles.btnFinalizar, (ingressosCarrinho.length === 0 && lanchesCarrinho.length === 0) && { opacity: 0.5 }]} onPress={handleFinalizarVenda} disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.btnFinalizarText}>FINALIZAR</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F13',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  cardInfo: {
    backgroundColor: '#1E1E24',
    padding: 20,
    margin: 16,
    borderRadius: 8,
  },
  title: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#AAA',
    fontSize: 14,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: '#5A5A6E',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  seatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  seat: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatText: {
    fontSize: 12,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  legendText: {
    color: '#AAA',
    fontSize: 12,
  },
  cartItem: {
    backgroundColor: '#1E1E24',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  cartItemTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cartItemSub: {
    color: '#8F8F9F',
    fontSize: 12,
    marginTop: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#13131A',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2D2D37',
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  toggleBtnActive: {
    backgroundColor: '#FFF',
  },
  toggleBtnText: {
    color: '#8F8F9F',
    fontSize: 12,
    fontWeight: 'bold',
  },
  toggleBtnTextActive: {
    color: '#000',
  },
  snackScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  snackCard: {
    backgroundColor: '#1E1E24',
    width: 140,
    padding: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  snackTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  snackPrice: {
    color: '#4CAF50',
    fontSize: 14,
    marginBottom: 4,
  },
  snackStock: {
    color: '#5A5A6E',
    fontSize: 11,
    marginBottom: 12,
  },
  snackActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#13131A',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2D2D37',
  },
  snackBtn: {
    padding: 8,
    width: 32,
    alignItems: 'center',
  },
  snackBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  snackQtd: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: '#1E1E24',
    padding: 16,
    paddingBottom: 32, // Safe area
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  totalLabel: {
    color: '#8F8F9F',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  totalValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  btnFinalizar: {
    backgroundColor: '#FFF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    minWidth: 140,
    alignItems: 'center',
  },
  btnFinalizarText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
});
