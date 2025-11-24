// Dashboard Toggle Functionality

const dashboardBottom = document.getElementById('dashboardBottom')
const dashboardToggle = document.getElementById('dashboardToggle')

// Toggle dashboard visibility
dashboardToggle.addEventListener('click', () => {
  dashboardBottom.classList.toggle('minimized')

  // Save preference
  const isMinimized = dashboardBottom.classList.contains('minimized')
  localStorage.setItem('dashboardMinimized', isMinimized)
})

// Load saved preference
const savedMinimized = localStorage.getItem('dashboardMinimized')
if (savedMinimized === 'true') {
  dashboardBottom.classList.add('minimized')
}

console.log('Dashboard toggle loaded! Click the bar to minimize/expand 📊')
