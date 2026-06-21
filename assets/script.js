
function toggleMenu(){
  document.getElementById("menu").classList.toggle("open");
}
function fakeDiscordLogin(){
  localStorage.setItem("pmrp_login","true");
  localStorage.setItem("pmrp_role","2cia_autorizado");
  updateLoginState();
  alert("Login Discord simulado feito com sucesso. Para validar cargo real, precisa conectar com OAuth2 + bot no backend.");
  atualizarPermissoesTela();
  carregarStats();
}
function logout(){
  localStorage.removeItem("pmrp_login");
  localStorage.removeItem("pmrp_role");
  updateLoginState();
  if(typeof atualizarPermissoesTela === 'function') atualizarPermissoesTela();
  if(typeof renderBarcas === 'function') renderBarcas();
  atualizarCategoriasPainel();
  irParaCategoria('barca');
}
function updateLoginState(){
  const logged = localStorage.getItem("pmrp_login") === "true";
  document.querySelectorAll(".only-logged").forEach(el=>el.classList.toggle("hidden",!logged));
  document.querySelectorAll(".only-guest").forEach(el=>el.classList.toggle("hidden",logged));
}
document.addEventListener("DOMContentLoaded", updateLoginState);

const respostas = {"q1": "b", "q2": "c", "q3": "a", "q4": "b", "q5": "c", "q6": "a", "q7": "b", "q8": "c", "q9": "a", "q10": "b", "q11": "c", "q12": "a", "q13": "b", "q14": "c", "q15": "a", "q16": "b", "q17": "c", "q18": "a", "q19": "b", "q20": "c"};
function corrigirConcurso(e){
  e.preventDefault();
  let acertos = 0;
  Object.keys(respostas).forEach(k=>{
    const v = document.querySelector(`[name="${k}"]:checked`);
    if(v && v.value === respostas[k]) acertos++;
  });
  const nome = document.getElementById("nome")?.value || "Candidato";
  const box = document.getElementById("resultado");
  const aprovado = acertos >= 16;
  box.className = "result " + (aprovado ? "ok" : "bad");
  box.innerHTML = aprovado
    ? `✅ ${nome}, você foi APROVADO com ${acertos}/20. Envie o print para a equipe de recrutamento.`
    : `❌ ${nome}, você ficou REPROVADO com ${acertos}/20. A nota mínima é 16/20.`;
}
function enviarOuvidoria(e){
  e.preventDefault();
  const box = document.getElementById("ouvidoriaResult");
  box.className = "result ok";
  box.innerHTML = "✅ Manifestação registrada no sistema fictício. Para funcionar de verdade, conecte com backend/Discord webhook.";
}
function criarBoletim(e){
  e.preventDefault();
  const tipo = document.getElementById("tipoBoletim").value;
  const titulo = document.getElementById("tituloBoletim").value;
  const lista = document.getElementById("listaBoletins");
  const item = document.createElement("div");
  item.className = "boletim-item";
  item.innerHTML = `<strong>${tipo}</strong><span>${titulo}</span>`;
  lista.prepend(item);
  e.target.reset();
}


// Ripple nos botões
document.addEventListener("click", function(e){
  const btn = e.target.closest(".btn");
  if(!btn) return;
  const old = btn.querySelector(".ripple");
  if(old) old.remove();
  const circle = document.createElement("span");
  const d = Math.max(btn.clientWidth, btn.clientHeight);
  circle.style.width = circle.style.height = d + "px";
  const rect = btn.getBoundingClientRect();
  circle.style.left = (e.clientX - rect.left - d/2) + "px";
  circle.style.top = (e.clientY - rect.top - d/2) + "px";
  circle.className = "ripple";
  btn.appendChild(circle);
});

