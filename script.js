/* script.js - Lógica Zero-Bug */

const WHATSAPP_NUM = "5511954558195"; 
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzGxfH_oqr_QY8ypPr7Y_pDEK3fDC1vJeW74dz6-L2sfmukBEs9bm0c-r-d-Foup7sB/exec";

/* ---------- helpers ---------- */
function showCard(msg){
  const card = document.getElementById('cardNotif');
  if(!card) return;
  card.innerText = msg;
  card.style.display = 'block';
  setTimeout(() => { card.style.display = 'none'; }, 4200);
}

function scrollToSection(id){
  const el = document.getElementById(id);
  if(!el) return;
  const headerOffset = 80; 
  const elementPosition = el.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.scrollY - headerOffset;

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth"
  });
}

function scrollToTop(){
  window.scrollTo({top:0, behavior:'smooth'});
}

/* ---------- modal & lightbox ---------- */
function openModal(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.style.display = 'flex';
  requestAnimationFrame(() => {
    el.classList.add('ativo');
  });
  el.setAttribute('aria-hidden', 'false');
}

function closeModal(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.classList.remove('ativo');
  setTimeout(()=> { 
    el.style.display = 'none'; 
    el.setAttribute('aria-hidden','true'); 
  }, 300); 
}

function openLightbox(imgSrc, caption){
  const img = document.getElementById('lightboxImg');
  const cap = document.getElementById('lightboxCaption');
  if(img) img.src = imgSrc;
  if(cap) cap.innerText = caption || '';
  openModal('lightbox');
}

/* ---------- máscara telefone ---------- */
function mascaraTelefone(e){
  let v = e.target.value || '';
  v = v.replace(/\D/g,'');
  v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
  v = v.replace(/(\d{5})(\d)/, '$1-$2');
  e.target.value = v.substring(0, 15);
}

