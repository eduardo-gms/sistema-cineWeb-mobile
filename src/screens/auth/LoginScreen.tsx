import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const login = useAuthStore((state: any) => state.login);

  const handleLogin = async () => {
    if (!email.trim() || !senha.trim()) {
      setError('Preencha todos os campos.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await login(email.trim(), senha);
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo / Branding */}
        <View style={styles.brandContainer}>
          <Text style={styles.brandIcon}>🎬</Text>
          <Text style={styles.brandTitle}>CineWeb</Text>
          <Text style={styles.brandSubtitle}>Acesse sua conta para ver seus ingressos</Text>
        </View>

        {/* Formulário */}
        <View style={styles.formContainer}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            placeholderTextColor="#5A5A6E"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSubmitting}
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••"
            placeholderTextColor="#5A5A6E"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            editable={!isSubmitting}
          />

          <TouchableOpacity
            style={[styles.loginButton, isSubmitting && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          {/* Dica de credenciais para desenvolvimento */}
          <View style={styles.hintContainer}>
            <Text style={styles.hintTitle}>Credenciais de teste:</Text>
            <Text style={styles.hintText}>cliente@cineweb.com / cliente123</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F13',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brandIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#8F8F9F',
    marginTop: 8,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#1B1B22',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2D2D37',
  },
  errorContainer: {
    backgroundColor: 'rgba(229, 9, 20, 0.15)',
    borderWidth: 1,
    borderColor: '#E50914',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    textAlign: 'center',
  },
  label: {
    color: '#8F8F9F',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#13131A',
    borderWidth: 1,
    borderColor: '#2D2D37',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#E50914',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  hintContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2D2D37',
    alignItems: 'center',
  },
  hintTitle: {
    color: '#5A5A6E',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  hintText: {
    color: '#5A5A6E',
    fontSize: 11,
    fontFamily: 'monospace',
  },
});
