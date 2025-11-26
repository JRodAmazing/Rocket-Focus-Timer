// ===================================
// ROCKET FOCUS - DAILY BRIEFING, PROFILE, GAMES & SUMMARY
// ===================================

// ===== DAILY BRIEFING SYSTEM =====
const dailyBriefingModal = document.getElementById('dailyBriefingModal')
const briefingClose = document.getElementById('briefingClose')
const startDayBtn = document.getElementById('startDayBtn')
const briefingGreeting = document.getElementById('briefingGreeting')
const dailyJoke = document.getElementById('dailyJoke')
const newsBrief = document.getElementById('newsBrief')
const frogTask = document.getElementById('frogTask')
const topThreeTasks = document.getElementById('topThreeTasks')

// Office-appropriate jokes collection
const DAILY_JOKES = [
  "Why did the developer go broke? Because he used up all his cache!",
  "I told my computer I needed a break, and now it won't stop sending me Kit-Kats.",
  "Why do programmers prefer dark mode? Because light attracts bugs!",
  "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
  "Why did the JavaScript developer wear glasses? Because they couldn't C#!",
  "I would tell you a UDP joke, but you might not get it.",
  "Why did the function break up with the variable? It had too many arguments!",
  "What's a programmer's favorite place to hang out? The Foo Bar!",
  "Why don't programmers like nature? It has too many bugs.",
  "A SQL query walks into a bar, walks up to two tables and asks, 'Can I join you?'",
  "Why did the developer quit their job? They didn't get arrays!",
  "I have a joke about REST APIs, but I'll have to GET it first.",
  "What do you call 8 hobbits? A hobbyte!",
  "Why did the robot go on vacation? To recharge its batteries!",
  "What's the object-oriented way to become wealthy? Inheritance.",
  "Why did the PowerPoint presentation cross the road? To get to the other slide!",
  "Why was the JavaScript reality show cancelled? No one could follow the promises.",
  "I'm reading a book on anti-gravity. It's impossible to put down!",
  "Why did the scarecrow become a successful manager? He was outstanding in his field!",
  "What do you call a factory that makes okay products? A satisfactory!"
]

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning, J.Rod! 🚀'
  if (hour < 18) return 'Good afternoon, J.Rod! 🚀'
  return 'Good evening, J.Rod! 🚀'
}

function getDailyJoke() {
  const today = new Date().toDateString()
  const lastJokeDate = localStorage.getItem('lastJokeDate')

  if (lastJokeDate === today) {
    return localStorage.getItem('todayJoke') || DAILY_JOKES[0]
  }

  const randomJoke = DAILY_JOKES[Math.floor(Math.random() * DAILY_JOKES.length)]
  localStorage.setItem('lastJokeDate', today)
  localStorage.setItem('todayJoke', randomJoke)

  return randomJoke
}

async function fetchDailyNews() {
  // Fallback news items (used when no API key or API fails)
  const fallbackNews = [
    {
      title: "AI & Tech News",
      description: "Stay focused on your work today! Remember to check tech news sites during your breaks."
    },
    {
      title: "Productivity Tip",
      description: "Tackle your biggest task first (Eat The Frog) to maximize your morning energy!"
    }
  ]

  return fallbackNews
}