/* ---------- animações por scroll ---------- */
function setupScrollAnimations(){
  const elements = document.querySelectorAll('.secao-padrao, .secao-numeros, .secao-historia, .secao-orcamento, .numero-card, .movel-card, .avaliacao-card, .card-diferencial, .faq-container');
  
  if(!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('visivel'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        entry.target.classList.add('visivel');
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(el => {
    el.classList.add('animar-entrada');
    observer.observe(el);
  });
}

/* ---------- formulário e integração ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const telInput = document.getElementById('telefone');
  if(telInput) telInput.addEventListener('input', mascaraTelefone);

  document.querySelectorAll('.ver-mais-link').forEach(el => {
    el.addEventListener('click', (e) => {
      const nome = e.currentTarget.dataset.nome || '';
      const msg = e.currentTarget.dataset.msg || '';
      const modalNome = document.getElementById('modalNome');
      const modalTexto = document.getElementById('modalTexto');
      if(modalNome) modalNome.innerText = nome;
      if(modalTexto) modalTexto.innerText = msg;
      openModal('modalAvaliacao');
    });
  });

  document.addEventListener('keydown', (ev) => {
    if(ev.key === 'Escape'){
      document.querySelectorAll('.modal-overlay.ativo').forEach(m => closeModal(m.id));
    }
  });

  setTimeout(() => {
    const bemv = document.getElementById('bemvindo');
    if(bemv) {
      bemv.style.display = 'block';
      bemv.style.animation = 'slideInUp 0.45s forwards';
    }
  }, 3800);

  setupScrollAnimations();

  const form = document.getElementById('formOrcamento');
  const btnEnviar = document.getElementById('btnEnviar');
  const feedback = document.getElementById('feedbackSucesso');

  if(form){
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if(!btnEnviar) return;

      const tel = (document.getElementById('telefone') || {}).value || '';
      if(tel.replace(/\D/g,'').length < 10){
        showCard("Por favor, preencha um telefone válido com DDD.");
        return;
      }

      btnEnviar.disabled = true;
      const originalText = btnEnviar.innerText;
      btnEnviar.innerText = "Enviando...";

      const data = new FormData(form);
      const objData = {};
      data.forEach((v,k) => objData[k]=v);

      try {
        const res = await fetch(SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify(objData),
          headers: { 'Content-Type': 'application/json' }
        });
        const json = await res.json();

        if(json && json.sucesso){
          form.reset();
          if(feedback){ feedback.style.display = 'block'; feedback.innerText = '✅ Recebido! Abrindo o WhatsApp...'; }
          setTimeout(() => {
            const msgZap = `Olá Carlos! Me chamo ${objData.nome || ''}. Quero um orçamento de montagem para: ${objData.tipo || ''}.`;
            window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(msgZap)}`, '_blank');
            btnEnviar.disabled = false;
            btnEnviar.innerText = originalText;
            if(feedback) feedback.style.display = 'none';
          }, 1500);
        } else {
          throw new Error(json && json.erro ? json.erro : 'Erro desconhecido');
        }
      } catch(err){
        console.error(err);
        showCard('Erro de conexão. Tente o botão do WhatsApp!');
        btnEnviar.disabled = false;
        btnEnviar.innerText = "Tentar Novamente";
      }
    });
  }

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if(e.target === overlay) closeModal(overlay.id);
    });
  });

  // Iniciar chat (se estiver fechado) após um tempo
  setTimeout(() => {
    const chatWidget = document.getElementById('chat-widget-container');
    if(chatWidget && chatWidget.classList.contains('hidden')){
       // Descomente a linha abaixo se quiser abrir automático
       // toggleChatBot(); 
    }
  }, 7000);

});

/* =========================================
   LÓGICA CHATBOT ESPECIALISTA (ZERO-BUG)
   ========================================= */
let chatState = 0; 
// Agora armazenamos a Zona também para ajudar na logistica
let chatData = { nome: '', tipo: '', detalhe: '', condicao: '', zona: '', bairro: '' };

function toggleChatBot() {
  const w = document.getElementById('chat-widget-container');
  w.classList.toggle('hidden');
  
  const msgs = document.getElementById('chat-messages');
  if(!w.classList.contains('hidden') && msgs.innerHTML.trim() === '') {
    botSay("Olá! 🤖 Sou o assistente virtual do Carlos.");
    setTimeout(() => botSay("Vou fazer algumas perguntas rápidas para agilizar seu orçamento. Qual é o seu **Nome**?"), 600);
    chatState = 1; 
  }
}

function botSay(text) {
  const msgs = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'msg bot';
  div.innerHTML = text; // Permite HTML (bold, etc)
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function userSay(text) {
  const msgs = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'msg user';
  div.innerText = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function showOptions(options) {
  const msgs = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'chat-options';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'chat-btn-opt';
    btn.innerText = opt;
    btn.onclick = () => processUserMessage(opt);
    div.appendChild(btn);
  });
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function handleChatEnter(e) {
  if(e.key === 'Enter') processUserMessage();
}

function processUserMessage(optValue) {
  const input = document.getElementById('chat-input');
  const text = optValue || input.value.trim();
  
  if(!text) return;
  if(!optValue) input.value = ''; 

  userSay(text);

  // === ÁRVORE DE DECISÃO COMPLETA ===
  setTimeout(() => {
    
    // 1. NOME -> TIPO GERAL
    if(chatState === 1) {
      chatData.nome = text;
      botSay(`Prazer, ${text}! Qual categoria de móvel você precisa montar/desmontar?`);
      showOptions([
        'Guarda-Roupa', 
        'Cozinha', 
        'Sala (Rack/Painel)', 
        'Cama/Berço', 
        'Escritório',
        'Desmontagem Geral'
      ]);
      chatState = 2;
    } 
    
    // 2. TIPO GERAL -> DETALHES ESPECÍFICOS
    else if(chatState === 2) {
      chatData.tipo = text;

      // --- Lógica de Guarda-Roupa ---
      if(text.includes('Guarda-Roupa')){
        botSay("Guarda-roupas variam muito. Como ele é?");
        showOptions([
          '2 ou 3 Portas (Bater)', 
          '4 a 6 Portas (Bater)', 
          'Portas de Correr (Slide)', 
          'Planejado (Marcenaria)',
          'Closet Aberto'
        ]);
      }
      // --- Lógica de Cozinha ---
      else if(text.includes('Cozinha')){
        botSay("Sobre a cozinha, qual o tamanho?");
        showOptions([
          'Kit Compacto (Pequena)', 
          'Modulada (Vários Armários)', 
          'Apenas Balcão/Pia',
          'Planejada (Sob Medida)'
        ]);
      }
      // --- Lógica de Sala ---
      else if(text.includes('Sala')){
        botSay("É fixado na parede ou de chão?");
        showOptions([
          'Painel de TV (Parede)', 
          'Rack Simples (Chão)', 
          'Estante Grande / Home',
          'Suporte de TV'
        ]);
      }
      // --- Lógica de Cama ---
      else if(text.includes('Cama')){
        botSay("Qual o modelo da cama?");
        showOptions([
          'Berço Infantil', 
          'Cama Simples/Box', 
          'Beliche / Treliche',
          'Cama Baú (Hidráulica)'
        ]);
      }
      // --- Lógica de Escritório ---
      else if(text.includes('Escritório')){
        botSay("O que seria no escritório?");
        showOptions([
          'Mesa Simples', 
          'Mesa em L / Diretor', 
          'Cadeira de Rodas',
          'Armário / Estante'
        ]);
      }
      // --- Desmontagem/Outros ---
      else {
        botSay("Entendi. É um móvel Padrão de Loja ou Planejado?");
        showOptions(['Padrão de Loja', 'Móvel Planejado', 'Móvel Antigo']);
      }
      
      chatState = 3; // Avança para condição
    }

    // 3. DETALHES -> CONDIÇÃO (NOVO vs USADO)
    else if(chatState === 3) {
      chatData.detalhe = text;
      
      // Pergunta crucial para precificação
      botSay("E qual a situação do móvel?");
      showOptions([
        'Novo na Caixa (Loja)', 
        'Usado (Já foi montado)', 
        'Precisa Desmontar e Montar',
        'Apenas Reparo/Regulagem'
      ]);
      
      chatState = 4; // Avança para Zona
    }

    // 4. CONDIÇÃO -> ZONA (LOCALIZAÇÃO MACRO)
    else if(chatState === 4) {
      chatData.condicao = text;
      botSay("Certo. Para calcular meu deslocamento, em qual **Região de SP** você está?");
      showOptions([
        'Zona Leste', 
        'Zona Sul', 
        'Zona Norte', 
        'Zona Oeste', 
        'Centro', 
        'Grande SP / ABC'
      ]);
      chatState = 5; // Avança para Bairro
    }

    // 5. ZONA -> BAIRRO (LOCALIZAÇÃO MICRO)
    else if(chatState === 5) {
      chatData.zona = text;
      botSay(`Entendi, ${text}. Para finalizar, digite o nome do seu **Bairro** ou Ponto de Referência:`);
      chatState = 6; // Fim
    }

    // 6. FINALIZAÇÃO -> LINK WHATSAPP
    else if(chatState === 6) {
      chatData.bairro = text;
      
      botSay("Perfeito! Já montei o resumo do seu pedido.");
      botSay("👇 **Toque no botão abaixo** para me enviar no WhatsApp e receber o valor:");
      
      // Criação da mensagem super detalhada para facilitar sua vida
      const msgZap = `Olá Carlos! Sou *${chatData.nome}*.\n\nGostaria de um orçamento para:\n🛠️ *${chatData.tipo}*\n📝 Detalhe: ${chatData.detalhe}\n📦 Estado: ${chatData.condicao}\n\n📍 Local: ${chatData.zona} - ${chatData.bairro}`;
      
      const link = `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(msgZap)}`;
      
      const msgs = document.getElementById('chat-messages');
      const btnLink = document.createElement('a');
      btnLink.href = link;
      btnLink.target = '_blank';
      btnLink.className = 'chat-btn-opt';
      // Estilo de destaque para o botão final
      btnLink.style.background = '#25D366'; 
      btnLink.style.color = 'white';
      btnLink.style.textAlign = 'center';
      btnLink.style.display = 'block';
      btnLink.style.marginTop = '12px';
      btnLink.style.padding = '12px';
      btnLink.style.fontWeight = 'bold';
      btnLink.style.textDecoration = 'none';
      btnLink.style.borderRadius = '8px';
      btnLink.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
      btnLink.innerHTML = '✅ <b>Ver Orçamento no WhatsApp</b>';
      
      msgs.appendChild(btnLink);
      msgs.scrollTop = msgs.scrollHeight;
      
      chatState = 7; // Estado final travado
    }
    
    else if(chatState === 7) {
       botSay("O link já foi gerado acima! Pode clicar nele para falar comigo. 👍");
    }
  }, 600); // Delay natural de "digitando..."
}
