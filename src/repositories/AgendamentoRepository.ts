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

    /**
     * Verifica se há agendamento conflitante considerando a duração do serviço.
     * Um agendamento é conflitante se o seu período (início + duração) se sobrepõe
     * ao período de um agendamento existente para o mesmo barbeiro.
     * @param barbeiroId ID do barbeiro.
     * @param dataHora Início do novo agendamento (ISO string).
     * @param duracaoMinutos Duração do novo serviço em minutos.
     */
    async verificarConflito(barbeiroId: string, dataHora: string, duracaoMinutos: number): Promise<boolean> {
        
        // Calcula o FIM PROJETADO do NOVO agendamento: dataHora + duracaoMinutos
        // Usamos Date para calcular o fim do novo agendamento.
        const dataFimNovo = new Date(dataHora);
        dataFimNovo.setMinutes(dataFimNovo.getMinutes() + duracaoMinutos);
        const dataFimNovoString = dataFimNovo.toISOString();

        // ------------------------------------------------------------------------------------
        // LÓGICA DE SOBREPOSIÇÃO (Overlaps)
        // ------------------------------------------------------------------------------------
        // Buscamos um agendamento existente (A_EXISTENTE) que:
        // 1. Seja do mesmo barbeiro.
        // 2. Não esteja cancelado.
        // 3. Cujo INÍCIO esteja ANTES do FIM do NOVO agendamento. (A_EXISTENTE.INICIO < NOVO.FIM)
        // 4. Cujo FIM (INICIO + DURACAO) esteja DEPOIS do INÍCIO do NOVO agendamento. (A_EXISTENTE.FIM > NOVO.INICIO)
        //    *NOTA: Para (4), precisamos calcular o FIM do agendamento existente, o que exige um JOIN com 'servico'.
        
        try {
            // Buscamos um agendamento existente que se sobreponha.
            const { data, error } = await supabase
                .from('agendamento')
                .select(`
                    id,
                    data_hora_agendada,
                    servico:servico_id (duracao_minutos) // Traz a duração do serviço existente
                `)
                .eq('barbeiro_id', barbeiroId)
                .neq('status', 'CANCELADO');

            if (error) {
                console.error('ERRO SUPABASE (Verificar Conflito):', error);
                throw new Error('Falha ao verificar conflito de agendamento por intervalo.');
            }

            if (error) {
                console.error('ERRO SUPABASE (Verificar Conflito):', error);
                throw new Error('Falha ao verificar conflito de agendamento por intervalo.');
            }

            // Filtragem da Sobrecarga (Refinando o acesso à duração do serviço)
            const conflito = data.find((agendamentoExistente: any) => {
                
                // 1. Acesso Seguro à Duração:
                // O servico_id retorna como objeto (join 1:1). Usamos 30 como fallback de segurança.
                let duracaoExistente = 30; // Default de segurança
                if (agendamentoExistente.servico) {
                    // Verifica se o objeto servico existe e tem o campo duracao_minutos
                    duracaoExistente = agendamentoExistente.servico.duracao_minutos || 30;
                }
                
                // 2. Continua com a lógica de comparação de intervalos
                const inicioExistente = new Date(agendamentoExistente.data_hora_agendada);
                // NOTA: Multiplicar por 60000 converte minutos para milissegundos
                const fimExistente = new Date(inicioExistente.getTime() + duracaoExistente * 60000); 
                
                const inicioNovo = new Date(dataHora);
                const fimNovo = dataFimNovo; // dataFimNovo é calculada no início do método

                // Regra de Sobrecarga: (A < D) && (C < B)
                const isOverlapping = 
                    inicioExistente.getTime() < fimNovo.getTime() && 
                    inicioNovo.getTime() < fimExistente.getTime();
                
                return isOverlapping;
            });

            // Se `conflito` for diferente de undefined, há um agendamento sobreposto.
            return !!conflito; 

        } catch (error) {
            console.error('ERRO INTERNO (Verificar Conflito por Intervalo):', error);
            throw new Error('Erro na lógica de verificação de conflito de agendamento.');
        }
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