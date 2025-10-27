import { ServicoRepository } from "../repositories/ServicoRepository";

interface ServicoInput {
    nome: string;
    descricao: string;
    preco: number;
    duracao_minutos: number;
}

export class ServicoService {
    private servicoRepository: ServicoRepository;

    constructor() {
        this.servicoRepository = new ServicoRepository();
    }

    // Listar todos os serviços
    async listar() {
        return await this.servicoRepository.listar();
    }

    // Criar novo serviço
    async criar(data: ServicoInput) {
        // Lógica de Negócio: Garante que o preço e duração são válidos antes de salvar
        if (data.preco <= 0 || data.duracao_minutos <= 0) {
            throw new Error("Preço e duração devem ser valores positivos.");
        }
        return await this.servicoRepository.criar(data);
    }
    
    // Atualizar serviço
    async atualizar(id: string, data: Partial<ServicoInput & { ativo: boolean }>) {
        const servicoExistente = await this.servicoRepository.buscarPorId(id);
        
        if (!servicoExistente) {
            throw new Error(`Serviço com ID ${id} não encontrado.`);
        }
        
        // Lógica de Negócio: Evitar que campos sensíveis sejam atualizados com valores inválidos
        if (data.preco !== undefined && data.preco <= 0) {
             throw new Error("Preço de atualização deve ser positivo.");
        }

        return await this.servicoRepository.atualizar(id, data);
    }
    
    // Deletar serviço
    async deletar(id: string) {
        const servicoExistente = await this.servicoRepository.buscarPorId(id);
        
        if (!servicoExistente) {
            throw new Error(`Serviço com ID ${id} não encontrado para deleção.`);
        }
        
        return await this.servicoRepository.deletar(id);
    }
}