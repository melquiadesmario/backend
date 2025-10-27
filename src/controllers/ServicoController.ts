import { Request, Response } from 'express';
import { ServicoService } from '../services/ServicoService';

export class ServicoController {
    private servicoService: ServicoService;

    constructor() {
        this.servicoService = new ServicoService();
    }

    // GET /servicos
    public listar = async (req: Request, res: Response): Promise<Response> => {
        try {
            const servicos = await this.servicoService.listar();
            return res.status(200).json(servicos);
        } catch (error: any) {
            // Retorna 500 para erros internos do banco
            return res.status(500).json({ message: error.message });
        }
    };

    // POST /servicos
    public criar = async (req: Request, res: Response): Promise<Response> => {
        try {
            const novoServico = await this.servicoService.criar(req.body);
            return res.status(201).json(novoServico); // Status 201: Criado
        } catch (error: any) {
            // 400 para erros de validação da regra de negócio
            const statusCode = error.message.includes('Preço') ? 400 : 500;
            return res.status(statusCode).json({ message: error.message });
        }
    };

    // PUT /servicos/:id
    public atualizar = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            const servicoAtualizado = await this.servicoService.atualizar(id, req.body);
            
            // 404 se o serviço não for encontrado pelo ID
            if (!servicoAtualizado) {
                 return res.status(404).json({ message: `Serviço com ID ${id} não encontrado.` });
            }
            
            return res.status(200).json(servicoAtualizado);
        } catch (error: any) {
            const statusCode = error.message.includes('encontrado') ? 404 : 400;
            return res.status(statusCode).json({ message: error.message });
        }
    };

    // DELETE /servicos/:id
    public deletar = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            await this.servicoService.deletar(id);
            return res.status(204).send(); // Status 204: Sem conteúdo (sucesso na deleção)
        } catch (error: any) {
            const statusCode = error.message.includes('encontrado') ? 404 : 500;
            return res.status(statusCode).json({ message: error.message });
        }
    };
}