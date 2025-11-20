import supabase from '../supabaseClient';
import { PostgrestError } from '@supabase/supabase-js';

// Interface para a entidade Serviço.
export interface Servico { 
    id: string;
    nome: string;
    descricao: string;
    preco: number; // Tipo Numeric do banco
    duracao_minutos: number; // Tipo int4 do banco
    ativo: boolean;
}

// Interface para dados de entrada (sem ID e sem 'ativo' no momento da criação)
export interface ServicoInput extends Omit<Servico, 'id' | 'ativo'> {}

export class ServicoRepository {

    /**
     * Lista todos os serviços disponíveis.
     * @returns Promise<Servico[]> - Lista de serviços.
     */
    async listar(): Promise<Servico[]> {
        
        const { data, error } = await supabase
            .from('servico') 
            .select('*');

        if (error) {
            console.error('Erro no Supabase (Listar Servicos):', error);
            throw new Error('Falha ao obter dados do banco.');
        }

        // Garante que o tipo de retorno é Servico[]
        return data as Servico[];
    }

    /**
     * Cria um novo serviço no banco de dados.
     * @param servicoData Dados do novo serviço.
     * @returns Promise<Servico | null> - O serviço criado ou null em caso de falha silenciosa.
     */
    async criar(servicoData: ServicoInput): Promise<Servico | null> {
        const { data, error } = await supabase
            .from('servico')
            .insert([servicoData])
            .select(); // Retorna o registro inserido

        if (error) {
            console.error('Erro no Supabase (Criar Servico):', error);
            throw new Error('Falha ao inserir serviço no banco.');
        }
        
        // Retorna o primeiro (e único) item inserido, ou null se data for vazio.
        return (data && data.length > 0) ? (data[0] as Servico) : null;
    }
    
    /**
     * Obtém um serviço específico por ID.
     * @param id ID do serviço a buscar.
     * @returns Promise<Servico | null> - O serviço encontrado ou null se não existir.
     */
    async buscarPorId(id: string): Promise<Servico | null> {
        const { data, error } = await supabase
            .from('servico')
            .select('*')
            .eq('id', id)
            .single(); // Espera apenas um registro

        // 'PGRST116' é o código de erro para "nenhum registro encontrado" em .single()
        if (error && error.code !== 'PGRST116') {
             console.error('Erro no Supabase (Buscar Servico):', error);
             throw new Error('Falha ao buscar serviço no banco.');
        }
        
        // Se 'data' for null (por causa do erro PGRST116), retorna null. Caso contrário, retorna o serviço.
        return data as Servico | null;
    }

    /**
     * Atualiza um serviço existente.
     * @param id ID do serviço a atualizar.
     * @param servicoData Dados parciais a serem atualizados.
     * @returns Promise<Servico | null> - O serviço atualizado ou null se não encontrado.
     */
    async atualizar(id: string, servicoData: Partial<ServicoInput | { ativo: boolean }>): Promise<Servico | null> {
        const { data, error } = await supabase
            .from('servico')
            .update(servicoData)
            .eq('id', id)
            .select();

        if (error) {
            console.error('Erro no Supabase (Atualizar Servico):', error);
            throw new Error('Falha ao atualizar serviço no banco.');
        }

        // Retorna o primeiro (e único) item atualizado, ou null.
        return (data && data.length > 0) ? (data[0] as Servico) : null;
    }
    
    /**
     * Deleta um serviço por ID.
     * @param id ID do serviço a deletar.
     * @returns Promise<void>
     */
    async deletar(id: string): Promise<void> {
        const { error } = await supabase
            .from('servico')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erro no Supabase (Deletar Servico):', error);
            throw new Error('Falha ao deletar serviço no banco.');
        }
        // Não é necessário retornar true/false, pois o erro é lançado se houver falha no banco.
    }
}