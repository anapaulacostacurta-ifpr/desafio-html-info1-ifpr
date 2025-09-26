// =========================
// Chaves de estado
// =========================
const KEY_FLAGS = "ctf_div_flags_v1";
const KEY_COMPLETED_AT = "ctf_div_completed_at";
const KEY_STEP_INDEX = "ctf_div_step_index_v1"; // 0..7 (quantas fases sequenciais já concluiu)

// =========================
// DOM refs
// =========================
const bar = document.getElementById('bar');
const list = document.getElementById('foundList');
const msg = document.getElementById('msg');
const input = document.getElementById('flagInput');
const btn = document.getElementById('btnCheck');
const finishCard = document.getElementById('finishCard');
const finishForm = document.getElementById('finishForm');
const finishThanks = document.getElementById('finishThanks');

const a11yBtn = document.getElementById('a11yBtn');
const debugBox = document.getElementById('debugBox');

// =========================
// Estado em memória
// =========================
let FLAGS_ALL = [];
let steps = [];   
let SEQUENCE = []; 


// =========================
// Utils
// =========================
function loadFound(){
  try { return JSON.parse(localStorage.getItem(KEY_FLAGS)) || []; }
  catch { return []; }
}
function saveFound(arr){
  localStorage.setItem(KEY_FLAGS, JSON.stringify(arr));
}
function getStepIndex(){
  const v = localStorage.getItem(KEY_STEP_INDEX);
  return v === null ? 0 : parseInt(v,10);
}
function setStepIndex(i){
  localStorage.setItem(KEY_STEP_INDEX, String(i));
}
function maskFlag(flag){
  const m = /^IFPR\{(.+)\}$/.exec(flag);
  if(!m) return flag;
  const inner = m[1];
  const first3 = inner.slice(0,3);
  const last3 = inner.slice(-3);
  return `IFPR{${first3}******${last3}}`;
}
function hideAllSteps(){
  document.querySelectorAll('.step-card').forEach(el=>el.classList.add('hidden'));
}
function showStep(n){
  const s = steps[n];
  if(!s) return;
  const el = document.getElementById(s.id);
  if (el) el.classList.remove('hidden');
}
function refreshStepsVisibility(){
  hideAllSteps();
  const found = loadFound();
  // quantos passos da sequência já concluídos (em ordem)
  let idx = 0;
  for (let i=0;i<steps.length;i++){
    if (found.includes(steps[i].flag)) idx++;
    else break;
  }
  // mostra o próximo a fazer
  const toShow = Math.min(idx, steps.length - 1);
  showStep(toShow);
  // se terminou todos, garante mostrar o último + card de finalização
  if (idx >= steps.length) {
    showStep(steps.length - 1);
    if (finishCard) finishCard.style.display = "block";
  }
}

// =========================
// Render UI
// =========================
function render(){
  const found = loadFound();
  list.innerHTML = "";
  found.forEach(f=>{
    const li = document.createElement('li');
    li.textContent = maskFlag(f);
    li.style.color = "#fff";
    list.appendChild(li);
  });
  const pct = FLAGS_ALL.length ? Math.min(100, Math.round((found.length / FLAGS_ALL.length) * 100)) : 0;
  if (bar) bar.style.width = pct + "%";

  if (FLAGS_ALL.length && found.length >= FLAGS_ALL.length && finishCard){
    finishCard.style.display = "block";
    if(!localStorage.getItem(KEY_COMPLETED_AT)){
      localStorage.setItem(KEY_COMPLETED_AT, new Date().toISOString());
    }
  }
  refreshStepsVisibility();
}

