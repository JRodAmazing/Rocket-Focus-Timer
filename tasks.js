// ===================================
// ROCKET FOCUS - KANBAN & PRIORITIZATION SYSTEM
// Full task management with Eat The Frog + Eisenhower Matrix
// ===================================

// ===== DOM ELEMENTS =====
const kanbanBoard = document.getElementById('kanbanBoard')
const addTaskBtn = document.getElementById('addTaskBtn')
const addTaskModal = document.getElementById('addTaskModal')
const addTaskClose = document.getElementById('addTaskClose')
const cancelTaskBtn = document.getElementById('cancelTaskBtn')
const saveTaskBtn = document.getElementById('saveTaskBtn')

// Task form inputs
const taskNameInput = document.getElementById('taskNameInput')
const taskDescInput = document.getElementById('taskDescInput')
const taskDifficultyInput = document.getElementById('taskDifficultyInput')
const taskPomodorosInput = document.getElementById('taskPomodorosInput')
const taskTagInput = document.getElementById('taskTagInput')
const taskDeadlineInput = document.getElementById('taskDeadlineInput')
const taskUrgentInput = document.getElementById('taskUrgentInput')
const taskImportantInput = document.getElementById('taskImportantInput')

// Column count displays
const backlogCount = document.getElementById('backlogCount')
const todoCount = document.getElementById('todoCount')
const inProgressCount = document.getElementById('inProgressCount')
const doneCount = document.getElementById('doneCount')

// Priorities modal
const viewPrioritiesBtn = document.getElementById('viewPrioritiesBtn')
const prioritiesModal = document.getElementById('prioritiesModal')
const prioritiesClose = document.getElementById('prioritiesClose')

const focusPointsEl = document.getElementById('focusPoints')
const currentTaskDisplay = document.getElementById('currentTaskDisplay')
const currentTaskName = document.getElementById('currentTaskName')
const currentTaskProgress = document.getElementById('currentTaskProgress')

// ===== STATE MANAGEMENT =====
let tasks = loadTasks()
let activeTaskId = null
let focusPoints = stats.focusPoints || 0
let userXP = loadUserXP()
let userLevel = calculateLevel(userXP)

// Gamification badges
const BADGES = [
  { id: 'first-task', icon: '🎯', name: 'First Task', desc: 'Complete your first task', check: s => s.tasksCompleted >= 1 },
  { id: 'frog-slayer', icon: '🐸', name: 'Frog Slayer', desc: 'Complete your first Eat The Frog task', check: s => s.frogsSlain >= 1 },
  { id: 'frog-master', icon: '🐸💪', name: 'Frog Master', desc: 'Complete 10 Frog tasks', check: s => s.frogsSlain >= 10 },
  { id: 'productivity-pilot', icon: '✈️', name: 'Productivity Pilot', desc: 'Complete 5 tasks in one day', check: s => s.tasksCompletedToday >= 5 },
  { id: 'rocket-booster', icon: '🚀', name: 'Rocket Booster', desc: 'Complete 20 tasks total', check: s => s.tasksCompleted >= 20 },
  { id: 'full-day-streak', icon: '🔥', name: 'Full Day Streak', desc: 'Work 3 days in a row', check: s => s.currentStreak >= 3 },
  { id: 'week-warrior', icon: '⚔️', name: 'Week Warrior', desc: 'Work 7 days in a row', check: s => s.currentStreak >= 7 },
  { id: 'consistency-king', icon: '👑', name: 'Consistency King', desc: 'Work 30 days in a row', check: s => s.currentStreak >= 30 },
  { id: 'speed-demon', icon: '⚡', name: 'Speed Demon', desc: 'Complete a task in under 15 minutes', check: s => s.fastestTask > 0 && s.fastestTask <= 15 },
  { id: 'centurion', icon: '💯', name: 'Centurion', desc: 'Complete 100 tasks', check: s => s.tasksCompleted >= 100 },
]

