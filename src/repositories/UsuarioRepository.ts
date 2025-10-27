import supabase from '../supabaseClient';

export interface UsuarioInput {
    nome: string;
    email: string;
    senha: string;
    telefone?: string;
    cargo_id: string; 
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
}