// =========================
// Validação e sequência
// =========================
function addFlag(flag){
  const clean = (flag || "").trim();
  if(!/^IFPR\{DIV-[A-Z0-9\-]+\}$/.test(clean)){
    if (msg) msg.innerHTML = `<span style="color:#f59e0b">Formato inválido. Use algo como <code>IFPR{DIV-EXEMPLO}</code>.</span>`;
    return;
  }
  if(!FLAGS_ALL.includes(clean)){
    if (msg) msg.innerHTML = `<span style="color:#ef4444">Flag não reconhecida. Continue tentando!</span>`;
    return;
  }

  const found = loadFound();
  if(found.includes(clean)){
    if (msg) msg.innerHTML = `<span style="color:#f59e0b">Você já registrou essa flag.</span>`;
    render();
    return;
  }

  // checagem de ordem (somente para as da sequência de fases)
  const expectedIndex = getStepIndex(); // 0..7
  const expectedFlag = SEQUENCE[expectedIndex];   // qual flag libera a próxima
  if (SEQUENCE.includes(clean) && clean !== expectedFlag) {
    // conta no placar, mas não libera próxima fase
    found.push(clean);
    saveFound(found);
    if (msg) msg.innerHTML = `<span style="color:#f59e0b">Flag válida, mas fora de sequência. Complete a fase atual para liberar a próxima.</span>`;
    render();
    return;
  }

  // registra
  found.push(clean);
  saveFound(found);

  // se é a esperada, avança o índice
  if (clean === expectedFlag) {
    setStepIndex(expectedIndex + 1);
    if (msg) msg.innerHTML = `<span style="color:#22c55e">Boa! Fase concluída. Próximo desafio liberado.</span>`;
  } else {
    if (msg) msg.innerHTML = `<span style="color:#22c55e">Boa! Flag registrada.</span>`;
  }

  if(FLAGS_ALL.length && found.length >= FLAGS_ALL.length && !localStorage.getItem(KEY_COMPLETED_AT)){
    localStorage.setItem(KEY_COMPLETED_AT, new Date().toISOString());
  }

  render();
}

// =========================
// Eventos UI
// =========================
if (btn) {
  btn.addEventListener('click', ()=>{
    addFlag(input.value);
    input.value="";
    input.focus();
  });
}
if (input) {
  input.addEventListener('keydown', e=>{
    if(e.key==="Enter"){ btn.click(); }
  });
}

// Desafio 5 (data-attribute): Enter/Espaço/click -> revela
function revealA11y(){
  const f = a11yBtn?.dataset.flag;
  if(!f) return;
  alert("Flag do data-attribute: " + f);
  addFlag(f);
}
if (a11yBtn){
  a11yBtn.addEventListener('click', revealA11y);
  a11yBtn.addEventListener('keydown', (e)=>{
    if(e.key==="Enter" || e.key===" "){
      e.preventDefault();
      revealA11y();
    }
  });
}

// Desafio 6: console log
if (debugBox){
  debugBox.addEventListener('click', ()=>{
    console.log("Você clicou no bloco de debug. Flag: IFPR{DIV-CONSOLE-LOG}");
    addFlag("IFPR{DIV-CONSOLE-LOG}");
  });
}

// Dica do ROT13 no console
(function rot13Hint(){
  const rawEl = document.getElementById('rot13');
  if(!rawEl) return;
  const raw = rawEl.dataset.rot || "";
  console.log("Dica ROT13 → Texto bruto:", raw, "| Use uma função ROT13, ex.:");
  console.log(`function rot13(s){return s.replace(/[A-Za-z]/g,c=>String.fromCharCode((c<="Z"?90:122)>=(c=c.charCodeAt(0)+13)?c:c-26));}`);
  console.log("Se decodificar corretamente, registre: IFPR{DIV-ROT13-DECODED}");
})();

// =========================
// Envio Google Forms
// =========================
function prepareFormsFields(){
  const found = loadFound();
  const completedAt = localStorage.getItem(KEY_COMPLETED_AT) || new Date().toISOString();

  const totalEl = document.getElementById('totalFlags');
  const flagsEl = document.getElementById('flagsField');
  const compEl  = document.getElementById('completedAt');

  if (FLAGS_ALL.length && totalEl) totalEl.value = `${found.length}/${FLAGS_ALL.length}`;
  if (flagsEl) flagsEl.value = found.join("\n");
  if (compEl)  compEl.value  = completedAt;
}
if (finishForm){
  finishForm.addEventListener('submit', ()=>{
    prepareFormsFields();
    setTimeout(()=>{ if (finishThanks) finishThanks.style.display = "block"; }, 600);
  });
}

// Inicia tudo
boot_div();
