
// =========================
    // CONFIGURAÇÃO DO CTF
    // =========================
    const FLAGS = [
      "IFPR{DIV-SOURCE-VIEW}",
      "IFPR{DIV-HOVER-REVEAL}",
      "IFPR{DIV-TARGET-OPENED}",
      "IFPR{DIV-CSS-VAR}",
      "IFPR{DIV-BOX-MODEL}",
      "IFPR{DIV-DATA-ATTRIBUTE}",
      "IFPR{DIV-CONSOLE-LOG}",
      "IFPR{DIV-CLASS-POWER}",
      "IFPR{DIV-ROT13-DECODED}"
    ];
    const TOTAL_FLAGS = FLAGS.length;

    const KEY = "ctf_div_flags_v1";
    const KEY_COMPLETED_AT = "ctf_div_completed_at";

    const bar = document.getElementById('bar');
    const list = document.getElementById('foundList');
    const msg = document.getElementById('msg');
    const input = document.getElementById('flagInput');
    const btn = document.getElementById('btnCheck');
    const finishCard = document.getElementById('finishCard');
    const finishForm = document.getElementById('finishForm');
    const finishThanks = document.getElementById('finishThanks');

    function loadFound(){
      try{
        const raw = localStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : [];
      }catch(e){ return []; }
    }
    function saveFound(arr){ localStorage.setItem(KEY, JSON.stringify(arr)); }

    // MÁSCARA: IFPR{XXX******YYY}
    function maskFlag(flag){
      const m = /^IFPR\{(.+)\}$/.exec(flag);
      if(!m) return flag;
      const inner = m[1];
      const first3 = inner.slice(0,3);
      const last3 = inner.slice(-3);
      return `IFPR{${first3}******${last3}}`;
    }

    function render(){
      const found = loadFound();
      list.innerHTML = "";
      found.forEach(f=>{
        const li = document.createElement('li');
        li.textContent = maskFlag(f);
        list.appendChild(li);
      });
      const pct = Math.min(100, Math.round((found.length / TOTAL_FLAGS) * 100));
      bar.style.width = pct + "%";

      if(found.length >= TOTAL_FLAGS){
        finishCard.style.display = "block";
        if(!localStorage.getItem(KEY_COMPLETED_AT)){
          localStorage.setItem(KEY_COMPLETED_AT, new Date().toISOString());
        }
        // Prepara campos do Forms assim que o card aparecer
        prepareFormsFields();
      }
    }

    function addFlag(flag){
      const clean = flag.trim();
      if(!/^IFPR\{DIV-[A-Z0-9\-]+\}$/.test(clean)){
        msg.innerHTML = `<span class="bad">Formato inválido. Use algo como <code>IFPR{DIV-EXEMPLO}</code>.</span>`;
        return;
      }
      if(!FLAGS.includes(clean)){
        msg.innerHTML = `<span class="bad">Flag não reconhecida. Continue tentando!</span>`;
        return;
      }
      const found = loadFound();
      if(found.includes(clean)){
        msg.innerHTML = `<span class="warn">Você já registrou essa flag.</span>`;
        render();
        return;
      }
      found.push(clean);
      saveFound(found);
      msg.innerHTML = `<span class="ok">Boa! Flag registrada.</span>`;
      render();
    }

    btn.addEventListener('click', ()=>{
      addFlag(input.value);
      input.value="";
      input.focus();
    });
    input.addEventListener('keydown', e=>{
      if(e.key==="Enter"){ btn.click(); }
    });

    // A11y “div botão”: Enter/Espaço revelam a flag do data-attribute
    const a11yBtn = document.getElementById('a11yBtn');
    function revealA11y(){
      const f = a11yBtn.dataset.flag;
      alert("Flag do data-attribute: " + f);
      addFlag(f);
    }
    a11yBtn.addEventListener('click', revealA11y);
    a11yBtn.addEventListener('keydown', (e)=>{
      if(e.key==="Enter" || e.key===" "){ e.preventDefault(); revealA11y(); }
    });

    // Debug box: loga no console
    const debugBox = document.getElementById('debugBox');
    debugBox.addEventListener('click', ()=>{
      console.log("Você clicou no bloco de debug. Flag: IFPR{DIV-CONSOLE-LOG}");
      addFlag("IFPR{DIV-CONSOLE-LOG}");
    });

    // ROT13 hint automático
    (function rot13Hint(){
      const raw = document.getElementById('rot13').dataset.rot || "";
      console.log("Dica ROT13 → Texto bruto:", raw, "| Use uma função ROT13, ex.:");
      console.log(`function rot13(s){return s.replace(/[A-Za-z]/g,c=>String.fromCharCode((c<="Z"?90:122)>=(c=c.charCodeAt(0)+13)?c:c-26));}`);
      console.log("Se decodificar corretamente, registre: IFPR{DIV-ROT13-DECODED}");
    })();

    // ===== Integração com Google Forms =====
    function prepareFormsFields(){
      const found = loadFound();
      const completedAt = localStorage.getItem(KEY_COMPLETED_AT) || new Date().toISOString();

      const totalEl = document.getElementById('totalFlags');
      const flagsField = document.getElementById('flagsField');
      const completedEl = document.getElementById('completedAt');

      if(totalEl) totalEl.value = `${found.length}/${TOTAL_FLAGS}`;
      if(flagsField) flagsField.value = found.join("\n"); // uma por linha
      if(completedEl) completedEl.value = completedAt;
    }

    if(finishForm){
      // Mostra "obrigado" após submissão (Forms vai responder no iframe oculto)
      finishForm.addEventListener('submit', ()=>{
        // Pequeno delay para UX (envio acontece por navegação no iframe)
        setTimeout(()=>{
          if(finishThanks) finishThanks.style.display = "block";
        }, 600);
      });
    }

    // Render inicial + restaura progresso
    render();