// ===== UTILITY FUNCTIONS =====
function loadTasks() {
  const saved = localStorage.getItem('focusTasks')
  if (saved) {
    return JSON.parse(saved)
  }
  return []
}

function saveTasks() {
  localStorage.setItem('focusTasks', JSON.stringify(tasks))
  if (tasks.length > 0) {
    recalculatePriorities()
  }
}

function loadUserXP() {
  const saved = localStorage.getItem('userXP')
  return saved ? parseInt(saved) : 0
}

function saveUserXP() {
  localStorage.setItem('userXP', userXP)
}

function calculateLevel(xp) {
  // Level formula: Level = floor(sqrt(XP / 100)) + 1
  return Math.floor(Math.sqrt(xp / 100)) + 1
}

function awardXP(amount, reason = '') {
  userXP += amount
  userLevel = calculateLevel(userXP)
  saveUserXP()

  // Animate XP gain
  showFloatingXP(amount, reason)

  // Check for level up
  const prevLevel = calculateLevel(userXP - amount)
  if (userLevel > prevLevel) {
    showLevelUp(userLevel)
  }

  checkBadges()
}

function showFloatingXP(amount, reason) {
  const popup = achievementPopup
  popup.innerHTML = `<strong>+${amount} XP</strong><br>${reason || 'Great work!'}`
  popup.classList.add('show')
  setTimeout(() => popup.classList.remove('show'), 2000)
}

function showLevelUp(level) {
  const popup = achievementPopup
  popup.innerHTML = `
    <div style="font-size:48px">🎉</div>
    <div style="font-size:24px;font-weight:bold">LEVEL UP!</div>
    <div style="font-size:18px">You're now Level ${level}!</div>
  `
  popup.classList.add('show')
  playCompletionSound()
  setTimeout(() => popup.classList.remove('show'), 4000)
}

function checkBadges() {
  const gameStats = getGameStats()
  let newBadges = []

  BADGES.forEach(badge => {
    if (!stats.earnedAchievements.includes(badge.id) && badge.check(gameStats)) {
      stats.earnedAchievements.push(badge.id)
      newBadges.push(badge)
    }
  })

  if (newBadges.length > 0) {
    saveStats()
    newBadges.forEach(badge => showBadgeUnlock(badge))
  }
}

function showBadgeUnlock(badge) {
  const popup = achievementPopup
  popup.innerHTML = `
    <div style="font-size:36px;margin-bottom:8px">${badge.icon}</div>
    <div style="font-weight:600;font-size:18px">${badge.name}</div>
    <div style="font-size:13px;opacity:0.9;margin-top:4px">Badge Unlocked! 🎉</div>
  `
  popup.classList.add('show')
  playCompletionSound()
  setTimeout(() => popup.classList.remove('show'), 3500)
}

function getGameStats() {
  const completedTasks = tasks.filter(t => t.status === 'done')
  const frogsSlain = completedTasks.filter(t => t.wasFrog).length

  // Tasks completed today
  const today = new Date().toDateString()
  const tasksCompletedToday = completedTasks.filter(t => {
    const taskDate = new Date(t.completedAt || 0).toDateString()
    return taskDate === today
  }).length

  // Fastest task (in minutes)
  const fastestTask = completedTasks.reduce((min, t) => {
    if (t.timeSpent && (min === 0 || t.timeSpent < min)) {
      return t.timeSpent
    }
    return min
  }, 0)

  return {
    tasksCompleted: completedTasks.length,
    frogsSlain,
    tasksCompletedToday,
    fastestTask,
    currentStreak: stats.currentStreak || 0,
    bestStreak: stats.bestStreak || 0
  }
}

