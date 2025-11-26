# AI Learning Assistant - Architecture Documentation

## Overview

The AI Learning Assistant is an educational chatbot that demonstrates multiple AI system approaches. It uses a **stacking architecture** that combines different AI methodologies to answer user questions about artificial intelligence.

---

## System Stacking Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER QUERY                           │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  LAYER 1: QUERY DETECTION (detectSystem)                │
│  ─────────────────────────────────────────              │
│  • Analyzes query keywords                              │
│  • Determines PRIMARY AI system                         │
│  • Assigns SECONDARY supporting systems                 │
│                                                         │
│  Keywords → System Mapping:                             │
│  • "rag", "retrieval", "vector" → RAG                   │
│  • "lexicon", "nlp", "tokeniz" → LEXICON                │
│  • "symbolic", "rule", "logic" → SYMBOLIC               │
│  • "composite", "hybrid" → COMPOSITE                    │
│  • "what is", "explain" → COMPOSITE (default)           │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  LAYER 2: CONTEXT RETRIEVAL (retrieveContext)           │
│  ─────────────────────────────────────────              │
│  • Searches internal knowledgeBase                      │
│  • Matches query terms against topics                   │
│  • Returns relevant context objects                     │
│  • Simulates RAG retrieval process                      │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  LAYER 3: SYSTEM ORCHESTRATION (buildSystemPrompt)      │
│  ─────────────────────────────────────────              │
│  • Constructs dynamic system prompt                     │
│  • Injects retrieved context                            │
│  • Specifies response format                            │
│  • Instructs LLM on which systems to explain            │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  LAYER 4: GENERATION (callClaude)                       │
│  ─────────────────────────────────────────              │
│  • Calls Anthropic Claude API                           │
│  • Model: claude-sonnet-4-20250514                      │
│  • Returns educational response                         │
│  • Explains which AI systems were used                  │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  LAYER 5: REASONING TRACE (buildReasoningTrace)         │
│  ─────────────────────────────────────────              │
│  • Documents the decision pipeline                      │
│  • Shows keyword matches                                │
│  • Displays retrieval results                           │
│  • Visualizes system routing                            │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                    USER RESPONSE                        │
│  • AI answer with system explanations                   │
│  • System tags (visual indicators)                      │
│  • Collapsible reasoning trace                          │
└─────────────────────────────────────────────────────────┘
```

---

## AI Systems Explained

### 1. RAG (Retrieval-Augmented Generation)
**Icon:** 🔍

**Purpose:** Combines retrieval with generation for factual accuracy.

**How it's used:**
- `retrieveContext()` searches the `knowledgeBase` object
- Matches are ranked and injected into the system prompt
- LLM generates response using retrieved context

**Triggered by:** "rag", "retrieval", "vector", "embedding"

---

### 2. Lexicon (NLP Analysis)
**Icon:** 📚

**Purpose:** Analyzes vocabulary, terminology, and language structure.

**How it's used:**
- Provides definitions and terminology explanations
- Breaks down technical jargon
- Explains linguistic concepts

**Triggered by:** "lexicon", "nlp", "tokeniz", "vocabulary"

---

### 3. Symbolic (Rule-Based Reasoning)
**Icon:** 🔣

**Purpose:** Applies explicit rules and logical inference.

**How it's used:**
- Step-by-step logical explanations
- Rule-based decision making
- Structured reasoning paths

**Triggered by:** "symbolic", "rule", "logic", "reasoning"

---

### 4. Generative (LLM Creation)
**Icon:** 🧠

**Purpose:** Creates new content using transformer-based models.

**How it's used:**
- Default system for open-ended questions
- Creative explanations and examples
- Content synthesis

**Triggered by:** "prompt", "few-shot", "chain of thought"

---

### 5. Composite (Hybrid Approach)
**Icon:** 🔀

**Purpose:** Combines multiple AI approaches for complex queries.

**How it's used:**
- Routes to multiple systems simultaneously
- Synthesizes outputs from different approaches
- Handles "explain" and "what is" questions

**Triggered by:** "composite", "hybrid", "neuro-symbolic", "what is", "explain", "how does"

---

## Data Flow

### 1. User Input
```javascript
handleSend() → message = chatInput.value.trim()
```

### 2. System Detection
```javascript
const systems = detectSystem(message)
// Returns: { primary: 'composite', secondary: ['rag', 'generative', 'lexicon'] }
```

### 3. Context Retrieval
```javascript
const context = retrieveContext(message)
// Returns: [{ topic: 'rag', data: {...}, relevance: 'high' }]
```

### 4. Reasoning Trace
```javascript
const trace = buildReasoningTrace(message, systems, context)
// Documents the entire pipeline for transparency
```

### 5. API Call
```javascript
const response = await callClaude(message, systems, context)
// Sends to Anthropic API with constructed system prompt
```

### 6. Display
```javascript
addMessage(response.content, false, response.systems, trace)
// Renders response + system tags + reasoning trace
```

---

## Knowledge Base Structure

The `knowledgeBase` object contains structured information about AI topics:

```javascript
knowledgeBase = {
  rag: { definition, howItWorks, useCases, tools },
  lexicon: { definition, howItWorks, useCases, tools },
  symbolic: { definition, howItWorks, useCases, tools },
  generative: { definition, howItWorks, useCases, models },
  composite: { definition, howItWorks, useCases, examples },
  disambiguation: { definition, types, techniques },
  news: { claude, gpt4, gemini, llama, trends },
  prompting: { techniques, bestPractices, advanced }
}
```

---

## Reasoning Trace Feature

Each response includes a collapsible reasoning trace showing:

1. **Step 1 - Detection**
   - Keywords matched
   - Primary system selected
   - Secondary systems assigned

2. **Step 2 - Retrieval**
   - Number of topics searched
   - Matches found
   - Retrieved topic names

3. **Step 3 - Pipeline**
   - Visual flow: `Query → PRIMARY → [SECONDARY] → Response`

---

## API Integration

### Anthropic Claude API
- **Endpoint:** `https://api.anthropic.com/v1/messages`
- **Model:** `claude-sonnet-4-20250514`
- **Max tokens:** 1024
- **Headers:**
  - `anthropic-version: 2023-06-01`
  - `anthropic-dangerous-direct-browser-access: true`

---

## File Structure

```
focus-timer/
├── index.html       # Main application with chatbot UI
├── styles.css       # Styling including chatbot panel
├── script.js        # Timer and gamification logic
├── chatbot.js       # AI Learning Assistant (this architecture)
├── README.md        # User documentation
└── ARCHITECTURE.md  # Technical architecture (this file)
```

---

## Future Enhancements

Potential improvements to the stacking architecture:

1. **Vector embeddings** - Replace keyword matching with semantic similarity
2. **Conversation memory** - Add context from previous messages
3. **Multi-turn reasoning** - Chain multiple AI system passes
4. **Custom knowledge bases** - Allow user-uploaded documents
5. **System confidence scores** - Show certainty levels for each layer

---

## Summary

The AI Learning Assistant demonstrates how modern AI systems can be "stacked" to provide transparent, educational responses. By showing the reasoning trace and system tags, users learn not just WHAT the answer is, but HOW the AI arrived at it.

This architecture showcases:
- **RAG** for knowledge retrieval
- **Lexicon** for language analysis
- **Symbolic** for logical reasoning
- **Generative** for content creation
- **Composite** for multi-system orchestration
