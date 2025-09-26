async function boot_div(){
  try {
    const resp = await fetch("../assets/ctf-div-data.json");
    if (!resp.ok) throw new Error('Erro ao carregar ctf-data.json: ' + resp.status);
    const data = await resp.json();

    FLAGS_ALL = data.flags;
    steps = data.steps;                
    SEQUENCE = steps.map(s => s.flag); 

  } catch(e){
    console.error(e);
    return; // se não conseguir ler o JSON, não continua
  }

  // Ajusta o índice de fase já concluída
  if (localStorage.getItem(KEY_STEP_INDEX) === null) {
    const found = loadFound();
    let idx = 0;
    for (let i=0;i<SEQUENCE.length;i++){
      if (found.includes(SEQUENCE[i])) idx++;
      else break;
    }
    setStepIndex(idx);
  }

  refreshStepsVisibility();
  render();
}
