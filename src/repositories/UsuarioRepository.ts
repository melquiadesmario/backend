import supabase from '../supabaseClient';

// 1. DEFINE E EXPORTA a interface UsuarioInput (Usada no Service)
export interface UsuarioInput {
    nome: string;
    email: string;
    senha: string;
    telefone?: string;
    cargo_id: string;
    senha_hash: string;
}

// 2. DEFINE E EXPORTA a interface Usuario (O que o banco retorna)
export interface Usuario extends Omit<UsuarioInput, 'senha' | 'senha_hash'> {
    id: string;
    cargo_id: string;
    ativo: boolean;
    criado_em: string;
    senha_hash: string;
}

export class UsuarioRepository {

    // 1. Criar um novo usuário (usado após o hashing de senha)
    async criar(usuarioData: Omit<UsuarioInput, 'senha'> & { senha_hash: string }) {
        
        const { data, error } = await supabase
            .from('usuario')
            .insert([usuarioData])
            .select('id, nome, email, cargo_id, telefone, criado_em, ativo'); // Retorna campos seguros

        if (error) {
            console.error('Erro no Supabase (Criar Usuário):', error);
            throw new Error(`Falha ao inserir usuário: ${error.message}`);
        }

        return data ? data[0] : null;
    }

    // 2. Buscar usuário pelo email (crucial para o login/autenticação)
    async buscarPorEmail(email: string) {
        const { data, error } = await supabase
            .from('usuario')
            .select('*')
            .eq('email', email)
            .single();

        if (error && error.code !== 'PGRST116') { 
            console.error('Erro no Supabase (Buscar por Email):', error);
            throw new Error('Falha ao buscar usuário no banco.');
        }

        // Retorna o objeto completo, incluindo o senha_hash, necessário para a Service
        return data; 
    }

    async buscarPorId(id: string): Promise<Usuario | null> {
        const { data, error } = await supabase
            .from('usuario')
            .select('*, cargo_id') // Selecionar tudo, incluindo o cargo_id
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('ERRO SUPABASE (Buscar Usuário por ID):', error);
            throw new Error('Falha ao buscar usuário por ID.');
        }
        return data || null;
    }
}