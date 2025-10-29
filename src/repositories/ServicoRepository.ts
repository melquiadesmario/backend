import supabase from '../supabaseClient';

export interface Servico { 
    id: string;
    nome: string;
    descricao: string;
    preco: number; // Tipo Numeric do banco
    duracao_minutos: number; // Tipo int4 do banco
    ativo: boolean;
}

export interface ServicoInput extends Omit<Servico, 'id' | 'ativo'> {}

export class ServicoRepository {

    async listar() {
        
        const { data, error } = await supabase
            .from('servico') 
            .select('*');

        if (error) {
            console.error('Erro no Supabase (Listar Servicos):', error);
            throw new Error('Falha ao obter dados do banco.');
        }

        return data;
    }

    // Criar um novo serviço
    async criar(servicoData: { nome: string, descricao: string, preco: number, duracao_minutos: number }) {
        const { data, error } = await supabase
            .from('servico')
            .insert([servicoData])
            .select(); // Retorna o registro inserido

        if (error) {
            console.error('Erro no Supabase (Criar Servico):', error);
            throw new Error('Falha ao inserir serviço no banco.');
        }

        return data ? data[0] : null;
    }
    
    // Obter um serviço por ID
    async buscarPorId(id: string) {
        const { data, error } = await supabase
            .from('servico')
            .select('*')
            .eq('id', id)
            .single(); // Espera apenas um registro

        if (error && error.code !== 'PGRST116') {
             console.error('Erro no Supabase (Buscar Servico):', error);
             throw new Error('Falha ao buscar serviço no banco.');
        }
        
        return data;
    }

    // Atualizar um serviço
    async atualizar(id: string, servicoData: Partial<{ nome: string, descricao: string, preco: number, duracao_minutos: number, ativo: boolean }>) {
        const { data, error } = await supabase
            .from('servico')
            .update(servicoData)
            .eq('id', id)
            .select();

        if (error) {
            console.error('Erro no Supabase (Atualizar Servico):', error);
            throw new Error('Falha ao atualizar serviço no banco.');
        }

        return data ? data[0] : null;
    }
    
    // Deletar um serviço
    async deletar(id: string) {
        const { error } = await supabase
            .from('servico')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erro no Supabase (Deletar Servico):', error);
            throw new Error('Falha ao deletar serviço no banco.');
        }

        return true; // Sucesso na deleção
    }
}