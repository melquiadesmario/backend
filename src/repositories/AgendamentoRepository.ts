import supabase from '../supabaseClient';
import { PostgrestError } from '@supabase/supabase-js';

export interface AgendamentoInput {
    cliente_id: string; // ID do Cliente (do token JWT)
    barbeiro_id: string; 
    servico_id: string;
    data_hora_agendada: string;
    valor_total: number;
    status: string; // Ex: 'PENDENTE', 'CONFIRMADO', 'CANCELADO'
}

export interface Agendamento extends AgendamentoInput {
    id: string;
}

export class AgendamentoRepository {

    async criar(data: AgendamentoInput): Promise<Agendamento | null> {
        const { data: novoAgendamento, error } = await supabase
            .from('agendamento')
            .insert([data])
            .select()
            .single();

        if (error) {
            console.error('ERRO SUPABASE (Criar Agendamento):', error);
            throw new Error(`Falha ao inserir agendamento no banco. Detalhe: ${(error as PostgrestError).message}`);
        }

        return novoAgendamento as Agendamento;
    }

    // LISTAR TODOS
    async listar(): Promise<Agendamento[]> {
        const { data, error } = await supabase
            .from('agendamento')
            .select('*');

        if (error) {
            console.error('ERRO SUPABASE (Listar Agendamentos):', error);
            throw new Error('Falha ao listar agendamentos.');
        }

        return data as Agendamento[];
    }

    // Atualizar Status
    async atualizarStatus(id: string, novoStatus: string): Promise<Agendamento | null> {
        const { data, error } = await supabase
            .from('agendamento')
            .update({ status: novoStatus })
            .eq('id', id)
            .select() // Retorna a linha atualizada
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('ERRO SUPABASE (Atualizar Status Agendamento):', error);
            throw new Error('Falha ao atualizar status do agendamento.');
        }

        // Retorna a linha atualizada, ou null se não encontrada
        return data as Agendamento || null; 
    }

    // Deletar Agendamento
    async deletar(id: string): Promise<boolean> {
        // Apenas deletamos e verificamos se houve um erro no processo.
        // Se a linha não existir, error será nulo e a operação será considerada sucesso (204 No Content)
        const { error } = await supabase
            .from('agendamento')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('ERRO SUPABASE (Deletar Agendamento):', error);
            throw new Error('Falha ao deletar agendamento.');
        }

        // Se não houve erro, a operação foi bem-sucedida
        return true; 
    }
}