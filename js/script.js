let slideIndex = 0;
const slides = document.querySelectorAll(".slide");
const API_URL = "https://backend-mariaclara.onrender.com/avaliacoes";

let paginaAtual = 1;
const limitePorPagina = 3;
let todasAvaliacoes = [];

function showSlides() {
  slides.forEach((slide) => slide.classList.remove("active"));
  slideIndex++;
  if (slideIndex > slides.length) slideIndex = 1;
  slides[slideIndex - 1].classList.add("active");
  setTimeout(showSlides, 3000);
}

function listItems(items, paginaAtual, limitePorPagina) {
  const result = [];
  const totalPaginas = Math.ceil(items.length / limitePorPagina);
  const count = paginaAtual * limitePorPagina - limitePorPagina;
  const delimiter = count + limitePorPagina;

  if (paginaAtual <= totalPaginas) {
    for (let i = count; i < delimiter; i++) {
      if (items[i] != null) {
        result.push(items[i]);
      }
    }
  }

  return result;
}

function renderizarPagina() {
  const cardsContainer = document.getElementById("reviewCards");
  const paginaInfo = document.getElementById("paginaAtual");
  const paginacao = document.querySelector(".pagination");

  const totalPaginas = Math.ceil(todasAvaliacoes.length / limitePorPagina);
  const dadosPagina = listItems(todasAvaliacoes, paginaAtual, limitePorPagina);

  cardsContainer.innerHTML = "";

  if (dadosPagina.length === 0) {
    document.getElementById("semAvaliacoes").style.display = "block";
    paginacao.style.display = "none";
    return;
  }

  document.getElementById("semAvaliacoes").style.display = "none";
  paginacao.style.display = totalPaginas > 1 ? "block" : "none";

  dadosPagina.forEach(({ nome, mensagem }) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `<p>"${mensagem}"</p><span>— ${nome}</span>`;
    cardsContainer.appendChild(card);
  });

  paginaInfo.innerText = `Página ${paginaAtual} de ${totalPaginas}`;
  document.getElementById("prevBtn").disabled = paginaAtual === 1;
  document.getElementById("nextBtn").disabled = paginaAtual === totalPaginas;
}

function mudarPagina(delta) {
  const totalPaginas = Math.ceil(todasAvaliacoes.length / limitePorPagina);
  const novaPagina = paginaAtual + delta;
  if (novaPagina >= 1 && novaPagina <= totalPaginas) {
    paginaAtual = novaPagina;
    renderizarPagina();
  }
}

function carregarTodasAvaliacoes() {
  fetch(API_URL)
    .then((res) => res.json())
    .then((res) => {
      const data = Array.isArray(res) ? res : res.data || res;
      todasAvaliacoes = data;
      renderizarPagina();
    })
    .catch(() => {
      console.error("Erro ao carregar avaliações do backend.");
    });
}

document.addEventListener("DOMContentLoaded", () => {
  showSlides();
  carregarTodasAvaliacoes();

  const openBtn = document.querySelector(".open-modal-btn");
  const closeBtn = document.querySelector(".close-modal-btn");
  const modal = document.getElementById("reviewModal");
  const form = document.getElementById("reviewForm");

  openBtn.addEventListener("click", () => {
    modal.style.display = "flex";
  });

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = form.nome.value.trim();
    const mensagem = form.avaliacao.value.trim();

    if (!nome || !messagem) return;

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, mensagem }),
    })
      .then((res) => {
        if (res.ok) {
          form.reset();
          modal.style.display = "none";
          carregarTodasAvaliacoes();
        } else {
          alert("Erro ao enviar avaliação.");
        }
      })
      .catch(() => alert("Erro de conexão com o servidor."));
  });
});

// Animação de carregamento da página
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

// Fade-in das seções ao rolar
const sections = document.querySelectorAll(".fade-in-section");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.1 }
);

sections.forEach((section) => observer.observe(section));
