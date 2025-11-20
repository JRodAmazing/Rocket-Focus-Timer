const minutesInput = document.getElementById('minutesInput')
const startBtn = document.getElementById('startBtn')
const pauseBtn = document.getElementById('pauseBtn')
const resetBtn = document.getElementById('resetBtn')
const abortBtn = document.getElementById('abortBtn')

const minutesTens = document.getElementById('minutesTens')
const minutesOnes = document.getElementById('minutesOnes')
const secondsTens = document.getElementById('secondsTens')
const secondsOnes = document.getElementById('secondsOnes')

const flapClock = document.getElementById('flapClock')
const rocketWrap = document.getElementById('rocketWrap')
const smoke = document.getElementById('smoke')
const trail = document.getElementById('trail')
const rocket = document.getElementById('rocket')
const modeIndicator = document.getElementById('modeIndicator')

// Stats elements
const totalSessionsEl = document.getElementById('totalSessions')
const totalMinutesEl = document.getElementById('totalMinutes')
const currentStreakEl = document.getElementById('currentStreak')
const achievementsEl = document.getElementById('achievements')
const achievementPopup = document.getElementById('achievementPopup')

let totalSeconds = parseInt(minutesInput.value || 25) * 60
let remaining = totalSeconds
let timerInterval = null
let running = false
let isPaused = false
let pauseTimeout = null
const PAUSE_LIMIT = 5 * 60 * 1000 // 5 minutes in ms

// Pomodoro state
let isBreakMode = false
let sessionsBeforeLongBreak = 0
const SHORT_BREAK = 5 * 60  // 5 minutes
const LONG_BREAK = 15 * 60  // 15 minutes

// Audio context
let audioContext = null

function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
}

function playTick() {
  initAudio()
  const osc = audioContext.createOscillator()
  const gain = audioContext.createGain()
  osc.connect(gain)
  gain.connect(audioContext.destination)
  osc.frequency.value = 800
  osc.type = 'sine'
  gain.gain.setValueAtTime(0.1, audioContext.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
  osc.start(audioContext.currentTime)
  osc.stop(audioContext.currentTime + 0.1)
}

function playLaunchSound() {
  initAudio()
  // Rising tone
  const osc = audioContext.createOscillator()
  const gain = audioContext.createGain()
  osc.connect(gain)
  gain.connect(audioContext.destination)
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(100, audioContext.currentTime)
  osc.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 1.5)
  gain.gain.setValueAtTime(0.15, audioContext.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2)
  osc.start(audioContext.currentTime)
  osc.stop(audioContext.currentTime + 2)
}

function playExplosionSound() {
  initAudio()
  // White noise burst
  const bufferSize = audioContext.sampleRate * 0.5
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }
  const noise = audioContext.createBufferSource()
  noise.buffer = buffer
  const gain = audioContext.createGain()
  const filter = audioContext.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 1000
  noise.connect(filter)
  filter.connect(gain)
  gain.connect(audioContext.destination)
  gain.gain.setValueAtTime(0.3, audioContext.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
  noise.start(audioContext.currentTime)
  noise.stop(audioContext.currentTime + 0.5)
}

function playCompletionSound() {
  initAudio()
  const notes = [523.25, 659.25, 783.99, 1046.50]
  notes.forEach((freq, i) => {
    const osc = audioContext.createOscillator()
    const gain = audioContext.createGain()
    osc.connect(gain)
    gain.connect(audioContext.destination)
    osc.type = 'square'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.1, audioContext.currentTime + i * 0.15)
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.3)
    osc.start(audioContext.currentTime + i * 0.15)
    osc.stop(audioContext.currentTime + i * 0.15 + 0.3)
  })
}

// Browser notifications
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

function sendNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '🚀' })
  }
}

// Session tracking
let stats = loadStats()

// Achievements definition
const achievements = [
  { id: 'first', icon: '🚀', name: 'First Launch', desc: 'Complete your first session', check: s => s.totalSessions >= 1 },
  { id: 'five', icon: '⭐', name: 'Rising Star', desc: 'Complete 5 sessions', check: s => s.totalSessions >= 5 },
  { id: 'ten', icon: '🌟', name: 'Focus Master', desc: 'Complete 10 sessions', check: s => s.totalSessions >= 10 },
  { id: 'twentyfive', icon: '💫', name: 'Dedicated', desc: 'Complete 25 sessions', check: s => s.totalSessions >= 25 },
  { id: 'hour', icon: '⏰', name: 'Hour Power', desc: 'Focus for 60 minutes total', check: s => s.totalMinutes >= 60 },
  { id: 'threehour', icon: '🏆', name: 'Marathon', desc: 'Focus for 180 minutes total', check: s => s.totalMinutes >= 180 },
  { id: 'streak3', icon: '🔥', name: 'On Fire', desc: '3 day streak', check: s => s.currentStreak >= 3 },
  { id: 'streak7', icon: '💪', name: 'Week Warrior', desc: '7 day streak', check: s => s.currentStreak >= 7 },
]

