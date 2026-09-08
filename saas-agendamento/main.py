from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from Crypto.Hash import SHA256
import os
from dotenv import load_dotenv
from pydantic import BaseModel

# 1. Carrega o cofre oculto de senhas
load_dotenv()

# 2. Inicializa a nossa API SaaS
app = FastAPI(title="SaaS de Agendamentos Online - Bento Grid")

# 3. ESCUDO DO CORS: Libera o tráfego seguro entre o Front-end e o Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# 4. Transforma a senha limpa do usuário em um código inquebrável
def criptografar_senha(senha_limpa: str) -> str:
    # Transforma o texto puro digitado pelo usuário em bytes
    senha_bytes = senha_limpa.encode('utf-8')
    # Gera um hash seguro SHA-256 e extrai o código hexadecimal embaralhado
    hash_objeto = SHA256.new(data=senha_bytes)
    return hash_objeto.hexdigest()

# Rota de teste inicial para ver se o motor está batendo certo
@app.get("/")
def home():
    return {"status": "Sucesso", "projeto": "SaaS de Agendamentos Online ligado!"}

# 1. Configuração de Infraestrutura do Banco (PostgreSQL)
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 👥 2. MODELO DA TABELA DE USUÁRIOS
class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    # O e-mail será o identificador único do usuário (Unique), impedindo cadastros duplicados!
    email = Column(String(100), unique=True, index=True, nullable=False)
    # A coluna de senha reserva 64 caracteres exatos para o Hash hexadecimal do SHA-256
    senha = Column(String(64), nullable=False)

# 🔌 3. Função auxiliar (Injeção de Dependência) para abrir/fechar conexões com o banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

Base.metadata.create_all(bind=engine)  # Cria as tabelas no banco de dados, se não existirem

@app.post("/Cadastro")
def cadastrar_usuario(
    nome: str,
    email: str,
    senha: str,
    db: Session = Depends(get_db)
    ):
    # Criptografa a senha antes de salvar no banco
    senha_criptografada = criptografar_senha(senha)
    
    # Verifica se o usuário já existe
    usuario_existente = db.query(Usuario).filter(Usuario.email == email).first()
    if usuario_existente:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email já cadastrado")
    
    # Cria novo usuário
    novo_usuario = Usuario(nome=nome, email=email, senha=senha_criptografada)
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    
    return {"status": "Sucesso", "usuario_id": novo_usuario.id, "email": novo_usuario.email}


class loginRequest(BaseModel):
    email: str
    senha: str

class AgendamentoRequest(BaseModel):
    cliente_nome: str
    servico: str
    data_hora: str

@app.post("/Login")
def Login_usuario(request: loginRequest, db: Session = Depends(get_db)):
    if not request.email or not request.senha:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email e senha são obrigatórios")

    # Busca o Usuario pelo email
    usuario = db.query(Usuario).filter(Usuario.email == request.email).first()

    if not usuario:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="E-mail ou senha incorretos")

    #  alinhado perfeitamente na mesma margem dos IFs!
    senha_criptografada = criptografar_senha(request.senha)
    
    if usuario.senha != senha_criptografada:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="E-mail ou senha incorretos")
    
    return {"status": "Sucesso", "Usuario": usuario.nome, "email": usuario.email}


class Agendamento(Base):
    __tablename__ = "agendamentos"

    id = Column(Integer, primary_key=True, index=True)
    cliente_nome = Column(String(100), nullable=False)
    servico = Column(String(100), nullable=False)
    data_hora = Column(String(50), unique=True, nullable=False)


Base.metadata.create_all(bind=engine)

@app.post("/agendar")
def agendar(agendamento: AgendamentoRequest, db: Session = Depends(get_db)):
    # Verifica se já existe um agendamento para a mesma data e hora
    agendamento_existente = db.query(Agendamento).filter(Agendamento.data_hora == agendamento.data_hora).first()
    if agendamento_existente:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Já existe um agendamento para esta data e hora")
    else:
        novo_agendamento = Agendamento(
            cliente_nome=agendamento.cliente_nome,
            servico=agendamento.servico,
            data_hora=agendamento.data_hora
        )
        # Salva o novo agendamento no banco de dados
        db.add(novo_agendamento)
        db.commit()
        db.refresh(novo_agendamento)
        return {"Status": "Sucesso", "Agendamento":{
            "Cliente": novo_agendamento.cliente_nome, "Serviço": novo_agendamento.servico, "Data e Hora": novo_agendamento.data_hora}}

# Verifica os horários disponíveis para agendamento
@app.get("/agendamentos")
def Listar_agendamentos(db:Session = Depends(get_db)):
    agendamentos = db.query(Agendamento).all()
    return {"Status": "Sucesso", "Dados": agendamentos}

@app.delete("/agendar/{agendamento_id}")
def Delete_agendamento(agendamento_id: int, db: Session = Depends(get_db)):
    item = db.query(Agendamento).filter(Agendamento.id == agendamento_id).first()
    if None == item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agendamento não encontrado")
    else:
        db.delete(item)
        db.commit()
    return {"Status": "Sucesso", "Mensagem": f"Agendamento de ID {agendamento_id} deletado com sucesso!"}
