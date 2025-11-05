import { VendaRepository, VendaInput, Venda, VendaListagem } from "../repositories/VendaRepository";
import { ProdutoRepository } from "../repositories/ProdutoRepository";
import { UsuarioRepository } from "../repositories/UsuarioRepository";
import { UnprocessableEntityError } from "../utils/errors"; 
import { ConflictError } from "../utils/errors"; 

// A interface que o Controller enviará para o Service (inclui a lista de produtos)
export interface VendaCompletaInput extends VendaInput {
    // Adicionamos a lista de produtos a serem vendidos.
    // O Repositório de Venda AINDA NÃO vai lidar com isso, mas o Service sim.
    produtos_vendidos: {
        produto_id: string;
        quantidade: number;
    }[];
}

export class VendaService {
    private vendaRepository: VendaRepository;
    private produtoRepository: ProdutoRepository;
    private usuarioRepository: UsuarioRepository; // Adicionado para checar se o vendedor existe

    constructor() {
        this.vendaRepository = new VendaRepository();
        this.produtoRepository = new ProdutoRepository();
        this.usuarioRepository = new UsuarioRepository();
    }

    // LISTAR VENDAS
    async listarVendas(): Promise<VendaListagem[]> {
        return this.vendaRepository.listar();
    }
    
    // CRIAR VENDA PRINCIPAL (AGORA COM LÓGICA DE TRANSAÇÃO COMPLETA)
    async criarVenda(data: VendaCompletaInput): Promise<Venda> {
        
        // 1. Validações Iniciais
        if (!data.usuario_id || !data.produtos_vendidos || data.produtos_vendidos.length === 0) {
            throw new UnprocessableEntityError("Vendedor (usuario_id) e pelo menos um produto são obrigatórios.");
        }

        // 2. Validação da Existência do Vendedor
        const vendedor = await this.usuarioRepository.buscarPorId(data.usuario_id);
        const cargoNome = vendedor?.cargo?.nome; 

        if (!vendedor || cargoNome === 'CLIENTE' || !cargoNome) { 
            throw new UnprocessableEntityError("O usuário informado como vendedor não é válido (deve ser ADMIN ou BARBEIRO).");
        }

        // --- LÓGICA DE TRANSAÇÃO E VALIDAÇÃO DE ESTOQUE ---
        
        let valorTotalVenda = 0;
        const itensParaRegistro: {
            produto_id: string;
            quantidade: number;
            preco_unitario: number;
        }[] = [];

        // 3. Validação, Cálculo e Reserva de Estoque
        for (const item of data.produtos_vendidos) {
            const produto = await this.produtoRepository.buscarPorId(item.produto_id);
            
            // Assumindo que o buscarPorId do ProdutoRepository retorna null se não encontrar ou se ativo=false
            if (!produto || !produto.ativo) { 
                throw new UnprocessableEntityError(`Produto ID ${item.produto_id} não encontrado ou inativo.`);
            }

            if (produto.estoque < item.quantidade) {
                throw new ConflictError(`Estoque insuficiente para o produto '${produto.nome}'. Disponível: ${produto.estoque}, Requerido: ${item.quantidade}.`);
            }
            
            // Adiciona o item à lista de registro e calcula o valor total
            itensParaRegistro.push({
                produto_id: item.produto_id,
                quantidade: item.quantidade,
                preco_unitario: produto.preco // Usa o preço REAL do produto do banco de dados
            });
            
            valorTotalVenda += produto.preco * item.quantidade;
        }

        // 3.1. Validação de Integridade do Valor Final (Calculado vs. Enviado)
        // Se o valor_final for enviado, ele deve coincidir com o valor que calculamos.
        if (data.valor_final !== undefined && data.valor_final !== valorTotalVenda) {
            // Nota: Se você for implementar descontos, esta lógica precisará ser refinada.
             throw new UnprocessableEntityError(`O valor final calculado (${valorTotalVenda.toFixed(2)}) difere do valor informado (${data.valor_final.toFixed(2)}).`);
        }

        // 4. Criação da Venda Principal (NA TABELA 'VENDA')
        const vendaPrincipal = await this.vendaRepository.criar({
            usuario_id: data.usuario_id,
            agendamento_id: data.agendamento_id,
            valor_final: valorTotalVenda, // Usa o valor calculado (fonte da verdade)
        });
        
        try {
            // 5. INSERÇÃO NA TABELA VENDAPRODUTO (RELACIONAMENTO)
            await this.vendaRepository.registrarProdutosVendidos(vendaPrincipal.id, itensParaRegistro);

            // 6. DAR BAIXA NO ESTOQUE (RPC)
            for (const item of itensParaRegistro) {
                // Chama a função RPC de banco de dados para segurança de concorrência
                await this.produtoRepository.darBaixaEstoque(item.produto_id, item.quantidade);
            }

        } catch (error) {
            // NOTE: Em caso de falha nas etapas 5 ou 6, o ideal seria deletar a vendaPrincipal (ROLLBACK manual).
            // Por enquanto, apenas relançamos o erro para ser capturado pelo Controller.
            throw error; 
        }
        
        return vendaPrincipal;
    }
}