async function showDailyBriefing() {
  // Set greeting
  briefingGreeting.textContent = getGreeting()

  // Set daily joke
  dailyJoke.textContent = getDailyJoke()

  // Fetch news
  const news = await fetchDailyNews()
  newsBrief.innerHTML = news.map(item => `
    <div class="news-item">
      <h4>${item.title}</h4>
      <p>${item.description}</p>
    </div>
  `).join('')

  // Show frog task
  if (window.getEatTheFrogTask) {
    const frog = window.getEatTheFrogTask()
    if (frog) {
      frogTask.innerHTML = `
        <div class="frog-preview">
          <strong>🐸 ${frog.title}</strong>
          <p>${frog.description || 'Your biggest priority task'}</p>
        </div>
      `
    } else {
      frogTask.textContent = 'No frog task today. Add tasks to get started!'
    }
  }

  // Show top 3 Eisenhower tasks
  if (window.getEisenhowerQuadrants) {
    const quadrants = window.getEisenhowerQuadrants()
    const urgentImportant = quadrants.urgentImportant.slice(0, 3)

    if (urgentImportant.length > 0) {
      topThreeTasks.innerHTML = urgentImportant.map((task, i) => `
        <div class="brief-task">
          <span class="task-number">${i + 1}</span>
          <span class="task-name">${task.title}</span>
        </div>
      `).join('')
    } else {
      // Show next important tasks
      const important = quadrants.notUrgentImportant.slice(0, 3)
      if (important.length > 0) {
        topThreeTasks.innerHTML = important.map((task, i) => `
          <div class="brief-task">
            <span class="task-number">${i + 1}</span>
            <span class="task-name">${task.title}</span>
          </div>
        `).join('')
      } else {
        topThreeTasks.textContent = 'No prioritized tasks yet. Add some tasks!'
      }
    }
  }

  dailyBriefingModal.classList.add('active')
}

function checkFirstLoginOfDay() {
  const today = new Date().toDateString()
  const lastLogin = localStorage.getItem('lastLoginDate')

  if (lastLogin !== today) {
    localStorage.setItem('lastLoginDate', today)
    // Show briefing after 500ms to let page load
    setTimeout(() => showDailyBriefing(), 500)
  }
}

briefingClose.addEventListener('click', () => {
  dailyBriefingModal.classList.remove('active')
})

startDayBtn.addEventListener('click', () => {
  dailyBriefingModal.classList.remove('active')
})

dailyBriefingModal.addEventListener('click', (e) => {
  if (e.target === dailyBriefingModal) {
    dailyBriefingModal.classList.remove('active')
  }
})

// ===== PROFILE DASHBOARD =====
const profileBtn = document.getElementById('profileBtn')
const profileModal = document.getElementById('profileModal')
const profileClose = document.getElementById('profileClose')

function showProfileDashboard() {
  // Update profile stats
  if (window.userXP !== undefined && window.userLevel !== undefined) {
    document.getElementById('userLevel').textContent = window.userLevel
    document.getElementById('userXP').textContent = window.userXP
  }

  if (window.getGameStats) {
    const gameStats = window.getGameStats()
    document.getElementById('profileTotalTasks').textContent = gameStats.tasksCompleted
    document.getElementById('profileFrogsSlain').textContent = gameStats.frogsSlain
    document.getElementById('profileBestStreak').textContent = gameStats.bestStreak

    if (gameStats.fastestTask > 0) {
      document.getElementById('profileFastestTask').textContent = gameStats.fastestTask + ' min'
    } else {
      document.getElementById('profileFastestTask').textContent = '--'
    }
  }

  // Render badges
  const badgesDisplay = document.getElementById('badgesDisplay')
  if (window.BADGES && window.stats) {
    badgesDisplay.innerHTML = window.BADGES.map(badge => {
      const earned = window.stats.earnedAchievements.includes(badge.id)
      return `
        <div class="profile-badge ${earned ? 'earned' : ''}">
          <div class="badge-icon">${badge.icon}</div>
          <div class="badge-name">${badge.name}</div>
          <div class="badge-desc">${badge.desc}</div>
        </div>
      `
    }).join('')
  }

  profileModal.classList.add('active')
}

profileBtn?.addEventListener('click', () => {
  showProfileDashboard()
})

profileClose?.addEventListener('click', () => {
  profileModal.classList.remove('active')
})

profileModal?.addEventListener('click', (e) => {
  if (e.target === profileModal) {
    profileModal.classList.remove('active')
  }
})

