import { Request, Response } from 'express';
import { VendaService } from '../services/VendaService';
import { UnprocessableEntityError, ConflictError } from '../utils/errors'; 

export class VendaController {
    private vendaService: VendaService;

    constructor() {
        this.vendaService = new VendaService();
    }

    // HANDLER DE ERROS (Centraliza o tratamento de erros)
    private handleError(res: Response, error: any): Response {
        if (error instanceof UnprocessableEntityError) {
            // Erros de validação (422)
            return res.status(422).json({ message: error.message });
        }
        if (error instanceof ConflictError) {
            // Erros de conflito, como falta de estoque (409)
            return res.status(409).json({ message: error.message });
        }
        
        // Para todos os outros erros (erros de banco, lógica interna, etc.)
        console.error('Erro no VendaController:', error);
        return res.status(500).json({ message: 'Falha interna ao processar a requisição.' });
    }

    // 1. CRIAR VENDA (POST /vendas)
    // O usuário que faz a requisição (Admin ou Barbeiro) é quem está logado,
    // mas o body da requisição pode especificar o 'usuario_id' do vendedor.
    public criar = async (req: Request, res: Response): Promise<Response> => {
        try {
            // O VendaService já valida se o usuario_id (vendedor) existe e tem permissão
            const novaVenda = await this.vendaService.criarVenda(req.body);
            return res.status(201).json(novaVenda);
        } catch (error) {
            return this.handleError(res, error);
        }
    };

    // 2. LISTAR VENDAS (GET /vendas)
    public listar = async (req: Request, res: Response): Promise<Response> => {
        try {
            const vendas = await this.vendaService.listarVendas();
            return res.status(200).json(vendas);
        } catch (error) {
            return this.handleError(res, error);
        }
    };
    
    // ... (Métodos de busca e detalhes virão depois)
}