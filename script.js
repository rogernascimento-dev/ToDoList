const SUPABASE_URL = 'https://lzwdqkvajhblbzsibgye.supabase.co';
const SUPABASE_KEY = 'sb_publishable_fCMzXffpGLX3aICD78zlWA_Nl6nj14q';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let isTeacher = false;

// Monitora se o professor está logado
supabaseClient.auth.onAuthStateChange((event, session) => {
  isTeacher = !!session;
  document.getElementById('teacher-panel').classList.toggle('hidden', !isTeacher);
  document.getElementById('btn-logout').classList.toggle('hidden', !isTeacher);
  document.getElementById('btn-login-toggle').classList.toggle('hidden', isTeacher);
  document.getElementById('login-modal').classList.add('hidden');
  loadTasks();
});

async function handleLogin() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) document.getElementById('login-error').innerText = "Dados inválidos.";
}

async function handleLogout() {
  await supabaseClient.auth.signOut();
}

function toggleLoginModal() {
  document.getElementById('login-modal').classList.toggle('hidden');
}

async function loadTasks() {
  const { data: tasks, error } = await supabaseClient.from('tasks').select('*');
  if (error) return console.error(error);

  document.querySelectorAll('.cards').forEach(el => el.innerHTML = '');

  tasks.forEach(task => {
    const card = document.createElement('div');
    card.className = 'card';
    
    let actionsHTML = '';
    // Mostra botões de mover e excluir apenas para o professor
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

    // Exibe o comentário apenas se ele existir
    const comentarioHTML = task.comentario 
      ? `<p class="card-comment" style="margin-top: 6px; font-size: 0.85rem; color: #475569;">💬 ${task.comentario}</p>` 
      : '';

    card.innerHTML = `
      <strong>${task.title}</strong><br>
      <small style="color: #64748b;">Aluno: ${task.student_name}</small>
      ${comentarioHTML}
      ${actionsHTML}
    `;

    document.querySelector(`#${task.status} .cards`).appendChild(card);
  });
}

async function createTask() {
  const title = document.getElementById('task-title').value.trim();
  const student = document.getElementById('student-name').value.trim();
  const comentario = document.getElementById('comentario').value.trim();
  
  if (!title || !student) return;

  // Inclui 'comentario' no insert do Supabase
  const { error } = await supabaseClient.from('tasks').insert([
    { 
      title, 
      student_name: student, 
      comentario, 
      status: 'todo' 
    }
  ]);

  if (!error) {
    document.getElementById('task-title').value = '';
    document.getElementById('student-name').value = '';
    document.getElementById('comentario').value = '';
    loadTasks();
  } else {
    console.error("Erro ao criar tarefa:", error);
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
