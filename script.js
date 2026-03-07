document.addEventListener("DOMContentLoaded", function () {
  const formProduto = document.getElementById("formProduto");
  const nomeInput = document.getElementById("nome");
  const precoInput = document.getElementById("preco");
  const quantidadeInput = document.getElementById("quantidade");
  const categoriaInput = document.getElementById("categoria");
  const buscaInput = document.getElementById("busca");
  const tabelaProdutos = document.getElementById("tabelaProdutos");
  const botaoSalvar = formProduto ? formProduto.querySelector("button[type='submit']") : null;

  let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
  let editandoIndex = null;

  const paginaAtual = window.location.pathname.split("/").pop();
  if (paginaAtual === "index.html" || paginaAtual === "") {
    const logado = localStorage.getItem("logado");
    if (logado !== "true") {
      window.location = "login.html";
      return;
    }
  }

  function salvarProdutos() {
    localStorage.setItem("produtos", JSON.stringify(produtos));
  }

  function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  function criarContainerToast() {
    let container = document.getElementById("toastContainer");

    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "toast-container position-fixed top-0 end-0 p-3";
      container.style.zIndex = "9999";
      document.body.appendChild(container);
    }

    return container;
  }

  function mostrarToast(mensagem, tipo = "success") {
    if (typeof bootstrap === "undefined") {
      alert(mensagem);
      return;
    }

    const container = criarContainerToast();

    const classes = {
      success: "text-bg-success",
      danger: "text-bg-danger",
      warning: "text-bg-warning",
      info: "text-bg-primary"
    };

    const icones = {
      success: "bi-check-circle-fill",
      danger: "bi-x-circle-fill",
      warning: "bi-exclamation-triangle-fill",
      info: "bi-info-circle-fill"
    };

    const toast = document.createElement("div");
    toast.className = `toast align-items-center border-0 ${classes[tipo] || "text-bg-primary"}`;
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.setAttribute("aria-atomic", "true");

    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          <i class="bi ${icones[tipo] || "bi-info-circle-fill"} me-2"></i>
          ${mensagem}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Fechar"></button>
      </div>
    `;

    container.appendChild(toast);

    const bsToast = new bootstrap.Toast(toast, {
      delay: 2500
    });

    bsToast.show();

    toast.addEventListener("hidden.bs.toast", function () {
      toast.remove();
    });
  }

  function limparFormulario() {
    if (!formProduto) return;

    formProduto.reset();
    categoriaInput.value = "Celulares";
    editandoIndex = null;

    if (botaoSalvar) {
      botaoSalvar.innerHTML = `<i class="bi bi-save"></i> Salvar Produto`;
    }
  }

  function atualizarContadores() {
    const totalProdutos = produtos.length;
    const totalItens = produtos.reduce((total, produto) => {
      return total + Number(produto.quantidade || 0);
    }, 0);

    const miniCards = document.querySelectorAll(".mini-card strong");

    if (miniCards[0]) miniCards[0].textContent = `${totalProdutos} produtos`;
    if (miniCards[1]) miniCards[1].textContent = `${totalItens} itens`;
    if (miniCards[2]) miniCards[2].textContent = `Loja principal`;

    const badge = document.querySelector(".badge-soft");
    if (badge) {
      badge.textContent = `Total cadastrados: ${totalProdutos}`;
    }
  }

  function atualizarTabela() {
    if (!tabelaProdutos) return;

    const termo = buscaInput ? buscaInput.value.toLowerCase().trim() : "";

    tabelaProdutos.innerHTML = "";

    const produtosFiltrados = produtos
      .map((produto, index) => ({ ...produto, indexOriginal: index }))
      .filter((produto) => {
        return (
          produto.nome.toLowerCase().includes(termo) ||
          produto.categoria.toLowerCase().includes(termo)
        );
      });

    if (produtosFiltrados.length === 0) {
      tabelaProdutos.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-4 text-light">
            <i class="bi bi-inbox fs-4 d-block mb-2"></i>
            Nenhum produto encontrado.
          </td>
        </tr>
      `;
      atualizarContadores();
      return;
    }

    produtosFiltrados.forEach((produto) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td><strong>${produto.nome}</strong></td>
        <td>${formatarMoeda(produto.preco)}</td>
        <td>${produto.quantidade}</td>
        <td><span class="categoria-badge">${produto.categoria}</span></td>
        <td>
          <div class="d-flex gap-2 flex-wrap justify-content-center">
            <button class="btn btn-sm btn-success" data-vender="${produto.indexOriginal}" title="Vender">
              <i class="bi bi-cart-check"></i>
            </button>

            <button class="btn btn-sm btn-warning" data-editar="${produto.indexOriginal}" title="Editar">
              <i class="bi bi-pencil-square"></i>
            </button>

            <button class="btn btn-sm btn-danger" data-excluir="${produto.indexOriginal}" title="Excluir">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      `;

      tabelaProdutos.appendChild(tr);
    });

    atualizarContadores();
  }

  function editarProduto(index) {
    const produto = produtos[index];
    if (!produto) return;

    nomeInput.value = produto.nome;
    precoInput.value = produto.preco;
    quantidadeInput.value = produto.quantidade;
    categoriaInput.value = produto.categoria;

    editandoIndex = index;

    if (botaoSalvar) {
      botaoSalvar.innerHTML = `<i class="bi bi-pencil-square"></i> Atualizar Produto`;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    mostrarToast("Modo de edição ativado.", "info");
  }

  function excluirProduto(index) {
    const produto = produtos[index];
    if (!produto) return;

    const confirmar = confirm(`Deseja excluir o produto "${produto.nome}"?`);
    if (!confirmar) return;

    produtos.splice(index, 1);

    if (editandoIndex === index) {
      limparFormulario();
    } else if (editandoIndex !== null && editandoIndex > index) {
      editandoIndex--;
    }

    salvarProdutos();
    atualizarTabela();
    mostrarToast("Produto excluído com sucesso.", "danger");
  }

  function venderProduto(index) {
    const produto = produtos[index];
    if (!produto) return;

    if (Number(produto.quantidade) <= 0) {
      mostrarToast("Produto sem estoque.", "warning");
      return;
    }

    const qtd = prompt(`Quantidade para vender de "${produto.nome}":`);

    if (qtd === null) return;

    const quantidadeVenda = Number(qtd);

    if (isNaN(quantidadeVenda) || quantidadeVenda <= 0) {
      mostrarToast("Quantidade inválida.", "warning");
      return;
    }

    if (quantidadeVenda > Number(produto.quantidade)) {
      mostrarToast("Estoque insuficiente para essa venda.", "danger");
      return;
    }

    produto.quantidade = Number(produto.quantidade) - quantidadeVenda;

    salvarProdutos();
    atualizarTabela();
    mostrarToast("Venda registrada com sucesso.", "success");
  }

  function logout() {
    localStorage.removeItem("logado");
    window.location = "login.html";
  }

  if (formProduto) {
    formProduto.addEventListener("submit", function (e) {
      e.preventDefault();

      const nome = nomeInput.value.trim();
      const preco = precoInput.value.trim();
      const quantidade = quantidadeInput.value.trim();
      const categoria = categoriaInput.value;

      if (!nome || !preco || !quantidade || !categoria) {
        mostrarToast("Preencha todos os campos.", "warning");
        return;
      }

      if (Number(preco) <= 0) {
        mostrarToast("O preço deve ser maior que zero.", "warning");
        return;
      }

      if (Number(quantidade) < 0) {
        mostrarToast("A quantidade não pode ser negativa.", "warning");
        return;
      }

      const produto = {
        nome: nome,
        preco: Number(preco),
        quantidade: Number(quantidade),
        categoria: categoria
      };

      if (editandoIndex === null) {
        produtos.push(produto);
        mostrarToast("Produto cadastrado com sucesso.", "success");
      } else {
        produtos[editandoIndex] = produto;
        mostrarToast("Produto atualizado com sucesso.", "info");
      }

      salvarProdutos();
      atualizarTabela();
      limparFormulario();
    });
  }

  if (buscaInput) {
    buscaInput.addEventListener("input", atualizarTabela);
  }

  if (tabelaProdutos) {
    tabelaProdutos.addEventListener("click", function (e) {
      const botaoVender = e.target.closest("[data-vender]");
      const botaoEditar = e.target.closest("[data-editar]");
      const botaoExcluir = e.target.closest("[data-excluir]");

      if (botaoVender) {
        venderProduto(Number(botaoVender.getAttribute("data-vender")));
      }

      if (botaoEditar) {
        editarProduto(Number(botaoEditar.getAttribute("data-editar")));
      }

      if (botaoExcluir) {
        excluirProduto(Number(botaoExcluir.getAttribute("data-excluir")));
      }
    });
  }

  window.logout = logout;

  atualizarTabela();
  atualizarContadores();
});