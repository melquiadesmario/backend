import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { router } from './routes';

const app = express();

const PORT = process.env.PORT || 3000; 

app.use(express.json());
app.use(cors());
app.use(router); 

app.listen(PORT, () => {
    console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});