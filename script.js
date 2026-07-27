// Vetor (Array) para armazenar a lista de tarefas
const listaDeTarefas = [];

// Elementos da página
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');

// Função para atualizar o HTML a partir do vetor
function renderizarTarefas() {
    taskList.innerHTML = '';

    listaDeTarefas.forEach((tarefa, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${tarefa}</span>
            <button class="delete-btn" onclick="removerTarefa(${index})">Feito</button>
        `;
        taskList.appendChild(li);
    });
}

// Função para salvar a tarefa no vetor
function salvarTarefa() {
    const textoTarefa = taskInput.value.trim();

    if (textoTarefa !== '') {
        listaDeTarefas.push(textoTarefa); // Salva no vetor
        taskInput.value = '';             // Limpa o campo de texto
        renderizarTarefas();              // Atualiza a tela
    }
}

// Função para remover uma tarefa do vetor
function removerTarefa(index) {
    listaDeTarefas.splice(index, 1);     // Remove do vetor pelo índice
    renderizarTarefas();                 // Atualiza a tela
}

// Evento ao clicar no botão "Salvar"
addBtn.addEventListener('click', salvarTarefa);

// Evento para salvar apertando a tecla "Enter"
taskInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        salvarTarefa();
    }
});