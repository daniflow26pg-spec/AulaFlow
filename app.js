/* AulaFlow: proyecto educativo sin servidor. Guarda datos SOLO en este navegador. */
(() => {
  'use strict';

  const STORAGE_KEY = 'aulaflow_tasks_v1';
  const priorityOrder = { alta: 0, media: 1, baja: 2 };
  const priorityLabel = { alta: 'Alta', media: 'Media', baja: 'Baja' };
  const allowedCourses = ['Matemática', 'Comunicación', 'Ciencia y Tecnología', 'Inglés', 'Historia', 'Computación', 'Otro'];
  const $ = (selector) => document.querySelector(selector);

  let tasks = readTasks();
  let activeFilter = 'all';
  let searchQuery = '';
  let sortBy = 'date';
  let editingId = null;
  let toastTimer;

  const form = $('#taskForm');
  const titleInput = $('#taskTitle');
  const courseInput = $('#taskCourse');
  const dateInput = $('#taskDate');
  const priorityInput = $('#taskPriority');
  const notesInput = $('#taskNotes');
  const taskList = $('#taskList');

  function todayISO() {
    const date = new Date();
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  }

  function prettyDate(dateString) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return 'Sin fecha';
    const date = new Date(dateString + 'T12:00:00');
    if (Number.isNaN(date.getTime())) return 'Sin fecha';
    return new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short' }).format(date);
  }

  function readTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(t => t && typeof t.id === 'string' && typeof t.title === 'string' && typeof t.dueDate === 'string');
    } catch (error) {
      console.warn('No se pudieron recuperar las tareas guardadas', error);
      return [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.warn('No se pudieron guardar las tareas', error);
      notify('No fue posible guardar en este navegador.');
    }
  }

  function notify(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 3000);
  }

  function resetForm() {
    editingId = null;
    form.reset();
    dateInput.value = todayISO();
    $('#form-title').textContent = 'Nueva tarea';
    $('#submitBtn').textContent = '＋ Agregar tarea';
    $('#cancelEditBtn').hidden = true;
  }

  function updateStats() {
    const total = tasks.length;
    const complete = tasks.filter(t => t.completed).length;
    const pending = total - complete;
    const today = todayISO();
    const dueToday = tasks.filter(t => !t.completed && t.dueDate === today).length;
    const overdue = tasks.filter(t => !t.completed && t.dueDate < today).length;
    const pct = total ? Math.round((complete / total) * 100) : 0;

    $('#pendingCount').textContent = pending;
    $('#todayCount').textContent = dueToday;
    $('#doneCount').textContent = complete;
    $('#overdueCount').textContent = overdue;
    $('#progressText').textContent = `${pct}%`;
    $('#progressFill').style.width = `${pct}%`;
    $('#progressBar').setAttribute('aria-valuenow', String(pct));
    $('#progressHint').textContent = total
      ? `Has completado ${complete} de ${total} ${total === 1 ? 'tarea' : 'tareas'}. ¡Vamos por más!`
      : '¡Empieza agregando tu primera tarea!';
  }

  function makeElement(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function makePill(text, className = '') {
    return makeElement('span', `pill ${className}`.trim(), text);
  }

  function makeAction(text, label, action, taskId, extraClass = '') {
    const button = makeElement('button', `icon-btn ${extraClass}`.trim(), text);
    button.type = 'button';
    button.title = label;
    button.setAttribute('aria-label', label);
    button.dataset.action = action;
    button.dataset.id = taskId;
    return button;
  }

  function makeTaskCard(task) {
    const card = makeElement('article', `task-item${task.completed ? ' is-done' : ''}`);
    const check = makeElement('button', 'complete-btn', task.completed ? '✓' : '');
    check.type = 'button';
    check.setAttribute('aria-label', task.completed ? `Marcar pendiente: ${task.title}` : `Completar: ${task.title}`);
    check.setAttribute('aria-pressed', String(Boolean(task.completed)));
    check.dataset.action = 'toggle';
    check.dataset.id = task.id;

    const body = makeElement('div', 'task-body');
    body.appendChild(makeElement('h3', '', task.title));
    const meta = makeElement('div', 'task-meta');
    meta.appendChild(makePill(allowedCourses.includes(task.course) ? task.course : 'Otro'));
    meta.appendChild(makePill(`${priorityLabel[task.priority] || 'Media'} prioridad`, task.priority || 'media'));
    meta.appendChild(makePill(`📅 ${prettyDate(task.dueDate)}`));
    if (!task.completed && task.dueDate < todayISO()) meta.appendChild(makePill('Vencida', 'overdue'));
    else if (!task.completed && task.dueDate === todayISO()) meta.appendChild(makePill('¡Hoy!', 'today'));
    body.appendChild(meta);
    if (task.notes) body.appendChild(makeElement('p', '', String(task.notes)));

    const actions = makeElement('div', 'actions');
    actions.appendChild(makeAction('✎', `Editar: ${task.title}`, 'edit', task.id));
    actions.appendChild(makeAction('✕', `Eliminar: ${task.title}`, 'delete', task.id, 'delete-btn'));
    card.append(check, body, actions);
    return card;
  }

  function visibleTasks() {
    const term = searchQuery.trim().toLocaleLowerCase('es');
    return tasks.filter(task => {
      if (activeFilter === 'pending' && task.completed) return false;
      if (activeFilter === 'done' && !task.completed) return false;
      return !term || `${task.title} ${task.course} ${task.notes || ''}`.toLocaleLowerCase('es').includes(term);
    }).sort((a, b) => {
      if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed);
      if (sortBy === 'priority') return (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1) || a.dueDate.localeCompare(b.dueDate);
      if (sortBy === 'recent') return (b.createdAt || '').localeCompare(a.createdAt || '');
      return a.dueDate.localeCompare(b.dueDate) || (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
    });
  }

  function render() {
    updateStats();
    const filtered = visibleTasks();
    taskList.replaceChildren(...filtered.map(makeTaskCard));
    $('#emptyState').hidden = filtered.length !== 0;
    if (filtered.length === 0) {
      $('#emptyTitle').textContent = tasks.length ? 'No encontramos tareas' : 'Todavía no tienes tareas';
      $('#emptyText').textContent = tasks.length
        ? 'Prueba cambiando el filtro o el texto de búsqueda.'
        : 'Agrega tu primera actividad y empieza a organizar tu semana.';
    }
  }

  function makeId() {
    return (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const title = titleInput.value.trim();
    const dueDate = dateInput.value;
    if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      notify('Completa el nombre y la fecha de entrega.');
      return;
    }
    const draft = {
      title,
      course: courseInput.value,
      dueDate,
      priority: priorityInput.value,
      notes: notesInput.value.trim()
    };
    if (editingId) {
      const index = tasks.findIndex(t => t.id === editingId);
      if (index !== -1) tasks[index] = { ...tasks[index], ...draft };
      notify('¡Tarea actualizada!');
    } else {
      tasks.unshift({ id: makeId(), ...draft, completed: false, createdAt: new Date().toISOString() });
      notify('¡Nueva tarea agregada! 🎉');
    }
    saveTasks();
    resetForm();
    render();
  });

  taskList.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const task = tasks.find(t => t.id === button.dataset.id);
    if (!task) return;
    const action = button.dataset.action;
    if (action === 'toggle') {
      task.completed = !task.completed;
      saveTasks();
      render();
      notify(task.completed ? '¡Una tarea menos! Excelente 🎉' : 'Tarea marcada como pendiente.');
    } else if (action === 'edit') {
      editingId = task.id;
      titleInput.value = task.title;
      courseInput.value = allowedCourses.includes(task.course) ? task.course : 'Otro';
      dateInput.value = task.dueDate;
      priorityInput.value = priorityOrder[task.priority] === undefined ? 'media' : task.priority;
      notesInput.value = task.notes || '';
      $('#form-title').textContent = 'Editar tarea';
      $('#submitBtn').textContent = '✓ Guardar cambios';
      $('#cancelEditBtn').hidden = false;
      $('.form-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
      titleInput.focus({ preventScroll: true });
    } else if (action === 'delete') {
      if (!confirm(`¿Seguro que deseas eliminar la tarea «${task.title}»?`)) return;
      tasks = tasks.filter(t => t.id !== task.id);
      if (editingId === task.id) resetForm();
      saveTasks();
      render();
      notify('Tarea eliminada.');
    }
  });

  $('#cancelEditBtn').addEventListener('click', resetForm);
  $('#searchInput').addEventListener('input', event => {
    searchQuery = event.target.value;
    render();
  });
  $('#sortSelect').addEventListener('change', event => {
    sortBy = event.target.value;
    render();
  });
  document.querySelectorAll('.filter-btn').forEach(button => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(other => {
      const selected = other === button;
      other.classList.toggle('active', selected);
      other.setAttribute('aria-pressed', String(selected));
    });
    render();
  }));

  function csvCell(value) {
    let content = String(value ?? '');
    // Evita que programas de hojas de cálculo interpreten texto del usuario como una fórmula.
    if (/^[\s]*[=+@-]/.test(content)) content = "'" + content;
    return '"' + content.replace(/"/g, '""') + '"';
  }

  $('#exportBtn').addEventListener('click', () => {
    if (!tasks.length) { notify('Agrega alguna tarea antes de exportar.'); return; }
    const rows = [
      ['Tarea', 'Curso', 'Fecha de entrega', 'Prioridad', 'Estado', 'Notas'],
      ...tasks.map(t => [t.title, t.course, t.dueDate, priorityLabel[t.priority] || 'Media', t.completed ? 'Completada' : 'Pendiente', t.notes || ''])
    ];
    const content = '\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `aulaflow-tareas-${todayISO()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify('Descargaste tus tareas en CSV.');
  });

  $('#todayLabel').textContent = new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  resetForm();
  render();
})();
