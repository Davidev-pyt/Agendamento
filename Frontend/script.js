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
        Swal.fire({
            title: 'Campos Vazios!',
            text: 'Por favor, preencha o e-mail e a senha para acessar.',
            icon: 'warning',
            confirmButtonColor: '#059669'
        });
        return;
    }

    try {
        const resposta = await fetch('http://localhost:8000/Login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: emailValue,
                senha: senhaValue
            })
        });

        const dadosServidor = await resposta.json();

        // Pop-up premium de Sucesso no Login!
        if (resposta.ok) {
            Swal.fire({
                title: 'Login Efetuado!',
                text: `Bem-vindo de volta, ${dadosServidor.Usuario}!`,
                icon: 'success',
                confirmButtonColor: '#059669'
            });
            console.log('Resposta de sucesso do Back-End:', dadosServidor);
        } else {
            // Pop-up premium de Erro nas credenciais!
            Swal.fire({
                title: 'Falha no Acesso',
                text: dadosServidor.detail || 'E-mail ou senha incorretos.',
                icon: 'error',
                confirmButtonColor: '#d33'
            });
        }

    } catch (erro) {
        console.error('Erro de conexão com o servidor Back-End:', erro);
        // pop-up premium de Falha de Rede!
        Swal.fire({
            title: 'Ops!',
            text: 'Não foi possível conectar ao servidor. Verifique se o Python está ligado!',
            icon: 'error',
            confirmButtonColor: '#d33'
        });
    }
});

// 3. FUNÇÃO PARA BUSCAR AGENDAMENTOS DO BACK-END
async function buscarAgendamentos() {
    const container_manha = document.getElementById('lista_manha');
    const container_tarde = document.getElementById('lista_tarde');

    container_manha.innerHTML = '';
    container_tarde.innerHTML = '';

    try {
        const resposta = await fetch('http://localhost:8000/agendamentos');
        const dadosServidor = await resposta.json();

        if (resposta.ok) {
            console.log('Agendamentos carregados com sucesso do PostgreSQL:', dadosServidor.Dados);

            dadosServidor.Dados.forEach(function(item) {
                const card = document.createElement('div');
                card.className = "bg-zinc-50 border border-zinc-100 rounded-2xl p-4 flex justify-between items-center transition-all hover:border-emerald-200";

                card.innerHTML = `
                  <div>
                      <p class="font-bold text-slate-800 text-sm">${item.cliente_nome}</p>
                      <p class="text-xs text-slate-400 font-medium">${item.servico}</p>
                 </div>
                  <div class="text-right flex items-center gap-3">
                     <span class="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">${item.data_hora}</span>
                     <button onclick="removerAgendamento(${item.id})" class="text-rose-400 hover:text-rose-600 font-bold transition-all p-1 text-sm">✕</button>
                  </div>
                `;

                const apenasHora = item.data_hora.includes('T') ? item.data_hora.split('T')[1] : item.data_hora;
                const horaCheia = parseInt(apenasHora.split(':')[0]);

                if (horaCheia < 12) {
                    container_manha.appendChild(card);
                } else {
                    container_tarde.appendChild(card);
                }
            });
        }
    } catch (erro) {
        console.error('Falha ao buscar o calendário do servidor:', erro);
    }
}

buscarAgendamentos();

// OUVINTE DE CLIQUE DO BOTÃO DE NOVO AGENDAMENTO
document.getElementById('btn-agendar').addEventListener('click', async function(event) {
    event.preventDefault();

    const nomeValue = document.getElementById('agendar-nome').value;
    const servicoValue = document.getElementById('agendar-servico').value;
    const horaValue = document.getElementById('agendar-datahora').value;

    if (!nomeValue || !servicoValue || !horaValue) {
        Swal.fire({
            title: 'Ops!',
            text: 'Preencha todos os campos antes de enviar.',
            icon: 'error',
            confirmButtonColor: '#d33'
        });
        return;
    }

    try {
        const resposta = await fetch('http://localhost:8000/agendar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cliente_nome: nomeValue,
                servico: servicoValue,
                data_hora: horaValue
            })
        });

        const dadosServidor = await resposta.json();

        if (resposta.ok) {
            console.log('Agendamento gravado com sucesso no PostgreSQL:', dadosServidor);
            Swal.fire({
                title: 'Confirmado!',
                text: 'Horário reservado com sucesso.',
                icon: 'success',
                confirmButtonColor: '#059669'
            });

            document.getElementById('agendar-nome').value = '';
            document.getElementById('agendar-servico').value = '';
            document.getElementById('agendar-datahora').value = '';

            buscarAgendamentos();
        } else {
             Swal.fire({
                 title: 'Ops!',
                 text: 'Não foi possível agendar. Verifique se o horário já não está ocupado.',
                 icon: 'error',
                 confirmButtonColor: '#d33'
            });
        }
    } catch (erro) {
        console.error('Erro ao enviar agendamento:', erro);
        Swal.fire({
            title: 'Ops!',
            text: 'Não foi possível conectar ao servidor Back-End. Verifique se o Python está ligado!',
            icon: 'error',
            confirmButtonColor: '#d33'
        });
    }
});


async function removerAgendamento(id) {
    try {
       const resposta = await fetch(`http://localhost:8000/agendar/${id}`, {
            method: 'DELETE'
        });
        const dadosServidor = await resposta.json();
        
        if (resposta.ok) {
            Swal.fire({
                title: 'Removido!',
                text: 'O agendamento foi cancelado com sucesso.',
                icon: 'success',
                confirmButtonColor: '#059669'
            });
            console.log('Agendamento removido com sucesso:', dadosServidor);
            buscarAgendamentos();
        } else {
            Swal.fire({
                title: 'Ops!',
                text: dadosServidor.detail || 'Não foi possível remover o agendamento.',
                icon: 'error',
                confirmButtonColor: '#d33'
            });
        }
    } catch (erro) {
        console.error('Erro ao remover agendamento:', erro);
        Swal.fire({
            title: 'Ops!',
            text: 'Não foi possível conectar ao servidor Back-End. Verifique se o Python está ligado!',
            icon: 'error',
            confirmButtonColor: '#d33'
        });
    }
}
