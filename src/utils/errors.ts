// Erro padrão para falhas de validação de regra de negócio (HTTP 422 Unprocessable Entity)
export class UnprocessableEntityError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UnprocessableEntityError';
    }
}

// Outro erro útil: Bad Request (HTTP 400)
export class BadRequestError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'BadRequestError';
    }
}

// Erro de Conflito (HTTP 409)
export class ConflictError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ConflictError';
    }
}

// Opcional: Para erros de recurso não encontrado (404)
export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
    }
}