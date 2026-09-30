const CHAVE = "gestaoAtividades";

let atividades = JSON.parse(localStorage.getItem(CHAVE)) || [
  {
    id: Date.now(),
    titulo: "Planejar o projeto",
    descricao: "Definir objetivos, funcionalidades e organização inicial.",
    prioridade: "Alta",
    status: "Concluído"
  },
  {
    id: Date.now() + 1,
    titulo: "Desenvolver interface",
    descricao: "Criar a estrutura visual e responsiva da aplicação.",
    prioridade: "Média",
    status: "Em andamento"
  },
  {
    id: Date.now() + 2,
    titulo: "Realizar testes",
    descricao: "Verificar as funcionalidades e corrigir possíveis problemas.",
    prioridade: "Alta",
    status: "Pendente"
  }
];

const lista = document.getElementById("listaAtividades");
const vazio = document.getElementById("vazio");
const modal = document.getElementById("modal");
const form = document.getElementById("formAtividade");

function salvarDados() {
  localStorage.setItem(CHAVE, JSON.stringify(atividades));
}

function atualizarResumo() {
  const total = atividades.length;
  const pendentes = atividades.filter(a => a.status === "Pendente").length;
  const andamento = atividades.filter(a => a.status === "Em andamento").length;
  const concluidas = atividades.filter(a => a.status === "Concluído").length;
  const percentual = total ? Math.round((concluidas / total) * 100) : 0;

  document.getElementById("total").textContent = total;
  document.getElementById("pendentes").textContent = pendentes;
  document.getElementById("andamento").textContent = andamento;
  document.getElementById("concluidas").textContent = concluidas;
  document.getElementById("percentual").textContent = `${percentual}%`;
  document.getElementById("barraProgresso").style.width = `${percentual}%`;
}

function classePrioridade(prioridade) {
  return prioridade.toLowerCase()
    .replace("é", "e");
}

function renderizar() {
  const busca = document.getElementById("busca").value.toLowerCase();
  const filtroStatus = document.getElementById("filtroStatus").value;
  const filtroPrioridade = document.getElementById("filtroPrioridade").value;

  const filtradas = atividades.filter(a => {
    const correspondeBusca =
      a.titulo.toLowerCase().includes(busca) ||
      a.descricao.toLowerCase().includes(busca);

    const correspondeStatus =
      filtroStatus === "todos" || a.status === filtroStatus;

    const correspondePrioridade =
      filtroPrioridade === "todas" || a.prioridade === filtroPrioridade;

    return correspondeBusca && correspondeStatus && correspondePrioridade;
  });

  lista.innerHTML = "";
  vazio.style.display = filtradas.length ? "none" : "block";

  filtradas.forEach(a => {
    const item = document.createElement("article");
    item.className = "atividade";

    item.innerHTML = `
      <div class="informacoes">
        <h3>${escaparHTML(a.titulo)}</h3>
        <p>${escaparHTML(a.descricao || "Sem descrição.")}</p>
        <div class="tags">
          <span class="tag ${classePrioridade(a.prioridade)}">${a.prioridade}</span>
          <span class="tag">${a.status}</span>
        </div>
      </div>
      <div class="acoes-item">
        <button class="btn btn-secundario" onclick="editarAtividade(${a.id})">Editar</button>
        <button class="btn btn-perigo" onclick="excluirAtividade(${a.id})">Excluir</button>
      </div>
    `;

    lista.appendChild(item);
  });

  atualizarResumo();
}

function escaparHTML(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

function abrirModal(atividade = null) {
  modal.classList.remove("escondido");

  document.getElementById("tituloModal").textContent =
    atividade ? "Editar atividade" : "Nova atividade";

  document.getElementById("idAtividade").value = atividade?.id || "";
  document.getElementById("titulo").value = atividade?.titulo || "";
  document.getElementById("descricao").value = atividade?.descricao || "";
  document.getElementById("prioridade").value = atividade?.prioridade || "Média";
  document.getElementById("status").value = atividade?.status || "Pendente";

  document.getElementById("titulo").focus();
}

function fecharModal() {
  modal.classList.add("escondido");
  form.reset();
  document.getElementById("idAtividade").value = "";
}

document.getElementById("btnNova").addEventListener("click", () => abrirModal());
document.getElementById("btnFechar").addEventListener("click", fecharModal);
document.getElementById("btnCancelar").addEventListener("click", fecharModal);

modal.addEventListener("click", event => {
  if (event.target === modal) fecharModal();
});

form.addEventListener("submit", event => {
  event.preventDefault();

  const id = document.getElementById("idAtividade").value;
  const dados = {
    id: id ? Number(id) : Date.now(),
    titulo: document.getElementById("titulo").value.trim(),
    descricao: document.getElementById("descricao").value.trim(),
    prioridade: document.getElementById("prioridade").value,
    status: document.getElementById("status").value
  };

  if (id) {
    const indice = atividades.findIndex(a => a.id === Number(id));
    atividades[indice] = dados;
  } else {
    atividades.push(dados);
  }

  salvarDados();
  fecharModal();
  renderizar();
});

window.editarAtividade = function(id) {
  const atividade = atividades.find(a => a.id === id);
  if (atividade) abrirModal(atividade);
};

window.excluirAtividade = function(id) {
  const atividade = atividades.find(a => a.id === id);
  if (!atividade) return;

  if (confirm(`Excluir "${atividade.titulo}"?`)) {
    atividades = atividades.filter(a => a.id !== id);
    salvarDados();
    renderizar();
  }
};

document.getElementById("busca").addEventListener("input", renderizar);
document.getElementById("filtroStatus").addEventListener("change", renderizar);
document.getElementById("filtroPrioridade").addEventListener("change", renderizar);

salvarDados();
renderizar();