// ===== BREAK GAMES SYSTEM =====
const breakGamesModal = document.getElementById('breakGamesModal')
const gamesClose = document.getElementById('gamesClose')
const gameMenu = document.getElementById('gameMenu')
const gameContainer = document.getElementById('gameContainer')
const gameCanvas = document.getElementById('gameCanvas')
const backToMenuBtn = document.getElementById('backToMenuBtn')

let currentGame = null

// Show games modal automatically during break mode
function showBreakGames() {
  breakGamesModal.classList.add('active')
  gameMenu.style.display = 'grid'
  gameContainer.style.display = 'none'
}

// Game option click handlers
document.querySelectorAll('.game-option').forEach(btn => {
  btn.addEventListener('click', () => {
    const gameName = btn.dataset.game
    startGame(gameName)
  })
})

function startGame(gameName) {
  currentGame = gameName
  gameMenu.style.display = 'none'
  gameContainer.style.display = 'block'

  switch(gameName) {
    case 'trivia':
      loadTriviaGame()
      break
    case 'pong':
      loadPongGame()
      break
    case 'rocket':
      loadRocketGame()
      break
    case 'memory':
      loadMemoryGame()
      break
  }
}

// AI Trivia Game
const TRIVIA_QUESTIONS = [
  {
    question: "What does AI stand for?",
    options: ["Artificial Intelligence", "Automated Input", "Advanced Integration", "Analog Interface"],
    correct: 0
  },
  {
    question: "Which company developed ChatGPT?",
    options: ["Google", "Meta", "OpenAI", "Microsoft"],
    correct: 2
  },
  {
    question: "What is a neural network inspired by?",
    options: ["Computer circuits", "The human brain", "Plant roots", "River networks"],
    correct: 1
  },
  {
    question: "What does GPU stand for?",
    options: ["General Processing Unit", "Graphics Processing Unit", "Grid Power Unit", "Global Performance Utility"],
    correct: 1
  },
  {
    question: "Which programming language is most commonly used for AI?",
    options: ["JavaScript", "Python", "C++", "Java"],
    correct: 1
  }
]

let triviaScore = 0
let triviaCurrentQuestion = 0

function loadTriviaGame() {
  triviaScore = 0
  triviaCurrentQuestion = 0
  showTriviaQuestion()
}

function showTriviaQuestion() {
  if (triviaCurrentQuestion >= TRIVIA_QUESTIONS.length) {
    showTriviaResults()
    return
  }

  const q = TRIVIA_QUESTIONS[triviaCurrentQuestion]
  gameCanvas.innerHTML = `
    <div class="trivia-game">
      <h3>Question ${triviaCurrentQuestion + 1}/${TRIVIA_QUESTIONS.length}</h3>
      <p class="trivia-question">${q.question}</p>
      <div class="trivia-options">
        ${q.options.map((opt, i) => `
          <button class="trivia-option" data-index="${i}">${opt}</button>
        `).join('')}
      </div>
      <div class="trivia-score">Score: ${triviaScore}</div>
    </div>
  `

  document.querySelectorAll('.trivia-option').forEach(btn => {
    btn.addEventListener('click', () => {
      handleTriviaAnswer(parseInt(btn.dataset.index))
    })
  })
}

function handleTriviaAnswer(selectedIndex) {
  const q = TRIVIA_QUESTIONS[triviaCurrentQuestion]
  const correct = selectedIndex === q.correct

  if (correct) {
    triviaScore += 10
    if (window.awardXP) {
      window.awardXP(2, 'Trivia answer correct!')
    }
  }

  // Show feedback
  gameCanvas.innerHTML += `
    <div class="trivia-feedback ${correct ? 'correct' : 'wrong'}">
      ${correct ? '✅ Correct!' : '❌ Wrong! The answer was: ' + q.options[q.correct]}
    </div>
  `

  setTimeout(() => {
    triviaCurrentQuestion++
    showTriviaQuestion()
  }, 2000)
}

