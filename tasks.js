// Task Queue & Focus Points System
// The ultimate focus maximizer 🚀

// DOM Elements
const taskList = document.getElementById('taskList')
const addTaskBtn = document.getElementById('addTaskBtn')
const addTaskModal = document.getElementById('addTaskModal')
const addTaskClose = document.getElementById('addTaskClose')
const taskNameInput = document.getElementById('taskNameInput')
const taskPomodorosInput = document.getElementById('taskPomodorosInput')
const saveTaskBtn = document.getElementById('saveTaskBtn')
const cancelTaskBtn = document.getElementById('cancelTaskBtn')
const focusPointsEl = document.getElementById('focusPoints')
const currentTaskDisplay = document.getElementById('currentTaskDisplay')
const currentTaskName = document.getElementById('currentTaskName')
const currentTaskProgress = document.getElementById('currentTaskProgress')

// Task Management State
let tasks = loadTasks()
let activeTaskId = null
let focusPoints = stats.focusPoints || 0

// Milestone Definitions (Focus Points based)
const milestones = [
  { id: 'seedling', icon: '🌱', name: 'Focus Seedling', desc: 'Earn 10 focus points', points: 10 },
  { id: 'sprout', icon: '🌿', name: 'Focus Sprout', desc: 'Earn 25 focus points', points: 25 },
  { id: 'sapling', icon: '🌳', name: 'Focus Tree', desc: 'Earn 50 focus points', points: 50 },
  { id: 'mountain', icon: '🏔️', name: 'Focus Mountain', desc: 'Earn 100 focus points', points: 100 },
  { id: 'star', icon: '🌟', name: 'Focus Star', desc: 'Earn 200 focus points', points: 200 },
  { id: 'astronaut', icon: '🚀', name: 'Focus Astronaut', desc: 'Earn 500 focus points', points: 500 },
  { id: 'galaxy', icon: '🌌', name: 'Focus Galaxy', desc: 'Earn 1000 focus points', points: 1000 },
  { id: 'universe', icon: '🌠', name: 'Focus Universe', desc: 'Earn 2000 focus points', points: 2000 },
  { id: 'infinity', icon: '♾️', name: 'Focus Infinity', desc: 'Earn 5000 focus points', points: 5000 },
]

// Load tasks from localStorage
function loadTasks() {
  const saved = localStorage.getItem('focusTasks')
  if (saved) {
    return JSON.parse(saved)
  }
  return []
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem('focusTasks', JSON.stringify(tasks))
}

// Add task
function addTask(name, estimatedPomodoros) {
  const task = {
    id: Date.now(),
    name: name,
    estimatedPomodoros: estimatedPomodoros,
    completedPomodoros: 0,
    completed: false,
    createdAt: new Date().toISOString()
  }

  tasks.push(task)
  saveTasks()
  renderTasks()

  return task
}

// Delete task
function deleteTask(taskId) {
  tasks = tasks.filter(t => t.id !== taskId)
  if (activeTaskId === taskId) {
    activeTaskId = null
    hideCurrentTaskDisplay()
  }
  saveTasks()
  renderTasks()
}

// Complete a pomodoro for a task
function completePomodoro(taskId) {
  const task = tasks.find(t => t.id === taskId)
  if (!task) return

  task.completedPomodoros++

  // Award focus points (1 point per pomodoro)
  const pointsEarned = 1
  awardFocusPoints(pointsEarned)

  // Check if task is fully completed
  if (task.completedPomodoros >= task.estimatedPomodoros) {
    task.completed = true
    // Bonus points for completing a task
    const bonusPoints = Math.ceil(task.estimatedPomodoros * 0.5)
    awardFocusPoints(bonusPoints, `Task Complete Bonus! +${bonusPoints} 🎉`)
  }

  saveTasks()
  renderTasks()
  updateCurrentTaskDisplay()
}

// Award focus points
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

  // Check for milestone unlocks
  checkMilestones()

  // Show notification
  if (customMessage) {
    showNotification('Focus Points!', customMessage)
  } else {
    showNotification('Focus Points!', `+${points} point${points > 1 ? 's' : ''} earned! ⭐`)
  }
}

// Check for milestone unlocks
function checkMilestones() {
  if (!stats.unlockedMilestones) {
    stats.unlockedMilestones = []
  }

  milestones.forEach(milestone => {
    if (focusPoints >= milestone.points && !stats.unlockedMilestones.includes(milestone.id)) {
      stats.unlockedMilestones.push(milestone.id)
      saveStats()
      showMilestonePopup(milestone)
    }
  })

  renderMilestones()

  // Update sidebar displays
  if (window.updateNextMilestoneDisplay) {
    window.updateNextMilestoneDisplay()
  }
  if (window.renderAllMilestones) {
    window.renderAllMilestones()
  }
}

// Show milestone unlock popup
function showMilestonePopup(milestone) {
  const popup = achievementPopup // Reuse achievement popup element
  popup.innerHTML = `
    <div style="font-size:36px;margin-bottom:8px">${milestone.icon}</div>
    <div style="font-weight:600;font-size:18px">${milestone.name}</div>
    <div style="font-size:13px;opacity:0.9;margin-top:4px">${milestone.points} Focus Points! 🎯</div>
  `
  popup.classList.add('show')

  // Play celebration sound
  playCompletionSound()

  setTimeout(() => {
    popup.classList.remove('show')
  }, 4000)
}

