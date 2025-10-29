import supabase from '../supabaseClient';

export interface Barbeiro {
    id: string; // ID da tabela 'barbeiro'
    usuario_id: string; // ID do usuário associado
    biografia: string;
    data_contratacao: string;
}

export class BarbeiroRepository {
    async buscarPorId(id: string): Promise<Barbeiro | null> {
        const { data, error } = await supabase
            .from('barbeiro')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('ERRO SUPABASE (Buscar Barbeiro):', error);
            throw new Error('Falha ao buscar barbeiro por ID.');
        }
        return data as Barbeiro || null;
    }
}