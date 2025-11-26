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

// Load saved preference - default to minimized if no preference saved
const savedMinimized = localStorage.getItem('dashboardMinimized')
if (savedMinimized === 'true' || savedMinimized === null) {
  dashboardBottom.classList.add('minimized')
}

// Minimize chatbot by default
const chatbotContainer = document.getElementById('chatbotContainer')
if (chatbotContainer) {
  chatbotContainer.classList.add('minimized')
}

console.log('Dashboard toggle loaded! Click the bar to minimize/expand 📊')
