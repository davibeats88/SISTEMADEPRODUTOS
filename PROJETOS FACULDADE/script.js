let produtos = JSON.parse(localStorage.getItem("produtos")) || []
let editando = null

function salvarLocal(){
localStorage.setItem("produtos", JSON.stringify(produtos))
}

function corCategoria(cat){

if(cat=="Eletrônicos") return "bg-primary"
if(cat=="Alimentos") return "bg-success"
if(cat=="Roupas") return "bg-warning"

return "bg-secondary"

}

function atualizarTabela(lista = produtos){

let tabela = document.getElementById("tabelaProdutos")
tabela.innerHTML=""

lista.forEach((produto,index)=>{

let linha = `
<tr>
<td>${index+1}</td>
<td>${produto.nome}</td>
<td>R$ ${produto.preco}</td>
<td>${produto.quantidade}</td>

<td>
<span class="badge ${corCategoria(produto.categoria)}">
${produto.categoria}
</span>
</td>

<td>

<button class="btn btn-warning btn-sm" onclick="editar(${index})">
<i class="bi bi-pencil"></i>
</button>

<button class="btn btn-danger btn-sm" onclick="excluir(${index})">
<i class="bi bi-trash"></i>
</button>

</td>

</tr>
`

tabela.innerHTML += linha

})

document.getElementById("contador").innerText = produtos.length

}

document.getElementById("formProduto").addEventListener("submit",function(e){

e.preventDefault()

let nome = document.getElementById("nome").value
let preco = document.getElementById("preco").value
let quantidade = document.getElementById("quantidade").value
let categoria = document.getElementById("categoria").value

let produto = {nome,preco,quantidade,categoria}

if(editando !== null){

produtos[editando] = produto
editando = null

}else{

produtos.push(produto)

}

salvarLocal()
atualizarTabela()

this.reset()

})

function excluir(index){

produtos.splice(index,1)

salvarLocal()
atualizarTabela()

}

function editar(index){

let produto = produtos[index]

document.getElementById("nome").value = produto.nome
document.getElementById("preco").value = produto.preco
document.getElementById("quantidade").value = produto.quantidade
document.getElementById("categoria").value = produto.categoria

editando = index

}

document.getElementById("pesquisa").addEventListener("keyup",function(){

let termo = this.value.toLowerCase()

let filtrados = produtos.filter(p =>
p.nome.toLowerCase().includes(termo)
)

atualizarTabela(filtrados)

})

document.querySelector(".botao-flutuante").addEventListener("click",function(){

window.scrollTo({
top:0,
behavior:"smooth"
})

})

atualizarTabela()