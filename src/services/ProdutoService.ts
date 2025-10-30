import { ProdutoRepository, Produto, ProdutoInput } from "../repositories/ProdutoRepository";
import { UnprocessableEntityError } from "../utils/errors"; // Assumindo que você tem um erro 422 para erros de regra de negócio

export class ProdutoService {
    private produtoRepository: ProdutoRepository;

    constructor() {
        this.produtoRepository = new ProdutoRepository();
    }

    // CRIAÇÃO DE PRODUTO
    async criarProduto(data: ProdutoInput): Promise<Produto> {
        // 1. Validação simples de campos obrigatórios
        if (!data.nome || !data.descricao || data.preco === undefined || data.estoque === undefined) {
            throw new UnprocessableEntityError("Nome, descrição, preço e estoque são obrigatórios.");
        }
        
        // 2. Validação de valores
        if (data.preco < 0 || data.estoque < 0) {
            throw new UnprocessableEntityError("Preço e estoque não podem ser negativos.");
        }

        // 3. Verificação de unicidade (Opcional, mas boa prática para nomes)
        // Você precisaria de um método buscarPorNome no repositório para isso. 
        // Vamos pular esta checagem agora para simplificar, mas é uma melhoria futura.

        // 4. Criação no repositório
        const novoProduto = await this.produtoRepository.criar(data);
        return novoProduto;
    }

    // LISTAR TODOS OS PRODUTOS
    async listarProdutos(): Promise<Produto[]> {
        return this.produtoRepository.listar();
    }

    // BUSCAR PRODUTO POR ID
    async buscarProdutoPorId(id: string): Promise<Produto> {
        const produto = await this.produtoRepository.buscarPorId(id);
        if (!produto) {
            throw new UnprocessableEntityError("Produto não encontrado.");
        }
        return produto;
    }

    // ATUALIZAR PRODUTO
    async atualizarProduto(id: string, data: Partial<ProdutoInput>): Promise<Produto> {
        // 1. Validação de dados (garantir que preço/estoque, se fornecidos, não sejam negativos)
        if (data.preco !== undefined && data.preco < 0) {
            throw new UnprocessableEntityError("O preço do produto não pode ser negativo.");
        }
        if (data.estoque !== undefined && data.estoque < 0) {
            throw new UnprocessableEntityError("O estoque do produto não pode ser negativo.");
        }

        // 2. Atualização no repositório
        const produtoAtualizado = await this.produtoRepository.atualizar(id, data);

        if (!produtoAtualizado) {
            throw new UnprocessableEntityError("Produto não encontrado para atualização.");
        }
        return produtoAtualizado;
    }
    
    // DELETAR PRODUTO
    async deletarProduto(id: string): Promise<void> {
        // 1. Checar se o produto existe antes de tentar deletar
        // Isso retorna 404/422 mais claro, em vez de um DELETE que não faz nada.
        await this.buscarProdutoPorId(id); 

        // 2. Deletar no repositório
        await this.produtoRepository.deletar(id);
    }
}