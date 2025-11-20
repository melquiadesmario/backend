import supabase from '../supabaseClient';

export interface Barbeiro {
    id: string; // ID da tabela 'barbeiro'
    usuario_id: string; // ID do usuário associado
    biografia: string;
    data_contratacao: string;
}

export class BarbeiroRepository {

    /**
     * Busca um barbeiro pelo seu ID na tabela 'barbeiro'.
     * Retorna o objeto Barbeiro ou null se não for encontrado.
     * @param id ID do barbeiro a ser buscado.
     * @returns Promise<Barbeiro | null>
     */
    async buscarPorId(id: string): Promise<Barbeiro | null> {
        const { data, error } = await supabase
            .from('barbeiro')
            .select('*')
            .eq('id', id)
            .single();

        // PGRST116: Nenhum registro encontrado. É um caso de sucesso (Barbeiro não existe), não um erro de banco.
        if (error && error.code !== 'PGRST116') {
            console.error('ERRO SUPABASE (Buscar Barbeiro):', error);
            throw new Error('Falha ao buscar barbeiro por ID.');
        }

        // Retorna o objeto tipado ou null se 'data' for nulo (por causa do erro PGRST116).
        return data as Barbeiro || null;
    }
}