// Estatísticas locais
function carregarStats(){
  const membros = 28;
  const boletins = JSON.parse(localStorage.getItem("boletins_pm") || "[]").length + 12;
  const prisoes = Number(localStorage.getItem("prisoes_pm") || "47");
  const barcas = JSON.parse(localStorage.getItem("barcas_pm") || "{}");
  const emServico = Object.values(barcas).filter(v => v && v.nome).length;

  const set = (id, val) => {
    const el = document.getElementById(id);
    if(el) el.textContent = val;
  };
  set("statMembros", membros);
  set("statBoletins", boletins);
  set("statPrisoes", prisoes);
  set("statBarcas", emServico);
}

// Boletim com veículo
function criarBoletimCompleto(e){
  e.preventDefault();

  const boletim = {
    tipo: document.getElementById("tipoBoletim")?.value || "Ocorrência",
    titulo: document.getElementById("tituloBoletim")?.value || "Sem título",
    veiculo: document.getElementById("veiculoBoletim")?.value || "Não informado",
    placa: document.getElementById("placaBoletim")?.value || "Não informado",
    cor: document.getElementById("corBoletim")?.value || "Não informada",
    suspeito: document.getElementById("suspeitoBoletim")?.value || "Não informado",
    prisao: document.getElementById("prisaoBoletim")?.value || "Não",
    data: new Date().toLocaleString("pt-BR")
  };

  const listaStorage = JSON.parse(localStorage.getItem("boletins_pm") || "[]");
  listaStorage.unshift(boletim);
  localStorage.setItem("boletins_pm", JSON.stringify(listaStorage));

  if(boletim.prisao === "Sim"){
    const atual = Number(localStorage.getItem("prisoes_pm") || "47");
    localStorage.setItem("prisoes_pm", String(atual + 1));
  }

  renderBoletins();
  carregarStats();
  e.target.reset();
}

function renderBoletins(){
  const lista = document.getElementById("listaBoletins");
  if(!lista) return;
  const dados = JSON.parse(localStorage.getItem("boletins_pm") || "[]");
  lista.innerHTML = "";

  const fixos = [
    {tipo:"Patrulhamento", titulo:"Ronda preventiva concluída", veiculo:"Viatura", placa:"2CIA-01", cor:"Caracterizada", suspeito:"Não houve", prisao:"Não", data:"Registro anterior"},
    {tipo:"Treinamento", titulo:"Treinamento de abordagem realizado", veiculo:"Não informado", placa:"Não informado", cor:"Não informada", suspeito:"Não houve", prisao:"Não", data:"Registro anterior"}
  ];

  [...dados, ...fixos].forEach(b => {
    const item = document.createElement("div");
    item.className = "boletim-item";
    item.style.display = "block";
    item.innerHTML = `
      <strong style="color:var(--gold2)">${b.tipo} — ${b.titulo}</strong>
      <p style="margin-top:8px;color:var(--muted);line-height:1.5">
        Veículo: ${b.veiculo} | Placa: ${b.placa} | Cor: ${b.cor}<br>
        Suspeito/Condutor: ${b.suspeito} | Prisão realizada: ${b.prisao}<br>
        Data: ${b.data}
      </p>
    `;
    lista.appendChild(item);
  });
}

