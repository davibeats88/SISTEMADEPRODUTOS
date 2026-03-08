document.addEventListener("DOMContentLoaded", function () {
  const formProduto = document.getElementById("formProduto");
  const nomeInput = document.getElementById("nome");
  const precoInput = document.getElementById("preco");
  const quantidadeInput = document.getElementById("quantidade");
  const categoriaInput = document.getElementById("categoria");
  const buscaInput = document.getElementById("busca");
  const tabelaProdutos = document.getElementById("tabelaProdutos");
  const tabelaHistoricoVendas = document.getElementById("tabelaHistoricoVendas");
  const comprovanteVenda = document.getElementById("comprovanteVenda");
  const totalVendasBadge = document.getElementById("totalVendasBadge");
  const botaoSalvar = formProduto ? formProduto.querySelector("button[type='submit']") : null;

  let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
  let historicoVendas = JSON.parse(localStorage.getItem("historicoVendas")) || [];
  let ultimaVenda = JSON.parse(localStorage.getItem("ultimaVenda")) || null;
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

  function salvarHistoricoVendas() {
    localStorage.setItem("historicoVendas", JSON.stringify(historicoVendas));
  }

  function salvarUltimaVenda() {
    localStorage.setItem("ultimaVenda", JSON.stringify(ultimaVenda));
  }

  function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  function formatarData(dataIso) {
    const data = new Date(dataIso);

    return data.toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short"
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

  function aplicarTemaSalvo() {
    const tema = localStorage.getItem("temaLoja") || "escuro";
    const body = document.body;
    const iconeTema = document.getElementById("iconeTema");
    const textoTema = document.getElementById("textoTema");

    if (tema === "claro") {
      body.classList.add("tema-claro");
      if (iconeTema) iconeTema.className = "bi bi-sun";
      if (textoTema) textoTema.textContent = "Modo claro";
    } else {
      body.classList.remove("tema-claro");
      if (iconeTema) iconeTema.className = "bi bi-moon-stars";
      if (textoTema) textoTema.textContent = "Modo escuro";
    }
  }

  function alternarTema() {
    const body = document.body;
    const estaClaro = body.classList.contains("tema-claro");

    if (estaClaro) {
      body.classList.remove("tema-claro");
      localStorage.setItem("temaLoja", "escuro");
    } else {
      body.classList.add("tema-claro");
      localStorage.setItem("temaLoja", "claro");
    }

    aplicarTemaSalvo();
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

    const totalVendas = historicoVendas.length;

    const totalProdutosInfo = document.getElementById("totalProdutosInfo");
    const totalEstoqueInfo = document.getElementById("totalEstoqueInfo");
    const totalCadastradosBadge = document.getElementById("totalCadastradosBadge");

    if (totalProdutosInfo) totalProdutosInfo.textContent = `${totalProdutos} produtos`;
    if (totalEstoqueInfo) totalEstoqueInfo.textContent = `${totalItens} itens`;
    if (totalCadastradosBadge) totalCadastradosBadge.textContent = `Total cadastrados: ${totalProdutos}`;
    if (totalVendasBadge) totalVendasBadge.textContent = `Total de vendas: ${totalVendas}`;
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

  function atualizarHistoricoVendas() {
    if (!tabelaHistoricoVendas) return;

    tabelaHistoricoVendas.innerHTML = "";

    if (historicoVendas.length === 0) {
      tabelaHistoricoVendas.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-muted">Nenhuma venda registrada.</td>
        </tr>
      `;
      atualizarContadores();
      return;
    }

    const vendasOrdenadas = [...historicoVendas].reverse();

    vendasOrdenadas.forEach((venda, index) => {
      const indiceOriginal = historicoVendas.length - 1 - index;

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${formatarData(venda.data)}</td>
        <td><strong>${venda.produto}</strong></td>
        <td>${venda.quantidade}</td>
        <td>${formatarMoeda(venda.total)}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary" data-comprovante="${indiceOriginal}" title="Ver comprovante">
            <i class="bi bi-receipt"></i>
          </button>
        </td>
      `;

      tabelaHistoricoVendas.appendChild(tr);
    });

    atualizarContadores();
  }

  function atualizarComprovante(venda) {
    if (!comprovanteVenda) return;

    if (!venda) {
      comprovanteVenda.innerHTML = `
<div class="cupom-titulo">CUPOM DE VENDA</div>
--------------------------------
Loja: Loja principal
Cliente: Não informado
Produto: --
Categoria: --
Qtd: --
Unitário: R$ 0,00
Total: R$ 0,00
Data: --
--------------------------------
Obrigado pela preferência
      `;
      return;
    }

    comprovanteVenda.innerHTML = `
<div class="cupom-titulo">CUPOM DE VENDA</div>
--------------------------------
Loja: Loja principal
Cliente: ${venda.cliente || "Não informado"}
Produto: ${venda.produto}
Categoria: ${venda.categoria}
Qtd: ${venda.quantidade}
Unitário: ${formatarMoeda(venda.valorUnitario)}
Total: ${formatarMoeda(venda.total)}
Data: ${formatarData(venda.data)}
--------------------------------
Obrigado pela preferência
    `;
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

    if (!Number.isInteger(quantidadeVenda)) {
      mostrarToast("Digite uma quantidade inteira.", "warning");
      return;
    }

    if (quantidadeVenda > Number(produto.quantidade)) {
      mostrarToast("Estoque insuficiente para essa venda.", "danger");
      return;
    }

    const clienteInformado = prompt("Nome do cliente (opcional):");
    if (clienteInformado === null) return;

    const cliente = clienteInformado.trim() || "Não informado";
    const totalVenda = Number(produto.preco) * quantidadeVenda;

    const confirmar = confirm(
      `Confirmar venda?\n\nProduto: ${produto.nome}\nQuantidade: ${quantidadeVenda}\nTotal: ${formatarMoeda(totalVenda)}`
    );

    if (!confirmar) return;

    produto.quantidade = Number(produto.quantidade) - quantidadeVenda;

    const venda = {
      produto: produto.nome,
      categoria: produto.categoria,
      quantidade: quantidadeVenda,
      valorUnitario: Number(produto.preco),
      total: totalVenda,
      cliente: cliente,
      data: new Date().toISOString()
    };

    historicoVendas.push(venda);
    ultimaVenda = venda;

    salvarProdutos();
    salvarHistoricoVendas();
    salvarUltimaVenda();

    atualizarTabela();
    atualizarHistoricoVendas();
    atualizarComprovante(ultimaVenda);

    mostrarToast("Venda registrada com sucesso.", "success");
  }

  function mostrarComprovantePorIndice(index) {
    const venda = historicoVendas[index];
    if (!venda) return;

    ultimaVenda = venda;
    salvarUltimaVenda();
    atualizarComprovante(venda);
    mostrarToast("Comprovante carregado.", "info");
  }

  function imprimirComprovante() {
    if (!ultimaVenda) {
      mostrarToast("Nenhum comprovante disponível para impressão.", "warning");
      return;
    }

    const janela = window.open("", "_blank");

    if (!janela) {
      mostrarToast("Não foi possível abrir a janela de impressão.", "danger");
      return;
    }

    janela.document.write(`
      <html>
        <head>
          <title>Cupom de Venda</title>
          <style>
            body {
              font-family: "Courier New", monospace;
              padding: 24px;
              color: #000;
              background: #fff;
            }

            .cupom {
              max-width: 320px;
              margin: 0 auto;
              font-size: 14px;
              line-height: 1.6;
              white-space: pre-line;
            }

            .titulo {
              text-align: center;
              font-weight: bold;
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="cupom">
<div class="titulo">CUPOM DE VENDA</div>
--------------------------------
Loja: Loja principal
Cliente: ${ultimaVenda.cliente || "Não informado"}
Produto: ${ultimaVenda.produto}
Categoria: ${ultimaVenda.categoria}
Qtd: ${ultimaVenda.quantidade}
Unitário: ${formatarMoeda(ultimaVenda.valorUnitario)}
Total: ${formatarMoeda(ultimaVenda.total)}
Data: ${formatarData(ultimaVenda.data)}
--------------------------------
Obrigado pela preferência
          </div>
        </body>
      </html>
    `);

    janela.document.close();
    janela.focus();
    janela.print();
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

  if (tabelaHistoricoVendas) {
    tabelaHistoricoVendas.addEventListener("click", function (e) {
      const botaoComprovante = e.target.closest("[data-comprovante]");

      if (botaoComprovante) {
        mostrarComprovantePorIndice(Number(botaoComprovante.getAttribute("data-comprovante")));
      }
    });
  }

  window.logout = logout;
  window.imprimirComprovante = imprimirComprovante;
  window.alternarTema = alternarTema;

  aplicarTemaSalvo();
  atualizarTabela();
  atualizarHistoricoVendas();
  atualizarComprovante(ultimaVenda);
  atualizarContadores();
});