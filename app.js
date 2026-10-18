// ====== CONFIGURAÇÕES - EDITAR AQUI ======

// WhatsApp principal da loja (somente números: DDI + DDD + número)
const WHATSAPP_PRINCIPAL = "5583998968776";

// Site oficial da loja
const SITE_OFICIAL = "https://drveiculospb.com.br/";

// ==========================================

const screens = {
  road: document.getElementById('screen-road'),
  hub: document.getElementById('screen-hub'),
  contact: document.getElementById('screen-contact'),
  address: document.getElementById('screen-address')
};

let currentScreen = 'road';
let isReloading = false;

function showScreen(name) {
  currentScreen = name;

  Object.entries(screens).forEach(([key, el]) => {
    if (!el) return;

    if (key === name) {
      el.classList.add('active');
      el.style.transform = 'translateX(0)';
      el.style.opacity = '1';
      el.style.zIndex = '5';
    } else if (key === 'road') {
      el.classList.remove('active');
      el.style.transform = 'translateX(-100%)';
      el.style.opacity = '0';
      el.style.zIndex = '4';
    } else {
      el.classList.remove('active');
      el.style.transform = 'translateX(100%)';
      el.style.opacity = '0';
      el.style.zIndex = '4';
    }
  });
}

function goTo(name, pushHistory = true) {
  showScreen(name);

  if (pushHistory) {
    history.pushState({ screen: name }, '', `#${name}`);
  }
}

function reloadToRoad() {
  if (isReloading) return;
  isReloading = true;
  history.replaceState(null, '', '#road');
  window.location.href = window.location.pathname + '#road';
  window.location.reload();
}

function initScreen() {
  const hash = window.location.hash.replace('#', '');
  const validScreens = ['road', 'hub', 'contact', 'address'];

  if (validScreens.includes(hash)) {
    showScreen(hash);
    history.replaceState({ screen: hash }, '', `#${hash}`);
  } else {
    showScreen('road');
    history.replaceState({ screen: 'road' }, '', '#road');
  }
}

// ---- Estado inicial ----
initScreen();

// ---- Drag do carro (Screen 1) ----
const car = document.getElementById('carDrag');
const roadWrap = car ? car.parentElement : null;
const storeTarget = document.getElementById('storeTarget');

const CAR_BASE_BOTTOM = 24;
const CAR_TOP_MARGIN = 20;

let dragging = false;
let startY = 0;
let startOffset = 0;

function getMaxOffset() {
  if (!roadWrap || !car) return 0;
  return roadWrap.offsetHeight - car.offsetHeight - CAR_TOP_MARGIN - CAR_BASE_BOTTOM;
}

function getOffset() {
  if (!car) return 0;
  const value = getComputedStyle(car).getPropertyValue('--car-offset').trim();
  return value ? parseFloat(value) : 0;
}

function setCarOffset(offset) {
  if (!car) return;
  car.style.setProperty('--car-offset', `-${offset}px`);
}

function updateStoreZoom(progress) {
  if (!storeTarget) return;
  const scale = 1 + (progress * 1.5);
  const opacity = 1 - (progress * 0.7);
  storeTarget.style.transform = `scale(${scale})`;
  storeTarget.style.opacity = opacity;
}

function onDown(e) {
  if (!car) return;
  dragging = true;
  car.classList.add('dragging');
  startY = e.touches ? e.touches[0].clientY : e.clientY;
  startOffset = getOffset();
}

function onMove(e) {
  if (!dragging || !car || !roadWrap) return;

  if (e.type === 'touchmove') {
    e.preventDefault();
  }

  const y = e.touches ? e.touches[0].clientY : e.clientY;
  const delta = startY - y;
  const maxOffset = getMaxOffset();
  let newOffset = Math.min(Math.max(startOffset + delta, 0), maxOffset);

  setCarOffset(newOffset);

  const progress = Math.max(0, newOffset / maxOffset);
  updateStoreZoom(progress);

  if (newOffset >= maxOffset - 2) {
    finishDrag();
  }
}

function onUp() {
  if (!dragging || !car || !storeTarget) return;
  dragging = false;
  car.classList.remove('dragging');

  const maxOffset = getMaxOffset();
  if (getOffset() < maxOffset - 30) {
    car.classList.add('animating');
    storeTarget.style.transform = 'scale(1)';
    storeTarget.style.opacity = '1';
    setCarOffset(0);
    setTimeout(() => car.classList.remove('animating'), 500);
  }
}

function finishDrag() {
  dragging = false;
  if (car) car.classList.remove('dragging');
  setTimeout(() => goTo('hub'), 150);
}

if (car) {
  car.addEventListener('mousedown', onDown);
  car.addEventListener('touchstart', onDown, { passive: true });
}

window.addEventListener('mousemove', onMove);
window.addEventListener('touchmove', onMove, { passive: false });
window.addEventListener('mouseup', onUp);
window.addEventListener('touchend', onUp);

if (storeTarget) {
  storeTarget.addEventListener('click', () => goTo('hub'));
}

// ---- Clique/Swipe nos cards do HUB ----
function enableSwipeCard(el, action) {
  el.addEventListener('touchend', () => action());
  el.addEventListener('click', () => action());
}

document.querySelectorAll('.path-card').forEach(card => {
  const target = card.dataset.swipe;
  enableSwipeCard(card, () => {
    if (target === 'site') {
      window.open(SITE_OFICIAL, '_blank');
    } else {
      goTo(target);
    }
  });
});

// ---- Botões voltar internos ----
document.querySelectorAll('[data-back]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const target = btn.dataset.back;

    if (target === 'road') {
      reloadToRoad();
      return;
    }

    showScreen(target);
    history.replaceState({ screen: target }, '', `#${target}`);
  });
});

// ---- Botão voltar do navegador ----
window.addEventListener('popstate', (e) => {
  const hash = window.location.hash.replace('#', '');
  const targetScreen = (e.state && e.state.screen) ? e.state.screen : (hash || 'road');

  if (targetScreen === 'road' && currentScreen !== 'road') {
    reloadToRoad();
  } else {
    showScreen(targetScreen);
  }
});

// ---- WhatsApp principal ----
const btnWhatsMain = document.getElementById('btnWhatsMain');
if (btnWhatsMain) {
  btnWhatsMain.addEventListener('click', () => {
    const texto = encodeURIComponent('Olá! Vim pelo link da DR Veículos e gostaria de mais informações.');
    window.open(`https://wa.me/${WHATSAPP_PRINCIPAL}?text=${texto}`, '_blank');
  });
}

// ---- Consultores ----
document.querySelectorAll('.consultor-card').forEach(card => {
  card.addEventListener('click', () => {
    const numero = card.dataset.wpp;
    const texto = encodeURIComponent('Olá! Vim pelo link da DR Veículos e gostaria de falar com você.');
    window.open(`https://wa.me/${numero}?text=${texto}`, '_blank');
  });
});