// Sistema de assumir barca
const barcasPadrao = ["BARCA 01", "BARCA 02", "BARCA 03", "BARCA 04", "ROCAM 01", "ROCAM 02", "COMANDO"];
function renderBarcas(){
  const grid = document.getElementById("barcaGrid");
  if(!grid) return;

  const logged = localStorage.getItem("pmrp_login") === "true";
  const role = localStorage.getItem("pmrp_role");
  const autorizado = logged && role === "2cia_autorizado";

  const aviso = document.getElementById("barcaPermissao");
  if(aviso){
    aviso.innerHTML = autorizado
      ? "✅ Você está logado e autorizado para assumir/liberar barcas."
      : "👀 Visitantes podem ver quem está em cada barca. Para assumir ou liberar, entre com Discord e tenha o cargo autorizado.";
  }

  const dados = JSON.parse(localStorage.getItem("barcas_pm") || "{}");
  grid.innerHTML = "";

  barcasPadrao.forEach(nomeBarca => {
    const b = dados[nomeBarca];
    const ocupada = b && b.nome;
    const card = document.createElement("div");
    card.className = "barca-card";
    card.innerHTML = `
      <span class="barca-status ${ocupada ? "ocupada" : "livre"}">${ocupada ? "OCUPADA" : "LIVRE"}</span>
      <h3>${nomeBarca}</h3>
      <p>${ocupada ? `Responsável: <b>${b.nome}</b><br>Viatura/Moto: ${b.veiculo}<br>Desde: ${b.hora}` : "Disponível para serviço."}</p>
      <br>
      ${autorizado 
        ? (ocupada ? `<button class="btn btn-outline" onclick="liberarBarca('${nomeBarca}')">Liberar barca</button>` : `<button class="btn btn-primary" onclick="assumirBarca('${nomeBarca}')">Assumir barca</button>`)
        : `<button class="btn btn-outline" onclick="alert('Você precisa estar logado com Discord e ter o cargo autorizado para assumir barca.')">Apenas autorizados</button>`
      }
    `;
    grid.appendChild(card);
  });

  carregarStats();
}

function assumirBarca(nomeBarca){
  const nome = prompt("Nome do responsável pela barca:");
  if(!nome) return;
  const veiculo = prompt("Informe a viatura/moto usada:");
  const dados = JSON.parse(localStorage.getItem("barcas_pm") || "{}");
  dados[nomeBarca] = {
    nome,
    veiculo: veiculo || "Não informado",
    hora: new Date().toLocaleString("pt-BR")
  };
  localStorage.setItem("barcas_pm", JSON.stringify(dados));
  renderBarcas();
  atualizarCategoriasPainel();
}

function liberarBarca(nomeBarca){
  const dados = JSON.parse(localStorage.getItem("barcas_pm") || "{}");
  delete dados[nomeBarca];
  localStorage.setItem("barcas_pm", JSON.stringify(dados));
  renderBarcas();
}

document.addEventListener("DOMContentLoaded", function(){
  carregarStats();
  renderBoletins();
  renderBarcas();
});


// Loader ao entrar em outra aba/página
function mostrarLoader(){
  const loader = document.getElementById("pageLoader");
  if(loader) loader.classList.add("show");
}
window.addEventListener("pageshow", () => {
  const loader = document.getElementById("pageLoader");
  if(loader) setTimeout(() => loader.classList.remove("show"), 250);
});
document.addEventListener("click", function(e){
  const link = e.target.closest("a");
  if(!link) return;
  const href = link.getAttribute("href") || "";
  if(href && !href.startsWith("#") && !href.startsWith("http") && !link.hasAttribute("download")){
    mostrarLoader();
  }
});


// ===== Sistema local de prisões, boletins e estatísticas =====
function isPmAutorizado(){
  return localStorage.getItem("pmrp_login") === "true" && localStorage.getItem("pmrp_role") === "2cia_autorizado";
}

function gerarBO(){
  const ano = new Date().getFullYear();
  const seq = Number(localStorage.getItem("bo_seq_pm") || "0") + 1;
  localStorage.setItem("bo_seq_pm", String(seq));
  return `BO-${ano}-${String(seq).padStart(5,"0")}`;
}

function getPrisoes(){
  return JSON.parse(localStorage.getItem("prisoes_pm") || "[]");
}
function setPrisoes(lista){
  localStorage.setItem("prisoes_pm", JSON.stringify(lista));
}
function getBoletins(){
  return JSON.parse(localStorage.getItem("boletins_pm") || "[]");
}
function setBoletins(lista){
  localStorage.setItem("boletins_pm", JSON.stringify(lista));
}

