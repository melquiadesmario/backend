import supabase from '../supabaseClient';

// Definir a interface Cargo para tipagem
export interface Cargo {
    id: string;
    nome: string;
    descricao: string;
}

export class CargoRepository {
    // 1. MÉTODO NECESSÁRIO PARA O REGISTRO DE USUÁRIO (buscarPorNome)
    async buscarPorNome(nome: string): Promise<Cargo | null> {
        const { data, error } = await supabase
            .from('cargo')
            .select('*')
            .eq('nome', nome.toUpperCase()) // Garante que a busca seja case-insensitive
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('ERRO SUPABASE (Buscar Cargo por Nome):', error);
            throw new Error('Falha ao buscar cargo por nome.');
        }

        return data || null;
    }

    // 2. MÉTODO NECESSÁRIO PARA O MIDDLEWARE RBAC (buscarPorId)
    async buscarPorId(id: string): Promise<Cargo | null> {
        const { data, error } = await supabase
            .from('cargo')
            .select('*')
            .eq('id', id) 
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('ERRO SUPABASE (Buscar Cargo por ID):', error);
            throw new Error('Falha ao buscar cargo por ID.');
        }

        return data || null;
    }
}