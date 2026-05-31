import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ticketService, { SyncTicketsResult } from '../../services/ticketService';
import { Pedido } from '../../@types';
import { useAuthStore } from '../../store/useAuthStore';

export default function MyTicketsScreen() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const logout = useAuthStore((state: any) => state.logout);
  const navigation = useNavigation<any>();

  const loadTickets = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMsg(null);

    try {
      const result: SyncTicketsResult = await ticketService.syncTickets();
      setPedidos(result.data);
      setIsOffline(result.isOfflineData);
      if (result.error) {
        setErrorMsg(result.error);
      }
    } catch (err) {
      setErrorMsg('Ocorreu um erro inesperado ao processar os ingressos.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTickets();
    });
    return unsubscribe;
  }, [navigation, loadTickets]);

  const onRefresh = () => {
    loadTickets(true);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Sincronizando seus pedidos...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor="#E50914"
          colors={['#E50914']}
        />
      }
    >
      <View style={styles.accountHeader}>
        <Text style={styles.accountTitle}>Minha Conta</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.syncStatusBadge, isOffline ? styles.statusOffline : styles.statusOnline]}>
        <View style={[styles.statusDot, isOffline ? styles.dotOffline : styles.dotOnline]} />
        <Text style={styles.syncStatusText}>
          {isOffline
            ? 'Modo Offline - Exibindo Histórico Local'
            : 'Sincronizado e Atualizado'}
        </Text>
      </View>

      {errorMsg && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadTickets()}>
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      {pedidos.length === 0 && !errorMsg ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Nenhum pedido encontrado</Text>
          <Text style={styles.emptySubtitle}>
            Seus pedidos e comprovantes aparecerão aqui. Compre pelo app e aproveite o cinema!
          </Text>
          <TouchableOpacity style={styles.buyButton} onPress={() => navigation.navigate('Filmes')}>
            <Text style={styles.buyButtonText}>Ver Filmes</Text>
          </TouchableOpacity>
        </View>
      ) : (
        pedidos.map((pedido: Pedido) => {
          const ingressosCount = pedido.ingressos?.length || 0;
          const lanchesCount = pedido.lanches?.reduce((acc, curr) => acc + curr.quantidade, 0) || 0;

          return (
            <TouchableOpacity 
              key={pedido.id} 
              style={styles.orderCard}
              onPress={() => navigation.navigate('TicketReceipt', { pedidoId: pedido.id })}
              activeOpacity={0.8}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Pedido #{String(pedido.id).substring(0, 8)}</Text>
                <Text style={styles.orderDate}>
                  {new Date(pedido.criadoEm || '').toLocaleDateString('pt-BR')}
                </Text>
              </View>

              <View style={styles.orderBody}>
                <View style={styles.badgesContainer}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{ingressosCount} Ingresso(s)</Text>
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{lanchesCount} Lanche(s)</Text>
                  </View>
                </View>

                <View style={styles.totalContainer}>
                  <Text style={styles.totalLabel}>TOTAL</Text>
                  <Text style={styles.totalValue}>R$ {pedido.valorTotal?.toFixed(2).replace('.', ',') || '0,00'}</Text>
                </View>
              </View>
              
              <View style={styles.orderFooter}>
                <Text style={styles.footerText}>Ver Comprovante Detalhado →</Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}
      <View style={styles.footerSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F13',
  },
  contentContainer: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0F0F13',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#8F8F9F',
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  syncStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 20,
  },
  statusOnline: {
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.3)',
  },
  statusOffline: {
    backgroundColor: 'rgba(230, 126, 34, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(230, 126, 34, 0.3)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dotOnline: {
    backgroundColor: '#2ECC71',
  },
  dotOffline: {
    backgroundColor: '#E67E22',
  },
  syncStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubtitle: {
    color: '#8F8F9F',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buyButton: {
    borderColor: '#FFFFFF',
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D37',
  },
  accountTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  orderCard: {
    backgroundColor: '#1B1B22',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D2D37',
    marginBottom: 16,
    overflow: 'hidden',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#22222B',
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D37',
  },
  orderId: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  orderDate: {
    color: '#8F8F9F',
    fontSize: 14,
  },
  orderBody: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: '#333340',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeText: {
    color: '#E0E0E0',
    fontSize: 12,
    fontWeight: '600',
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    color: '#8F8F9F',
    fontSize: 10,
    fontWeight: 'bold',
  },
  totalValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderFooter: {
    padding: 12,
    backgroundColor: '#17171D',
    alignItems: 'center',
  },
  footerText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  footerSpacing: {
    height: 40,
  },
});