function carregarStats(){
  const membros = 28;
  const boletins = getBoletins().length;
  const prisoes = getPrisoes().length;
  const barcas = JSON.parse(localStorage.getItem("barcas_pm") || "{}");
  const emServico = Object.values(barcas).filter(v => v && v.nome).length;

  const set = (id, val) => {
    const el = document.getElementById(id);
    if(el) el.textContent = val;
  };
  set("statMembros", membros);
  set("statBoletins", boletins);
  set("statPrisoes", prisoes);
  set("statBarcas", emServico);
}

function preencherSelectPrisoes(){
  const select = document.getElementById("prisaoVinculada");
  if(!select) return;

  const prisoes = getPrisoes();
  select.innerHTML = `<option value="">Sem prisão vinculada</option>`;

  prisoes.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.bo;
    opt.textContent = `${p.bo} — ${p.nomePreso} (${p.motivo})`;
    select.appendChild(opt);
  });
}

function criarPrisao(e){
  e.preventDefault();

  if(!isPmAutorizado()){
    alert("Apenas membros com cargo autorizado da PM podem criar prisão.");
    return;
  }

  const prisao = {
    bo: gerarBO(),
    nomePreso: document.getElementById("nomePreso").value.trim(),
    idPreso: document.getElementById("idPreso").value.trim(),
    motivo: document.getElementById("motivoPrisao").value.trim(),
    pena: document.getElementById("penaPrisao").value.trim(),
    responsavel: document.getElementById("responsavelPrisao").value.trim(),
    veiculo: document.getElementById("veiculoPrisao").value.trim(),
    placa: document.getElementById("placaPrisao").value.trim(),
    observacoes: document.getElementById("obsPrisao").value.trim(),
    data: new Date().toLocaleString("pt-BR")
  };

  const lista = getPrisoes();
  lista.unshift(prisao);
  setPrisoes(lista);

  renderPrisoes();
  preencherSelectPrisoes();
  carregarStats();
  atualizarCategoriasPainel();
  irParaCategoria('prisao');
  e.target.reset();

  const box = document.getElementById("prisaoResult");
  if(box){
    box.className = "result ok";
    box.innerHTML = `✅ Prisão registrada com sucesso. Número do B.O.: <b>${prisao.bo}</b>`;
  }
}

function renderPrisoes(){
  const lista = document.getElementById("listaPrisoes");
  if(!lista) return;

  const busca = (document.getElementById("buscarPrisao")?.value || "").toLowerCase();
  let prisoes = getPrisoes();

  if(busca){
    prisoes = prisoes.filter(p => 
      p.bo.toLowerCase().includes(busca) ||
      p.nomePreso.toLowerCase().includes(busca) ||
      p.idPreso.toLowerCase().includes(busca) ||
      p.motivo.toLowerCase().includes(busca) ||
      p.responsavel.toLowerCase().includes(busca)
    );
  }

  lista.innerHTML = "";

  if(prisoes.length === 0){
    lista.innerHTML = `<div class="record-card"><h3>Nenhuma prisão encontrada</h3><p>Quando uma prisão for registrada por um membro autorizado, ela aparecerá aqui para todos visualizarem.</p></div>`;
    return;
  }

  prisoes.forEach(p => {
    const card = document.createElement("div");
    card.className = "record-card";
    card.innerHTML = `
      <span class="protocol">${p.bo}</span>
      <h3>${p.nomePreso} ${p.idPreso ? `— ID ${p.idPreso}` : ""}</h3>
      <p>
        <b>Motivo:</b> ${p.motivo}<br>
        <b>Pena:</b> ${p.pena || "Não informada"}<br>
        <b>Responsável:</b> ${p.responsavel || "Não informado"}<br>
        <b>Veículo:</b> ${p.veiculo || "Não informado"} | <b>Placa:</b> ${p.placa || "Não informada"}<br>
        <b>Data:</b> ${p.data}<br>
        <b>Observações:</b> ${p.observacoes || "Nenhuma"}
      </p>
    `;
    lista.appendChild(card);
  });
}

