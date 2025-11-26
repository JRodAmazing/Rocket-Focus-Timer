// Sidebar Toggle & Milestone Display Logic

const sidebar = document.getElementById('sidebar')
const sidebarToggle = document.getElementById('sidebarToggle')
const milestoneProgressFill = document.getElementById('milestoneProgressFill')
const milestoneProgressText = document.getElementById('milestoneProgressText')
const milestoneCard = document.getElementById('milestoneCard')
const milestonesGrid = document.getElementById('milestonesGrid')

// Toggle sidebar
sidebarToggle.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed')
})

// Update next milestone display
function updateNextMilestoneDisplay() {
  if (!stats.unlockedMilestones) {
    stats.unlockedMilestones = []
  }

  // Find next uncompleted milestone
  const nextMilestone = milestones.find(m => !stats.unlockedMilestones.includes(m.id))

  if (nextMilestone) {
    // Update icon and info
    milestoneCard.querySelector('.milestone-icon').textContent = nextMilestone.icon
    milestoneCard.querySelector('.milestone-name').textContent = nextMilestone.name
    milestoneCard.querySelector('.milestone-target').textContent = `${nextMilestone.points} Focus Points`

    // Update progress bar
    const progress = Math.min((focusPoints / nextMilestone.points) * 100, 100)
    milestoneProgressFill.style.width = `${progress}%`
    milestoneProgressText.textContent = `${focusPoints} / ${nextMilestone.points}`
  } else {
    // All milestones completed!
    milestoneCard.querySelector('.milestone-icon').textContent = '👑'
    milestoneCard.querySelector('.milestone-name').textContent = 'All Milestones Complete!'
    milestoneCard.querySelector('.milestone-target').textContent = 'You are a Focus Legend'
    milestoneProgressFill.style.width = '100%'
    milestoneProgressText.textContent = 'MAX LEVEL'
  }
}

// Render all milestones in grid
function renderAllMilestones() {
  milestonesGrid.innerHTML = ''

  milestones.forEach(milestone => {
    const badge = document.createElement('div')
    badge.className = 'milestone-badge'

    if (stats.unlockedMilestones && stats.unlockedMilestones.includes(milestone.id)) {
      badge.classList.add('earned')
    }

    badge.textContent = milestone.icon
    badge.title = `${milestone.name}\n${milestone.desc}\n${stats.unlockedMilestones && stats.unlockedMilestones.includes(milestone.id) ? '✓ Unlocked!' : `Need ${milestone.points} points`}`

    milestonesGrid.appendChild(badge)
  })
}

// Initialize
updateNextMilestoneDisplay()
renderAllMilestones()

// Export functions for use by tasks.js
window.updateNextMilestoneDisplay = updateNextMilestoneDisplay
window.renderAllMilestones = renderAllMilestones

console.log('Sidebar & Milestone Display loaded! 🎨')
