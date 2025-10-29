import { AgendamentoRepository, AgendamentoInput, Agendamento } from "../repositories/AgendamentoRepository";
import { ServicoRepository, Servico } from "../repositories/ServicoRepository"; // Precisamos do preço do serviço
import { BarbeiroRepository } from "../repositories/BarbeiroRepository";

// Tipo de dados recebidos do Controller (cliente_id será injetado, valor_total será calculado)
interface AgendamentoPayload {
    clienteId: string; // Vem do JWT (req.usuario.id)
    barbeiroId: string;
    servicoId: string;
    dataHoraAgendada: string;
}

// Define os status válidos para o sistema
const STATUS_VALIDOS = ['PENDENTE', 'CONFIRMADO', 'CONCLUIDO', 'CANCELADO'];
// Status inicial para novos agendamentos
const STATUS_INICIAL = 'PENDENTE';

export class AgendamentoService {
    private agendamentoRepository: AgendamentoRepository;
    private servicoRepository: ServicoRepository;
    private barbeiroRepository: BarbeiroRepository;

    constructor() {
        this.agendamentoRepository = new AgendamentoRepository();
        this.servicoRepository = new ServicoRepository(); 
        this.barbeiroRepository = new BarbeiroRepository();
    }

    async criarAgendamento(data: AgendamentoPayload): Promise<Agendamento> {
        
        // 1. Validação do Barbeiro: Deve existir na tabela 'barbeiro
        const barbeiroExiste = await this.barbeiroRepository.buscarPorId(data.barbeiroId);
        if (!barbeiroExiste) {
            throw new Error('Barbeiro selecionado não existe na tabela Barbeiro.'); 
        }

        // 2. Buscar dados do Serviço (necessário para o preço)
        const servico: Servico | null = await this.servicoRepository.buscarPorId(data.servicoId);
        if (!servico) {
            throw new Error('Serviço selecionado não existe.');
        }
        
        // 3. Lógica de Negócio: Calcular valor total
        const valor_total = servico.preco; // Se fosse múltiplos serviços, faríamos a soma.

        // 4. Montar o objeto para o Repositório
        const agendamentoData: AgendamentoInput = {
            cliente_id: data.clienteId,
            barbeiro_id: data.barbeiroId,
            servico_id: data.servicoId,
            data_hora_agendada: data.dataHoraAgendada,
            valor_total: valor_total,
            status: STATUS_INICIAL
        };

        // 5. Inserir no Banco
        const novoAgendamento = await this.agendamentoRepository.criar(agendamentoData);

        // Checagem:
        if (!novoAgendamento) {
            // Se, por alguma razão (além do erro 500 do repositório), não retornar nada:
            throw new Error("Agendamento falhou por razão desconhecida.");
        }

        return novoAgendamento;
    }
    
    // Atualizar Status
    async atualizarStatus(agendamentoId: string, novoStatus: string): Promise<Agendamento> {
        // 1. Validação do novo status
        const statusUpper = novoStatus.toUpperCase();
        if (!STATUS_VALIDOS.includes(statusUpper)) {
            throw new Error(`Status inválido. Status permitidos: ${STATUS_VALIDOS.join(', ')}.`);
        }

        // 2. Chamar o Repositório
        const agendamentoAtualizado = await this.agendamentoRepository.atualizarStatus(
            agendamentoId,
            statusUpper // Sempre salva em caixa alta
        );

        // 3. Checagem de existência
        if (!agendamentoAtualizado) {
            throw new Error('Agendamento não encontrado para atualização.');
        }

        return agendamentoAtualizado;
    }

    // Lista todos os agendamentos
    async listarAgendamentos(): Promise<Agendamento[]> {
        return this.agendamentoRepository.listar();
    }

    // Deletar Agendamento
    async deletarAgendamento(agendamentoId: string): Promise<void> {
        // No momento, apenas verificamos se a deleção falha no banco.
        // O controle de quem pode deletar será feito no Controller/Middleware.
        try {
            await this.agendamentoRepository.deletar(agendamentoId);
        } catch (error: any) {
            throw new Error(`Não foi possível deletar o agendamento: ${error.message}`);
        }
    }
}