function loadStats() {
  const saved = localStorage.getItem('focusTimerStats')
  if (saved) {
    return JSON.parse(saved)
  }
  return {
    totalSessions: 0,
    totalMinutes: 0,
    currentStreak: 0,
    bestStreak: 0,
    lastSessionDate: null,
    earnedAchievements: []
  }
}

function saveStats() {
  localStorage.setItem('focusTimerStats', JSON.stringify(stats))
}

function updateStatsDisplay() {
  totalSessionsEl.textContent = stats.totalSessions
  totalMinutesEl.textContent = stats.totalMinutes
  currentStreakEl.textContent = stats.currentStreak
  renderAchievements()
}

function renderAchievements() {
  achievementsEl.innerHTML = ''
  achievements.forEach(ach => {
    const badge = document.createElement('div')
    badge.className = 'badge' + (stats.earnedAchievements.includes(ach.id) ? ' earned' : '')
    badge.textContent = ach.icon
    badge.title = ach.name + ': ' + ach.desc
    achievementsEl.appendChild(badge)
  })
}

function checkAchievements() {
  achievements.forEach(ach => {
    if (!stats.earnedAchievements.includes(ach.id) && ach.check(stats)) {
      stats.earnedAchievements.push(ach.id)
      showAchievementPopup(ach)
    }
  })
  saveStats()
  renderAchievements()
}

function showAchievementPopup(ach) {
  achievementPopup.innerHTML = ach.icon + ' ' + ach.name + ' unlocked!'
  achievementPopup.classList.add('show')
  setTimeout(() => {
    achievementPopup.classList.remove('show')
  }, 3000)
}

function updateStreak() {
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()

  if (stats.lastSessionDate === today) {
    return
  } else if (stats.lastSessionDate === yesterday) {
    stats.currentStreak++
  } else if (stats.lastSessionDate === null) {
    stats.currentStreak = 1
  } else {
    stats.currentStreak = 1
  }

  if (stats.currentStreak > stats.bestStreak) {
    stats.bestStreak = stats.currentStreak
  }

  stats.lastSessionDate = today
}

function completeSession() {
  const sessionMinutes = Math.ceil(totalSeconds / 60)
  stats.totalSessions++
  stats.totalMinutes += sessionMinutes
  updateStreak()
  saveStats()
  updateStatsDisplay()
  checkAchievements()
}

function formatNum(n){return String(n).padStart(2,'0')}

function updateDigits(secondsLeft){
  const m = Math.floor(secondsLeft/60)
  const s = secondsLeft%60
  const [mT,mO] = formatNum(m).split('')
  const [sT,sO] = formatNum(s).split('')
  setFlap(minutesTens,mT)
  setFlap(minutesOnes,mO)
  setFlap(secondsTens,sT)
  setFlap(secondsOnes,sO)
}

function setFlap(el, value){
  const card = el.querySelector('.card')
  const top = card.querySelector('.face.top')
  const bottom = card.querySelector('.face.bottom')
  const current = top.textContent
  if(current === value || card.classList.contains('flipping')) return
  bottom.textContent = value
  card.classList.remove('flipping')
  void card.offsetWidth
  card.classList.add('flipping')
  function onAnim(e){
    if(e.animationName && (e.animationName === 'unfoldBottom')){
      top.textContent = value
      bottom.textContent = value
      card.classList.remove('flipping')
      card.removeEventListener('animationend', onAnim)
    }
  }
  card.addEventListener('animationend', onAnim)
}

function setMilestones(secondsLeft){
  const body = document.body
  body.classList.remove('final-60')
  flapClock.classList.remove('milestone-warn','milestone-urgent')
  if(secondsLeft <= 60 && secondsLeft>0){
    body.classList.add('final-60')
  }
  if(secondsLeft <= 30 && secondsLeft>10){
    flapClock.classList.add('milestone-warn')
  }
  if(secondsLeft <= 10 && secondsLeft>0){
    flapClock.classList.add('milestone-urgent')
  }
}

// Progressive rocket animation
function updateRocketProgress() {
  if (isBreakMode) return

  const progress = 1 - (remaining / totalSeconds)
  const maxRise = 80
  const rise = progress * maxRise

  rocketWrap.style.transform = `translateY(-${rise}px)`

  const flames = rocket.querySelectorAll('.flame')
  const baseOpacity = Math.min(progress * 1.5, 1)
  flames.forEach((flame, i) => {
    flame.style.opacity = baseOpacity * (0.6 + Math.random() * 0.4)
  })

  if (progress > 0.3 && Math.random() < progress * 0.3) {
    addSmokeParticle()
  }
}

