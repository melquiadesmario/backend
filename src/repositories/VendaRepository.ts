// src/repositories/VendaRepository.ts

import supabase from '../supabaseClient';
import { PostgrestError } from '@supabase/supabase-js';

// DTOs para o Repositório
export interface VendaInput {
    usuario_id: string; 
    agendamento_id?: string;
    data_venda?: string; 
    valor_final: number; 
}

export interface Venda extends VendaInput {
    id: string;
}

// ----------------------------------------------------
// NOVO DTO: Interface específica para o retorno da listagem (com JOIN)
// ----------------------------------------------------
export interface VendaListagem {
    id: string;
    agendamento_id: string | null;
    data_venda: string;
    valor_final: number;
    
    usuario: {
        nome: string;
        email: string;
        cargo: { nome: string }[]; 
    }[]; 
}

export class VendaRepository {

    // CRIAR VENDA (POST) (NÃO PRECISA DE ALTERAÇÃO)
    async criar(data: VendaInput): Promise<Venda> {
        const { data: novaVenda, error } = await supabase
            .from('venda')
            .insert([data]) 
            .select()
            .single();

        if (error) {
            console.error('ERRO SUPABASE (Criar Venda):', error);
            throw new Error(`Falha ao inserir venda no banco. Detalhe: ${(error as PostgrestError).message}`);
        }

        return novaVenda as Venda;
    }

    // LISTAR TODAS AS VENDAS (GET) (COM CORREÇÃO DE TIPAGEM)
    async listar(): Promise<VendaListagem[]> { // <-- AQUI: Usamos a nova interface
        // Retorna a venda e o nome/email do usuário que a registrou (JOIN implícito)
        const { data, error } = await supabase
            .from('venda')
            .select(`
                id,
                agendamento_id,
                data_venda,
                valor_final,
                usuario:usuario_id (nome, email, cargo:cargo_id (nome))
            `)
            .order('data_venda', { ascending: false });

        if (error) {
            console.error('ERRO SUPABASE (Listar Vendas):', error);
            throw new Error('Falha ao listar vendas.');
        }

        // Conversão com a interface VendaListagem[]
        return data as VendaListagem[];
    }

    // NOVO MÉTODO: Insere múltiplos produtos vendidos em 'vendaproduto'
    async registrarProdutosVendidos(vendaId: string, itensVendidos: any[]): Promise<void> {
        // Prepara os dados para inserção na tabela de junção
        const dadosInsercao = itensVendidos.map(item => ({
            venda_id: vendaId,
            produto_id: item.produto_id,
            quantidade: item.quantidade,
            preco_unitario: item.preco_unitario // Valor do produto no momento da venda
        }));

        const { error } = await supabase
            .from('vendaproduto')
            .insert(dadosInsercao);

        if (error) {
            console.error('ERRO SUPABASE (Registrar Produtos):', error);
            throw new Error(`Falha ao registrar produtos vendidos. Detalhe: ${error.message}`);
        }
    }
}