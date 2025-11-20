import { Request, Response } from 'express';
import { ServicoRepository } from '../repositories/ServicoRepository';
import { StatusCodes } from 'http-status-codes';

const servicoRepository = new ServicoRepository();

/**
 * Controller responsável por manipular as requisições HTTP para a entidade Serviço.
 * As operações de banco de dados são delegadas ao ServicoRepository.
 */
export class ServicoController {

    /**
     * @route POST /servicos
     * Cria um novo serviço (Admin Only).
     */
    public async criar(req: Request, res: Response) {
        const servicoData = req.body; // Espera { nome, descricao, preco, duracao_minutos }

        if (!servicoData.nome || !servicoData.preco || !servicoData.duracao_minutos) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                message: 'Os campos nome, preco e duracao_minutos são obrigatórios.' 
            });
        }
        
        try {
            const novoServico = await servicoRepository.criar(servicoData);
            if (novoServico) {
                return res.status(StatusCodes.CREATED).json(novoServico);
            }
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Falha ao criar serviço.' });
        } catch (error) {
            console.error('Erro ao criar serviço:', error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
                message: 'Falha interna ao criar serviço.' 
            });
        }
    }

    /**
     * @route GET /servicos
     * Lista todos os serviços ativos (Público).
     */
    public async listar(req: Request, res: Response) {
        try {
            const servicos = await servicoRepository.listar();
            return res.status(StatusCodes.OK).json(servicos);
        } catch (error) {
            console.error('Erro ao listar serviços:', error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
                message: 'Falha interna ao listar serviços.' 
            });
        }
    }

    /**
     * @route GET /servicos/:id
     * Busca um serviço por ID (Público).
     * CORREÇÃO: Método que faltava e causava o erro no routes.ts.
     */
    public async buscarPorId(req: Request, res: Response) {
        const { id } = req.params;

        try {
            const servico = await servicoRepository.buscarPorId(id);

            if (!servico) {
                return res.status(StatusCodes.NOT_FOUND).json({ message: 'Serviço não encontrado.' });
            }

            return res.status(StatusCodes.OK).json(servico);
        } catch (error) {
            console.error('Erro ao buscar serviço por ID:', error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
                message: 'Falha interna ao buscar serviço.' 
            });
        }
    }

    /**
     * @route PUT /servicos/:id
     * Atualiza um serviço (Admin Only).
     */
    public async atualizar(req: Request, res: Response) {
        const { id } = req.params;
        const servicoData = req.body;

        try {
            const servicoAtualizado = await servicoRepository.atualizar(id, servicoData);

            if (!servicoAtualizado) {
                return res.status(StatusCodes.NOT_FOUND).json({ message: 'Serviço não encontrado.' });
            }

            return res.status(StatusCodes.OK).json(servicoAtualizado);
        } catch (error) {
            console.error('Erro ao atualizar serviço:', error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
                message: 'Falha interna ao atualizar serviço.' 
            });
        }
    }

    /**
     * @route DELETE /servicos/:id
     * Deleta (ou desativa) um serviço (Admin Only).
     */
    public async deletar(req: Request, res: Response) {
        const { id } = req.params;

        try {
            // Assumindo que 'deletar' no controller pode significar 'deletar' ou 'desativar'
            // Vamos usar o método de desativação ou exclusão do repositório
            
            // Para garantir que a rota de delete do routes.ts funcione, chamamos o delete do repository
            await servicoRepository.deletar(id); 
            
            // Sucesso sem conteúdo (padrão para DELETE)
            return res.status(StatusCodes.NO_CONTENT).send(); 
        } catch (error) {
            console.error('Erro ao deletar serviço:', error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
                message: 'Falha interna ao deletar serviço.' 
            });
        }
    }
}