function addSmokeParticle() {
  const puff = document.createElement('div')
  puff.className = 'puff'
  const size = 10 + Math.random() * 20
  puff.style.width = size + 'px'
  puff.style.height = size + 'px'
  puff.style.left = (30 + Math.random() * 40) + 'px'
  puff.style.bottom = '0px'
  puff.style.opacity = '0.6'
  puff.style.animation = 'smoke-drift 2s forwards'
  smoke.appendChild(puff)
  setTimeout(() => puff.remove(), 2000)
}

// Explosion effect
function createExplosion() {
  const container = document.createElement('div')
  container.className = 'explosion'

  const colors = ['#ff4500', '#ff8c00', '#ffd700', '#ff6347', '#fff']

  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div')
    particle.className = 'explosion-particle'
    const size = 8 + Math.random() * 16
    particle.style.width = size + 'px'
    particle.style.height = size + 'px'
    particle.style.background = colors[Math.floor(Math.random() * colors.length)]

    const angle = (Math.PI * 2 * i) / 30
    const distance = 80 + Math.random() * 120
    particle.style.setProperty('--tx', Math.cos(angle) * distance + 'px')
    particle.style.setProperty('--ty', Math.sin(angle) * distance + 'px')

    container.appendChild(particle)
  }

  rocketWrap.appendChild(container)
  playExplosionSound()

  setTimeout(() => container.remove(), 1000)
}

function explodeRocket() {
  document.body.classList.add('exploding')
  createExplosion()

  setTimeout(() => {
    document.body.classList.remove('exploding')
    rocket.style.opacity = '1'
    rocket.style.transform = 'scale(1)'
  }, 1500)
}

// Mode switching
function setFocusMode() {
  isBreakMode = false
  document.body.classList.remove('break-mode')
  modeIndicator.className = 'mode-indicator focus'
  modeIndicator.textContent = '🎯 FOCUS'
  totalSeconds = parseInt(minutesInput.value || 25) * 60
  remaining = totalSeconds
  updateDigits(remaining)
  minutesInput.disabled = false
}

function setBreakMode() {
  isBreakMode = true
  document.body.classList.add('break-mode')
  document.body.classList.remove('launching')
  modeIndicator.className = 'mode-indicator break'
  modeIndicator.textContent = '☕ BREAK'

  // Determine break length
  sessionsBeforeLongBreak++
  if (sessionsBeforeLongBreak >= 4) {
    totalSeconds = LONG_BREAK
    sessionsBeforeLongBreak = 0
    modeIndicator.textContent = '☕ LONG BREAK'
  } else {
    totalSeconds = SHORT_BREAK
  }

  remaining = totalSeconds
  updateDigits(remaining)
  minutesInput.disabled = true

  // Reset rocket visibility and position for descent
  rocket.style.opacity = '1'
  rocket.style.transform = 'scale(1)'
  rocketWrap.style.transform = 'translateY(-1100px)'

  // Rocket descends back down
  setTimeout(() => {
    document.body.classList.add('descending')
  }, 100)

  setTimeout(() => {
    document.body.classList.remove('descending')
    rocketWrap.style.transform = 'translateY(0)'
  }, 3100)
}

function tick(){
  if(remaining<=0){
    stopTimer()

    if (isBreakMode) {
      // Break ended - big explosion to signal work time!
      sendNotification('Break Over!', 'Time to get back to work! 💪')

      // Make sure rocket is visible before exploding
      rocket.style.opacity = '1'
      rocket.style.transform = 'scale(1)'
      rocketWrap.style.transform = 'translateY(0)'

      // Create bigger explosion
      setTimeout(() => {
        explodeRocket()
        playCompletionSound() // Alert sound
      }, 200)

      setTimeout(() => {
        setFocusMode()
        clearVisuals()
      }, 2000)
    } else {
      // Focus ended - launch and start break
      completeSession()
      playCompletionSound()
      beginLaunch()
      sendNotification('Focus Complete!', 'Great work! Time for a break. 🚀')
      setTimeout(() => {
        setBreakMode()
        startTimer()
      }, 4000)
    }
    return
  }

  remaining--
  updateDigits(remaining)
  setMilestones(remaining)

  if (!isBreakMode) {
    updateRocketProgress()
  }

  // Tick sound and notification at 30 seconds
  if (remaining <= 30 && remaining > 0) {
    playTick()

    if (remaining === 30) {
      if (isBreakMode) {
        sendNotification('30 Seconds Left!', 'Break ending soon - prepare to focus!')
      } else {
        sendNotification('30 Seconds Left!', 'Almost there! Keep going!')
      }
    }
  }
}