// ===== TASK CRUD OPERATIONS =====
function addTask(taskData) {
  const task = {
    id: Date.now(),
    title: taskData.title || 'Untitled Task',
    description: taskData.description || '',
    difficulty: taskData.difficulty || 'M',
    estimatedPomodoros: parseInt(taskData.estimatedPomodoros) || 2,
    timeEstimate: (parseInt(taskData.estimatedPomodoros) || 2) * 25, // minutes
    deadline: taskData.deadline || null,
    tag: taskData.tag || 'work',
    urgent: !!taskData.urgent,
    important: !!taskData.important,
    status: 'backlog',
    completedPomodoros: 0,
    createdAt: new Date().toISOString(),
    completedAt: null,
    wasFrog: false,
    timeSpent: 0,
    priorityScore: 0
  }

  console.log('Creating task with data:', task)

  tasks.push(task)
  saveTasks()
  renderKanban()

  return task
}

function updateTask(taskId, updates) {
  const task = tasks.find(t => t.id === taskId)
  if (task) {
    Object.assign(task, updates)
    saveTasks()
    renderKanban()
  }
}

function deleteTask(taskId) {
  tasks = tasks.filter(t => t.id !== taskId)
  if (activeTaskId === taskId) {
    activeTaskId = null
    hideCurrentTaskDisplay()
  }
  saveTasks()
  renderKanban()
}

function moveTask(taskId, newStatus) {
  const task = tasks.find(t => t.id === taskId)
  if (task) {
    task.status = newStatus

    // If moving to done, mark completion
    if (newStatus === 'done' && !task.completedAt) {
      completeTask(taskId)
    }

    saveTasks()
    renderKanban()
  }
}

function completeTask(taskId) {
  const task = tasks.find(t => t.id === taskId)
  if (!task) return

  task.status = 'done'
  task.completedAt = new Date().toISOString()

  // Calculate time spent (rough estimate based on pomodoros)
  task.timeSpent = task.completedPomodoros * 25

  // Award XP based on difficulty and importance
  let xpAmount = 10 // Base XP
  if (task.difficulty === 'M') xpAmount = 15
  if (task.difficulty === 'L') xpAmount = 25
  if (task.important) xpAmount += 10
  if (task.urgent) xpAmount += 5
  if (task.wasFrog) xpAmount += 20

  awardXP(xpAmount, `Completed: ${task.title}`)

  // Award focus points
  const pointsEarned = task.completedPomodoros
  awardFocusPoints(pointsEarned)

  // Check if this was the frog task
  if (task.wasFrog) {
    showFrogConquered()
  }

  saveTasks()
  renderKanban()
  checkBadges()

  // Create confetti effect
  createConfetti()
}

function createConfetti() {
  // Simple confetti animation
  for (let i = 0; i < 30; i++) {
    const confetti = document.createElement('div')
    confetti.className = 'confetti-piece'
    confetti.style.left = Math.random() * 100 + 'vw'
    confetti.style.background = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'][Math.floor(Math.random() * 5)]
    confetti.style.animationDelay = Math.random() * 0.3 + 's'
    document.body.appendChild(confetti)
    setTimeout(() => confetti.remove(), 3000)
  }
}

function showFrogConquered() {
  const popup = achievementPopup
  popup.innerHTML = `
    <div style="font-size:48px;margin-bottom:12px">🐸✨</div>
    <div style="font-size:24px;font-weight:bold">FROG CONQUERED!</div>
    <div style="font-size:16px;margin-top:8px">You did the hardest thing first! 💪</div>
  `
  popup.classList.add('show')
  playCompletionSound()
  setTimeout(() => popup.classList.remove('show'), 4000)
}

function completePomodoro(taskId) {
  const task = tasks.find(t => t.id === taskId)
  if (!task) return

  task.completedPomodoros++

  // Award focus points (1 point per pomodoro)
  awardFocusPoints(1)

  // Award XP for completing pomodoro
  awardXP(5, 'Pomodoro completed!')

  saveTasks()
  renderKanban()
  updateCurrentTaskDisplay()
}

