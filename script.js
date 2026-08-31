const SUPABASE_URL = 'https://lzwdqkvajhblbzsibgye.supabase.co';
const SUPABASE_KEY = 'sb_publishable_fCMzXffpGLX3aICD78zlWA_Nl6nj14q';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let isTeacher = false;

// Monitora se o professor está logado
supabaseClient.auth.onAuthStateChange((event, session) => {
  isTeacher = !!session;
  
  const teacherPanel = document.getElementById('teacher-panel');
  const btnLogout = document.getElementById('btn-logout');
  const btnLoginToggle = document.getElementById('btn-login-toggle');
  const loginModal = document.getElementById('login-modal');

  if (teacherPanel) teacherPanel.classList.toggle('hidden', !isTeacher);
  if (btnLogout) btnLogout.classList.toggle('hidden', !isTeacher);
  if (btnLoginToggle) btnLoginToggle.classList.toggle('hidden', isTeacher);
  if (loginModal) loginModal.classList.add('hidden');

  loadTasks();
});

async function handleLogin() {
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const errorEl = document.getElementById('login-error');

  if (!emailInput || !passwordInput) return;

  const { error } = await supabaseClient.auth.signInWithPassword({
    email: emailInput.value,
    password: passwordInput.value
  });

  if (error && errorEl) {
    errorEl.innerText = "Dados inválidos.";
  }
}

async function handleLogout() {
  await supabaseClient.auth.signOut();
}

function toggleLoginModal() {
  const loginModal = document.getElementById('login-modal');
  if (loginModal) loginModal.classList.toggle('hidden');
}

async function loadTasks() {
  const { data: tasks, error } = await supabaseClient.from('tasks').select('*');
  
  if (error) {
    console.error("Erro ao carregar tarefas:", error);
    return;
  }

  document.querySelectorAll('.cards').forEach(el => el.innerHTML = '');

  (tasks || []).forEach(task => {
    const card = document.createElement('div');
    card.className = 'card';
    
    let actionsHTML = '';
    if (isTeacher) {
      actionsHTML = `
        <div class="card-actions">
          ${task.status !== 'todo' ? `<button onclick="moveTask('${task.id}', 'todo')">← A Fazer</button>` : ''}
          ${task.status !== 'in_progress' ? `<button onclick="moveTask('${task.id}', 'in_progress')">Em Progresso</button>` : ''}
          ${task.status !== 'done' ? `<button onclick="moveTask('${task.id}', 'done')">Concluído →</button>` : ''}
          <button onclick="deleteTask('${task.id}')" style="color:red;">X</button>
        </div>
      `;
    }

    const comentarioHTML = task.comentario 
      ? `<p class="card-comment" style="margin-top: 6px; font-size: 0.85rem; color: #475569;">💬 ${task.comentario}</p>` 
      : '';

    card.innerHTML = `
      <strong>${task.title}</strong><br>
      <small style="color: #64748b;">Aluno: ${task.student_name}</small>
      ${comentarioHTML}
      ${actionsHTML}
    `;

    const column = document.querySelector(`#${task.status} .cards`);
    if (column) {
      column.appendChild(card);
    }
  });
}

async function createTask() {
  const titleInput = document.getElementById('task-title');
  const studentInput = document.getElementById('student-name');
  const comentarioInput = document.getElementById('comentario');

  if (!titleInput || !studentInput) {
    alert("Erro: Elementos do formulário não foram encontrados no HTML.");
    return;
  }

  const title = titleInput.value.trim();
  const student = studentInput.value.trim();
  const comentario = comentarioInput ? comentarioInput.value.trim() : '';

  if (!title || !student) {
    alert("Preencha pelo menos o título e o nome do aluno!");
    return;
  }

  const { error } = await supabaseClient.from('tasks').insert([
    { 
      title: title, 
      student_name: student, 
      comentario: comentario, 
      status: 'todo' 
    }
  ]);

  if (error) {
    console.error("Erro no Supabase:", error);
    alert("Erro ao salvar no banco: " + error.message);
  } else {
    titleInput.value = '';
    studentInput.value = '';
    if (comentarioInput) comentarioInput.value = '';
    loadTasks();
  }
}

async function moveTask(id, newStatus) {
  await supabaseClient.from('tasks').update({ status: newStatus }).eq('id', id);
  loadTasks();
}

async function deleteTask(id) {
  if (confirm("Deseja excluir este projeto?")) {
    await supabaseClient.from('tasks').delete().eq('id', id);
    loadTasks();
  }
}

// Carregamento inicial público
loadTasks();
