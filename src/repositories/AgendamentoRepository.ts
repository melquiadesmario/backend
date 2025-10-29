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

    // LISTAR TODOS (por enquanto, para o ADMIN)
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
}