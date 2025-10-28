import { Request, Response } from 'express';
import { UsuarioService } from '../services/UsuarioService';

export class UsuarioController {
    private usuarioService: UsuarioService;

    constructor() {
        this.usuarioService = new UsuarioService();
    }

    // POST /usuarios/registrar
    public registrar = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Assumimos que o corpo da requisição já contém nome, email, senha e cargo_nome
            const { nome, email, senha, telefone, cargo_nome } = req.body;

            // Validação mínima
            if (!nome || !email || !senha || !cargo_nome) {
                return res.status(400).json({ message: "Nome, email, senha e cargo_nome são obrigatórios." });
            }
            
            const novoUsuario = await this.usuarioService.registrarUsuario(req.body);
            
            // 201 Created com os dados públicos do usuário
            return res.status(201).json(novoUsuario); 
        } catch (error: any) {
            // Erros de email já em uso (409 Conflict) ou erros de validação (400 Bad Request)
            const statusCode = error.message.includes('email') ? 409 : 400;
            return res.status(statusCode).json({ message: error.message });
        }
    };

    // POST /usuarios/login
    public login = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { email, senha } = req.body;
            
            if (!email || !senha) {
                return res.status(400).json({ message: "Email e senha são obrigatórios." });
            }

            const resultado = await this.usuarioService.loginUsuario(email, senha);
            
            // 200 OK: Retorna o token e os dados públicos
            return res.status(200).json(resultado); 

        } catch (error: any) {
            // 401 Unauthorized para falhas de credenciais
            const statusCode = error.message.includes('Credenciais inválidas') ? 401 : 500;
            return res.status(statusCode).json({ message: error.message });
        }
    };
}