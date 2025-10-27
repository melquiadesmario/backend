import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';

// 1. Definição do Tipo do Usuário Decodificado no Token
interface TokenPayload {
    id: string;
    cargoId: string;
    email: string;
    iat: number;
    exp: number;
}

// 2. Extensão da Interface Request do Express
// Isso permite que o Controller acesse req.usuario.
declare global {
    namespace Express {
        interface Request {
            usuario?: TokenPayload; 
        }
    }
}

// Carrega a chave secreta do ambiente (deve ser a mesma do Service)
const JWT_SECRET: Secret = process.env.JWT_SECRET || 'fallback_secret_nao_usar_em_producao';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // 1. Obter o cabeçalho de Autorização
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Token não fornecido.' });
    }

    // O formato esperado é "Bearer TOKEN"
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ message: 'Formato do token inválido. Use: Bearer <token>' });
    }

    // 2. Verificar o Token
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
        
        // 3. Anexar os dados do usuário à requisição
        req.usuario = {
            id: decoded.id,
            cargoId: decoded.cargoId,
            email: decoded.email,
            iat: decoded.iat,
            exp: decoded.exp
        };

        return next(); // Prossegue para o Controller
        
    } catch (err: any) {
        // Erro de token expirado ou inválido
        return res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
};