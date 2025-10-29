import { Router } from 'express';
import { authMiddleware } from './middlewares/authMiddleware';
import { roleMiddleware } from './middlewares/roleMiddleware';
import { ServicoController } from './controllers/ServicoController'; 
import { UsuarioController } from './controllers/UsuarioController';
import { AgendamentoController } from './controllers/AgendamentoController';

const router = Router();
const servicoController = new ServicoController();
const usuarioController = new UsuarioController();
const agendamentoController = new AgendamentoController();

// ------------------------------------
// ROTAS DE USUÁRIO / AUTENTICAÇÃO (Públicas)
// ------------------------------------
router.post('/usuarios/registrar', usuarioController.registrar);
router.post('/usuarios/login', usuarioController.login);

// Define as permissões para a manipulação de Serviços
const ADMIN_ONLY = ['ADMIN']; // Apenas o cargo ADMIN pode manipular
const CLIENTE_ONLY = ['CLIENTE']; // Apenas o CLIENTE pode criar agendamentos
const ADMIN_BARBEIRO = ['ADMIN', 'BARBEIRO']; // Admin e Barbeiro poderão listar

// ------------------------------------
// ROTAS DE SERVIÇO (CRUD) (PROTEGIDAS COM JWT E RBAC)
// ------------------------------------
// GET /servicos: Público para CLIENTES, BARBEIROS e ADMIN. Não precisa de authMiddleware.
router.get('/servicos', servicoController.listar);
// POST, PUT, DELETE: Apenas ADMIN
router.post('/servicos', authMiddleware, servicoController.criar); 
router.put('/servicos/:id', authMiddleware, servicoController.atualizar);
router.delete('/servicos/:id', authMiddleware, servicoController.deletar);

// ------------------------------------
// ROTAS DE AGENDAMENTO
// ------------------------------------
// Criação: Apenas CLIENTE
router.post('/agendamentos', authMiddleware, roleMiddleware(CLIENTE_ONLY), agendamentoController.criar);

// Listagem: ADMIN ou BARBEIRO
router.get('/agendamentos', authMiddleware, roleMiddleware(ADMIN_BARBEIRO), agendamentoController.listar);

export { router };