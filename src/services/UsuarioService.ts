import { UsuarioRepository } from "../repositories/UsuarioRepository";
import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';

export interface UsuarioInput {
    nome: string;
    email: string;
    senha: string;
    telefone?: string;
    cargo_id: string; // O cargo é essencial no modelo de dados
}

// O número de rounds de hash (custo)
const SALT_ROUNDS = 10;

// Carrega as variáveis JWT do ambiente
const JWT_SECRET: Secret = process.env.JWT_SECRET || 'fallback_secret_nao_usar_em_producao';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '1h';

export class UsuarioService {
    private usuarioRepository: UsuarioRepository;

    constructor() {
        this.usuarioRepository = new UsuarioRepository();
    }

    // Função de registro (Criação)
    async registrarUsuario(data: UsuarioInput) {
        // 1. Lógica de Negócio: Verificar se o email já existe
        const usuarioExistente = await this.usuarioRepository.buscarPorEmail(data.email);
        if (usuarioExistente) {
            throw new Error("O email fornecido já está em uso.");
        }

        // 2. Hash da Senha
        const senha_hash = await bcrypt.hash(data.senha, SALT_ROUNDS);

        // 3. Preparar dados para o repositório
        const dadosParaCriar = {
            nome: data.nome,
            email: data.email,
            telefone: data.telefone,
            cargo_id: data.cargo_id,
            senha_hash: senha_hash, // Passa o hash, não a senha
        };

        // 4. Criação no banco
        const novoUsuario = await this.usuarioRepository.criar(dadosParaCriar);

        if (!novoUsuario) {
             throw new Error("Falha desconhecida ao criar usuário.");
        }

        // Retorna o usuário sem o hash
        return novoUsuario; 
    }

    // Funções de login (implementação da autenticação e token)
    async loginUsuario(email: string, senha: string) {
        // 1. Busca o usuário completo (incluindo senha_hash)
        const usuario = await this.usuarioRepository.buscarPorEmail(email);

        if (!usuario) {
            throw new Error("Credenciais inválidas: Usuário não encontrado.");
        }

        // 2. Compara a senha fornecida com o hash do banco
        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

        if (!senhaValida) {
            throw new Error("Credenciais inválidas: Senha incorreta.");
        }
        
        const options: SignOptions = {
            expiresIn: JWT_EXPIRES_IN
        }as SignOptions;

        // 3. Gera o Token JWT
        const token = jwt.sign(
            { id: usuario.id, cargoId: usuario.cargo_id, email: usuario.email },
            JWT_SECRET, options
        );

        // 4. Retorna o token e os dados públicos do usuário
        const dadosPublicos = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            cargo_id: usuario.cargo_id,
            telefone: usuario.telefone,
            ativo: usuario.ativo
        };
        
        return { token, usuario: dadosPublicos };
    }
}