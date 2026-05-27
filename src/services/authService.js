export const authService = {
    /**
     * Efetua login com e-mail e senha
     */
    async login(email, senha) {
        try {
            // Em produção real, consumirá o backend NestJS:
            // const response = await api.post<AuthResponse>('/auth/login', { email, senha });
            // return response.data;
            // Retorno simulado (Mock) consistente e detalhado para testes e desenvolvimento do mobile:
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (email.includes('@cineweb.com') && senha.length >= 6) {
                        resolve({
                            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLWNsaWVudC0xMjMiLCJuYW1lIjoiRnVsYW5vIGRlIFRhbCIsImVtYWlsIjoiY2xpZW50ZUBjaW5ld2ViLmNvbS5iciIsInBlcmZpbCI6IkNVU1RPTUVSIiwiaWF0IjoxNTE2MjM5MDIyfQ',
                            user: {
                                id: 'user-client-123',
                                nome: 'Fulano de Tal',
                                email: email,
                                perfil: 'CUSTOMER',
                            },
                        });
                    }
                    else {
                        reject(new Error('Credenciais inválidas. Use um e-mail @cineweb.com e senha de no mínimo 6 caracteres.'));
                    }
                }, 1000);
            });
        }
        catch (error) {
            const apiMessage = error.response?.data?.message || 'Falha na conexão com o servidor.';
            throw new Error(apiMessage);
        }
    },
    /**
     * Registra um novo usuário cliente
     */
    async register(nome, email, senha) {
        try {
            // Em produção real, consumirá o backend NestJS:
            // const response = await api.post<AuthResponse>('/auth/register', { nome, email, senha });
            // return response.data;
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLWNsaWVudC0xMjMiLCJuYW1lIjoiRnVsYW5vIGRlIFRhbCIsImVtYWlsIjoiY2xpZW50ZUBjaW5ld2ViLmNvbS5iciIsInBlcmZpbCI6IkNVU1RPTUVSIiwiaWF0IjoxNTE2MjM5MDIyfQ',
                        user: {
                            id: 'user-client-124',
                            nome: nome,
                            email: email,
                            perfil: 'CUSTOMER',
                        },
                    });
                }, 1200);
            });
        }
        catch (error) {
            const apiMessage = error.response?.data?.message || 'Falha ao registrar novo cliente.';
            throw new Error(apiMessage);
        }
    },
    /**
     * Recuperação de senha
     */
    async forgotPassword(email) {
        try {
            // Em produção real, consumirá o backend NestJS:
            // await api.post('/auth/forgot-password', { email });
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (email.includes('@')) {
                        resolve();
                    }
                    else {
                        reject(new Error('E-mail inválido.'));
                    }
                }, 800);
            });
        }
        catch (error) {
            const apiMessage = error.response?.data?.message || 'Falha ao enviar e-mail de recuperação.';
            throw new Error(apiMessage);
        }
    }
};
export default authService;
