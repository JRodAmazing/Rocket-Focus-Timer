// Notepad and Music Player Features

// Modal Elements
const notepadModal = document.getElementById('notepadModal')
const notepadBtn = document.getElementById('notepadBtn')
const notepadClose = document.getElementById('notepadClose')
const notepadText = document.getElementById('notepadText')
const copyNotesBtn = document.getElementById('copyNotesBtn')
const downloadNotesBtn = document.getElementById('downloadNotesBtn')
const clearNotesBtn = document.getElementById('clearNotesBtn')

const musicModal = document.getElementById('musicModal')
const musicBtn = document.getElementById('musicBtn')
const musicClose = document.getElementById('musicClose')
const trackName = document.getElementById('trackName')
const playPauseBtn = document.getElementById('playPauseBtn')
const stopBtn = document.getElementById('stopBtn')
const volumeSlider = document.getElementById('volumeSlider')
const trackBtns = document.querySelectorAll('.track-btn')

// ==================== NOTEPAD FUNCTIONALITY ====================

// Open notepad
notepadBtn.addEventListener('click', () => {
  notepadModal.classList.add('active')
  notepadText.focus()
})

// Close notepad
notepadClose.addEventListener('click', () => {
  notepadModal.classList.remove('active')
})

// Close modal when clicking outside
notepadModal.addEventListener('click', (e) => {
  if (e.target === notepadModal) {
    notepadModal.classList.remove('active')
  }
})

// Copy notes to clipboard
copyNotesBtn.addEventListener('click', async () => {
  const text = notepadText.value
  if (!text) {
    showNotification('Nothing to copy!', 'Add some notes first.')
    return
  }

  try {
    await navigator.clipboard.writeText(text)
    showNotification('Copied!', 'Notes copied to clipboard. 📋')
    // Temporarily change button text
    const originalText = copyNotesBtn.textContent
    copyNotesBtn.textContent = '✓ Copied!'
    setTimeout(() => {
      copyNotesBtn.textContent = originalText
    }, 2000)
  } catch (err) {
    showNotification('Copy Failed', 'Could not copy to clipboard.')
  }
})

