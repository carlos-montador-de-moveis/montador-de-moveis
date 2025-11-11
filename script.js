const scriptURL = "https://script.google.com/macros/s/AKfycbzGxfH_oqr_QY8ypPr7Y_pDEK3fDC1vJeW74dz6-L2sfmukBEs9bm0c-r-d-Foup7sB/exec";
const cardNotif = document.getElementById('cardNotif');

// Função para exibir card de notificação
function showCard(msg, duration=3000){
  cardNotif.textContent = msg;
  cardNotif.style.display = 'block';
  cardNotif.style.opacity = 1;
  setTimeout(() => {
    cardNotif.style.transition = 'opacity 0.5s';
    cardNotif.style.opacity = 0;
    setTimeout(()=> {
      cardNotif.style.display='none';
      cardNotif.style.transition = '';
    }, 500);
  }, duration);
}

// Formulário
document.getElementById('formOrcamento').addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;
  const data = {};
  new FormData(form).forEach((value,key) => data[key]=value);

  fetch(scriptURL, {
    method:'POST',
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(r => {
    if(r.sucesso){
      showCard('Pedido enviado com sucesso!');
      form.reset();
      window.open(`https://wa.me/551111954558195?text=Olá, acabei de solicitar um orçamento pelo seu site. Aguardo seu retorno.`, '_blank');
    } else {
      showCard('Erro ao enviar: ' + r.erro);
    }
  })
  .catch(err => showCard('Erro ao enviar: '+err));
});

// Scroll
function scrollToSection(id){ document.getElementById(id).scrollIntoView({behavior:'smooth'}); }
function scrollToTop(){ window.scrollTo({top:0, behavior:'smooth'}); }

// Mensagem de boas-vindas
window.addEventListener('load', () => {
  setTimeout(() => {
    const bemvindo = document.getElementById('bemvindo');
    bemvindo.style.display = 'block';
    bemvindo.style.animation = 'entrarMsg 0.8s forwards';
    setTimeout(() => {
      bemvindo.style.animation = 'sairMsg 0.8s forwards';
      setTimeout(()=> bemvindo.style.display='none', 800);
    }, 7000);
  }, 3000);
});

// Cards "ver mais" das avaliações
document.querySelectorAll('.ver-mais').forEach(el => {
  el.addEventListener('click', e => {
    showCard(el.dataset.msg);
  });
});
