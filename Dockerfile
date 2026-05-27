FROM node:20-alpine
WORKDIR /app

# Instala dependências do Expo CLI
RUN npm install -g expo-cli@latest

COPY package*.json ./
RUN npm install

COPY . .

# Porta do Metro Bundler
EXPOSE 8081

# Variáveis de ambiente para Expo Go em dispositivo físico
ENV REACT_NATIVE_PACKAGER_HOSTNAME=0.0.0.0

CMD ["npx", "expo", "start", "--tunnel"]
