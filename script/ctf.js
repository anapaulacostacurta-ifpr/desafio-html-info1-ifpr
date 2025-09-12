// ===== CTF - Lógica de validação =====
// Flags do desafio (também são “pistas” para quem inspecionar o JS 😉)
const FLAGS = [
  "IFPR{INLINE-STYLE-IS-POWERFUL}",     // Flag 1 – revelada por botão
  "IFPR{SOURCE-VIEW-WARRIOR}",          // Flag 2 – comentário no HTML
  "IFPR{ROT13-DECODED-THIS}",           // Flag 3 – ROT13
  "IFPR{HOVER-TO-REVEAL}",              // Flag 4 – CSS :hover::after
  "IFPR{OPEN-CONSOLE-CTRL-SHIFT-I}",    // Flag 5 – console
  "IFPR{DATA-ATTRIBUTES-ARE-HANDY}"     // Flag 6 – data-attribute
];

const progressBar = document.getElementById('progressBar');
const foundCountEl = document.getElementById('foundCount');
const foundList = document.getElementById('foundList');
const flagInput = document.getElementById('flagInput');
const checkBtn = document.getElementById('checkBtn');
const hintBtn = document.getElementById('hintBtn');
const revealInlineBtn = document.getElementById('revealInlineBtn');
const inlineFlag = document.getElementById('inlineFlag');
const dataStash = document.getElementById('dataStash');

// Mantém estado no localStorage para não perder o progresso
const STORAGE_KEY = 'ifpr_ctf_found';
const foundSet = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));

// Atualiza UI inicial
renderFound();
renderProgress();

// Evento: validar flag digitada
checkBtn.addEventListener('click', () => {
  const value = (flagInput.value || '').trim();
  if (!value) return;

  if (FLAGS.includes(value)) {
    if (!foundSet.has(value)) {
      foundSet.add(value);
      persist();
      renderFound();
      renderProgress();
      toast('✅ Flag válida! Boa!');
    } else {
      toast('ℹ️ Você já encontrou essa flag.');
    }
  } else {
    toast('❌ Flag incorreta. Tente outra pista!');
  }
  flagInput.value = '';
  flagInput.focus();
});

// Enter envia
flagInput.addEventListener('keydown', (ev) => {
  if (ev.key === 'Enter') checkBtn.click();
});

// Botão de dica contextuais (cicla as dicas)
const HINTS = [
  'Use “Ver código-fonte da página” (Ctrl+U) e também o Inspetor (Ctrl+Shift+I).',
  'Pseudoelementos CSS podem “escrever” conteúdo: tente passar o mouse em “CSS-Hover”.',
  'ROT13: cada letra avança 13 posições no alfabeto. Decodifique VSCE{...}.',
  'Atributos data-* guardam dados. Procure algo como data-flag.',
  'Inline styles podem esconder ou mostrar coisas: experimente o botão de revelar.',
  'O console às vezes “conversa” com você. Olhe o que o JS imprime.'
];
let hintIndex = 0;
hintBtn.addEventListener('click', () => {
  toast('💡 Dica: ' + HINTS[hintIndex]);
  hintIndex = (hintIndex + 1) % HINTS.length;
});

// Botão: revelar a flag inline (Flag 1)
revealInlineBtn.addEventListener('click', () => {
  inlineFlag.style.display = inlineFlag.style.display === 'none' ? 'inline-block' : 'none';
});

// Imprime Flag 5 no console
console.log('%c💬 Dica do Console:', 'color:#7c4dff; font-weight:bold;');
console.log('Aqui vai uma “mensagem secreta”: %cIFPR{OPEN-CONSOLE-CTRL-SHIFT-I}', 'color:#00c853; font-weight:bold;');

// Utilitário: renderizar progresso
function renderProgress() {
  const total = FLAGS.length;
  const current = foundSet.size;
  foundCountEl.textContent = current.toString();
  const pct = Math.round((current / total) * 100);
  progressBar.style.width = pct + '%';

  if (current === total) {
    toast('🏆 Parabéns! Todas as flags encontradas! Flag final: IFPR{WEB-NINJA}');
  }
}

// Utilitário: listar flags encontradas (parcialmente mascaradas)
function renderFound() {
  foundList.innerHTML = '';
  [...foundSet].forEach(f => {
    const li = document.createElement('li');
    li.textContent = mask(f);
    foundList.appendChild(li);
  });
}

// Utilitário: salva estado
function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...foundSet]));
}

// Utilitário: mascarar flags na lista
function mask(flag) {
  // Ex.: IFPR{INLINE-STYLE-IS-POWERFUL} -> IFPR{IN*****FUL}
  const open = flag.indexOf('{');
  const close = flag.indexOf('}');
  if (open === -1 || close === -1) return flag;
  const inner = flag.slice(open + 1, close);
  if (inner.length <= 4) return flag;

  const head = inner.slice(0, 2);
  const tail = inner.slice(-3);
  const masked = head + '*'.repeat(Math.max(1, inner.length - 5)) + tail;
  return flag.slice(0, open + 1) + masked + flag.slice(close);
}

// Toast simples (não intrusivo)
let toastTimer = null;
function toast(msg) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.style.position = 'fixed';
    el.style.left = '50%';
    el.style.bottom = '24px';
    el.style.transform = 'translateX(-50%)';
    el.style.background = '#222';
    el.style.color = '#fff';
    el.style.padding = '10px 14px';
    el.style.borderRadius = '8px';
    el.style.boxShadow = '0 6px 20px rgba(0,0,0,.25)';
    el.style.zIndex = '9999';
    el.style.maxWidth = '90vw';
    el.style.fontSize = '14px';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = '1';
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.style.opacity = '0';
  }, 2500);
}

// Pequeno “easter egg”: se o usuário clicar 5x no título, dá uma micro-dica
(() => {
  const h1 = document.querySelector('.box h1');
  let clicks = 0;
  h1.addEventListener('click', () => {
    clicks++;
    if (clicks === 5) {
      toast('👀 Micro-dica: data-flag...');
      clicks = 0;
    }
  });
})();
