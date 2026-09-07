// 1. MAPEAMENTO DAS VARIÁVEIS
const campo_email = document.getElementById('email');
const campo_senha = document.getElementById('senha');
const btn_login = document.getElementById('btn-login');

// 2. OUVINTE DE CLIQUE DO BOTÃO
btn_login.addEventListener('click', async function(event) {
    event.preventDefault();

    const emailValue = campo_email.value;
    const senhaValue = campo_senha.value;

    console.log('Tentativa de login enviada para processamento...');

    // Validação de segurança básica no Front-end
    if (!emailValue || !senhaValue) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    try {
        const resposta = await fetch('http://localhost:8000/Login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Transforma os dados no molde JSON idêntico ao loginRequest do Pydantic
            body: JSON.stringify({
                email: emailValue,
                senha: senhaValue
            })
        });

        const dadosServidor = await resposta.json();

        // Se o banco de dados aceitar o login
        if (resposta.ok) {
            alert(`Bem-vindo de volta, ${dadosServidor.Usuario}! Login efetuado com sucesso.`);
            console.log('Resposta de sucesso do Back-End:', dadosServidor);
            // Aqui futuramente vou redirecionar o usuário para o painel Bento Grid!
        } else {
            // Se a senha estiver errada ou e-mail não existir
            alert(dadosServidor.detail || 'Falha ao acessar a conta.');
        }

    } catch (erro) {
        console.error('Erro de conexão com o servidor Back-End:', erro);
        alert('Não foi possível conectar ao servidor. Verifique se o Python está ligado!');
    }
});

// 3. FUNÇÃO PARA BUSCAR AGENDAMENTOS DO BACK-END

//  CRIADA A FUNÇÃO ASSÍNCRONA ENVELOPADA
async function buscarAgendamentos() {
    // Captura as duas caixas do Bento Grid
    const container_manha = document.getElementById('lista_manha');
    const container_tarde = document.getElementById('lista_tarde');

    // Limpa os blocos para evitar duplicações
    container_manha.innerHTML = '';
    container_tarde.innerHTML = '';

    try {
        // Bate na rota correta em minúsculo e no plural do Python!
        const resposta = await fetch('http://localhost:8000/agendamentos');
        const dadosServidor = await resposta.json();

        if (resposta.ok) {
            console.log('Agendamentos carregados com sucesso do PostgreSQL:', dadosServidor.Dados);

            // Percorre a lista de registros vindos do banco de dados
            dadosServidor.Dados.forEach(function(item) {
                
                // Cria a caixinha visual do agendamento (Card premium)
                const card = document.createElement('div');
                card.className = "bg-zinc-50 border border-zinc-100 rounded-2xl p-4 flex justify-between items-center transition-all hover:border-emerald-200";
                
                card.innerHTML = `
                    <div>
                        <p class="font-bold text-slate-800 text-sm">${item.cliente_nome}</p>
                        <p class="text-xs text-slate-400 font-medium">${item.servico}</p>
                    </div>
                    <div class="text-right">
                        <span class="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">${item.data_hora}</span>
                    </div>
                `;

               // TRIAGEM INTELIGENTE DE TURNOS: Extrai os dois primeiros dígitos da hora (ex: "09:00" -> 9)
                const apenasHora = item.data_hora.includes('T') ? item.data_hora.split('T')[1] : item.data_hora;
                const horaCheia = parseInt(apenasHora.split(':')[0]);

               

                if (horaCheia < 12) {
                    // Se for antes de meio-dia, injeta no bloco da manhã
                    container_manha.appendChild(card);
                } else {
                    // Se for meio-dia ou depois, injeta no bloco da tarde
                    container_tarde.appendChild(card);
                }
            });
        }
    } catch (erro) {
        console.error('Falha ao buscar o calendário do servidor:', erro);
    }
}

// Dispara a busca automática assim que a página carrega na tela!
buscarAgendamentos();

// ... (Tudo o que você já escreveu continua igualzinho aqui em cima)

// OUVINTE DE CLIQUE DO BOTÃO DE NOVO AGENDAMENTO
document.getElementById('btn-agendar').addEventListener('click', async function(event) {
    event.preventDefault();

    // Pega o que o usuário digitou na tela naquele milissegundo!
    const nomeValue = document.getElementById('agendar-nome').value;
    const servicoValue = document.getElementById('agendar-servico').value;
    const horaValue = document.getElementById('agendar-datahora').value;

    // Validação de segurança básica na interface
    if (!nomeValue || !servicoValue || !horaValue) {
        alert('Por favor, preencha todos os campos do agendamento!');
        return;
    }

    try {
        // Bate na rota correta de gravação -> /agendar (no singular!)
        const resposta = await fetch('http://localhost:8000/agendar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Envia os valores da tela no molde exato do AgendamentoRequest do Python
            body: JSON.stringify({
                cliente_nome: nomeValue,
                servico: servicoValue,
                data_hora: horaValue
            })
        });

        const dadosServidor = await resposta.json();

        if (resposta.ok) {
            console.log('Agendamento gravado com sucesso no PostgreSQL:', dadosServidor);
            alert('Agendamento confirmado com sucesso!');
            
            // Limpa os campos do formulário para dar um feedback visual de sucesso
            document.getElementById('agendar-nome').value = '';
            document.getElementById('agendar-servico').value = '';
            document.getElementById('agendar-datahora').value = '';

            // Recarrega as caixas de turnos instantaneamente sem dar F5!
            buscarAgendamentos();
        } else {
            // Trata o erro 400 do Python se o horário já estiver ocupado!
            alert(dadosServidor.detail || 'Não foi possível enviar o agendamento.');
        }
    } catch (erro) {
        console.error('Erro ao enviar agendamento:', erro);
        alert('Não foi possível conectar ao servidor Back-End. Verifique se o Python está ligado!');
    }
});
