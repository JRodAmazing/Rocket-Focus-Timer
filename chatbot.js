// AI Learning Assistant - Chatbot with Multiple AI Systems
// Educational tool demonstrating RAG, Lexicon, Symbolic, Generative, and Composite AI

// DOM Elements
const chatMessages = document.getElementById('chatMessages')
const chatInput = document.getElementById('chatInput')
const sendBtn = document.getElementById('sendBtn')
const apiKeyInput = document.getElementById('apiKey')
const saveApiKeyBtn = document.getElementById('saveApiKey')
const chatbotToggle = document.getElementById('chatbotToggle')
const chatbotContainer = document.getElementById('chatbotContainer')
const chatbotBody = document.getElementById('chatbotBody')

// State
let apiKey = localStorage.getItem('anthropic_api_key') || ''
if (apiKey) apiKeyInput.value = '••••••••••••••••'

// AI Knowledge Base (for RAG simulation)
const knowledgeBase = {
  rag: {
    definition: "RAG (Retrieval-Augmented Generation) combines a retrieval system with a generative model. It first searches a knowledge base for relevant information, then uses that context to generate accurate responses.",
    howItWorks: "1. Query Analysis: Parse user question\n2. Retrieval: Search vector database for relevant documents\n3. Context Building: Rank and select top matches\n4. Generation: Feed context to LLM to generate response\n5. Citation: Reference sources used",
    useCases: "Customer support, documentation search, research assistance, fact-checking, enterprise knowledge management",
    tools: "LangChain, LlamaIndex, Pinecone, Weaviate, Chroma, FAISS"
  },
  lexicon: {
    definition: "Lexicon in NLP refers to the vocabulary and word knowledge used by language systems. It includes word meanings, relationships, synonyms, and domain-specific terminology.",
    howItWorks: "Lexical analysis involves tokenization, lemmatization, part-of-speech tagging, and semantic parsing to understand word meanings in context.",
    useCases: "Sentiment analysis, named entity recognition, machine translation, spell checking, autocomplete",
    tools: "WordNet, spaCy, NLTK, Stanford NLP, Hugging Face Transformers"
  },
  symbolic: {
    definition: "Symbolic AI uses explicit rules, logic, and structured knowledge to reason about problems. It represents knowledge in symbols and applies logical operations.",
    howItWorks: "1. Knowledge Representation: Define facts and rules\n2. Inference Engine: Apply logic (forward/backward chaining)\n3. Reasoning: Derive conclusions from premises\n4. Explanation: Trace reasoning path",
    useCases: "Expert systems, medical diagnosis, legal reasoning, math theorem proving, game AI",
    tools: "Prolog, CLIPS, Drools, OWL, RDF"
  },
  generative: {
    definition: "Generative AI creates new content (text, images, code) using models trained on large datasets. LLMs like GPT and Claude are generative models.",
    howItWorks: "1. Training: Learn patterns from massive datasets\n2. Architecture: Transformer with attention mechanisms\n3. Generation: Predict next tokens autoregressively\n4. Sampling: Use temperature/top-p for creativity control",
    useCases: "Content creation, code generation, chatbots, summarization, translation, creative writing",
    models: "GPT-4, Claude, Gemini, Llama, Mistral, Stable Diffusion, DALL-E"
  },
  composite: {
    definition: "Composite AI combines multiple AI approaches (symbolic + neural, RAG + agents) to leverage their complementary strengths.",
    howItWorks: "1. Task Analysis: Determine which AI approach fits\n2. Orchestration: Route to appropriate system\n3. Integration: Combine outputs\n4. Verification: Cross-check results between systems",
    useCases: "Complex decision systems, autonomous agents, multi-modal applications, enterprise AI platforms",
    examples: "Neuro-symbolic AI, RAG with agents, multi-agent systems"
  },
  disambiguation: {
    definition: "Disambiguation resolves ambiguity in language by determining the correct meaning from context. Essential for accurate NLP.",
    types: "Word sense disambiguation, entity disambiguation, coreference resolution, scope ambiguity",
    techniques: "Context analysis, knowledge graphs, attention mechanisms, entity linking"
  },
  news: {
    claude: "Claude 3.5 Sonnet (Oct 2024) - Anthropic's latest with computer use capabilities",
    gpt4: "GPT-4 Turbo - 128K context, vision capabilities, JSON mode",
    gemini: "Gemini 1.5 Pro - 1M token context window, multimodal",
    llama: "Llama 3.1 405B - Meta's open-source frontier model",
    trends: "Key trends: Agents, RAG, fine-tuning, multimodal, on-device AI, AI safety"
  },
  prompting: {
    techniques: "Zero-shot, few-shot, chain-of-thought, tree-of-thought, ReAct, self-consistency",
    bestPractices: "Be specific, provide examples, use system prompts, structure output format, iterate and refine",
    advanced: "Constitutional AI, RLHF, prompt chaining, tool use, function calling"
  }
}