function startTimer(){
  if(running) return
  initAudio()
  requestNotificationPermission()
  running=true
  isPaused=false
  startBtn.disabled=true
  pauseBtn.disabled=false
  abortBtn.disabled=false
  if (!isBreakMode) {
    minutesInput.disabled=true
  }

  // Clear any pause timeout
  if (pauseTimeout) {
    clearTimeout(pauseTimeout)
    pauseTimeout = null
  }

  timerInterval = setInterval(tick,1000)
}

function stopTimer(){
  running=false
  startBtn.disabled=false
  pauseBtn.disabled=true
  abortBtn.disabled=true
  if (!isBreakMode) {
    minutesInput.disabled=false
  }
  if(timerInterval) clearInterval(timerInterval)

  // Clear pause timeout
  if (pauseTimeout) {
    clearTimeout(pauseTimeout)
    pauseTimeout = null
  }
}

function abortMission() {
  // Clear any intervals/timeouts
  if (timerInterval) clearInterval(timerInterval)
  if (pauseTimeout) clearTimeout(pauseTimeout)

  running = false
  isPaused = false

  // Explode the rocket
  sendNotification('Mission Aborted!', 'The rocket has been destroyed! 💥')
  explodeRocket()

  setTimeout(() => {
    if (isBreakMode) {
      setFocusMode()
    }
    totalSeconds = parseInt(minutesInput.value||25)*60
    remaining = totalSeconds
    updateDigits(remaining)
    clearVisuals()

    startBtn.disabled = false
    pauseBtn.disabled = true
    abortBtn.disabled = true
    minutesInput.disabled = false
  }, 1500)
}

function resetTimer(){
  const wasRunning = running
  stopTimer()

  // If focus timer was running and reset, explode the rocket
  if (wasRunning && !isBreakMode && remaining < totalSeconds) {
    explodeRocket()
  }

  if (isBreakMode) {
    setFocusMode()
  }

  totalSeconds = parseInt(minutesInput.value||25)*60
  remaining = totalSeconds
  updateDigits(remaining)

  setTimeout(() => {
    clearVisuals()
  }, wasRunning ? 1500 : 0)
}

function clearVisuals(){
  document.body.classList.remove('final-60','launching','descending','exploding')
  smoke.innerHTML = ''
  trail.innerHTML = ''
  rocketWrap.style.transform = 'translateY(0)'
  rocket.style.opacity = '1'
  rocket.style.transform = 'scale(1)'
  const flames = rocket.querySelectorAll('.flame')
  flames.forEach(flame => flame.style.opacity = '0')
}

function beginLaunch(){
  document.body.classList.add('launching')
  playLaunchSound()
  createSmokeBurst()
  setTimeout(()=>{
    document.body.classList.remove('final-60')
  },3800)
}

function createSmokeBurst(){
  smoke.innerHTML = ''
  const count = 10
  for(let i=0;i<count;i++){
    const s = document.createElement('div')
    s.className = 'puff'
    const size = 18 + Math.round(Math.random()*36)
    s.style.bottom = (10 + Math.round(Math.random()*8)) + 'px'
    s.style.left = (20 + i*6 + Math.round(Math.random()*8)) + 'px'
    s.style.width = size + 'px'
    s.style.height = size + 'px'
    s.style.opacity = 0.95 - Math.random()*0.3
    s.style.animation = 'smoke-blast ' + (2.2 + Math.random()*1.4) + 's forwards'
    smoke.appendChild(s)
  }
  trail.innerHTML = ''
  for(let t=0;t<12;t++){
    const p = document.createElement('div')
    p.className = 'particle'
    p.style.bottom = (t*18) + 'px'
    p.style.opacity = (1 - t/16) * 0.9
    p.style.transform = 'translateX(-50%) scale(' + (1 - t*0.05) + ')'
    trail.appendChild(p)
  }
}

startBtn.addEventListener('click',()=>{
  if(!running){
    if(remaining<=0){
      if (isBreakMode) {
        setFocusMode()
      }
      resetTimer()
    }
    startTimer()
  }
})

pauseBtn.addEventListener('click',()=>{
  if(running){
    clearInterval(timerInterval)
    running=false
    isPaused=true
    startBtn.disabled=false
    pauseBtn.disabled=true

    // Start 5 minute pause timeout
    pauseTimeout = setTimeout(() => {
      if (isPaused && remaining < totalSeconds) {
        sendNotification('Pause Timeout!', 'You paused too long - mission aborted! 💥')
        abortMission()
      }
    }, PAUSE_LIMIT)
  }
})

resetBtn.addEventListener('click',()=>{resetTimer()})

abortBtn.addEventListener('click',()=>{
  if (remaining < totalSeconds || running || isPaused) {
    abortMission()
  }
})

minutesInput.addEventListener('change',()=>{
  if (!isBreakMode) {
    totalSeconds = parseInt(minutesInput.value||25)*60
    remaining = totalSeconds
    updateDigits(remaining)
  }
})

// Initialize
resetTimer()
updateStatsDisplay()
requestNotificationPermission()
