import { Request, Response, Router } from 'express';
import { AgendamentoRepository, AgendamentoComServico } from '../repositories/AgendamentoRepository';
import { ServicoRepository } from '../repositories/ServicoRepository';
import { StatusCodes } from 'http-status-codes';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

const agendamentoRepository = new AgendamentoRepository();
const servicoRepository = new ServicoRepository(); 

/**
 * Função de auxílio para verificar se o agendamento está dentro do horário de funcionamento.
 * NOTA: Esta é uma VERIFICAÇÃO SIMPLIFICADA para o teste 4B. 
 */
const verificarExpediente = (dataHora: Date): boolean => {
    // IMPORTANTE: Trabalha com a hora UTC (padrão do Supabase/ISO 8601).
    const hora = dataHora.getUTCHours();
    const diaSemana = dataHora.getUTCDay(); // 0 = Domingo
    
    // Fechado no Domingo
    if (diaSemana === 0) return false; 

    // Supondo horário de funcionamento (UTC) de 09:00h às 19:00h.
    // O agendamento deve COMEÇAR dentro deste período.
    if (hora >= 9 && hora < 19) {
        return true;
    }
    
    return false;
};

export class AgendamentoController {
    
    private ADMIN_CLIENTE = ['ADMIN', 'CLIENTE']; 

    async criarAgendamento(req: Request, res: Response): Promise<Response> {
        const { cliente_id, barbeiro_id, servico_id, data_hora_agendada, valor_total, status } = req.body;
        
        // --- 1. Validação de Campos Obrigatórios e Tipos ---
        if (!cliente_id || !barbeiro_id || !servico_id || !data_hora_agendada || !valor_total || !status) {
             return res.status(StatusCodes.BAD_REQUEST).json({ 
                 message: 'Dados obrigatórios ausentes.' 
             });
        }
        
        const dataAgendada = new Date(data_hora_agendada);
        if (isNaN(dataAgendada.getTime())) {
             return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Formato de data_hora_agendada inválido. Use ISO 8601 (Ex: 2025-11-21T14:00:00.000Z).' });
        }
        if (typeof valor_total !== 'number' || valor_total <= 0) {
             return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Valor total inválido.' });
        }

        try {
            // --- 2. BUSCAR DURAÇÃO DO NOVO SERVIÇO ---
            const servico = await servicoRepository.buscarPorId(servico_id);
            if (!servico) {
                return res.status(StatusCodes.NOT_FOUND).json({ message: 'Serviço não encontrado.' });
            }
            const duracaoNovoServico = servico.duracao_minutos;

            // --- 3. VERIFICAR HORÁRIO DE FUNCIONAMENTO (TESTE 4B) ---
            if (!verificarExpediente(dataAgendada)) {
                 return res.status(StatusCodes.BAD_REQUEST).json({ 
                     message: 'Agendamento fora do horário de expediente da barbearia (09:00h - 19:00h UTC).' 
                 });
            }

            // --- 4. VERIFICAR CONFLITO DE HORÁRIOS (Ajuste de precisão será o próximo passo) ---
            
            const dataAgendamentoDia = dataAgendada.toISOString().split('T')[0];
            const agendamentosExistentes = await agendamentoRepository.listarPorBarbeiroEData(
                barbeiro_id, 
                dataAgendamentoDia
            );
            
            // Intervalo do NOVO Agendamento (em milissegundos)
            const novoInicio = dataAgendada.getTime(); 
            // Usa -1ms para que o FINAL do novo serviço não conflite com o INÍCIO exato de outro
            const novoFim = novoInicio + (duracaoNovoServico * 60 * 1000) - 1; 

            // Iterar e checar a sobreposição
            for (const agendamento of agendamentosExistentes) {
                const duracaoExistente = agendamento.servico[0]?.duracao_minutos; 
                
                if (!duracaoExistente) continue; 

                // Intervalo do AGENDAMENTO EXISTENTE (em milissegundos)
                const inicioExistente = new Date(agendamento.data_hora_agendada).getTime();
                // Usa -1ms para que o FINAL do serviço existente não conflite com o INÍCIO exato de outro
                const fimExistente = inicioExistente + (duracaoExistente * 60 * 1000) - 1; 

                // --- Lógica de Sobreposição (Interval Overlap) ---
                // Verifica se os dois intervalos se cruzam
                if (
                    (novoInicio <= fimExistente) && 
                    (novoFim >= inicioExistente)
                ) {
                    // SE HOUVER SOBREPOSIÇÃO, DISPARA O CONFLITO!
                    return res.status(StatusCodes.CONFLICT).json({ 
                        message: `Barbeiro indisponível. Conflito com agendamento existente das ${new Date(inicioExistente).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}h.` 
                    });
                }
            }
            // --- FIM DA VERIFICAÇÃO DE CONFLITO ---

            // --- 5. CRIAR AGENDAMENTO ---
            const novoAgendamento = await agendamentoRepository.criar({
                cliente_id,
                barbeiro_id,
                servico_id,
                data_hora_agendada,
                valor_total,
                status
            });

            return res.status(StatusCodes.CREATED).json(novoAgendamento);

        } catch (error) {
            console.error('Erro ao criar agendamento:', error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
                message: 'Falha interna ao criar agendamento.' 
            });
        }
    }

    public rotas(): Router {
        const agendamentoRouter = Router();

        agendamentoRouter.post(
            '/', 
            authMiddleware, 
            roleMiddleware(this.ADMIN_CLIENTE),
            this.criarAgendamento.bind(this) 
        );

        return agendamentoRouter;
    }
}