function criarBoletimCompleto(e){
  e.preventDefault();

  if(!isPmAutorizado()){
    alert("Apenas membros com cargo autorizado da PM podem criar boletins.");
    return;
  }

  const prisaoBO = document.getElementById("prisaoVinculada")?.value || "";
  const prisao = getPrisoes().find(p => p.bo === prisaoBO);

  const boletim = {
    bo: gerarBO(),
    tipo: document.getElementById("tipoBoletim")?.value || "Ocorrência",
    titulo: document.getElementById("tituloBoletim")?.value || "Sem título",
    veiculo: document.getElementById("veiculoBoletim")?.value || "Não informado",
    placa: document.getElementById("placaBoletim")?.value || "Não informado",
    cor: document.getElementById("corBoletim")?.value || "Não informada",
    suspeito: document.getElementById("suspeitoBoletim")?.value || "Não informado",
    prisaoVinculada: prisaoBO,
    prisaoNome: prisao ? prisao.nomePreso : "",
    descricao: document.getElementById("descricaoBoletim")?.value || "",
    data: new Date().toLocaleString("pt-BR")
  };

  const lista = getBoletins();
  lista.unshift(boletim);
  setBoletins(lista);

  renderBoletins();
  carregarStats();
  atualizarCategoriasPainel();
  irParaCategoria('boletim');
  e.target.reset();
  preencherSelectPrisoes();

  const box = document.getElementById("boletimResult");
  if(box){
    box.className = "result ok";
    box.innerHTML = `✅ Boletim criado com sucesso. Número do B.O.: <b>${boletim.bo}</b>`;
  }
}

function renderBoletins(){
  const lista = document.getElementById("listaBoletins");
  if(!lista) return;

  const dados = getBoletins();
  lista.innerHTML = "";

  if(dados.length === 0){
    lista.innerHTML = `<div class="record-card"><h3>Nenhum boletim registrado</h3><p>Boletins criados por membros autorizados aparecerão aqui.</p></div>`;
    return;
  }

  dados.forEach(b => {
    const item = document.createElement("div");
    item.className = "record-card";
    item.innerHTML = `
      <span class="protocol">${b.bo}</span>
      <h3>${b.tipo} — ${b.titulo}</h3>
      <p>
        <b>Veículo:</b> ${b.veiculo} | <b>Placa:</b> ${b.placa} | <b>Cor:</b> ${b.cor}<br>
        <b>Suspeito/Condutor:</b> ${b.suspeito}<br>
        <b>Prisão vinculada:</b> ${b.prisaoVinculada ? `${b.prisaoVinculada} — ${b.prisaoNome}` : "Nenhuma"}<br>
        <b>Data:</b> ${b.data}<br>
        <b>Descrição:</b> ${b.descricao || "Nenhuma"}
      </p>
    `;
    lista.appendChild(item);
  });
}

function atualizarPermissoesTela(){
  const autorizado = isPmAutorizado();

  document.querySelectorAll(".pm-only").forEach(el => {
    el.style.display = autorizado ? "" : "none";
  });

  document.querySelectorAll(".pm-locked").forEach(el => {
    el.style.display = autorizado ? "none" : "";
  });

  const status = document.getElementById("statusPermissao");
  if(status){
    status.innerHTML = autorizado
      ? "✅ Você está logado com cargo autorizado. Pode criar registros."
      : "👀 Todos podem visualizar. Para criar registros, entre com Discord e tenha o cargo autorizado da PM.";
  }
}

document.addEventListener("DOMContentLoaded", function(){
  atualizarPermissoesTela();
  preencherSelectPrisoes();
  renderPrisoes();
  renderBoletins();
  carregarStats();

  const busca = document.getElementById("buscarPrisao");
  if(busca) busca.addEventListener("input", renderPrisoes);
});