// System Detection - Determines which AI system to use
function detectSystem(query) {
  const q = query.toLowerCase()

  if (q.includes('rag') || q.includes('retrieval') || q.includes('vector') || q.includes('embedding')) {
    return { primary: 'rag', secondary: ['generative'] }
  }
  if (q.includes('lexicon') || q.includes('nlp') || q.includes('tokeniz') || q.includes('vocabulary')) {
    return { primary: 'lexicon', secondary: ['generative'] }
  }
  if (q.includes('symbolic') || q.includes('rule') || q.includes('logic') || q.includes('reasoning')) {
    return { primary: 'symbolic', secondary: ['generative'] }
  }
  if (q.includes('composite') || q.includes('hybrid') || q.includes('neuro-symbolic')) {
    return { primary: 'composite', secondary: ['generative', 'symbolic'] }
  }
  if (q.includes('news') || q.includes('update') || q.includes('release') || q.includes('latest') || q.includes('new model')) {
    return { primary: 'rag', secondary: ['generative'] }
  }
  if (q.includes('prompt') || q.includes('few-shot') || q.includes('chain of thought')) {
    return { primary: 'generative', secondary: ['rag'] }
  }
  if (q.includes('what is') || q.includes('explain') || q.includes('how does') || q.includes('difference between')) {
    return { primary: 'composite', secondary: ['rag', 'generative', 'lexicon'] }
  }

  return { primary: 'generative', secondary: ['rag'] }
}

// Build context from knowledge base (RAG simulation)
function retrieveContext(query) {
  const q = query.toLowerCase()
  let context = []

  for (const [topic, data] of Object.entries(knowledgeBase)) {
    const topicStr = JSON.stringify(data).toLowerCase()
    if (topicStr.includes(q.split(' ')[0]) || q.includes(topic)) {
      context.push({ topic, data, relevance: 'high' })
    }
  }

  if (context.length === 0) {
    context.push({ topic: 'generative', data: knowledgeBase.generative, relevance: 'default' })
  }

  return context
}

// Format system annotation
function formatSystemTags(systems) {
  const icons = {
    rag: '🔍',
    lexicon: '📚',
    symbolic: '🔣',
    generative: '🧠',
    composite: '🔀',
    disambiguation: '🎯'
  }

  let html = '<div class="system-tag">'
  const primaryIcon = icons[systems.primary] || '⚙️'
  html += '<span class="tag ' + systems.primary + '">' + primaryIcon + ' Primary: ' + systems.primary.toUpperCase() + '</span>'

  if (systems.secondary && systems.secondary.length > 0) {
    systems.secondary.forEach(function(sys) {
      const icon = icons[sys] || '⚙️'
      html += '<span class="tag ' + sys + '">' + icon + ' ' + sys + '</span>'
    })
  }
  html += '</div>'

  return html
}

