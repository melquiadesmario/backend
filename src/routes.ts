import { Router } from 'express';
import { authMiddleware } from './middlewares/authMiddleware';
import { roleMiddleware } from './middlewares/roleMiddleware';
import { ServicoController } from './controllers/ServicoController'; 
import { UsuarioController } from './controllers/UsuarioController';
import { AgendamentoController } from './controllers/AgendamentoController';
import { ProdutoController } from './controllers/ProdutoController';
import { VendaController } from './controllers/VendaController';

const router = Router();
const servicoController = new ServicoController();
const usuarioController = new UsuarioController();
const agendamentoController = new AgendamentoController();
const produtoController = new ProdutoController();
const vendaController = new VendaController();

// ------------------------------------
// ROTAS DE USUÁRIO / AUTENTICAÇÃO (Públicas)
// ------------------------------------
router.post('/usuarios/registrar', usuarioController.registrar);
router.post('/usuarios/login', usuarioController.login);

// Define as permissões para a manipulação de Serviços
const ADMIN = ['ADMIN']; // Apenas o cargo ADMIN pode manipular
const CLIENTE_ONLY = ['CLIENTE']; // Apenas o CLIENTE pode criar agendamentos
const ADMIN_CLIENTE = ['ADMIN', 'CLIENTE']; // Admin e Cliente poderão deletar
const ADMIN_BARBEIRO = ['ADMIN', 'BARBEIRO']; // Admin e Barbeiro poderão listar

// ------------------------------------
// ROTAS DE SERVIÇO (CRUD) (PROTEGIDAS COM JWT E RBAC)
// ------------------------------------
// GET /servicos: Público para CLIENTES, BARBEIROS e ADMIN. Não precisa de authMiddleware.
router.get('/servicos', servicoController.listar);
// POST, PUT, DELETE: Apenas ADMIN
router.post('/servicos', authMiddleware, roleMiddleware(ADMIN), servicoController.criar); 
router.put('/servicos/:id', authMiddleware, roleMiddleware(ADMIN), servicoController.atualizar);
router.delete('/servicos/:id', authMiddleware, roleMiddleware(ADMIN), servicoController.deletar);

// ------------------------------------
// ROTAS DE AGENDAMENTO
// ------------------------------------
// Criação: Apenas CLIENTE
router.post('/agendamentos', authMiddleware, roleMiddleware(CLIENTE_ONLY), agendamentoController.criar);
// Listagem: ADMIN ou BARBEIRO
router.get('/agendamentos', authMiddleware, roleMiddleware(ADMIN_BARBEIRO), agendamentoController.listar);
// Atualização de Status: Apenas ADMIN ou BARBEIRO
router.put('/agendamentos/:id/status', authMiddleware, roleMiddleware(ADMIN_BARBEIRO), agendamentoController.atualizarStatus);
// Exclusão: Apenas ADMIN ou CLIENTE (para cancelar)
router.delete('/agendamentos/:id', authMiddleware, roleMiddleware(ADMIN_CLIENTE), agendamentoController.deletar);

// ------------------------------------
// ROTAS DE PRODUTO (CRUD)
// ------------------------------------
// Criar Produto (Apenas Admin)
router.post('/produtos', authMiddleware, roleMiddleware(ADMIN), produtoController.criar);
// Listar Todos (Apenas Admin)
router.get('/produtos', authMiddleware, roleMiddleware(ADMIN), produtoController.listar);
// Buscar por ID (Apenas Admin)
router.get('/produtos/:id', authMiddleware, roleMiddleware(ADMIN), produtoController.buscarPorId);
// Atualizar Produto (Apenas Admin)
router.put('/produtos/:id', authMiddleware, roleMiddleware(ADMIN), produtoController.atualizar);
// Deletar Produto (Apenas Admin)
router.delete('/produtos/:id', authMiddleware, roleMiddleware(ADMIN), produtoController.deletar);

// ------------------------------------
// ROTAS DE VENDA
// ------------------------------------
// Criar Venda (Apenas Admin e Barbeiro)
router.post('/vendas', authMiddleware, roleMiddleware(ADMIN_BARBEIRO), vendaController.criar);
// Listar Todas as Vendas (Apenas Admin e Barbeiro)
router.get('/vendas', authMiddleware, roleMiddleware(ADMIN_BARBEIRO), vendaController.listar);

export { router };