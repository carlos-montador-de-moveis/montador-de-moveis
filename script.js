/* ========================
   CONFIGURAÇÕES
======================== */
// URL Corrigida do WhatsApp (Sem o 11 extra)
const WHATSAPP_NUM = "5511954558195"; 
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzGxfH_oqr_QY8ypPr7Y_pDEK3fDC1vJeW74dz6-L2sfmukBEs9bm0c-r-d-Foup7sB/exec";

/* ========================
   INIT & EVENTOS
======================== */
document.addEventListener('DOMContentLoaded', () => {
    // Atualizar link do WhatsApp Float
    document.getElementById('btnWhatsappFloat').href = `https://wa.me/${WHATSAPP_NUM}`;
    
    // Configurar máscara de telefone
    const telInput = document.getElementById('telefone');
    telInput.addEventListener('input', mascaraTelefone);
    
    // Configurar Boas-vindas
    setTimeout(mostrarBoasVindas, 4000);
});

/* ========================
   FUNÇÕES DE UI (Modal/Lightbox)
======================== */
// Modal de Avaliações
document.querySelectorAll('.ver-mais').forEach(el => {
    el.addEventListener('click', (e) => {
        const nome = e.target.dataset.nome;
        const msg = e.target.dataset.msg;
        document.getElementById('modalNome').innerText = nome;
        document.getElementById('modalTexto').innerText = msg;
        openModal('modalAvaliacao');
    });
});

// Lightbox de Portfólio
function openLightbox(imgSrc, caption) {
    document.getElementById('lightboxImg').src = imgSrc;
    document.getElementById('lightboxCaption').innerText = caption || '';
    openModal('lightbox');
}

function openModal(id) {
    const el = document.getElementById(id);
    el.style.display = 'flex'; // Flex para centralizar
    setTimeout(() => el.classList.add('ativo'), 10);
}

function closeModal(id) {
    const el = document.getElementById(id);
    el.classList.remove('ativo');
    setTimeout(() => el.style.display = 'none', 300);
}

// Fechar ao clicar fora
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if(e.target === overlay) closeModal(overlay.id);
    });
});

/* ========================
   FORMULÁRIO & VALIDAÇÃO
======================== */
function mascaraTelefone(e) {
    let v = e.target.value.replace(/\D/g, "");
    v = v.replace(/^(\d\d)(\d)/g, "($1) $2");
    v = v.replace(/(\d{5})(\d)/, "$1-$2");
    e.target.value = v.substring(0, 15); // Limita tamanho
}

const form = document.getElementById('formOrcamento');
const btnEnviar = document.getElementById('btnEnviar');
const feedback = document.getElementById('feedbackSucesso');

form.addEventListener('submit', e => {
    e.preventDefault();
    
    // Validação Simples
    const tel = document.getElementById('telefone').value;
    if (tel.length < 14) {
        showCard("Por favor, preencha um telefone válido com DDD.");
        return;
    }

    btnEnviar.disabled = true;
    btnEnviar.innerText = "Enviando...";

    const data = new FormData(form);
    const objData = {};
    data.forEach((value, key) => objData[key] = value);

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(objData)
    })
    .then(response => response.json())
    .then(r => {
        if(r.sucesso){
            // Sucesso UX: Feedback na tela + Conversão WhatsApp
            form.reset();
            feedback.style.display = 'block';
            feedback.innerHTML = '✅ Recebido! Abrindo WhatsApp para finalizar o orçamento Sênior...';
            
            setTimeout(() => {
                const msgZap = `Olá Carlos! Me chamo ${objData.nome}. Solicitei um orçamento no site sobre: ${objData.tipo}.`;
                window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(msgZap)}`, '_blank');
                btnEnviar.disabled = false;
                btnEnviar.innerText = "Enviar Pedido de Orçamento";
                feedback.style.display = 'none';
            }, 2000);
        } else {
            throw new Error(r.erro);
        }
    })
    .catch(err => {
        showCard('Erro de conexão. Tente clicar no botão do WhatsApp direto!');
        btnEnviar.disabled = false;
        btnEnviar.innerText = "Tentar Novamente";
        console.error(err);
    });
});

/* ========================
   UTILITÁRIOS
======================== */
function showCard(msg){
    const card = document.getElementById('cardNotif');
    card.innerText = msg;
    card.style.display = 'block';
    setTimeout(() => card.style.display = 'none', 4000);
}

function scrollToSection(id){ 
    document.getElementById(id).scrollIntoView({behavior:'smooth'}); 
}

function scrollToTop(){ 
    window.scrollTo({top:0, behavior:'smooth'}); 
}

function mostrarBoasVindas(){
    const bemvindo = document.getElementById('bemvindo');
    bemvindo.style.display = 'block';
    bemvindo.style.animation = 'slideInUp 0.5s forwards';
}