function awardFocusPoints(points, customMessage = null) {
  focusPoints += points
  stats.focusPoints = focusPoints
  saveStats()

  // Update UI
  focusPointsEl.textContent = focusPoints

  // Animate points gain
  focusPointsEl.style.transform = 'scale(1.3)'
  focusPointsEl.style.color = '#4CAF50'
  setTimeout(() => {
    focusPointsEl.style.transform = 'scale(1)'
    focusPointsEl.style.color = '#f57c00'
  }, 400)
}

// ===== PRIORITIZATION ENGINE =====
function recalculatePriorities() {
  const activeTasks = tasks.filter(t => t.status !== 'done')

  // Calculate priority scores for each task
  activeTasks.forEach(task => {
    let score = 0

    // Difficulty (bigger = higher priority for "frog")
    if (task.difficulty === 'L') score += 30
    if (task.difficulty === 'M') score += 15
    if (task.difficulty === 'S') score += 5

    // Importance
    if (task.important) score += 40

    // Urgency
    if (task.urgent) score += 25

    // Deadline proximity
    if (task.deadline) {
      const daysUntil = Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24))
      if (daysUntil <= 1) score += 50
      else if (daysUntil <= 3) score += 30
      else if (daysUntil <= 7) score += 15
    }

    // Time estimate (longer tasks get slight boost to encourage starting them)
    score += Math.min(task.timeEstimate / 10, 10)

    task.priorityScore = score
  })

  // Reset all wasFrog flags
  tasks.forEach(t => { if (t.status !== 'done') t.wasFrog = false })

  // Identify the "Eat The Frog" task
  const frogTask = activeTasks.reduce((max, task) => {
    return (task.priorityScore > (max?.priorityScore || 0)) ? task : max
  }, null)

  if (frogTask) {
    frogTask.wasFrog = true
  }

  // Don't call saveTasks here to avoid infinite loop
  localStorage.setItem('focusTasks', JSON.stringify(tasks))
}

function getEatTheFrogTask() {
  return tasks.find(t => t.wasFrog && t.status !== 'done')
}

function getEisenhowerQuadrants() {
  const activeTasks = tasks.filter(t => t.status !== 'done')

  return {
    urgentImportant: activeTasks.filter(t => t.urgent && t.important),
    notUrgentImportant: activeTasks.filter(t => !t.urgent && t.important),
    urgentNotImportant: activeTasks.filter(t => t.urgent && !t.important),
    notUrgentNotImportant: activeTasks.filter(t => !t.urgent && !t.important)
  }
}

function getRecommendedOrder() {
  const activeTasks = tasks.filter(t => t.status !== 'done')
  return activeTasks.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0))
}

// ===== KANBAN RENDERING =====
function renderKanban() {
  const columns = {
    backlog: document.getElementById('backlogTasks'),
    todo: document.getElementById('todoTasks'),
    'in-progress': document.getElementById('inProgressTasks'),
    done: document.getElementById('doneTasks')
  }

  // Clear all columns
  Object.values(columns).forEach(col => col.innerHTML = '')

  // Count tasks in each column
  const counts = {
    backlog: 0,
    todo: 0,
    'in-progress': 0,
    done: 0
  }

  // Render tasks
  tasks.forEach(task => {
    const card = createTaskCard(task)
    if (columns[task.status]) {
      columns[task.status].appendChild(card)
      counts[task.status]++
    }
  })

  // Update counts
  backlogCount.textContent = counts.backlog
  todoCount.textContent = counts.todo
  inProgressCount.textContent = counts['in-progress']
  doneCount.textContent = counts.done

  // Add empty state messages
  Object.keys(columns).forEach(status => {
    if (counts[status] === 0) {
      const empty = document.createElement('div')
      empty.className = 'empty-column'
      empty.textContent = 'No tasks'
      columns[status].appendChild(empty)
    }
  })
}

