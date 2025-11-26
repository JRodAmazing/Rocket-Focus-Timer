// Dashboard Toggle Functionality
document.addEventListener('DOMContentLoaded', () => {
  console.log('🔍 Dashboard.js: DOM Content Loaded')

  const dashboardBottom = document.getElementById('dashboardBottom')
  const dashboardToggle = document.getElementById('dashboardToggle')

  console.log('Dashboard elements:', {dashboardBottom, dashboardToggle})

  // Toggle dashboard visibility
  if (dashboardToggle && dashboardBottom) {
    console.log('✅ Both elements found, attaching click listener...')

    dashboardToggle.addEventListener('click', (e) => {
      console.log('🖱️ Dashboard toggle clicked!')
      e.preventDefault()
      e.stopPropagation()

      dashboardBottom.classList.toggle('minimized')
      console.log('📊 Dashboard minimized:', dashboardBottom.classList.contains('minimized'))

      // Save preference
      const isMinimized = dashboardBottom.classList.contains('minimized')
      localStorage.setItem('dashboardMinimized', isMinimized)
    })
  } else {
    console.error('❌ Dashboard toggle elements not found!')
    console.error('dashboardBottom:', dashboardBottom)
    console.error('dashboardToggle:', dashboardToggle)
  }

  // Load saved preference - default to minimized if no preference saved
  const savedMinimized = localStorage.getItem('dashboardMinimized')
  console.log('💾 Saved minimized state:', savedMinimized)
  if (dashboardBottom && (savedMinimized === 'true' || savedMinimized === null)) {
    dashboardBottom.classList.add('minimized')
    console.log('✨ Dashboard set to minimized on load')
  }

  // Minimize chatbot by default
  const chatbotContainer = document.getElementById('chatbotContainer')
  if (chatbotContainer) {
    chatbotContainer.classList.add('minimized')
    console.log('💬 Chatbot minimized by default')
  }

  console.log('🚀 Dashboard toggle loaded! Click the bar to minimize/expand')
})
