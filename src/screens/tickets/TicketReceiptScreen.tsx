import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import api from '../../services/api';

interface Comprovante {
  pedidoId: string | number;
  dataCompra: string;
  cliente?: {
    nome: string;
    email: string;
  };
  ingressos: any[];
  lanches: any[];
  resumo: {
    qtdInteira: number;
    qtdMeia: number;
    totalIngressos: number;
    totalLanches: number;
    valorTotalFormatado: string;
  };
}

interface Props {
  route: {
    params: {
      pedidoId: string | number;
    };
  };
  navigation: any;
}

export default function TicketReceiptScreen({ route, navigation }: Props) {
  const { pedidoId } = route.params;
  const [comprovante, setComprovante] = useState<Comprovante | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadComprovante();
  }, [pedidoId]);

  const loadComprovante = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/pedidos/${pedidoId}/comprovante`);
      setComprovante(res.data.comprovante);
    } catch (error: any) {
      console.error(error);
      setErrorMsg('Erro ao carregar os dados do comprovante.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!comprovante) return;
    try {
      setIsGenerating(true);

      const htmlContent = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333; }
              h1 { text-align: center; font-size: 24px; margin-bottom: 20px; color: #000; }
              .header-info { display: flex; justify-content: space-between; border-bottom: 1px solid #CCC; padding-bottom: 10px; margin-bottom: 20px; }
              .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; margin-top: 20px; border-bottom: 2px solid #EEE; padding-bottom: 5px; }
              .item-card { border: 1px solid #EEE; border-radius: 8px; padding: 15px; margin-bottom: 10px; background-color: #FAFAFA; }
              .item-title { font-size: 16px; font-weight: bold; margin-bottom: 5px; color: #111; }
              .item-details { font-size: 14px; color: #555; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th, td { border-bottom: 1px solid #EEE; padding: 8px; text-align: left; }
              th { background-color: #F5F5F5; color: #333; }
              .summary { margin-top: 30px; border-top: 2px solid #000; padding-top: 15px; text-align: right; }
              .summary-total { font-size: 22px; font-weight: bold; color: #000; }
              .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; }
            </style>
          </head>
          <body>
            <h1>CineWeb — Comprovante de Compra</h1>
            
            <div class="header-info">
              <div>
                <strong>Pedido:</strong> #${comprovante.pedidoId}<br/>
                <strong>Data:</strong> ${new Date(comprovante.dataCompra).toLocaleString('pt-BR')}
              </div>
              ${comprovante.cliente ? `
              <div style="text-align: right;">
                <strong>Cliente:</strong><br/>
                ${comprovante.cliente.nome}<br/>
                ${comprovante.cliente.email}
              </div>
              ` : ''}
            </div>

            ${comprovante.ingressos.length > 0 ? `
              <div class="section-title">Ingressos (${comprovante.resumo.totalIngressos})</div>
              ${comprovante.ingressos.map(ing => `
                <div class="item-card">
                  <div class="item-title">${ing.filme} <span style="float:right">${ing.valorFormatado}</span></div>
                  <div class="item-details">
                    Data: ${new Date(ing.data).toLocaleDateString('pt-BR')} às ${ing.horario} &nbsp;|&nbsp; Sala: ${ing.sala}<br/>
                    Poltrona: <strong>${ing.poltrona}</strong> &nbsp;|&nbsp; Tipo: ${ing.tipo}
                  </div>
                </div>
              `).join('')}
            ` : ''}

            ${comprovante.lanches.length > 0 ? `
              <div class="section-title">Lanches & Combos (${comprovante.resumo.totalLanches})</div>
              <table>
                <tr><th>Item</th><th style="text-align:center">Qtd</th><th style="text-align:right">Subtotal</th></tr>
                ${comprovante.lanches.map(l => `
                  <tr>
                    <td>${l.nome}</td>
                    <td style="text-align:center">${l.quantidade}</td>
                    <td style="text-align:right">${l.subtotalFormatado}</td>
                  </tr>
                `).join('')}
              </table>
            ` : ''}

            <div class="summary">
              <div>Ingressos Inteira: ${comprovante.resumo.qtdInteira} &nbsp;|&nbsp; Meia: ${comprovante.resumo.qtdMeia}</div>
              <div class="summary-total"><br/>TOTAL: ${comprovante.resumo.valorTotalFormatado}</div>
            </div>

            <div class="footer">CineWeb — Sistema de Gerenciamento de Cinema</div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });

    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível gerar ou salvar o PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Carregando comprovante...</Text>
      </View>
    );
  }

  if (errorMsg || !comprovante) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: '#FFF' }}>{errorMsg || 'Comprovante não encontrado'}</Text>
        <TouchableOpacity style={styles.btnBack} onPress={() => navigation.goBack()}>
          <Text style={styles.btnBackText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Comprovante de Compra</Text>
          <Text style={styles.headerSubtitle}>CineWeb — Cinema Digital</Text>
        </View>

        <View style={styles.receiptCard}>
          {/* Header do Pedido */}
          <View style={styles.section}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.label}>PEDIDO</Text>
                <Text style={styles.valueHighlight}>#{String(comprovante.pedidoId).substring(0, 8)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.label}>DATA DA COMPRA</Text>
                <Text style={styles.value}>{new Date(comprovante.dataCompra).toLocaleString('pt-BR')}</Text>
              </View>
            </View>

            {comprovante.cliente && (
              <View style={styles.clientBox}>
                <Text style={styles.label}>CLIENTE</Text>
                <Text style={styles.value}>{comprovante.cliente.nome}</Text>
                <Text style={styles.labelDark}>{comprovante.cliente.email}</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* Ingressos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingressos ({comprovante.resumo.totalIngressos})</Text>
            {comprovante.ingressos.map((ing, idx) => (
              <View key={ing.id} style={styles.itemBox}>
                <View style={styles.rowBetween}>
                  <Text style={styles.itemTitle}>{ing.filme}</Text>
                  <Text style={styles.itemPrice}>{ing.valorFormatado}</Text>
                </View>
                <Text style={styles.itemSub}>Sala {ing.sala} — {new Date(ing.data).toLocaleDateString('pt-BR')} às {ing.horario}</Text>
                <View style={styles.rowBetween}>
                  <Text style={styles.itemSub}>Poltrona: <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{ing.poltrona}</Text></Text>
                  <Text style={styles.itemSub}>Tipo: {ing.tipo}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Lanches */}
          {comprovante.lanches.length > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Lanches & Combos ({comprovante.resumo.totalLanches})</Text>
                {comprovante.lanches.map((lanche, idx) => (
                  <View key={idx} style={styles.rowBetween}>
                    <Text style={styles.itemSub}><Text style={{ color: '#FFF' }}>{lanche.quantidade}x</Text> {lanche.nome}</Text>
                    <Text style={styles.itemSub}>{lanche.subtotalFormatado}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Resumo */}
          <View style={styles.divider} />
          <View style={styles.section}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.label}>INTEIRA: {comprovante.resumo.qtdInteira}</Text>
                <Text style={styles.label}>MEIA: {comprovante.resumo.qtdMeia}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.label}>TOTAL</Text>
                <Text style={styles.totalValue}>{comprovante.resumo.valorTotalFormatado}</Text>
              </View>
            </View>
          </View>

          {/* QR Code Unificado */}
          <View style={styles.cutoutDivider}>
            <View style={[styles.cutout, styles.cutoutLeft]} />
            <View style={styles.dottedLine} />
            <View style={[styles.cutout, styles.cutoutRight]} />
          </View>

          <View style={styles.qrSection}>
            <Text style={styles.qrInstruction}>QR Code do Pedido Completo</Text>
            <View style={styles.qrContainer}>
              <QRCode
                value={JSON.stringify({
                  pedidoId: comprovante.pedidoId,
                  hash: `cineweb-order-${comprovante.pedidoId}`
                })}
                size={140}
                color="#FFF"
                backgroundColor="#1B1B22"
              />
            </View>
            <Text style={styles.ticketId}>{String(comprovante.pedidoId).toUpperCase()}</Text>
          </View>

        </View>

      </ScrollView>

      {/* Footer Fixo: Botão de PDF */}
      <View style={styles.footerBar}>
        <TouchableOpacity style={styles.btnPdf} onPress={handleDownloadPDF} disabled={isGenerating}>
          {isGenerating ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.btnPdfText}>BAIXAR COMPROVANTE (PDF)</Text>
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
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0F0F13',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#8F8F9F',
    marginTop: 12,
  },
  btnBack: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
  },
  btnBackText: {
    color: '#000',
    fontWeight: 'bold',
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
    overflow: 'hidden',
    marginBottom: 16,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    color: '#8F8F9F',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  labelDark: {
    color: '#5A5A6E',
    fontSize: 12,
  },
  value: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  valueHighlight: {
    color: '#E50914',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  clientBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#17171D',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D2D37',
  },
  divider: {
    height: 1,
    backgroundColor: '#2D2D37',
    marginHorizontal: 20,
  },
  itemBox: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D37',
    borderStyle: 'dashed',
  },
  itemTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  itemPrice: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemSub: {
    color: '#8F8F9F',
    fontSize: 12,
    marginTop: 4,
  },
  totalValue: {
    color: '#FFF',
    fontSize: 22,
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
  },
  qrInstruction: {
    color: '#8F8F9F',
    fontSize: 12,
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
  },
  footerBar: {
    backgroundColor: '#1E1E24',
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  btnPdf: {
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnPdfText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
});
