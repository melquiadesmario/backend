# 💈 BARBERSHOP
### Barbearia System Pro (Full-Stack TypeScript)

## ✍️ Sumário Executivo

Este projeto é um sistema de gerenciamento de barbearia construído com a mentalidade **Full-Stack, Mobile-First** e **Type-Safety**. Ele demonstra proficiência em arquitetura de *software* (**Arquitetura em Camadas**), uso de **TypeScript de ponta a ponta** e gestão de dados com **PostgreSQL** via **Prisma ORM**.

O foco inicial está no módulo de agendamento e segurança, incluindo autenticação e autorização robustas (Admin/Cliente).

---

## 🎯 Requisitos e Casos de Uso (CRUD)

O sistema suporta a gestão completa das operações de uma barbearia, diferenciando os níveis de acesso:

| Usuário | Funcionalidade Principal | Métodos da API | Status de Implementação |
| :--- | :--- | :--- | :--- |
| **Administrador** | Gerenciar Serviços, Produtos e Usuários (CRUD completo) | `POST`, `GET`, `PUT`, `DELETE` | 🚧 Em Andamento |
| **Cliente** | Cadastro, Login, Visualizar Serviços e Realizar Agendamentos. | `POST`, `GET` | 🚧 Em Andamento |
| **Geral** | Autenticação e Autorização (JWT). | `/login`, `/register` | 🚧 Concluído |

---

## 🏛️ Arquitetura do Projeto

O projeto é dividido em dois microsserviços principais (`backend` e `frontend`), ambos utilizando TypeScript para garantir consistência e segurança de tipos em toda a aplicação.

### 1. 🌐 Backend: Node.js + Express + TypeScript

A API segue a arquitetura de **Camadas (Layered Architecture)**, o que garante a separação de responsabilidades, manutenibilidade e facilita a aplicação de Testes Unitários:

| Camada | Responsabilidade | Tecnologias Chave |
| :--- | :--- | :--- |
| **Controller** | Lida com Requisições (HTTP `req`, `res`) e chama o Service. | Express |
| **Service** | Contém toda a **Regra de Negócio** (Validação, Lógica de Login/JWT, Lógica de Agendamento). | TypeScript / Bcrypt |
| **Repository** | Responsável pela comunicação direta com o Banco de Dados. | Prisma ORM |

### 2. 🗄️ Banco de Dados e ORM

O Modelo Relacional é composto por 8 tabelas principais (Cargo, Usuario, Servico, Agendamento, etc.), garantindo a integridade dos dados.

- **Prisma ORM:** Utilizado para gerar um **Client Type-Safe**, eliminando a necessidade de SQL cru, garantindo a integridade referencial e o mapeamento fiel do esquema PostgreSQL.
- **PostgreSQL (via Supabase):** Banco de dados relacional robusto para dados transacionais críticos (Agendamentos e Transações Financeiras).

---

## ⚙️ Tecnologias Utilizadas (Stack)

| Área | Tecnologia | Motivação Técnica |
| :--- | :--- | :--- |
| **Linguagem** | TypeScript | Garantia de Tipos (Type-Safety) de ponta a ponta. |
| **Backend** | Node.js, Express | Ambiente assíncrono, escalável e de alta performance. |
| **ORM** | Prisma | Mapeamento declarativo, migrações e `Prisma Client` seguro. |
| **Database** | PostgreSQL (Supabase) | Robustez transacional e serviço hospedado (SaaS). |
| **Segurança** | JWT, Bcrypt | Padrões da indústria para autenticação e *hashing* de senhas. |
| **Frontend** | React, Vite | Desenvolvimento ágil de UI e performance otimizada (Mobile-First). |

---

## 🚀 Como Rodar o Projeto Localmente

### 0. Pré-requisitos

- Node.js (v18+)
- Conta no Supabase (PostgreSQL já configurado)
- Cliente Git

### 1. Clone e Inicialização

Clone o repositório e navegue até a pasta `backend` para iniciar a API:

```
bash
git clone [https://github.com/melquiadesmario/barbershop-fullstack-ts.git](https://github.com/melquiadesmario/barbershop-fullstack-ts.git)
cd barbershop-fullstack-ts/backend
npm install

```
### 2. Configuração do Backend (API)
- Configurar .env: Crie um arquivo .env na pasta backend e adicione a string de conexão do seu projeto Supabase:

```
# backend/.env
DATABASE_URL="postgresql://postgres:SUA_SENHA_AQUI@SUA_URL_DE_HOST:5432/postgres?schema=public"

```
- Gerar o Prisma Client:

```
Bash

npm run prisma:generate

```
- Iniciar a API (Modo Desenvolvimento):

```
Bash

npm run dev

```
*(A API estará rodando em http://localhost:3000)*

### 3. Configuração do Frontend (Web/Mobile)
(Detalhes completos serão adicionados após a implementação do Frontend.)

- Na pasta /frontend, instale as dependências: npm install
- Configure o .env do Frontend apontando para a URL da API.
- Inicie o Frontend: npm run dev

*Desenvolvido por: Melquiades Mário*