// Build system prompt for Claude
function buildSystemPrompt(systems, context) {
  let prompt = 'You are an AI Learning Assistant that teaches users about AI systems. Your responses should be educational and explain HOW you arrived at the answer.\n\n'
  prompt += 'IMPORTANT: For each response, explain which AI system approach you used and WHY:\n'
  prompt += '- RAG: When you retrieved information from knowledge base\n'
  prompt += '- Lexicon: When you analyzed language/terminology\n'
  prompt += '- Symbolic: When you applied logical rules/reasoning\n'
  prompt += '- Generative: When you created new explanations\n'
  prompt += '- Composite: When you combined multiple approaches\n\n'
  prompt += 'Current systems being used:\n'
  prompt += '- Primary: ' + systems.primary + '\n'
  prompt += '- Supporting: ' + systems.secondary.join(', ') + '\n\n'

  if (context.length > 0) {
    prompt += 'Relevant knowledge base context:\n'
    context.forEach(function(c) {
      prompt += '\n[' + c.topic.toUpperCase() + ']:\n' + JSON.stringify(c.data, null, 2) + '\n'
    })
  }

  prompt += '\nRESPONSE FORMAT:\n'
  prompt += '1. First, briefly explain which AI system(s) you are using and why\n'
  prompt += '2. Then provide the educational answer\n'
  prompt += '3. Include practical examples when relevant\n'
  prompt += '4. Keep responses concise but informative\n'
  prompt += '5. Use markdown formatting for clarity'

  return prompt
}

// Call Anthropic API
async function callClaude(message, systems, context) {
  if (!apiKey) {
    return {
      content: "Please add your Anthropic API key to use the AI assistant. You can get one at console.anthropic.com",
      systems: systems
    }
  }

  const systemPrompt = buildSystemPrompt(systems, context)

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'API request failed')
    }

    const data = await response.json()
    return {
      content: data.content[0].text,
      systems: systems
    }
  } catch (error) {
    console.error('API Error:', error)
    return {
      content: 'Error: ' + error.message + '. Please check your API key and try again.',
      systems: systems
    }
  }
}

// Add message to chat
function addMessage(content, isUser, systems) {
  const messageDiv = document.createElement('div')
  messageDiv.className = 'message ' + (isUser ? 'user-message' : 'bot-message')

  const contentDiv = document.createElement('div')
  contentDiv.className = 'message-content'

  let formattedContent = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')

  contentDiv.innerHTML = '<p>' + formattedContent + '</p>'
  messageDiv.appendChild(contentDiv)

  if (!isUser && systems) {
    messageDiv.innerHTML += formatSystemTags(systems)
  }

  chatMessages.appendChild(messageDiv)
  chatMessages.scrollTop = chatMessages.scrollHeight
}

// Show typing indicator
function showTyping() {
  const typingDiv = document.createElement('div')
  typingDiv.className = 'message bot-message'
  typingDiv.id = 'typing'
  typingDiv.innerHTML = '<div class="message-content"><div class="typing-indicator"><span></span><span></span><span></span></div></div>'
  chatMessages.appendChild(typingDiv)
  chatMessages.scrollTop = chatMessages.scrollHeight
}

function hideTyping() {
  const typing = document.getElementById('typing')
  if (typing) typing.remove()
}

// Handle send message
async function handleSend() {
  const message = chatInput.value.trim()
  if (!message) return

  addMessage(message, true, null)
  chatInput.value = ''

  const systems = detectSystem(message)
  const context = retrieveContext(message)

  showTyping()

  const response = await callClaude(message, systems, context)

  hideTyping()
  addMessage(response.content, false, response.systems)
}

// Event Listeners
sendBtn.addEventListener('click', handleSend)

chatInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
})

saveApiKeyBtn.addEventListener('click', function() {
  const key = apiKeyInput.value.trim()
  if (key && key.indexOf('•') === -1) {
    apiKey = key
    localStorage.setItem('anthropic_api_key', key)
    apiKeyInput.value = '••••••••••••••••'
    addMessage('API key saved! You can now ask me about AI systems.', false, { primary: 'generative', secondary: [] })
  }
})

chatbotToggle.addEventListener('click', function() {
  chatbotContainer.classList.toggle('minimized')
  chatbotToggle.textContent = chatbotContainer.classList.contains('minimized') ? '+' : '−'
})

console.log('AI Learning Assistant loaded.')
