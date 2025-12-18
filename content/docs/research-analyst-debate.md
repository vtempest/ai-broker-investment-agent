---
title: Research Debate Analyst
---

# Groq-Powered Multi-Agent Debate Analysis

This project now includes a powerful stock analysis system using **Groq LLMs** with **LangChain** for multi-agent debates. The system provides fast, cost-effective analysis through intelligent agent debates.

## 🚀 Features

- **Multi-Agent Debate System**: Bull vs Bear researchers debate investment thesis
- **Risk Management Consensus**: 3-way debate between conservative, neutral, and aggressive risk managers
- **Fast Inference**: Uses Groq's Llama 3.1 models (70B for deep thinking, 8B for quick thinking)
- **Memory-Based Learning**: Learns from past trading decisions using ChromaDB
- **Flexible Data Sources**: Integrates with yfinance, Alpha Vantage, and more

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Stock Analysis Request                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│               Market & News Analysts                         │
│  (Gather data: technical, fundamental, news, social)        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                 Investment Debate                            │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │ Bull         │  ←───→  │ Bear         │                 │
│  │ Researcher   │         │ Researcher   │                 │
│  └──────────────┘         └──────────────┘                 │
│         │                        │                          │
│         └────────┬───────────────┘                          │
│                  ▼                                           │
│         ┌────────────────┐                                  │
│         │ Research       │ (Judge: BUY/SELL/HOLD)          │
│         │ Manager        │                                  │
│         └────────┬───────┘                                  │
└──────────────────┼──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    Trader Decision                          │
│              (Action: BUY/SELL/HOLD)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                 Risk Management Debate                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │Conservative│ │ Neutral │  │Aggressive│                 │
│  │  Debator  │ │ Debator │  │ Debator  │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
│         │            │             │                        │
│         └────────────┼─────────────┘                        │
│                      ▼                                       │
│            ┌──────────────────┐                             │
│            │  Risk Manager    │ (Judge final risk level)   │
│            └──────────────────┘                             │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Installation

### 1. Install Python Dependencies

```bash
cd agents/debate-analyst

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies (includes langchain-groq)
pip install -r requirements.txt
```

### 2. Configure Environment

The environment has been configured to use Groq by default:

**Main Project `.env`** (create this file):
```bash
GROQ_API_KEY=your_groq_api_key_here
NEXT_PUBLIC_DEBATE_ANALYST_URL=http://localhost:8001
```

**Debate-Analyst `.env`** (create at `agents/debate-analyst/.env`):
```bash
GROQ_API_KEY=your_groq_api_key_here
LLM_PROVIDER=groq
DEEP_THINK_LLM=llama-3.1-70b-versatile
QUICK_THINK_LLM=llama-3.1-8b-instant
MAX_DEBATE_ROUNDS=2
```

**Default Configuration** (`agents/debate-analyst/tradingagents/default_config.py`):
```python
DEFAULT_CONFIG = {
    "llm_provider": "groq",
    "deep_think_llm": "llama-3.1-70b-versatile",
    "quick_think_llm": "llama-3.1-8b-instant",
    "max_debate_rounds": 2,
    # ... other settings
}
```

## 🚦 Running the Service

### Start the Debate-Analyst API Server

```bash
cd agents/debate-analyst
source venv/bin/activate
python api_server.py
```

The server will start on `http://localhost:8001`

### Start the Next.js Application

```bash
# From project root
npm run dev
```

The Next.js app will start on `http://localhost:3000`

## 📡 API Usage

### Using the Next.js API Endpoint

The new `/api/groq-debate` endpoint provides a simplified interface:

```bash
# Get API information
curl http://localhost:3000/api/groq-debate

# Analyze a stock
curl -X POST http://localhost:3000/api/groq-debate \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "date": "2024-12-11",
    "max_debate_rounds": 2
  }'
```

### Response Format

```json
{
  "success": true,
  "symbol": "AAPL",
  "date": "2024-12-11",
  "analysis": {
    "bull_arguments": [
      "Strong fundamentals with consistent revenue growth...",
      "Leading position in smartphone market with 50%+ profit share..."
    ],
    "bear_arguments": [
      "High valuation multiples compared to historical averages...",
      "Increasing regulatory pressure in key markets..."
    ],
    "risk_assessment": "Medium risk with controlled position sizing recommended",
    "final_decision": "BUY with 60% confidence",
    "confidence_level": "Medium-High",
    "reasoning": "The bull case is stronger based on fundamental analysis..."
  },
  "debate_history": [
    {
      "agent": "bull_researcher",
      "message": "...",
      "timestamp": "..."
    }
  ]
}
```

### Using JavaScript/TypeScript

```
interface GroqDebateRequest {
  symbol: string
  date?: string
  max_debate_rounds?: number
}

async function analyzeStock(symbol: string) {
  const response = await fetch('/api/groq-debate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      symbol,
      date: new Date().toISOString().split('T')[0],
      max_debate_rounds: 2
    })
  })

  const result = await response.json()

  if (result.success) {
    console.log('Bull Arguments:', result.analysis.bull_arguments)
    console.log('Bear Arguments:', result.analysis.bear_arguments)
    console.log('Final Decision:', result.analysis.final_decision)
    console.log('Reasoning:', result.analysis.reasoning)
  }

  return result
}

// Usage
analyzeStock('AAPL').then(result => {
  console.log('Analysis complete:', result)
})
```

### Direct API Server Usage

You can also call the debate-analyst service directly:

```bash
# Direct call to debate-analyst
curl -X POST http://localhost:8001/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "date": "2024-12-11"
  }'
```


## 🧠 How It Works

### 1. Data Collection Phase
- **Market Analyst**: Gathers OHLCV data, technical indicators
- **News Analyst**: Collects and analyzes recent news sentiment
- **Social Media Analyst**: Analyzes social sentiment (optional)
- **Fundamentals Analyst**: Reviews financial statements and metrics

### 2. Investment Debate Phase
- **Bull Researcher**: Presents optimistic case based on data
- **Bear Researcher**: Presents pessimistic case and risks
- **Multiple Rounds**: Agents debate back and forth (default: 2 rounds)
- **Research Manager**: Acts as judge, decides BUY/SELL/HOLD

### 3. Trading Decision
- **Trader Agent**: Makes action decision based on research manager's judgment
- Considers risk appetite, market conditions, portfolio context

### 4. Risk Management Debate
- **Conservative Debator**: Argues for minimal risk exposure
- **Neutral Debator**: Balanced risk perspective
- **Aggressive Debator**: Higher risk for higher returns
- **Risk Manager**: Final judgment on position size and risk level

### 5. Memory & Learning
- All decisions are stored in ChromaDB vector database
- Future analyses retrieve similar past situations
- Agents learn from past successes and failures
