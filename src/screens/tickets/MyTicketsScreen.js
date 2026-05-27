import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Dimensions, } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import ticketService from '../../services/ticketService';
const { width } = Dimensions.get('window');
export default function MyTicketsScreen() {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isOffline, setIsOffline] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    // Carrega e sincroniza os ingressos
    const loadTickets = useCallback(async (showRefreshing = false) => {
        if (showRefreshing) {
            setIsRefreshing(true);
        }
        else {
            setIsLoading(true);
        }
        setErrorMsg(null);
        try {
            const result = await ticketService.syncTickets();
            setTickets(result.data);
            setIsOffline(result.isOfflineData);
            if (result.error) {
                setErrorMsg(result.error);
            }
        }
        catch (err) {
            setErrorMsg('Ocorreu um erro inesperado ao processar os ingressos.');
        }
        finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);
    useEffect(() => {
        loadTickets();
    }, [loadTickets]);
    const onRefresh = () => {
        loadTickets(true);
    };
    // Formata a exibição amigável de datas
    const formatDate = (isoString) => {
        if (!isoString)
            return '';
        const date = new Date(isoString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };
    if (isLoading) {
        return (<View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#E50914"/>
        <Text style={styles.loadingText}>Sincronizando ingressos digitais...</Text>
      </View>);
    }
    return (<ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#E50914" colors={['#E50914']}/>}>
      {/* Indicador de Status da Sincronização Inteligente (DB Sync) */}
      <View style={[styles.syncStatusBadge, isOffline ? styles.statusOffline : styles.statusOnline]}>
        <View style={[styles.statusDot, isOffline ? styles.dotOffline : styles.dotOnline]}/>
        <Text style={styles.syncStatusText}>
          {isOffline
            ? 'Modo Offline - Exibindo Ingressos Salvos Localmente'
            : 'Sincronizado e Atualizado com a API CineWeb'}
        </Text>
      </View>

      {errorMsg && (<View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadTickets()}>
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>)}

      {tickets.length === 0 && !errorMsg ? (<View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Nenhum ingresso ativo</Text>
          <Text style={styles.emptySubtitle}>
            Seus ingressos comprados aparecerão aqui. Compre pelo app e acesse o cinema sem fila!
          </Text>
          <TouchableOpacity style={styles.buyButton} onPress={() => loadTickets()}>
            <Text style={styles.buyButtonText}>Atualizar Lista</Text>
          </TouchableOpacity>
        </View>) : (tickets.map((ticket) => (<View key={ticket.id} style={styles.ticketCard}>
            {/* Cabeçalho do Bilhete */}
            <View style={styles.ticketHeader}>
              <Text style={styles.movieTitle} numberOfLines={2}>
                {ticket.sessao?.filme?.titulo}
              </Text>
              <View style={styles.genreBadge}>
                <Text style={styles.genreText}>{ticket.sessao?.filme?.genero?.nome}</Text>
              </View>
            </View>

            {/* Informações da Sessão */}
            <View style={styles.ticketBody}>
              <View style={styles.infoRow}>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>DATA</Text>
                  <Text style={styles.infoValue}>{formatDate(ticket.sessao?.data)}</Text>
                </View>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>HORÁRIO</Text>
                  <Text style={styles.infoValue}>{ticket.sessao?.horario}</Text>
                </View>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>SALA</Text>
                  <Text style={styles.infoValue}>0{ticket.sessao?.sala?.numero}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>POLTRONA</Text>
                  <Text style={styles.infoValueHighlight}>{ticket.poltrona}</Text>
                </View>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>TIPO</Text>
                  <Text style={styles.infoValue}>{ticket.tipo}</Text>
                </View>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>VALOR</Text>
                  <Text style={styles.infoValue}>
                    R$ {ticket.valorPago.toFixed(2).replace('.', ',')}
                  </Text>
                </View>
              </View>
            </View>

            {/* Divisor Físico do Bilhete com Cortes Semicirculares e Linha Pontilhada */}
            <View style={styles.dividerContainer}>
              <View style={[styles.cutout, styles.cutoutLeft]}/>
              <View style={styles.dottedLine}/>
              <View style={[styles.cutout, styles.cutoutRight]}/>
            </View>

            {/* Rodapé com QR Code para Validação Offline na Portaria do Cinema */}
            <View style={styles.ticketFooter}>
              <Text style={styles.footerInstruction}>
                Apresente este QR Code na portaria da sala de exibição.
              </Text>
              
              <View style={styles.qrContainer}>
                <QRCode value={JSON.stringify({
                ticketId: ticket.id,
                poltrona: ticket.poltrona,
                sessaoId: ticket.sessaoId,
                hash: `cineweb-security-hash-${ticket.id}`,
            })} size={120} color="#FFFFFF" backgroundColor="#1B1B22"/>
              </View>
              
              <Text style={styles.ticketIdText}>CÓDIGO: {ticket.id.toUpperCase()}</Text>
            </View>
          </View>)))}

      {/* Espaçamento final */}
      <View style={styles.footerSpacing}/>
    </ScrollView>);
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
        backgroundColor: 'rgba(229, 9, 20, 0.1)',
        borderWidth: 1,
        borderColor: '#E50914',
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
        backgroundColor: '#E50914',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    retryButtonText: {
        color: '#FFFFFF',
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
        borderColor: '#E50914',
        borderWidth: 1.5,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    buyButtonText: {
        color: '#E50914',
        fontSize: 14,
        fontWeight: 'bold',
    },
    ticketCard: {
        backgroundColor: '#1B1B22',
        borderRadius: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#2D2D37',
    },
    ticketHeader: {
        padding: 20,
        borderBottomWidth: 1,
        borderColor: '#2D2D37',
    },
    movieTitle: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    genreBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#E50914',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
    },
    genreText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    ticketBody: {
        padding: 20,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    infoCol: {
        flex: 1,
    },
    infoLabel: {
        color: '#8F8F9F',
        fontSize: 10,
        fontWeight: '600',
        marginBottom: 4,
    },
    infoValue: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    infoValueHighlight: {
        color: '#E50914',
        fontSize: 16,
        fontWeight: 'bold',
    },
    dividerContainer: {
        height: 20,
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    cutout: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#0F0F13', // Mesma cor do fundo do app para dar efeito de transparência vazada
        position: 'absolute',
        borderWidth: 1,
        borderColor: '#2D2D37',
    },
    cutoutLeft: {
        left: -10,
    },
    cutoutRight: {
        right: -10,
    },
    dottedLine: {
        flex: 1,
        height: 1,
        borderWidth: 1,
        borderColor: '#2D2D37',
        borderStyle: 'dashed',
        marginHorizontal: 10,
    },
    ticketFooter: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#17171D',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    footerInstruction: {
        color: '#8F8F9F',
        fontSize: 11,
        textAlign: 'center',
        marginBottom: 16,
    },
    qrContainer: {
        padding: 14,
        backgroundColor: '#1B1B22',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2D2D37',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    ticketIdText: {
        color: '#8F8F9F',
        fontSize: 10,
        fontFamily: 'monospace',
        marginTop: 4,
    },
    footerSpacing: {
        height: 40,
    },
});
