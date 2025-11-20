import { Router } from 'express';
import { authMiddleware } from './middlewares/authMiddleware';
import { roleMiddleware } from './middlewares/roleMiddleware';
import { ServicoController } from './controllers/ServicoController'; 
import { UsuarioController } from './controllers/UsuarioController';
import { AgendamentoController } from './controllers/AgendamentoController';
import { ProdutoController } from './controllers/ProdutoController';
import { VendaController } from './controllers/VendaController';
import { RelatorioController } from './controllers/RelatorioController';

const router = Router(); 

const servicoController = new ServicoController();
const usuarioController = new UsuarioController();
const agendamentoController = new AgendamentoController(); 
const produtoController = new ProdutoController();
const vendaController = new VendaController();
const relatorioController = new RelatorioController();

// Define as permissões
const ADMIN = ['ADMIN'];
const CLIENTE_ONLY = ['CLIENTE']; 
const ADMIN_CLIENTE = ['ADMIN', 'CLIENTE']; 
const ADMIN_BARBEIRO = ['ADMIN', 'BARBEIRO']; 

// ------------------------------------
// ROTAS DE USUÁRIO / AUTENTICAÇÃO (Públicas)
// CORRIGIDO: Adicionando .bind() para garantir o contexto (this) no Controller
// ------------------------------------
router.post('/usuarios/registrar', usuarioController.registrar.bind(usuarioController));
router.post('/usuarios/login', usuarioController.login.bind(usuarioController));

// ------------------------------------
// ROTAS DE SERVIÇO
// ------------------------------------
// Criar Serviço (Apenas Admin)
router.post('/servicos', authMiddleware, roleMiddleware(ADMIN), servicoController.criar.bind(servicoController));
// Listar Todos (Público, para tela de agendamento)
router.get('/servicos', servicoController.listar.bind(servicoController));
// Buscar por ID (Público, para detalhes)
router.get('/servicos/:id', servicoController.buscarPorId.bind(servicoController)); 
// Atualizar Serviço (Apenas Admin)
router.put('/servicos/:id', authMiddleware, roleMiddleware(ADMIN), servicoController.atualizar.bind(servicoController));
// Deletar Serviço (Apenas Admin)
router.delete('/servicos/:id', authMiddleware, roleMiddleware(ADMIN), servicoController.deletar.bind(servicoController));

// ------------------------------------
// ROTAS DE PRODUTO
// ------------------------------------
// Criar Produto (Apenas Admin)
router.post('/produtos', authMiddleware, roleMiddleware(ADMIN), produtoController.criar.bind(produtoController));
// Listar Todos (Apenas Admin)
router.get('/produtos', authMiddleware, roleMiddleware(ADMIN), produtoController.listar.bind(produtoController));
// Buscar por ID (Apenas Admin)
router.get('/produtos/:id', authMiddleware, roleMiddleware(ADMIN), produtoController.buscarPorId.bind(produtoController));
// Atualizar Produto (Apenas Admin)
router.put('/produtos/:id', authMiddleware, roleMiddleware(ADMIN), produtoController.atualizar.bind(produtoController));
// Deletar Produto (Apenas Admin)
router.delete('/produtos/:id', authMiddleware, roleMiddleware(ADMIN), produtoController.deletar.bind(produtoController));

// ------------------------------------
// ROTAS DE VENDA
// ------------------------------------
// Criar Venda (Apenas Admin e Barbeiro)
router.post('/vendas', authMiddleware, roleMiddleware(ADMIN_BARBEIRO), vendaController.criar.bind(vendaController));
// Listar Todas as Vendas (Apenas Admin e Barbeiro)
router.get('/vendas', authMiddleware, roleMiddleware(ADMIN_BARBEIRO), vendaController.listar.bind(vendaController));

// ------------------------------------
// ROTAS DE RELATÓRIOS (APENAS ADMIN)
// ------------------------------------
// GET /relatorios/faturamento?dataInicio=YYYY-MM-DD&dataFim=YYYY-MM-DD
router.get('/relatorios/faturamento', authMiddleware, roleMiddleware(ADMIN), relatorioController.faturamento.bind(relatorioController));
// GET /relatorios/comissao
router.get('/relatorios/comissao', authMiddleware, roleMiddleware(ADMIN), relatorioController.comissao.bind(relatorioController));

export { router };