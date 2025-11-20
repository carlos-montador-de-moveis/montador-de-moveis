/* script.js - Lógica Zero-Bug
   Mantido estrutura original, ajustado apenas seletores novos. */

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
  /* Offset para compensar o menu sticky que agora tem altura fixa */
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
  // Pequeno delay para permitir que o navegador renderize o display:flex antes de adicionar a classe ativo (trigger da animação CSS)
  requestAnimationFrame(() => {
    el.classList.add('ativo');
  });
  el.setAttribute('aria-hidden', 'false');
}

function closeModal(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.classList.remove('ativo');
  
  // Espera a animação terminar (mesmo que seja 1.5s de entrada, a saída é rápida pelo CSS default ou podemos forçar)
  // Para UX, fechar deve ser rápido.
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

/* ---------- animações por scroll (IntersectionObserver) ---------- */
function setupScrollAnimations(){
  // Adicionei .faq-container para animar a lista de perguntas também
  const elements = document.querySelectorAll('.secao-padrao, .secao-numeros, .secao-historia, .secao-orcamento, .numero-card, .movel-card, .avaliacao-card, .card-diferencial, .faq-container');
  
  if(!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('visivel'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        entry.target.classList.add('visivel');
        // Opcional: parar de observar após aparecer
        // observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(el => {
    el.classList.add('animar-entrada'); // Certifique-se que essa classe existe no CSS global ou adicione
    observer.observe(el);
  });
}

/* ---------- formulário e integração ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const btnW = document.getElementById('btnWhatsappFloat');
  if(btnW) btnW.href = `https://wa.me/${WHATSAPP_NUM}`;

  const telInput = document.getElementById('telefone');
  if(telInput) telInput.addEventListener('input', mascaraTelefone);

  // Atualizado: seletor para a nova classe .ver-mais-link
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

});
