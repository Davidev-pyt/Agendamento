# 📅 AgendaÁgil - SaaS de Agendamentos Online (Bento Grid)

O **AgendaÁgil** é uma plataforma SaaS (Software as a Service) de agendamento online desenvolvida com uma arquitetura Full Stack moderna, segura e com foco em usabilidade premium. O sistema conta com regras rígidas de negócios no Back-end e uma interface baseada no padrão de design **Bento Grid**.

---

## 🚀 Tecnologias Utilizadas

### 🖥️ Back-End (API & Infraestrutura)
* **Python & FastAPI:** Desenvolvimento de rotas assíncronas de alta performance.
* **SQLAlchemy ORM:** Mapeamento objeto-relacional estável para comunicação com a base de dados.
* **Pydantic:** Validação rigorosa dos contratos de dados e pacotes HTTP.
* **PyCryptodome:** Criptografia via Hashing SHA-256 para proteção militar de credenciais.
* **python-dotenv:** Isolamento seguro de chaves de infraestrutura em variáveis de ambiente.

### 💾 Banco de Dados
* **PostgreSQL:** Banco relacional robusto configurado e provisionado via **pgAdmin**.

### 🎨 Front-End (Interface de Usuário)
* **JavaScript Moderno:** Consumo de APIs em tempo real (Fetch API) com manipulação dinâmica de elementos no DOM.
* **Tailwind CSS:** Estilização premium baseada em utilitários com efeitos reativos de foco.
* **SweetAlert2:** Notificações flutuantes, arredondadas e animadas integradas à estética da plataforma.

---

## 🛡️ Engenharia e Regras de Negócio Implementadas

1. **Segurança de Credenciais:** As senhas dos usuários nunca são salvas em formato de texto limpo. O sistema aplica o Hashing SHA-256 para transformar dados confidenciais em hashes irreversíveis.
2. **Proteção Contra Agendamentos Duplicados:** A tabela física `agendamentos` possui restrição de unicidade (`unique=True`) acoplada na coluna `data_hora`. Tentativas de colisão de horários são barradas na hora pela API com exceções HTTP `400 Bad Request`.
3. **Triagem Dinâmica de Turnos:** O JavaScript extrai os dígitos da hora cheia no Front-end e distribui os agendamentos automaticamente entre caixas específicas de **Manhã** (antes das 12h) e **Tarde** (12h ou depois).
4. **Controle de Acessos (RBAC Base):** O sistema armazena o cargo (`cargo: 'prestador'` ou `'cliente'`) no login. O Front-end valida a propriedade e oculta dinamicamente o botão de exclusão ("✕") caso o usuário logado seja um cliente.
5. **Experiência Zero F5 (CRUD Assíncrono):** As operações de criação, leitura e exclusão no banco ocorrem de forma assíncrona, atualizando a interface instantaneamente através de funções de callback reutilizáveis.

---

## 🛠️ Como Executar o Projeto Localmente

### 1. Clonar o Repositório
```bash
git clone https://github.com
cd saas-agendamento
```

### 2. Configurar o Back-End
1. Crie e ative o seu ambiente virtual (`.venv`).
2. Crie um arquivo `.env` na raiz do projeto e configure a sua rodovia de acesso:
```env
DATABASE_URL=postgresql://seu_usuario:sua_senha@localhost:5432/agenda_saas
```
3. Instale as dependências e inicie o Uvicorn:
```bash
uvicorn main:app --reload
```

### 3. Executar o Front-End
Abra a pasta `frontend` e inicialize o arquivo `index.html` utilizando a extensão **Live Server** no VS Code para simular a origem segura de rede (`http://127.0.0.1:5500`).
