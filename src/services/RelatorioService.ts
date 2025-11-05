import supabase from '../supabaseClient';
import { VendaRepository } from '../repositories/VendaRepository';
import { PostgrestError } from '@supabase/supabase-js';

// DTO para o Faturamento
export interface Faturamento {
    data_venda: string; // Data formatada
    total_vendido: number;
    quantidade_vendas: number;
}

// DTO para as Comissões
export interface ComissaoBarbeiro {
    usuario_id: string;
    nome_barbeiro: string;
    total_vendido: number;
    total_comissao: number; // Placeholder para o cálculo de comissão
}

export class RelatorioService {
    private vendaRepository: VendaRepository;

    constructor() {
        this.vendaRepository = new VendaRepository(); // Reutiliza a dependência
    }

    /**
     * Gera o relatório de faturamento total agrupado por dia.
     * @param dataInicio - Data de início (YYYY-MM-DD)
     * @param dataFim - Data de fim (YYYY-MM-DD)
     */
    async gerarFaturamentoDiario(dataInicio: string, dataFim: string): Promise<Faturamento[]> {
        try {
            // NOTE: Estamos chamando o banco diretamente para o SQL de agregação complexa (GROUP BY).
            const { data, error } = await supabase
                .from('venda')
                .select(`
                    data_venda,
                    valor_final
                `)
                .gte('data_venda', dataInicio) // Filtra >= data de início
                .lte('data_venda', dataFim);   // Filtra <= data de fim

            if (error) {
                console.error('ERRO SUPABASE (Faturamento):', error);
                throw new Error(`Falha ao gerar relatório de faturamento: ${error.message}`);
            }

            // Mapeamento e Agregação no backend (Melhor seria via PostgREST ou RPC para grandes volumes)
            const faturamentoMap = new Map<string, { total: number, count: number }>();

            data.forEach((venda: any) => {
                // A data_venda vem como timestamp, pegamos só a data (YYYY-MM-DD)
                const dataFormatada = venda.data_venda.substring(0, 10); 
                const valor = venda.valor_final || 0;

                const registro = faturamentoMap.get(dataFormatada) || { total: 0, count: 0 };
                registro.total += valor;
                registro.count += 1;
                faturamentoMap.set(dataFormatada, registro);
            });

            // Converte o Mapa para o DTO de Faturamento
            const resultado: Faturamento[] = Array.from(faturamentoMap, ([data, registro]) => ({
                data_venda: data,
                total_vendido: parseFloat(registro.total.toFixed(2)),
                quantidade_vendas: registro.count
            }));

            return resultado.sort((a, b) => a.data_venda.localeCompare(b.data_venda));

        } catch (error) {
            throw new Error(`Erro no serviço de Faturamento: ${(error as Error).message}`);
        }
    }

    /**
     * Gera o relatório de comissões por barbeiro/vendedor.
     * Por enquanto, apenas o total vendido por cada um.
     */
    async gerarComissaoBarbeiros(): Promise<ComissaoBarbeiro[]> {
         try {
            // Usa join para pegar o nome do usuário/barbeiro e agrupa
            const { data, error } = await supabase
                .from('venda')
                .select(`
                    usuario:usuario_id (id, nome),
                    valor_final
                `);
                
            if (error) {
                console.error('ERRO SUPABASE (Comissão):', error);
                throw new Error(`Falha ao gerar relatório de comissão: ${error.message}`);
            }
            
            const comissaoMap = new Map<string, { nome: string, total: number }>();

            data.forEach((venda: any) => {
                // CORREÇÃO AQUI: Tenta acessar como objeto aninhado, senão tenta o primeiro elemento de um array
                let usuario;
                if (venda.usuario && typeof venda.usuario === 'object' && !Array.isArray(venda.usuario)) {
                    // Caso 1: Retorna o objeto diretamente (Estrutura mais comum em joins 1:1)
                    usuario = venda.usuario;
                } else if (Array.isArray(venda.usuario) && venda.usuario.length > 0) {
                    // Caso 2: Retorna um array de objetos (Estrutura observada em algumas configurações)
                    usuario = venda.usuario[0];
                }
                
                // Garante que o usuário é ADMIN ou BARBEIRO (já que apenas eles fazem vendas)
                if (usuario && usuario.id) { 
                    const registro = comissaoMap.get(usuario.id) || { nome: usuario.nome, total: 0 };
                    registro.total += venda.valor_final || 0;
                    comissaoMap.set(usuario.id, registro);
                }
            });

            const resultado: ComissaoBarbeiro[] = Array.from(comissaoMap, ([id, registro]) => ({
                usuario_id: id,
                nome_barbeiro: registro.nome,
                total_vendido: parseFloat(registro.total.toFixed(2)),
                total_comissao: parseFloat((registro.total * 0.1).toFixed(2)) // Exemplo de 10% de comissão
            }));

            return resultado.sort((a, b) => b.total_vendido - a.total_vendido);

        } catch (error) {
            throw new Error(`Erro no serviço de Comissão: ${(error as Error).message}`);
        }
    }
}