function createTaskCard(task) {
  const card = document.createElement('div')
  card.className = 'kanban-card'
  card.draggable = true

  if (task.wasFrog) card.classList.add('frog-task')
  if (task.urgent && task.important) card.classList.add('urgent-important')
  if (task.id === activeTaskId) card.classList.add('active-task')

  // Card header
  const header = document.createElement('div')
  header.className = 'card-header'

  const title = document.createElement('div')
  title.className = 'card-title'
  title.textContent = task.title
  if (task.wasFrog) title.textContent = '🐸 ' + task.title

  const tagBadge = document.createElement('span')
  tagBadge.className = 'card-tag'
  tagBadge.textContent = getTagEmoji(task.tag)
  tagBadge.title = task.tag

  header.appendChild(title)
  header.appendChild(tagBadge)

  // Card body
  if (task.description) {
    const desc = document.createElement('div')
    desc.className = 'card-description'
    desc.textContent = task.description
    card.appendChild(desc)
  }

  // Card meta
  const meta = document.createElement('div')
  meta.className = 'card-meta'

  const difficulty = document.createElement('span')
  difficulty.className = 'card-difficulty diff-' + (task.difficulty || 'M').toLowerCase()
  difficulty.textContent = task.difficulty || 'M'
  difficulty.title = 'Difficulty'

  const pomodoros = document.createElement('span')
  pomodoros.className = 'card-pomodoros'
  pomodoros.textContent = `${task.completedPomodoros}/${task.estimatedPomodoros} 🍅`

  const priority = document.createElement('span')
  priority.className = 'card-priority'
  if (task.urgent) priority.textContent += '⚡'
  if (task.important) priority.textContent += '⭐'

  meta.appendChild(difficulty)
  meta.appendChild(pomodoros)
  if (priority.textContent) meta.appendChild(priority)

  // Deadline if exists
  if (task.deadline) {
    const deadline = document.createElement('div')
    deadline.className = 'card-deadline'
    const daysUntil = Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    deadline.textContent = `📅 ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`
    if (daysUntil <= 1) deadline.classList.add('deadline-urgent')
    else if (daysUntil <= 3) deadline.classList.add('deadline-soon')
    meta.appendChild(deadline)
  }

  // Card actions
  const actions = document.createElement('div')
  actions.className = 'card-actions'

  // Move buttons (only for non-done tasks)
  if (task.status !== 'done') {
    const statusFlow = ['backlog', 'todo', 'in-progress', 'done']
    const currentIndex = statusFlow.indexOf(task.status)

    if (currentIndex < statusFlow.length - 1) {
      const moveForward = document.createElement('button')
      moveForward.className = 'card-btn card-btn-move'
      moveForward.textContent = '→'
      moveForward.title = `Move to ${statusFlow[currentIndex + 1]}`
      moveForward.onclick = (e) => {
        e.stopPropagation()
        moveTask(task.id, statusFlow[currentIndex + 1])
      }
      actions.appendChild(moveForward)
    }

    // Set as active button for in-progress tasks
    if (task.status === 'in-progress') {
      const setActive = document.createElement('button')
      setActive.className = 'card-btn card-btn-active'
      setActive.textContent = task.id === activeTaskId ? '✓' : '▶️'
      setActive.title = 'Set as active task'
      setActive.onclick = (e) => {
        e.stopPropagation()
        if (task.id === activeTaskId) {
          activeTaskId = null
          hideCurrentTaskDisplay()
        } else {
          setActiveTask(task.id)
        }
      }
      actions.appendChild(setActive)
    }
  }

  // Delete button
  const deleteBtn = document.createElement('button')
  deleteBtn.className = 'card-btn card-btn-delete'
  deleteBtn.textContent = '🗑️'
  deleteBtn.title = 'Delete task'
  deleteBtn.onclick = (e) => {
    e.stopPropagation()
    if (confirm(`Delete "${task.title}"?`)) {
      deleteTask(task.id)
    }
  }
  actions.appendChild(deleteBtn)

  card.appendChild(header)
  card.appendChild(meta)
  card.appendChild(actions)

  // Drag and drop
  card.ondragstart = (e) => {
    e.dataTransfer.setData('taskId', task.id)
    card.classList.add('dragging')
  }

  card.ondragend = () => {
    card.classList.remove('dragging')
  }

  return card
}