// Painel operacional
function abrirAbaPainel(id){
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
  const btn = document.querySelector(`[data-tab="${id}"]`);
  const content = document.getElementById(id);
  if(btn) btn.classList.add("active");
  if(content) content.classList.add("active");
  if(id === "aba-barca" && typeof renderBarcas === "function") renderBarcas();
  if(id === "aba-boletim" && typeof preencherSelectPrisoes === "function") preencherSelectPrisoes();
}
document.addEventListener("DOMContentLoaded", function(){
  if(document.querySelector(".panel-tabs")) abrirAbaPainel("aba-boletim");
});


// ===== Categorias automáticas no painel =====
function atualizarCategoriasPainel(){
  const boList = document.getElementById("painelBoletinsLista");
  const prisList = document.getElementById("painelPrisoesLista");
  const barcaList = document.getElementById("painelBarcasLista");

  const boletins = typeof getBoletins === "function" ? getBoletins() : JSON.parse(localStorage.getItem("boletins_pm") || "[]");
  const prisoes = typeof getPrisoes === "function" ? getPrisoes() : JSON.parse(localStorage.getItem("prisoes_pm") || "[]");
  const barcas = JSON.parse(localStorage.getItem("barcas_pm") || "{}");
  const barcasOcupadas = Object.entries(barcas).filter(([_,v]) => v && v.nome);

  const setCount = (id, n) => {
    const el = document.getElementById(id);
    if(el) el.textContent = n;
  };
  setCount("countBoletinsPainel", boletins.length);
  setCount("countPrisoesPainel", prisoes.length);
  setCount("countBarcasPainel", barcasOcupadas.length);

  if(boList){
    boList.innerHTML = boletins.length ? "" : `<div class="mini-record"><strong>Nenhum B.O.</strong><p>Quando criar um B.O., ele entra aqui automaticamente.</p></div>`;
    boletins.slice(0,6).forEach(b => {
      boList.innerHTML += `<div class="mini-record"><strong>${b.bo} — ${b.tipo}</strong><p>${b.titulo}<br>${b.prisaoVinculada ? "Prisão vinculada: " + b.prisaoVinculada : "Sem prisão vinculada"}</p></div>`;
    });
  }

  if(prisList){
    prisList.innerHTML = prisoes.length ? "" : `<div class="mini-record"><strong>Nenhuma prisão</strong><p>Quando criar uma prisão, ela entra aqui automaticamente.</p></div>`;
    prisoes.slice(0,6).forEach(p => {
      prisList.innerHTML += `<div class="mini-record"><strong>${p.bo} — ${p.nomePreso}</strong><p>Motivo: ${p.motivo}<br>Responsável: ${p.responsavel || "Não informado"}</p></div>`;
    });
  }

  if(barcaList){
    barcaList.innerHTML = barcasOcupadas.length ? "" : `<div class="mini-record"><strong>Nenhuma barca em serviço</strong><p>Quando assumir uma barca, ela entra aqui automaticamente.</p></div>`;
    barcasOcupadas.forEach(([nome,v]) => {
      barcaList.innerHTML += `<div class="mini-record"><strong>${nome}</strong><p>Responsável: ${v.nome}<br>Viatura/Moto: ${v.veiculo}</p></div>`;
    });
  }
}

function irParaCategoria(tipo){
  const mapa = {
    boletim: "painelBoletinsLista",
    prisao: "painelPrisoesLista",
    barca: "painelBarcasLista"
  };
  const el = document.getElementById(mapa[tipo]);
  if(el){
    el.scrollIntoView({behavior:"smooth", block:"center"});
    const col = el.closest(".category-column");
    if(col){
      col.style.boxShadow = "0 0 35px rgba(250,204,21,.35)";
      setTimeout(() => col.style.boxShadow = "", 1200);
    }
  }
}

document.addEventListener("DOMContentLoaded", function(){
  atualizarCategoriasPainel();
});