function showTriviaResults() {
  gameCanvas.innerHTML = `
    <div class="trivia-results">
      <h2>🎉 Trivia Complete!</h2>
      <div class="final-score">Final Score: ${triviaScore}/${TRIVIA_QUESTIONS.length * 10}</div>
      <p>${triviaScore >= 30 ? 'Great job!' : 'Good effort! Try again next break!'}</p>
    </div>
  `

  if (window.awardXP) {
    window.awardXP(5, 'Completed trivia!')
  }
}

// Simple Pong Game
function loadPongGame() {
  gameCanvas.innerHTML = `
    <div class="pong-game">
      <canvas id="pongCanvas" width="600" height="400"></canvas>
      <div class="pong-controls">Use ↑ ↓ arrows to move paddle</div>
    </div>
  `

  const canvas = document.getElementById('pongCanvas')
  const ctx = canvas.getContext('2d')

  const paddle = { x: 10, y: 150, width: 10, height: 80, dy: 0 }
  const ball = { x: 300, y: 200, radius: 8, dx: 3, dy: 3 }
  const aiPaddle = { x: 580, y: 150, width: 10, height: 80 }
  let score = 0

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') paddle.dy = -5
    if (e.key === 'ArrowDown') paddle.dy = 5
  })

  document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') paddle.dy = 0
  })

  function updatePong() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Update paddle
    paddle.y += paddle.dy
    if (paddle.y < 0) paddle.y = 0
    if (paddle.y + paddle.height > canvas.height) paddle.y = canvas.height - paddle.height

    // Update ball
    ball.x += ball.dx
    ball.y += ball.dy

    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
      ball.dy *= -1
    }

    // Paddle collision
    if (ball.x - ball.radius < paddle.x + paddle.width &&
        ball.y > paddle.y && ball.y < paddle.y + paddle.height) {
      ball.dx *= -1
      score++
    }

    // AI paddle
    aiPaddle.y = ball.y - aiPaddle.height / 2
    if (ball.x + ball.radius > aiPaddle.x &&
        ball.y > aiPaddle.y && ball.y < aiPaddle.y + aiPaddle.height) {
      ball.dx *= -1
    }

    // Reset if missed
    if (ball.x < 0 || ball.x > canvas.width) {
      ball.x = 300
      ball.y = 200
      ball.dx = 3 * (Math.random() > 0.5 ? 1 : -1)
      ball.dy = 3 * (Math.random() > 0.5 ? 1 : -1)
    }

    // Draw
    ctx.fillStyle = '#fff'
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height)
    ctx.fillRect(aiPaddle.x, aiPaddle.y, aiPaddle.width, aiPaddle.height)
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
    ctx.fill()

    ctx.font = '20px Arial'
    ctx.fillText('Score: ' + score, 10, 30)

    requestAnimationFrame(updatePong)
  }

  updatePong()
}

// Rocket Landing Game
function loadRocketGame() {
  gameCanvas.innerHTML = `
    <div class="rocket-landing-game">
      <h3>🚀 Land the Rocket Safely!</h3>
      <p>Use ← → to steer, ↑ to thrust</p>
      <canvas id="rocketCanvas" width="400" height="500"></canvas>
    </div>
  `

  // Simple rocket landing mechanics would go here
  // For now, placeholder
  setTimeout(() => {
    gameCanvas.innerHTML += '<p class="game-message">Rocket Landing coming soon! 🚀</p>'
  }, 1000)
}