// Render milestones (add to achievements section)
function renderMilestones() {
  // Clear existing milestones
  const existingMilestones = achievementsEl.querySelectorAll('.milestone-badge')
  existingMilestones.forEach(m => m.remove())

  // Add milestone badges
  milestones.forEach(milestone => {
    const badge = document.createElement('div')
    badge.className = 'badge milestone-badge'

    const isUnlocked = stats.unlockedMilestones && stats.unlockedMilestones.includes(milestone.id)
    if (isUnlocked) {
      badge.classList.add('earned')
    }

    badge.textContent = milestone.icon
    badge.title = `${milestone.name}: ${milestone.desc} ${isUnlocked ? '✓' : ''}`

    achievementsEl.appendChild(badge)
  })
}

// Set active task
function setActiveTask(taskId) {
  activeTaskId = taskId
  renderTasks()
  showCurrentTaskDisplay()
}

// Show current task display
function showCurrentTaskDisplay() {
  if (!activeTaskId) return

  const task = tasks.find(t => t.id === activeTaskId)
  if (!task) return

  currentTaskName.textContent = task.name
  const progress = `${task.completedPomodoros} / ${task.estimatedPomodoros} 🍅`
  currentTaskProgress.textContent = progress
  currentTaskDisplay.style.display = 'block'
}

// Update current task display
function updateCurrentTaskDisplay() {
  if (!activeTaskId || !currentTaskDisplay.style.display || currentTaskDisplay.style.display === 'none') return
  showCurrentTaskDisplay()
}

// Hide current task display
function hideCurrentTaskDisplay() {
  currentTaskDisplay.style.display = 'none'
}

// Render all tasks
function renderTasks() {
  taskList.innerHTML = ''

  if (tasks.length === 0) {
    taskList.innerHTML = '<div class="empty-tasks"><p>No tasks yet. Add a task to get started! 🚀</p></div>'
    return
  }

  tasks.forEach(task => {
    const taskItem = document.createElement('div')
    taskItem.className = 'task-item'
    if (task.completed) {
      taskItem.classList.add('completed')
    }
    if (task.id === activeTaskId) {
      taskItem.classList.add('active')
    }

    // Checkbox
    const checkbox = document.createElement('div')
    checkbox.className = 'task-checkbox'
    if (task.completed) {
      checkbox.classList.add('checked')
    }
    checkbox.addEventListener('click', () => {
      if (!task.completed) {
        task.completed = true
        saveTasks()
        renderTasks()
      }
    })

    // Task content
    const content = document.createElement('div')
    content.className = 'task-content'

    const nameEl = document.createElement('div')
    nameEl.className = 'task-name'
    nameEl.textContent = task.name

    const pomodorosEl = document.createElement('div')
    pomodorosEl.className = 'task-pomodoros'
    for (let i = 0; i < task.estimatedPomodoros; i++) {
      const dot = document.createElement('div')
      dot.className = 'pomodoro-dot'
      if (i < task.completedPomodoros) {
        dot.classList.add('completed')
      }
      pomodorosEl.appendChild(dot)
    }

    content.appendChild(nameEl)
    content.appendChild(pomodorosEl)

    // Actions
    const actions = document.createElement('div')
    actions.className = 'task-actions'

    // Set as active button
    if (!task.completed) {
      const activeBtn = document.createElement('button')
      activeBtn.className = 'task-action-btn'
      activeBtn.textContent = task.id === activeTaskId ? '✓' : '▶️'
      activeBtn.title = task.id === activeTaskId ? 'Active' : 'Set as active'
      activeBtn.addEventListener('click', () => {
        if (task.id === activeTaskId) {
          activeTaskId = null
          hideCurrentTaskDisplay()
        } else {
          setActiveTask(task.id)
        }
      })
      actions.appendChild(activeBtn)
    }

    // Delete button
    const deleteBtn = document.createElement('button')
    deleteBtn.className = 'task-action-btn'
    deleteBtn.textContent = '🗑️'
    deleteBtn.title = 'Delete task'
    deleteBtn.addEventListener('click', () => {
      if (confirm(`Delete "${task.name}"?`)) {
        deleteTask(task.id)
      }
    })
    actions.appendChild(deleteBtn)

    taskItem.appendChild(checkbox)
    taskItem.appendChild(content)
    taskItem.appendChild(actions)

    taskList.appendChild(taskItem)
  })
}

// Modal controls
addTaskBtn.addEventListener('click', () => {
  addTaskModal.classList.add('active')
  taskNameInput.focus()
})

addTaskClose.addEventListener('click', () => {
  addTaskModal.classList.remove('active')
})

cancelTaskBtn.addEventListener('click', () => {
  addTaskModal.classList.remove('active')
})

addTaskModal.addEventListener('click', (e) => {
  if (e.target === addTaskModal) {
    addTaskModal.classList.remove('active')
  }
})

// Save task
saveTaskBtn.addEventListener('click', () => {
  const name = taskNameInput.value.trim()
  const pomodoros = parseInt(taskPomodorosInput.value)

  if (!name) {
    alert('Please enter a task name')
    return
  }

  if (pomodoros < 1 || pomodoros > 20) {
    alert('Pomodoros must be between 1 and 20')
    return
  }

  addTask(name, pomodoros)

  // Reset form
  taskNameInput.value = ''
  taskPomodorosInput.value = '2'

  // Close modal
  addTaskModal.classList.remove('active')

  showNotification('Task Added!', `${name} added to queue! 📋`)
})

// Enter key to save
taskNameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    saveTaskBtn.click()
  }
})

// Hook into timer completion to award focus points
// We'll need to modify script.js to call this function
window.onPomodoroComplete = function() {
  if (activeTaskId) {
    completePomodoro(activeTaskId)
  } else {
    // Award 1 point even without active task
    awardFocusPoints(1)
  }
}

// Initialize
focusPointsEl.textContent = focusPoints
renderTasks()
checkMilestones()
renderMilestones()

console.log('Task Queue & Focus Points system loaded! 🚀⭐')
