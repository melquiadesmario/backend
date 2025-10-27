import { Router } from 'express';
import { authMiddleware } from './middlewares/authMiddleware';
import { ServicoController } from './controllers/ServicoController'; 
import { UsuarioController } from './controllers/UsuarioController'; 

const router = Router();
const servicoController = new ServicoController();
const usuarioController = new UsuarioController(); 

// ------------------------------------
// ROTAS DE USUÁRIO / AUTENTICAÇÃO
// ------------------------------------
router.post('/usuarios/registrar', usuarioController.registrar);
router.post('/usuarios/login', usuarioController.login);

// ------------------------------------
// ROTAS DE SERVIÇO (CRUD)
// ------------------------------------
router.post('/servicos', authMiddleware, servicoController.criar); 
router.put('/servicos/:id', authMiddleware, servicoController.atualizar);
router.delete('/servicos/:id', authMiddleware, servicoController.deletar);

export { router };