// Memory Match Game
function loadMemoryGame() {
  const symbols = ['🚀', '🎯', '💡', '⭐', '🔥', '💪', '🏆', '🎨']
  const cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5)
  let flipped = []
  let matched = []

  gameCanvas.innerHTML = `
    <div class="memory-game">
      <h3>🃏 Memory Match</h3>
      <div class="memory-grid">
        ${cards.map((symbol, i) => `
          <div class="memory-card" data-index="${i}" data-symbol="${symbol}">
            <div class="card-front">?</div>
            <div class="card-back">${symbol}</div>
          </div>
        `).join('')}
      </div>
      <div class="memory-score">Matched: <span id="memoryMatched">0</span>/8</div>
    </div>
  `

  document.querySelectorAll('.memory-card').forEach(card => {
    card.addEventListener('click', () => {
      if (flipped.length < 2 && !card.classList.contains('flipped')) {
        card.classList.add('flipped')
        flipped.push(card)

        if (flipped.length === 2) {
          setTimeout(() => {
            const [card1, card2] = flipped
            if (card1.dataset.symbol === card2.dataset.symbol) {
              card1.classList.add('matched')
              card2.classList.add('matched')
              matched.push(card1, card2)
              document.getElementById('memoryMatched').textContent = matched.length / 2

              if (matched.length === 16) {
                setTimeout(() => {
                  gameCanvas.innerHTML = '<div class="game-win">🎉 You Win! Great memory!</div>'
                  if (window.awardXP) window.awardXP(10, 'Memory Match complete!')
                }, 500)
              }
            } else {
              card1.classList.remove('flipped')
              card2.classList.remove('flipped')
            }
            flipped = []
          }, 800)
        }
      }
    })
  })
}

backToMenuBtn.addEventListener('click', () => {
  currentGame = null
  gameMenu.style.display = 'grid'
  gameContainer.style.display = 'none'
  gameCanvas.innerHTML = ''
})

gamesClose.addEventListener('click', () => {
  breakGamesModal.classList.remove('active')
  currentGame = null
})

breakGamesModal.addEventListener('click', (e) => {
  if (e.target === breakGamesModal) {
    breakGamesModal.classList.remove('active')
  }
})

// ===== END OF DAY SUMMARY =====
const endOfDayModal = document.getElementById('endOfDayModal')
const summaryClose = document.getElementById('summaryClose')
const closeSummaryBtn = document.getElementById('closeSummaryBtn')

function showEndOfDaySummary() {
  if (!window.getGameStats || !window.getEatTheFrogTask) return

  const gameStats = getGameStats()
  const frog = getEatTheFrogTask()
  const frogConquered = frog ? (frog.status === 'done') : false

  document.getElementById('summaryTasksCompleted').textContent = gameStats.tasksCompletedToday
  document.getElementById('summaryFrogConquered').textContent = frogConquered ? 'Yes! 🐸' : 'No'

  // Calculate XP gained today (rough estimate)
  const xpGainedToday = gameStats.tasksCompletedToday * 15
  document.getElementById('summaryXPGained').textContent = xpGainedToday

  document.getElementById('summaryStreak').textContent = gameStats.currentStreak

  // Show badges earned today
  const summaryBadges = document.getElementById('summaryBadges')
  const todayBadges = window.stats?.earnedAchievements?.slice(-3) || []

  if (todayBadges.length > 0 && window.BADGES) {
    summaryBadges.innerHTML = todayBadges.map(badgeId => {
      const badge = window.BADGES.find(b => b.id === badgeId)
      return badge ? `<span class="summary-badge">${badge.icon} ${badge.name}</span>` : ''
    }).join('')
  } else {
    summaryBadges.textContent = 'No new badges today. Keep grinding! 💪'
  }

  endOfDayModal.classList.add('active')
}

summaryClose.addEventListener('click', () => {
  endOfDayModal.classList.remove('active')
})

closeSummaryBtn.addEventListener('click', () => {
  endOfDayModal.classList.remove('active')
})

endOfDayModal.addEventListener('click', (e) => {
  if (e.target === endOfDayModal) {
    endOfDayModal.classList.remove('active')
  }
})

// Add end of day button to dashboard (optional manual trigger)
window.showEndOfDaySummary = showEndOfDaySummary

// ===== INITIALIZATION =====
// Check for first login on page load
checkFirstLoginOfDay()

// Auto-show games during break mode
if (window.addEventListener) {
  // Listen for break mode changes
  document.addEventListener('breakModeStarted', () => {
    // showBreakGames() // Uncomment to auto-show games
  })
}

console.log('📰 Daily Briefing, Profile, Games & Summary System Loaded!')
