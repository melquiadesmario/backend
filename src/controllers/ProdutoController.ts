import { Request, Response } from 'express';
import { ProdutoService } from '../services/ProdutoService';
import { UnprocessableEntityError } from '../utils/errors'; // Importando a nova classe de erro

export class ProdutoController {
    private produtoService: ProdutoService;

    constructor() {
        this.produtoService = new ProdutoService();
    }

    // HANDLER DE ERROS (Centraliza o tratamento de erros para não repetir código)
    private handleError(res: Response, error: any): Response {
        if (error instanceof UnprocessableEntityError) {
            // Erros de validação ou "não encontrado" (422)
            return res.status(422).json({ message: error.message });
        }
        // Para todos os outros erros (erros de banco, lógica interna, etc.)
        console.error('Erro no ProdutoController:', error);
        return res.status(500).json({ message: 'Falha interna ao processar a requisição.' });
    }

    // 1. CRIAR PRODUTO (POST /produtos)
    public criar = async (req: Request, res: Response): Promise<Response> => {
        try {
            const novoProduto = await this.produtoService.criarProduto(req.body);
            return res.status(201).json(novoProduto);
        } catch (error) {
            return this.handleError(res, error);
        }
    };

    // 2. LISTAR PRODUTOS (GET /produtos)
    public listar = async (req: Request, res: Response): Promise<Response> => {
        try {
            const produtos = await this.produtoService.listarProdutos();
            return res.status(200).json(produtos);
        } catch (error) {
            return this.handleError(res, error);
        }
    };

    // 3. BUSCAR POR ID (GET /produtos/:id)
    public buscarPorId = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            const produto = await this.produtoService.buscarProdutoPorId(id);
            return res.status(200).json(produto);
        } catch (error) {
            return this.handleError(res, error);
        }
    };

    // 4. ATUALIZAR PRODUTO (PUT /produtos/:id)
    public atualizar = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            const produtoAtualizado = await this.produtoService.atualizarProduto(id, req.body);
            return res.status(200).json(produtoAtualizado);
        } catch (error) {
            return this.handleError(res, error);
        }
    };

    // 5. DELETAR PRODUTO (DELETE /produtos/:id)
    public deletar = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            await this.produtoService.deletarProduto(id);
            return res.status(204).send(); // 204 No Content
        } catch (error) {
            return this.handleError(res, error);
        }
    };
}