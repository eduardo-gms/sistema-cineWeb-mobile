import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ingresso } from '../../@types';

const { width } = Dimensions.get('window');

interface TicketReceiptScreenProps {
  route: {
    params: {
      ticket: Ingresso;
    };
  };
}

export default function TicketReceiptScreen({ route }: TicketReceiptScreenProps) {
  const { ticket } = route.params;

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Comprovante de Ingresso</Text>
        <Text style={styles.headerSubtitle}>CineWeb — Cinema Digital</Text>
      </View>

      {/* Card do comprovante */}
      <View style={styles.receiptCard}>
        {/* Filme */}
        <View style={styles.section}>
          <Text style={styles.movieTitle}>{ticket.sessao?.filme?.titulo || 'Filme'}</Text>
          {ticket.sessao?.filme?.genero?.nome && (
            <View style={styles.genreBadge}>
              <Text style={styles.genreText}>{ticket.sessao.filme.genero.nome}</Text>
            </View>
          )}
        </View>

        {/* Detalhes */}
        <View style={styles.divider} />
        <View style={styles.section}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>DATA</Text>
              <Text style={styles.detailValue}>{formatDate(ticket.sessao?.data)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>HORÁRIO</Text>
              <Text style={styles.detailValue}>{ticket.sessao?.horario}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>SALA</Text>
              <Text style={styles.detailValue}>
                {ticket.sessao?.sala ? `Sala ${String(ticket.sessao.sala.numero).padStart(2, '0')}` : '-'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>POLTRONA</Text>
              <Text style={styles.detailValueHighlight}>{ticket.poltrona}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>TIPO</Text>
              <Text style={styles.detailValue}>{ticket.tipo}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>VALOR PAGO</Text>
              <Text style={styles.detailValue}>
                R$ {ticket.valorPago.toFixed(2).replace('.', ',')}
              </Text>
            </View>
          </View>

          {ticket.sessao?.filme?.classificacaoEtaria && (
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>CLASSIFICAÇÃO</Text>
                <Text style={styles.detailValue}>{ticket.sessao.filme.classificacaoEtaria}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>DURAÇÃO</Text>
                <Text style={styles.detailValue}>{ticket.sessao.filme.duracao} min</Text>
              </View>
            </View>
          )}
        </View>

        {/* Divisor com cortes */}
        <View style={styles.cutoutDivider}>
          <View style={[styles.cutout, styles.cutoutLeft]} />
          <View style={styles.dottedLine} />
          <View style={[styles.cutout, styles.cutoutRight]} />
        </View>

        {/* QR Code */}
        <View style={styles.qrSection}>
          <Text style={styles.qrInstruction}>
            Apresente este QR Code na portaria do cinema
          </Text>
          <View style={styles.qrContainer}>
            <QRCode
              value={JSON.stringify({
                ticketId: ticket.id,
                pedidoId: ticket.pedidoId,
                sessaoId: ticket.sessaoId,
                poltrona: ticket.poltrona,
                hash: `cineweb-${ticket.id}-${ticket.pedidoId}`,
              })}
              size={140}
              color="#FFFFFF"
              backgroundColor="#1B1B22"
            />
          </View>
          <Text style={styles.ticketId}>
            {ticket.id.toUpperCase()}
          </Text>
        </View>
      </View>

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
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8F8F9F',
    marginTop: 4,
  },
  receiptCard: {
    backgroundColor: '#1B1B22',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2D2D37',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  section: {
    padding: 20,
  },
  movieTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  genreBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E50914',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  genreText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: '#2D2D37',
    marginHorizontal: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    color: '#8F8F9F',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  detailValueHighlight: {
    color: '#E50914',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cutoutDivider: {
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
    backgroundColor: '#0F0F13',
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#2D2D37',
  },
  cutoutLeft: { left: -10 },
  cutoutRight: { right: -10 },
  dottedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: '#2D2D37',
    borderStyle: 'dashed',
    marginHorizontal: 10,
  },
  qrSection: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#17171D',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  qrInstruction: {
    color: '#8F8F9F',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: '#1B1B22',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D2D37',
    marginBottom: 12,
  },
  ticketId: {
    color: '#5A5A6E',
    fontSize: 10,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  footerSpacing: {
    height: 40,
  },
});
