import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { captureRef } from 'react-native-view-shot';

import { PageHeader } from '../../components/PageHeader/PageHeader';
import { ThemedText } from '../../components/Themed';
import { supabase } from '../../services/supabase';
import { useTheme } from '../../theme/ThemeProvider';
import { BankSettings } from '../../types/bank';
import { createStyles } from './ContribuicoesScreen.styles';

// Mapeamento de logos de bancos (opcional)
const BANK_LOGOS: Record<string, { library: string, name: string }> = {
  'santander': { library: 'Ionicons', name: 'logo-santander' },
  'bradesco': { library: 'Ionicons', name: 'logo-bradesco' },
  'itau': { library: 'Ionicons', name: 'logo-itau' },
  'default': { library: 'Ionicons', name: 'business-outline' }
};

export default function ContribuicoesScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Estados
  const [bankSettings, setBankSettings] = useState<BankSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [copiedType, setCopiedType] = useState<'pix' | 'cnpj' | 'code' | null>(null);

  // Ref para o QR Code
  const qrCodeRef = useRef(null);

  // Valores rápidos
  const quickValues = ['20', '50', '100', '200', '500'];

  // Buscar configurações bancárias
  useEffect(() => {
    fetchBankSettings();
  }, []);

  const fetchBankSettings = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('church_bank_settings')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(1)
        .single();

      if (error) throw error;

      if (data) {
        setBankSettings(data);
      }
    } catch (error) {
      console.error('Erro ao buscar configurações bancárias:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados bancários');
    } finally {
      setLoading(false);
    }
  };

  // Função para obter o ícone do banco - CORRIGIDA
  const getBankIcon = () => {
    // Se for Santander, usa o logo local
    if (bankSettings?.bank_name?.toLowerCase() === 'santander') {
      return (
        <Image
          source={require('../../../assets/logo_santander.png')}
          style={{ width: 32, height: 32 }}
          resizeMode="contain"
        />
      );
    }

    // Se tiver bank_logo configurado e for URL
    if (bankSettings?.bank_logo?.startsWith('http')) {
      return (
        <Image
          source={{ uri: bankSettings.bank_logo }}
          style={{ width: 32, height: 32 }}
          resizeMode="contain"
        />
      );
    }

    // Fallback para ícone padrão
    return <Ionicons name="business-outline" size={28} color={theme.colors.primary} />;
  };

  // -----------------------
  // Helpers de valor
  // -----------------------

  // Normaliza string monetária: "20,00" -> "20.00"
  const normalizeAmount = (raw?: string): string | null => {
    if (!raw) return null;
    const cleaned = raw.replace(/\s/g, '').replace(',', '.');
    const n = Number(cleaned);
    if (!isFinite(n) || n <= 0) return null;
    return n.toFixed(2);
  };

  // Sanitiza a digitação do usuário
  const onAmountChange = (text: string) => {
    const sanitized = text.replace(/[^\d.,]/g, '');
    setAmount(sanitized);
  };

  const formattedAmountForDisplay = useMemo(() => {
    const normalized = normalizeAmount(amount);
    if (!normalized) return null;
    try {
      const n = Number(normalized);
      return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    } catch {
      return `R$ ${normalized.replace('.', ',')}`;
    }
  }, [amount]);

  // -----------------------
  // CRC-16/CCITT-FALSE
  // -----------------------
  const calculateCRC16 = (payload: string): string => {
    let crc = 0xFFFF;
    const polynomial = 0x1021;

    for (let i = 0; i < payload.length; i++) {
      const byte = payload.charCodeAt(i);
      crc ^= (byte << 8);
      crc &= 0xFFFF;

      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) !== 0) {
          crc = ((crc << 1) ^ polynomial) & 0xFFFF;
        } else {
          crc = (crc << 1) & 0xFFFF;
        }
      }
    }

    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  };

  // -----------------------
  // Payload PIX (EMV)
  // -----------------------
  const generatePixPayload = (valor?: string): string => {
    if (!bankSettings) return '';

    try {
      const cnpjLimpo = bankSettings.cnpj_raw;
      const nomeRecebedor = 'IBI';
      const cidade = 'SJC';
      const txid = '***';

      let payload = '';

      // 00 - Payload Format Indicator
      payload += '000201';

      // 01 - Point of Initiation Method (11 = estático, 12 = dinâmico)
      payload += '010211';

      // 26 - Merchant Account Information
      const gui = 'BR.GOV.BCB.PIX';
      const guiField = `00${gui.length.toString().padStart(2, '0')}${gui}`;
      const chavePix = cnpjLimpo;
      const chaveField = `01${chavePix.length.toString().padStart(2, '0')}${chavePix}`;
      const merchantAccountInfo = guiField + chaveField;
      payload += `26${merchantAccountInfo.length.toString().padStart(2, '0')}${merchantAccountInfo}`;

      // 52 - Merchant Category Code
      payload += '52040000';

      // 53 - Transaction Currency
      payload += '5303986';

      // 54 - Transaction Amount
      const valorDecimal = normalizeAmount(valor);
      if (valorDecimal) {
        payload += `54${valorDecimal.length.toString().padStart(2, '0')}${valorDecimal}`;
      }

      // 58 - Country Code
      payload += '5802BR';

      // 59 - Merchant Name
      const nomeFormatado = nomeRecebedor.substring(0, 25);
      payload += `59${nomeFormatado.length.toString().padStart(2, '0')}${nomeFormatado}`;

      // 60 - Merchant City
      const cidadeFormatada = cidade.substring(0, 15);
      payload += `60${cidadeFormatada.length.toString().padStart(2, '0')}${cidadeFormatada}`;

      // 62 - Additional Data Field Template
      const txidField = `05${txid.length.toString().padStart(2, '0')}${txid}`;
      payload += `62${txidField.length.toString().padStart(2, '0')}${txidField}`;

      // 63 - CRC16
      payload += '6304';
      const crc = calculateCRC16(payload);

      return payload + crc;
    } catch (error) {
      console.error('Erro ao gerar payload PIX:', error);
      return '';
    }
  };

  // Função para gerar código PIX copia e cola
  const generatePixCopyPaste = (valor?: string) => {
    return generatePixPayload(valor);
  };

  // Função para copiar texto
  const copyToClipboard = async (text: string, type: 'pix' | 'cnpj' | 'code') => {
    await Clipboard.setStringAsync(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);

    let message = '';
    if (type === 'pix') message = 'Chave PIX copiada!';
    else if (type === 'cnpj') message = 'CNPJ copiado!';
    else message = 'Código PIX copiado!';

    Alert.alert('Sucesso', message);
  };

  // Função para gerar QR Code com valor
  const handleGenerateQRCode = () => {
    const normalized = normalizeAmount(amount);
    if (amount && !normalized) {
      Alert.alert('Valor inválido', 'Por favor, insira um valor maior que zero');
      return;
    }
    setShowQRCode(true);
  };

  // Função para compartilhar QR Code
  const handleShareQRCode = async () => {
    try {
      if (!qrCodeRef.current) return;

      const uri = await captureRef(qrCodeRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Compartilhar QR Code PIX',
          UTI: 'public.png',
        });
      } else {
        Alert.alert('Não disponível', 'Compartilhamento não disponível neste dispositivo');
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar o QR Code');
    }
  };

  // Função para selecionar valor rápido
  const handleQuickValue = (value: string) => {
    setAmount(value);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!bankSettings) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Ionicons name="alert-circle-outline" size={48} color={theme.colors.muted} />
        <ThemedText style={{ marginTop: 16, textAlign: 'center', color: theme.colors.muted }}>
          Configurações bancárias não encontradas.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        <PageHeader
          title="Contribuições"
          subtitle='"Cada um contribua segundo propôs no seu coração, não com tristeza ou por necessidade; porque Deus ama ao que dá com alegria" - 2 Coríntios 9:7'
          icon="heart-outline"
        />

        {/* Seção PIX */}
        <View style={styles.pixSection}>
          <View style={styles.pixHeader}>
            <Ionicons name="qr-code-outline" size={24} color={theme.colors.primary} />
            <ThemedText style={styles.pixTitle}>PIX</ThemedText>
          </View>

          <ThemedText style={styles.pixSubtitle}>
            Faça sua contribuição de forma rápida e segura via PIX
          </ThemedText>

          {/* Chave PIX */}
          <ThemedText style={styles.valueLabel}>Chave PIX (CNPJ)</ThemedText>
          <View style={styles.pixKeyContainer}>
            <ThemedText style={styles.pixKeyText}>{bankSettings.cnpj}</ThemedText>
            <TouchableOpacity
              onPress={() => copyToClipboard(bankSettings.pix_key, 'pix')}
              style={{ padding: 8 }}
            >
              <Ionicons
                name={copiedType === 'pix' ? 'checkmark' : 'copy-outline'}
                size={20}
                color={copiedType === 'pix' ? theme.colors.primary : theme.colors.muted}
              />
            </TouchableOpacity>
          </View>

          {/* Input de valor */}
          <View style={styles.valueInputContainer}>
            <ThemedText style={styles.valueLabel}>Valor da contribuição (opcional)</ThemedText>
            <View style={{ position: 'relative' }}>
              <ThemedText style={{
                position: 'absolute',
                left: 12,
                top: 12,
                fontSize: 18,
                color: theme.colors.text,
                zIndex: 1,
              }}>
                R$
              </ThemedText>
              <TextInput
                style={[styles.valueInput, { paddingLeft: 40 }]}
                placeholder="0,00"
                placeholderTextColor={theme.colors.muted}
                value={amount}
                onChangeText={onAmountChange}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Valores rápidos */}
          <View style={styles.quickValuesContainer}>
            {quickValues.map((value) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.quickValueButton,
                  amount === value && styles.quickValueButtonActive
                ]}
                onPress={() => handleQuickValue(value)}
              >
                <ThemedText
                  style={[
                    styles.quickValueText,
                    amount === value && styles.quickValueTextActive
                  ]}
                >
                  R$ {value}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Botões de ação */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleGenerateQRCode}
            >
              <Ionicons name="qr-code" size={20} color="#fff" />
              <ThemedText style={styles.actionButtonText}>Gerar QR Code</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={() => copyToClipboard(bankSettings.pix_key, 'pix')}
            >
              <Ionicons
                name={copiedType === 'pix' ? 'checkmark' : 'copy-outline'}
                size={20}
                color={copiedType === 'pix' ? theme.colors.primary : theme.colors.text}
              />
              <ThemedText
                style={[
                  styles.actionButtonText,
                  styles.actionButtonTextSecondary
                ]}
              >
                {copiedType === 'pix' ? 'Copiado!' : 'Copiar Chave'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Informações adicionais */}
          {/* <View style={styles.infoCard}>
            <ThemedText style={styles.infoText}>
              O PIX é gratuito e cai na mesma hora na conta da igreja.
            </ThemedText>
            <ThemedText style={[styles.infoText, { marginTop: 8 }]}>
              Chave PIX: <ThemedText style={styles.infoHighlight}>{bankSettings.cnpj}</ThemedText>
            </ThemedText>
          </View> */}
        </View>

        {/* Card do Banco com logo do Santander */}
        <View style={styles.bankCard}>
          <View style={styles.bankHeader}>
            <Ionicons name="swap-horizontal-outline" size={24} color={theme.colors.primary} />
            <ThemedText style={styles.bankName}>Transferência Bancária</ThemedText>
          </View>

          <View style={styles.bankHeader}>
            {getBankIcon()}
            <ThemedText style={styles.bankName}>Banco {bankSettings.bank_name}</ThemedText>
          </View>

          <View style={styles.bankInfoRow}>
            <ThemedText style={styles.bankInfoLabel}>Banco:</ThemedText>
            <ThemedText style={styles.bankInfoValue}>{bankSettings.bank_code} - {bankSettings.bank_name}</ThemedText>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => copyToClipboard(bankSettings.bank_code, 'cnpj')}
            >
              <Ionicons
                name={copiedType === 'cnpj' ? 'checkmark' : 'copy-outline'}
                size={20}
                color={copiedType === 'cnpj' ? theme.colors.primary : theme.colors.muted}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.bankInfoRow}>
            <ThemedText style={styles.bankInfoLabel}>Agência:</ThemedText>
            <ThemedText style={styles.bankInfoValue}>{bankSettings.agency}</ThemedText>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => copyToClipboard(bankSettings.agency, 'cnpj')}
            >
              <Ionicons
                name={copiedType === 'cnpj' ? 'checkmark' : 'copy-outline'}
                size={20}
                color={copiedType === 'cnpj' ? theme.colors.primary : theme.colors.muted}
              />
            </TouchableOpacity>
          </View>

          <View style={[styles.bankInfoRow, { borderBottomWidth: 0 }]}>
            <ThemedText style={styles.bankInfoLabel}>Conta:</ThemedText>
            <ThemedText style={styles.bankInfoValue}>{bankSettings.account}</ThemedText>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => copyToClipboard(bankSettings.account, 'cnpj')}
            >
              <Ionicons
                name={copiedType === 'cnpj' ? 'checkmark' : 'copy-outline'}
                size={20}
                color={copiedType === 'cnpj' ? theme.colors.primary : theme.colors.muted}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Informações de transferência tradicional */}
        {/* <View style={styles.bankCard}>
          <View style={styles.bankHeader}>
            <Ionicons name="swap-horizontal-outline" size={24} color={theme.colors.primary} />
            <ThemedText style={styles.bankName}>Transferência Tradicional</ThemedText>
          </View>

          <ThemedText style={[styles.pixSubtitle, { marginBottom: 12 }]}>
            Utilize estes dados para transferência bancária
          </ThemedText>

          <View style={styles.bankInfoRow}>
            <ThemedText style={styles.bankInfoLabel}>Banco:</ThemedText>
            <ThemedText style={styles.bankInfoValue}>{bankSettings.bank_code} - {bankSettings.bank_name}</ThemedText>
          </View>

          <View style={styles.bankInfoRow}>
            <ThemedText style={styles.bankInfoLabel}>Agência:</ThemedText>
            <ThemedText style={styles.bankInfoValue}>{bankSettings.agency}</ThemedText>
          </View>

          <View style={styles.bankInfoRow}>
            <ThemedText style={styles.bankInfoLabel}>Conta:</ThemedText>
            <ThemedText style={styles.bankInfoValue}>{bankSettings.account}</ThemedText>
          </View>

          <View style={[styles.bankInfoRow, { borderBottomWidth: 0 }]}>
            <ThemedText style={styles.bankInfoLabel}>Titular:</ThemedText>
            <ThemedText style={styles.bankInfoValue}>Igreja Batista (CNPJ: {bankSettings.cnpj})</ThemedText>
          </View>
        </View> */}

        {/* Espaço extra no final */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal do QR Code */}
      <Modal
        visible={showQRCode}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQRCode(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowQRCode(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>QR Code PIX</ThemedText>
              <TouchableOpacity
                onPress={() => setShowQRCode(false)}
                style={styles.modalCloseButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.qrCodeContainer} collapsable={false} ref={qrCodeRef}>
              <QRCode
                value={generatePixCopyPaste(amount)}
                size={200}
                color="#000"
                backgroundColor="#fff"
              />
            </View>

            {formattedAmountForDisplay ? (
              <ThemedText style={styles.qrCodeValue}>
                {formattedAmountForDisplay}
              </ThemedText>
            ) : (
              <ThemedText style={styles.qrCodeValue}>
                Valor livre (qualquer valor)
              </ThemedText>
            )}

            <ThemedText style={styles.qrCodeInstructions}>
              Abra o app do seu banco, escaneie o QR Code e confirme o pagamento
            </ThemedText>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalActionButton, styles.modalActionButtonPrimary]}
                onPress={() => copyToClipboard(generatePixCopyPaste(amount), 'code')}
              >
                <Ionicons name="copy-outline" size={20} color="#fff" />
                <ThemedText style={styles.modalActionButtonText}>Copiar Código</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalActionButton, styles.modalActionButtonSecondary]}
                onPress={handleShareQRCode}
              >
                <Ionicons name="share-outline" size={20} color={theme.colors.primary} />
                <ThemedText style={[styles.modalActionButtonText, { color: theme.colors.primary }]}>
                  Compartilhar
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalActionButton, styles.modalActionButtonOutline]}
                onPress={() => setShowQRCode(false)}
              >
                <ThemedText style={styles.modalActionButtonTextOutline}>Fechar</ThemedText>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}