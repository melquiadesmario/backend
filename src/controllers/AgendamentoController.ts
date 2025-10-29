import { Request, Response } from 'express';
import { AgendamentoService } from '../services/AgendamentoService';

export class AgendamentoController {
    private agendamentoService: AgendamentoService;

    constructor() {
        this.agendamentoService = new AgendamentoService();
    }

    // POST /agendamentos
    // Protegido por authMiddleware e roleMiddleware(['CLIENTE'])
    public criar = async (req: Request, res: Response): Promise<Response> => {
        try {
            // O clienteId vem do token JWT, injetado pelo authMiddleware.
            // O TS precisa de checagem, mas sabemos que ele existe porque o middleware de Auth rodou.
            const clienteId = req.usuario?.id; 

            // Se o authMiddleware rodou, o clienteId deve existir.
            if (!clienteId) {
                 // Esta falha só ocorreria se o authMiddleware falhasse catastroficamente
                return res.status(401).json({ message: 'Cliente não autenticado ou token inválido.' });
            }

            // Dados do Body (o que o cliente informa)
            const { barbeiroId, servicoId, dataHoraAgendada } = req.body;

            // 1. Validação simples de campos obrigatórios
            if (!barbeiroId || !servicoId || !dataHoraAgendada) {
                return res.status(400).json({ 
                    message: "Barbeiro, serviço e data/hora de agendamento são obrigatórios." 
                });
            }
            
            // 2. Chamar o Service, injetando o ID do Cliente logado
            const novoAgendamento = await this.agendamentoService.criarAgendamento({
                clienteId: clienteId, // ID INJETADO AQUI
                barbeiroId,
                servicoId,
                dataHoraAgendada
            });

            return res.status(201).json(novoAgendamento);

        } catch (error: any) {
            console.error('Erro ao criar agendamento:', error.message);

            // Tratamento específico para erros de validação do Service
            if (error.message.includes('não existe')) {
                return res.status(400).json({ message: error.message });
            }
            
            return res.status(500).json({ message: `Falha ao agendar serviço: ${error.message}` });
        }
    };

    // Atualizar Status
    public atualizarStatus = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params; // ID do Agendamento vem do URL
            const { status } = req.body; // Novo status vem do Body

            if (!status) {
                return res.status(400).json({ message: 'O novo status é obrigatório.' });
            }

            const agendamentoAtualizado = await this.agendamentoService.atualizarStatus(id, status);

            return res.status(200).json(agendamentoAtualizado);
        } catch (error: any) {
            console.error('Erro ao atualizar status do agendamento:', error.message);
            if (error.message.includes('não encontrado') || error.message.includes('inválido')) {
                return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({ message: 'Falha ao atualizar status do agendamento.' });
        }
    };
    
    // Lista Agendamentos
    public listar = async (req: Request, res: Response): Promise<Response> => {
        try {
            const agendamentos = await this.agendamentoService.listarAgendamentos();
            return res.status(200).json(agendamentos);
        } catch (error: any) {
            return res.status(500).json({ message: 'Falha ao listar agendamentos.' });
        }
    };

    // Deletar Agendamento
    public deletar = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;

            await this.agendamentoService.deletarAgendamento(id);

            // Resposta 204 No Content para deleção bem-sucedida
            return res.status(204).send();
        } catch (error: any) {
            console.error('Erro ao deletar agendamento:', error.message);
            return res.status(500).json({ message: `Falha ao deletar agendamento: ${error.message}` });
        }
    };
}