import { Router } from 'express';
import { ServicoController } from './controllers/ServicoController'; 

const router = Router();
const servicoController = new ServicoController();

// ROTAS DE SERVIÇO (CRUD)
router.get('/servicos', servicoController.listar);
router.post('/servicos', servicoController.criar);
router.put('/servicos/:id', servicoController.atualizar);
router.delete('/servicos/:id', servicoController.deletar);

export { router };