let produtos = JSON.parse(localStorage.getItem("produtos")) || []

function salvar(){

localStorage.setItem("produtos", JSON.stringify(produtos))

}

function atualizarTabela(){

let tabela = document.getElementById("tabelaProdutos")

tabela.innerHTML = ""

produtos.forEach((produto,index)=>{

let linha = `

<tr>

<td>${produto.nome}</td>

<td>R$ ${produto.preco}</td>

<td>${produto.quantidade}</td>

<td>${produto.categoria}</td>

<td>

<button class="btn btn-success btn-sm" onclick="vender(${index})">
<i class="bi bi-cash"></i>
</button>

<button class="btn btn-danger btn-sm" onclick="excluir(${index})">
<i class="bi bi-trash"></i>
</button>

</td>

</tr>

`

tabela.innerHTML += linha

})

}

document.getElementById("formProduto").addEventListener("submit",function(e){

e.preventDefault()

let nome = document.getElementById("nome").value

let preco = document.getElementById("preco").value

let quantidade = document.getElementById("quantidade").value

let categoria = document.getElementById("categoria").value

produtos.push({nome,preco,quantidade,categoria})

salvar()

atualizarTabela()

this.reset()

})

function excluir(index){

produtos.splice(index,1)

salvar()

atualizarTabela()

}

function vender(index){

if(produtos[index].quantidade > 0){

produtos[index].quantidade--

alert("Venda registrada!")

}else{

alert("Produto sem estoque!")

}

salvar()

atualizarTabela()

}

atualizarTabela()