import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { router } from './routes';
import { AgendamentoController } from './controllers/AgendamentoController';
import { UsuarioController } from './controllers/UsuarioController'; // Importar o Controller para usar a instância se necessário

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializa Controllers que têm rotas modulares (como Agendamento)
const agendamentoController = new AgendamentoController();

app.use(express.json());
app.use(cors());

// 1. O 'router' exportado de './routes' contém todas as rotas PÚBLICAS e PROTEGIDAS.
app.use(router);

// 2. Rotas modulares (Ex: Agendamento)
// Se você está usando agendamentoController.rotas(), isso não deve ter conflito com o 'router'
app.use('/api/agendamentos', agendamentoController.rotas()); 


app.listen(PORT, () => {
    console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
    console.log(`🔗 Ambiente de Desenvolvimento: ${process.env.NODE_ENV || 'development'}`);
});