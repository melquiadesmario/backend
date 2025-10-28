import { Request, Response, NextFunction } from 'express';
import { CargoRepository } from '../repositories/CargoRepository';

// Inicializa o CargoRepository fora do middleware para evitar recriação
const cargoRepository = new CargoRepository();
// Cache para armazenar a relação ID -> Nome e evitar consultas repetitivas
const cargoCache: Map<string, string> = new Map(); 

// Middleware que aceita uma lista de nomes de cargos permitidos
export const roleMiddleware = (allowedRoles: string[]) => {
    
    return async (req: Request, res: Response, next: NextFunction) => {
        // O req.usuario é definido pelo authMiddleware, que DEVE ser executado antes
        const cargoId = req.usuario?.cargoId; 

        if (!cargoId) {
            // Se não houver cargoId, algo deu errado na autenticação
            return res.status(403).json({ message: 'Acesso negado: Informações de usuário incompletas.' });
        }
        
        let cargoNome: string | undefined;

        // 1. Tenta buscar o nome do cargo no cache
        if (cargoCache.has(cargoId)) {
            cargoNome = cargoCache.get(cargoId);
        } else {
            // 2. Se não estiver no cache, busca no banco
            const cargo = await cargoRepository.buscarPorId(cargoId);
            
            if (cargo) {
                cargoNome = cargo.nome;
                cargoCache.set(cargoId, cargoNome); // Adiciona ao cache
            }
        }

        if (!cargoNome) {
            return res.status(403).json({ message: 'Acesso negado: Cargo de usuário inválido.' });
        }

        // 3. Verifica se o cargo do usuário está na lista de cargos permitidos
        if (allowedRoles.includes(cargoNome)) {
            return next();
        } else {
            // 4. Se o cargo não estiver na lista (ex: CLIENTE tentando POST /servicos)
            return res.status(403).json({ message: `Acesso negado: Cargo "${cargoNome}" não autorizado para esta operação.` });
        }
    };
};