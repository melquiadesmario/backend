import { Request, Response } from 'express';
import { RelatorioService } from '../services/RelatorioService';
import { UnprocessableEntityError } from '../utils/errors';

export class RelatorioController {
    private relatorioService: RelatorioService;

    constructor() {
        this.relatorioService = new RelatorioService();
    }

    // HANDLER DE ERROS
    private handleError(res: Response, error: any): Response {
        if (error instanceof UnprocessableEntityError) {
            return res.status(422).json({ message: error.message });
        }
        console.error('Erro no RelatorioController:', error);
        return res.status(500).json({ message: 'Falha interna ao gerar relatório.' });
    }

    // 1. RELATÓRIO DE FATURAMENTO DIÁRIO (GET /relatorios/faturamento)
    public faturamento = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { dataInicio, dataFim } = req.query;

            if (!dataInicio || !dataFim || typeof dataInicio !== 'string' || typeof dataFim !== 'string') {
                throw new UnprocessableEntityError("As datas 'dataInicio' e 'dataFim' são obrigatórias na query string.");
            }
            
            // NOTE: A validação de formato de data (YYYY-MM-DD) pode ser adicionada aqui ou no Service.

            const relatorio = await this.relatorioService.gerarFaturamentoDiario(dataInicio, dataFim);
            return res.status(200).json(relatorio);
        } catch (error) {
            return this.handleError(res, error);
        }
    };

    // 2. RELATÓRIO DE COMISSÃO DE BARBEIROS (GET /relatorios/comissao)
    public comissao = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Este relatório não exige filtros de data por enquanto (apenas o total geral)
            const relatorio = await this.relatorioService.gerarComissaoBarbeiros();
            return res.status(200).json(relatorio);
        } catch (error) {
            return this.handleError(res, error);
        }
    };
}