import supabase from '../supabaseClient';
import { PostgrestError } from '@supabase/supabase-js';

// Definição da interface para os dados de entrada (sem o ID)
export interface ProdutoInput {
    nome: string;
    descricao: string;
    preco: number;
    estoque: number; // Novo campo para rastrear o inventário
    ativo?: boolean; // Produtos podem ser desativados
}

// Definição da interface completa do Produto (incluindo ID)
export interface Produto extends ProdutoInput {
    id: string;
}

export class ProdutoRepository {

    // CRIAR PRODUTO (POST)
    async criar(data: ProdutoInput): Promise<Produto> {
        const { data: novoProduto, error } = await supabase
            .from('produto')
            .insert([{ ...data, ativo: true }]) // Define 'ativo' como true por padrão na criação
            .select()
            .single();

        if (error) {
            console.error('ERRO SUPABASE (Criar Produto):', error);
            throw new Error(`Falha ao inserir produto no banco. Detalhe: ${(error as PostgrestError).message}`);
        }

        return novoProduto as Produto;
    }

    // LISTAR TODOS PRODUTOS (GET)
    async listar(): Promise<Produto[]> {
        const { data, error } = await supabase
            .from('produto')
            .select('*')
            .order('nome', { ascending: true });

        if (error) {
            console.error('ERRO SUPABASE (Listar Produtos):', error);
            throw new Error('Falha ao listar produtos.');
        }

        return data as Produto[];
    }

    // BUSCAR PRODUTO POR ID (GET /:id)
    async buscarPorId(id: string): Promise<Produto | null> {
        const { data, error } = await supabase
            .from('produto')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('ERRO SUPABASE (Buscar Produto):', error);
            throw new Error('Falha ao buscar produto por ID.');
        }

        return data as Produto || null;
    }

    // ATUALIZAR PRODUTO (PUT)
    async atualizar(id: string, data: Partial<ProdutoInput>): Promise<Produto | null> {
        const { data: produtoAtualizado, error } = await supabase
            .from('produto')
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('ERRO SUPABASE (Atualizar Produto):', error);
            throw new Error('Falha ao atualizar produto.');
        }

        return produtoAtualizado as Produto || null;
    }

    // DELETAR PRODUTO (DELETE)
    async deletar(id: string): Promise<void> {
        const { error } = await supabase
            .from('produto')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('ERRO SUPABASE (Deletar Produto):', error);
            throw new Error('Falha ao deletar produto.');
        }
    }

    // NOVO MÉTODO: Atualiza o estoque do produto (usando PostgreSQL's array function para performance)
    async darBaixaEstoque(produtoId: string, quantidade: number): Promise<void> {
    // Chamando a função SQL dar_baixa_estoque
    const { error } = await supabase.rpc('dar_baixa_estoque', {
        produto_uuid: produtoId, // Nome do parâmetro na função SQL
        qtde: quantidade        // Nome do parâmetro na função SQL
    });

    if (error) {
        console.error('ERRO SUPABASE (Baixa Estoque - RPC):', error);
        throw new Error(`Falha ao dar baixa no estoque do produto ${produtoId}. Detalhe: ${error.message}`);
    }
}
}