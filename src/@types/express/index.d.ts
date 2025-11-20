// Este arquivo de declaração de tipos estende a interface 'Request' do Express
// para incluir a propriedade 'user' injetada pelo nosso authMiddleware.

// 1. Definimos a interface do payload de usuário esperado (id e role do JWT)
export interface IUserPayload {
    id: string;
    role: 'ADMIN' | 'CLIENTE' | 'BARBEIRO';
}

// 2. Estende o namespace global do Express
declare global {
    namespace Express {
        // 3. Estende a interface Request padrão do Express
        interface Request {
            // Adiciona a propriedade 'user' opcional ao objeto Request
            user?: IUserPayload; 
        }
    }
}