// Download notes as text file
downloadNotesBtn.addEventListener('click', () => {
  const text = notepadText.value
  if (!text) {
    showNotification('Nothing to download!', 'Add some notes first.')
    return
  }

  // Create a blob with the text content
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)

  // Create download link
  const link = document.createElement('a')
  link.href = url
  link.download = `focus-notes-${new Date().toISOString().split('T')[0]}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  showNotification('Downloaded!', 'Notes saved to your computer. 💾')
})

// Clear notes
clearNotesBtn.addEventListener('click', () => {
  if (!notepadText.value) return

  if (confirm('Clear all notes? This cannot be undone.')) {
    notepadText.value = ''
    showNotification('Cleared!', 'Notes have been cleared.')
  }
})

// ==================== MUSIC PLAYER FUNCTIONALITY ====================

// Audio Context for music generation
let musicContext = null
let currentTrack = null
let isPlaying = false
let audioNodes = {}

// Initialize audio context
function initMusicContext() {
  if (!musicContext) {
    musicContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  return musicContext
}

// Track definitions
const tracks = {
  lofi: { name: '🎧 Lo-fi Beats' },
  rain: { name: '🌧️ Rain Sounds' },
  cafe: { name: '☕ Café Ambience' },
  forest: { name: '🌲 Forest Sounds' },
  waves: { name: '🌊 Ocean Waves' },
  fire: { name: '🔥 Fireplace' }
}

// Procedural audio generators for each track type
function createRainSound(ctx) {
  // White noise for rain
  const bufferSize = ctx.sampleRate * 2
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }

  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  noise.loop = true

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 1000

  const gainNode = ctx.createGain()
  gainNode.gain.value = 0.3

  noise.connect(filter)
  filter.connect(gainNode)

  return { sources: [noise], gain: gainNode }
}

function createWavesSound(ctx) {
  // Oscillating filtered noise for waves
  const bufferSize = ctx.sampleRate * 2
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }

  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  noise.loop = true

  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 400
  filter.Q.value = 1

  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.2
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 300

  lfo.connect(lfoGain)
  lfoGain.connect(filter.frequency)

  const gainNode = ctx.createGain()
  gainNode.gain.value = 0.4

  noise.connect(filter)
  filter.connect(gainNode)

  lfo.start()

  return { sources: [noise, lfo], gain: gainNode }
}

function createFireSound(ctx) {
  // Crackling fire with filtered noise
  const bufferSize = ctx.sampleRate * 2
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < bufferSize; i++) {
    // Brown noise for fire
    data[i] = (Math.random() * 2 - 1) * 0.5
  }

  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  noise.loop = true

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 600

  const gainNode = ctx.createGain()
  gainNode.gain.value = 0.35

  noise.connect(filter)
  filter.connect(gainNode)

  return { sources: [noise], gain: gainNode }
}

function createForestSound(ctx) {
  // Gentle filtered noise for forest ambience
  const bufferSize = ctx.sampleRate * 2
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.3
  }

  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  noise.loop = true

  const filter = ctx.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = 800

  const filter2 = ctx.createBiquadFilter()
  filter2.type = 'lowpass'
  filter2.frequency.value = 3000

  const gainNode = ctx.createGain()
  gainNode.gain.value = 0.25

  noise.connect(filter)
  filter.connect(filter2)
  filter2.connect(gainNode)

  return { sources: [noise], gain: gainNode }
}

function createCafeSound(ctx) {
  // Brown noise for café ambience
  const bufferSize = ctx.sampleRate * 2
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  let lastOut = 0
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1
    data[i] = (lastOut + (0.02 * white)) / 1.02
    lastOut = data[i]
    data[i] *= 3.5
  }

  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  noise.loop = true

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 1200

  const gainNode = ctx.createGain()
  gainNode.gain.value = 0.3

  noise.connect(filter)
  filter.connect(gainNode)

  return { sources: [noise], gain: gainNode }
}

function createLofiSound(ctx) {
  // Simple lo-fi beat pattern
  const osc1 = ctx.createOscillator()
  osc1.type = 'sine'
  osc1.frequency.value = 110

  const osc2 = ctx.createOscillator()
  osc2.type = 'triangle'
  osc2.frequency.value = 220

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 800

  const gainNode = ctx.createGain()
  gainNode.gain.value = 0.15

  // Add subtle pulsing
  const lfo = ctx.createOscillator()
  lfo.frequency.value = 1.5
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 0.05

  lfo.connect(lfoGain)
  lfoGain.connect(gainNode.gain)

  osc1.connect(filter)
  osc2.connect(filter)
  filter.connect(gainNode)

  osc1.start()
  osc2.start()
  lfo.start()

  return { sources: [osc1, osc2, lfo], gain: gainNode }
}

// Open music player
musicBtn.addEventListener('click', () => {
  musicModal.classList.add('active')
})

// Close music player
musicClose.addEventListener('click', () => {
  musicModal.classList.remove('active')
})

// Close modal when clicking outside
musicModal.addEventListener('click', (e) => {
  if (e.target === musicModal) {
    musicModal.classList.remove('active')
  }
})

// Track selection
trackBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const trackId = btn.dataset.track
    selectTrack(trackId)
  })
})

function selectTrack(trackId) {
  currentTrack = trackId
  const track = tracks[trackId]

  // Update UI
  trackName.textContent = track.name
  trackBtns.forEach(btn => btn.classList.remove('active'))
  document.querySelector(`[data-track="${trackId}"]`).classList.add('active')

  // Enable play and stop buttons
  playPauseBtn.disabled = false
  stopBtn.disabled = false

  // Stop current playback if any
  if (isPlaying) {
    stopMusic()
  }

  showNotification('Track Selected', `${track.name} ready to play!`)
}

// Play/Pause functionality
playPauseBtn.addEventListener('click', () => {
  if (!currentTrack) return

  if (isPlaying) {
    pauseMusic()
  } else {
    playMusic()
  }
})

function playMusic() {
  if (!currentTrack) return

  const ctx = initMusicContext()
  const track = tracks[currentTrack]

  // Create the appropriate sound generator
  let audioSetup
  switch (currentTrack) {
    case 'rain':
      audioSetup = createRainSound(ctx)
      break
    case 'waves':
      audioSetup = createWavesSound(ctx)
      break
    case 'fire':
      audioSetup = createFireSound(ctx)
      break
    case 'forest':
      audioSetup = createForestSound(ctx)
      break
    case 'cafe':
      audioSetup = createCafeSound(ctx)
      break
    case 'lofi':
      audioSetup = createLofiSound(ctx)
      break
    default:
      audioSetup = createRainSound(ctx)
  }

  // Store nodes for cleanup
  audioNodes = audioSetup

  // Connect to output with volume control
  const masterGain = ctx.createGain()
  masterGain.gain.value = volumeSlider.value / 100
  audioNodes.masterGain = masterGain

  audioSetup.gain.connect(masterGain)
  masterGain.connect(ctx.destination)

  // Start all sources
  audioSetup.sources.forEach(source => {
    if (source.start) {
      source.start(0)
    }
  })

  isPlaying = true
  playPauseBtn.textContent = '⏸️ Pause'
  showNotification('Now Playing', track.name)
}

function pauseMusic() {
  if (audioNodes.sources) {
    audioNodes.sources.forEach(source => {
      try {
        if (source.stop) {
          source.stop()
        }
      } catch (e) {
        // Source may already be stopped
      }
    })
  }

  audioNodes = {}
  isPlaying = false
  playPauseBtn.textContent = '▶️ Play'
}

function stopMusic() {
  pauseMusic()
  // Reset track selection
  currentTrack = null
  trackName.textContent = 'Select a track'
  trackBtns.forEach(btn => btn.classList.remove('active'))
  playPauseBtn.disabled = true
  stopBtn.disabled = true
  showNotification('Music Stopped', 'Track playback stopped.')
}

// Stop button functionality
stopBtn.addEventListener('click', () => {
  if (!currentTrack) return
  stopMusic()
})

// Volume control
volumeSlider.addEventListener('input', (e) => {
  const volume = e.target.value / 100
  if (audioNodes.masterGain) {
    audioNodes.masterGain.gain.value = volume
  }
})

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + K for notepad
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    notepadBtn.click()
  }

  // Ctrl/Cmd + M for music
  if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
    e.preventDefault()
    musicBtn.click()
  }

  // Escape to close modals
  if (e.key === 'Escape') {
    if (notepadModal.classList.contains('active')) {
      notepadModal.classList.remove('active')
    }
    if (musicModal.classList.contains('active')) {
      musicModal.classList.remove('active')
    }
  }
})

// Utility: Show notification (reusing existing function from script.js)
function showNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body })
  }
}

console.log('Notepad and Music Player loaded! Shortcuts: Ctrl+K (notepad), Ctrl+M (music)')
