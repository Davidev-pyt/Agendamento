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