function getTagEmoji(tag) {
  const emojis = {
    work: '💼',
    personal: '🏠',
    training: '📚',
    health: '💪',
    creative: '🎨',
    urgent: '⚡'
  }
  return emojis[tag] || '📋'
}

// ===== DRAG AND DROP =====
function setupDragAndDrop() {
  const columns = document.querySelectorAll('.column-tasks')

  columns.forEach(column => {
    column.ondragover = (e) => {
      e.preventDefault()
      column.classList.add('drag-over')
    }

    column.ondragleave = () => {
      column.classList.remove('drag-over')
    }

    column.ondrop = (e) => {
      e.preventDefault()
      column.classList.remove('drag-over')

      const taskId = parseInt(e.dataTransfer.getData('taskId'))
      const newStatus = column.parentElement.dataset.status

      moveTask(taskId, newStatus)
    }
  })
}

// ===== ACTIVE TASK MANAGEMENT =====
function setActiveTask(taskId) {
  activeTaskId = taskId
  renderKanban()
  showCurrentTaskDisplay()
}

function showCurrentTaskDisplay() {
  if (!activeTaskId) return

  const task = tasks.find(t => t.id === activeTaskId)
  if (!task) return

  currentTaskName.textContent = task.title
  const progress = `${task.completedPomodoros} / ${task.estimatedPomodoros} 🍅`
  currentTaskProgress.textContent = progress
  currentTaskDisplay.style.display = 'block'
}

function updateCurrentTaskDisplay() {
  if (!activeTaskId || !currentTaskDisplay.style.display || currentTaskDisplay.style.display === 'none') return
  showCurrentTaskDisplay()
}

function hideCurrentTaskDisplay() {
  currentTaskDisplay.style.display = 'none'
}

// ===== MODAL CONTROLS =====
if (!addTaskBtn) {
  console.error('addTaskBtn not found!')
}
if (!saveTaskBtn) {
  console.error('saveTaskBtn not found!')
}
if (!addTaskModal) {
  console.error('addTaskModal not found!')
}

addTaskBtn?.addEventListener('click', () => {
  addTaskModal.classList.add('active')
  taskNameInput.focus()
})

addTaskClose?.addEventListener('click', () => {
  addTaskModal.classList.remove('active')
})

cancelTaskBtn?.addEventListener('click', () => {
  addTaskModal.classList.remove('active')
})

addTaskModal?.addEventListener('click', (e) => {
  if (e.target === addTaskModal) {
    addTaskModal.classList.remove('active')
  }
})

saveTaskBtn?.addEventListener('click', () => {
  console.log('Save task button clicked!')

  const title = taskNameInput.value.trim()

  if (!title) {
    alert('Please enter a task name')
    return
  }

  const taskData = {
    title,
    description: taskDescInput.value.trim(),
    difficulty: taskDifficultyInput.value,
    estimatedPomodoros: parseInt(taskPomodorosInput.value),
    tag: taskTagInput.value,
    deadline: taskDeadlineInput.value || null,
    urgent: taskUrgentInput.checked,
    important: taskImportantInput.checked
  }

  console.log('Task data:', taskData)

  try {
    addTask(taskData)
    console.log('Task added successfully!')

    // Reset form
    taskNameInput.value = ''
    taskDescInput.value = ''
    taskDifficultyInput.value = 'M'
    taskPomodorosInput.value = '2'
    taskTagInput.value = 'work'
    taskDeadlineInput.value = ''
    taskUrgentInput.checked = false
    taskImportantInput.checked = false

    // Close modal
    addTaskModal.classList.remove('active')

    // Show notification
    if (window.sendNotification) {
      sendNotification('Task Added!', `${title} added to backlog! 📋`)
    } else {
      console.log('Task added:', title)
    }
  } catch (error) {
    console.error('Error adding task:', error)
    alert('Error adding task: ' + error.message)
  }
})

taskNameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    saveTaskBtn.click()
  }
})

// Priorities modal
viewPrioritiesBtn.addEventListener('click', () => {
  showPrioritiesModal()
})

prioritiesClose.addEventListener('click', () => {
  prioritiesModal.classList.remove('active')
})

prioritiesModal.addEventListener('click', (e) => {
  if (e.target === prioritiesModal) {
    prioritiesModal.classList.remove('active')
  }
})

function showPrioritiesModal() {
  // Recalculate priorities
  recalculatePriorities()

  // Get Eat The Frog task
  const frogTask = getEatTheFrogTask()
  const frogTaskFull = document.getElementById('frogTaskFull')

  if (frogTask) {
    frogTaskFull.innerHTML = `
      <div class="frog-card">
        <h3>🐸 ${frogTask.title}</h3>
        ${frogTask.description ? `<p>${frogTask.description}</p>` : ''}
        <div class="frog-meta">
          <span>Difficulty: ${frogTask.difficulty}</span>
          <span>Estimate: ${frogTask.timeEstimate} min</span>
          <span>${getTagEmoji(frogTask.tag)} ${frogTask.tag}</span>
        </div>
      </div>
    `
  } else {
    frogTaskFull.textContent = 'No tasks available. Add some tasks to get started!'
  }

  // Eisenhower Matrix
  const quadrants = getEisenhowerQuadrants()

  document.getElementById('urgentImportant').innerHTML = renderQuadrantTasks(quadrants.urgentImportant)
  document.getElementById('notUrgentImportant').innerHTML = renderQuadrantTasks(quadrants.notUrgentImportant)
  document.getElementById('urgentNotImportant').innerHTML = renderQuadrantTasks(quadrants.urgentNotImportant)
  document.getElementById('notUrgentNotImportant').innerHTML = renderQuadrantTasks(quadrants.notUrgentNotImportant)

  // Recommended order
  const recommended = getRecommendedOrder()
  const recommendedOrder = document.getElementById('recommendedOrder')

  if (recommended.length > 0) {
    recommendedOrder.innerHTML = recommended.slice(0, 10).map((task, i) => `
      <div class="recommended-task">
        <span class="task-rank">${i + 1}</span>
        <span class="task-title">${task.wasFrog ? '🐸 ' : ''}${task.title}</span>
        <span class="task-score">${getTagEmoji(task.tag)}</span>
      </div>
    `).join('')
  } else {
    recommendedOrder.textContent = 'No active tasks'
  }

  prioritiesModal.classList.add('active')
}

function renderQuadrantTasks(tasks) {
  if (tasks.length === 0) {
    return '<p class="no-tasks">No tasks</p>'
  }

  return tasks.map(task => `
    <div class="quadrant-task">
      <span>${task.wasFrog ? '🐸 ' : ''}${task.title}</span>
      <span class="task-tag">${getTagEmoji(task.tag)}</span>
    </div>
  `).join('')
}

// ===== HOOK INTO TIMER =====
window.onPomodoroComplete = function() {
  if (activeTaskId) {
    completePomodoro(activeTaskId)
  } else {
    // Award XP and focus points even without active task
    awardFocusPoints(1)
    awardXP(5, 'Pomodoro completed!')
  }
}

// ===== INITIALIZATION =====
function init() {
  focusPointsEl.textContent = focusPoints
  recalculatePriorities()
  renderKanban()
  setupDragAndDrop()
  checkBadges()

  console.log('🚀 Kanban & Prioritization System Loaded!')
  console.log(`📊 ${tasks.length} tasks loaded`)
  console.log(`⭐ Focus Points: ${focusPoints}`)
  console.log(`🎯 User Level: ${userLevel} (${userXP} XP)`)
}

init()
