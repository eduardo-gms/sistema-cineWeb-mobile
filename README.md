# 🎬 CineWeb Mobile

Aplicativo mobile do ecossistema CineWeb, construído com **React Native** e **Expo**. Permite que clientes visualizem seus ingressos digitais, com suporte a modo offline (DB Sync) e QR Code para validação na portaria do cinema.

---

## Stack de Tecnologias

| Tecnologia | Versão | Propósito |
|---|---|---|
| **React Native** | 0.85 | Framework mobile |
| **Expo** | SDK 56 | Toolchain e build |
| **TypeScript** | 5.x | Tipagem estática |
| **Zustand** | 4.x | Gerenciamento de estado |
| **Axios** | 1.6 | Requisições HTTP |
| **React Navigation** | 6.x | Navegação entre telas |
| **expo-secure-store** | 56.x | Armazenamento seguro (tokens) |
| **AsyncStorage** | 2.x | Cache de ingressos (offline) |
| **react-native-qrcode-svg** | 6.x | Geração de QR Code |
| **Docker** | - | Conteinerização (opcional) |

---

## Arquitetura de Autenticação

O mobile implementa autenticação JWT com **segurança máxima para tokens**:

```
┌──────────────────────────────────────────────────────────┐
│                  expo-secure-store                         │
│  (Keychain no iOS / EncryptedSharedPreferences no Android)│
│                                                           │
│  ACCESS_TOKEN_KEY  → Access Token JWT (15 min)            │
│  REFRESH_TOKEN_KEY → Refresh Token JWT (7 dias)           │
└──────────────────────────────────────────────────────────┘
          │
          ▼  (Interceptor Axios)
┌─────────────────────────────────┐
│  api.interceptors.request       │
│  → Injeta Access Token          │
│                                 │
│  api.interceptors.response      │
│  → 401? Tenta refresh auto      │
│  → Fila de requisições          │
│  → Refresh falhou? Logout       │
└─────────────────────────────────┘
```

> ⚠️ **Segurança**: Tokens JWT são armazenados **exclusivamente** via `expo-secure-store`, que utiliza criptografia de hardware (Keychain no iOS, EncryptedSharedPreferences no Android). O `AsyncStorage` é usado **somente** para cache de ingressos (dados não sensíveis).

---

## DB Sync (Armazenamento Local)

O sistema implementa sincronização inteligente de dados:

1. **Online**: Busca ingressos da API (`GET /pedidos/meus`), salva cópia no AsyncStorage.
2. **Offline**: Recupera ingressos do cache local (AsyncStorage).
3. **Fila de Sync**: Operações feitas offline são enfileiradas e enviadas quando a conectividade é restaurada.
4. **Indicador visual**: Badge na tela mostra se os dados são "Sincronizados" ou "Modo Offline".

---

## Funcionalidades

- ✅ Acesso público para Filmes e Sessões (arquitetura BottomTabs)
- ✅ Filtros dinâmicos cruzando dados (clique no Filme para filtrar Sessões)
- ✅ Fluxos completos de Autenticação, Cadastro e Recuperação de Senha
- ✅ Listagem de ingressos digitais com QR Code e Carrinho de compras
- ✅ Modo offline (DB Sync via AsyncStorage)
- ✅ Comprovante de ingresso individual
- ✅ Pull-to-refresh para sincronização manual
- ✅ Design dark theme (#0F0F13) minimalista monocromático

---

## Pré-requisitos

- Node.js 20+
- npm
- Expo CLI (`npx expo`)
- App **Expo Go** no celular (iOS/Android)
- Backend CineWeb rodando

---

## Setup Local

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar Expo
npx expo start
```

### Conectando ao Backend

Por padrão, o app se conecta ao backend em:
- **Android Emulator**: `http://10.0.2.2:3000`
- **iOS Simulator**: `http://localhost:3000`
- **Dispositivo físico**: Você precisa alterar a URL base em `src/services/api.ts` para o IP da sua máquina na rede Wi-Fi (ex: `http://192.168.1.100:3000`).

---

## Setup com Expo Go no Celular Físico

1. Certifique-se de que o celular e o computador estão na **mesma rede Wi-Fi**.
2. Descubra o IP local da sua máquina (ex: `ipconfig` no Windows).
3. Atualize a `baseURL` em `src/services/api.ts` ou configure via variável de ambiente.
4. Execute:

```bash
REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.100 npx expo start
```

5. Escaneie o QR Code com o app Expo Go.

---

## Setup Docker (Opcional)

O mobile Expo funciona melhor **fora do Docker** por causa do Metro Bundler e hot-reload. O Dockerfile é fornecido para casos específicos de CI/CD.

Via compose unificado (na raiz `cineWeb/`):

```bash
# O serviço mobile só sobe com --profile mobile
docker compose --profile mobile up --build
```

---

## Telas

| Tela | Descrição | Auth? |
|------|-----------|-------|
| **FilmesScreen** | Listagem pública de filmes | Não |
| **SessoesScreen** | Listagem e filtro de sessões | Não |
| **LoginScreen** | Login com email/senha | Não |
| **RegisterScreen** | Criação de nova conta | Não |
| **ForgotPasswordScreen** | Recuperação de senha | Não |
| **CheckoutScreen** | Finalização de compra | Sim |
| **MyTicketsScreen** | Lista de ingressos digitais | Sim |
| **TicketReceiptScreen** | Comprovante individual QR Code | Sim |

---

## Estrutura do Projeto

```
src/
├── @types/
│   └── index.ts            # Interfaces TypeScript
├── screens/
│   ├── auth/
│   │   └── LoginScreen.tsx
│   └── tickets/
│       ├── MyTicketsScreen.tsx
│       └── TicketReceiptScreen.tsx
├── services/
│   ├── api.ts              # Axios + interceptors (refresh automático)
│   ├── authService.ts      # Chamadas de autenticação
│   ├── storage.ts          # SecureStore + AsyncStorage
│   └── ticketService.ts    # DB Sync de ingressos
├── store/
│   └── useAuthStore.ts     # Estado global (Zustand)
App.tsx                      # Navegação condicional (auth vs. app)
app.json                     # Configuração Expo
```
