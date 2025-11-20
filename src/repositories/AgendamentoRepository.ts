import supabase from '../supabaseClient';
import { PostgrestError } from '@supabase/supabase-js';

// --- Interfaces para Repositório ---

/**
 * Interface para Agendamento retornado com JOIN do serviço (servico é um array aninhado).
 * Inclui a duracao_minutos do serviço para cálculo de conflito.
 */
export interface AgendamentoComServico {
    id: string;
    cliente_id: string; 
    barbeiro_id: string; 
    servico_id: string; 
    data_hora_agendada: string;
    status: string;
    valor_total: number;
    /** O Supabase retorna o JOIN como um array. */
    servico: {
        id: string;
        duracao_minutos: number;
    }[]; 
}

/**
 * Interface para dados de entrada no Repositório (usada no método criar).
 */
export interface AgendamentoInput {
    cliente_id: string; 
    barbeiro_id: string; 
    servico_id: string;
    data_hora_agendada: string;
    valor_total: number;
    status: string;
}

/**
 * Interface completa do Agendamento (inclui o ID gerado).
 */
export interface Agendamento extends AgendamentoInput {
    id: string;
}

/**
 * Repositório para operações CRUD na tabela 'agendamento'.
 */
export class AgendamentoRepository {
    private tableName = 'agendamento'; 

    /**
     * Insere um novo agendamento no banco de dados.
     * @param data Dados do agendamento a ser criado.
     * @returns Promise<Agendamento | null> - O agendamento criado ou null em caso de falha.
     */
    async criar(data: AgendamentoInput): Promise<Agendamento | null> {
        const { data: agendamento, error } = await supabase
            .from(this.tableName)
            .insert([data])
            .select();

        if (error) {
            console.error('Erro no Supabase (Criar Agendamento):', error);
            throw new Error('Falha ao criar agendamento no banco.');
        }

        return agendamento && agendamento.length > 0 ? (agendamento[0] as Agendamento) : null;
    }

    /**
     * Lista agendamentos confirmados ou pendentes para um barbeiro em uma data.
     * @param barbeiroId ID do barbeiro.
     * @param data Data de busca (YYYY-MM-DD).
     * @returns Promise<AgendamentoComServico[]>\
     */
    public async listarPorBarbeiroEData(
        barbeiroId: string, 
        data: string 
    ): Promise<AgendamentoComServico[]> {
        
        // --- 1. Calcular o Range de Data e Hora (Usando UTC para consistência no Supabase) ---
        const dataInicio = `${data}T00:00:00.000Z`; // Início do dia (UTC)
        
        const dataFinal = new Date(data);
        dataFinal.setDate(dataFinal.getDate() + 1); 
        const dataFimExclusiva = dataFinal.toISOString().split('T')[0] + 'T00:00:00.000Z'; 
        
        // --- 2. Executar a Query com JOIN para obter a DURAÇÃO ---
        const { data: agendamentos, error } = await supabase
            .from(this.tableName)
            // CRÍTICO: Removido o comentário da string de seleção para evitar o erro PGRST100
            .select(`
                id,
                cliente_id,
                barbeiro_id,
                servico_id,
                data_hora_agendada,
                status,
                valor_total,
                servico!inner (id, duracao_minutos) 
            `)
            .eq('barbeiro_id', barbeiroId)
            .in('status', ['CONFIRMADO', 'PENDENTE']) // Apenas agendamentos que ocupam o tempo
            .gte('data_hora_agendada', dataInicio) // Maior ou igual ao início do dia
            .lt('data_hora_agendada', dataFimExclusiva) // Menor que o início do próximo dia
            .order('data_hora_agendada', { ascending: true }); // Ordena por hora

        if (error) {
            console.error('Erro no Supabase (Listar por Barbeiro/Data):', error);
            throw new Error('Falha ao listar agendamentos no banco.');
        }

        // CORREÇÃO DE TIPAGEM: Força a conversão para o tipo correto.
        const agendamentosFormatados = agendamentos as unknown as AgendamentoComServico[];

        // Filtra para garantir que apenas agendamentos com dados de serviço válidos sejam retornados
        const agendamentosFiltrados = agendamentosFormatados.filter(a => 
            a.servico && a.servico.length > 0 && a.servico[0].duracao_minutos > 0
        );

        return agendamentosFiltrados;
    }

    /**
     * Atualiza o status de um agendamento.
     * @param id ID do agendamento.
     * @param status Novo status.
     * @returns Promise<Agendamento | null> - O agendamento atualizado ou null se não encontrado.
     */
    async atualizarStatus(id: string, status: string): Promise<Agendamento | null> {
        const { data, error } = await supabase
            .from(this.tableName)
            .update({ status })
            .eq('id', id)
            .select();

        if (error) {
            console.error('Erro no Supabase (Atualizar Status Agendamento):', error);
            throw new Error('Falha ao atualizar status do agendamento.');
        }

        return (data && data.length > 0) ? (data[0] as Agendamento) : null;
    }

    /**
     * Deleta um agendamento por ID.
     * @param id ID do agendamento a deletar.
     * @returns Promise<void>\
     */
    async deletar(id: string): Promise<void> {
        const { error } = await supabase
            .from(this.tableName)
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erro no Supabase (Deletar Agendamento):', error);
            throw new Error('Falha ao deletar agendamento no banco.');
        }
    }
}