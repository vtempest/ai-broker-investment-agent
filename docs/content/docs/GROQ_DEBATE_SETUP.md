---
title: Groq Debate Setup
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

## 🎯 Example Analyses

### Analyzing Tech Stocks

```bash
# Apple
curl -X POST http://localhost:3000/api/groq-debate \
  -H "Content-Type: application/json" \
  -d '{"symbol": "AAPL"}'

# Microsoft
curl -X POST http://localhost:3000/api/groq-debate \
  -H "Content-Type: application/json" \
  -d '{"symbol": "MSFT"}'

# NVIDIA
curl -X POST http://localhost:3000/api/groq-debate \
  -H "Content-Type: application/json" \
  -d '{"symbol": "NVDA"}'
```

### Batch Analysis Script

```python
import requests
import json

symbols = ["AAPL", "MSFT", "GOOGL", "NVDA", "TSLA"]
results = {}

for symbol in symbols:
    response = requests.post(
        "http://localhost:3000/api/groq-debate",
        json={"symbol": symbol, "max_debate_rounds": 2}
    )
    results[symbol] = response.json()
    print(f"Analyzed {symbol}: {results[symbol]['analysis']['final_decision']}")

# Save results
with open("analysis_results.json", "w") as f:
    json.dump(results, f, indent=2)
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

## 🔧 Configuration Options

### LLM Models

You can switch between different Groq models:

```python
# Fast and cheap (8B parameter model)
"quick_think_llm": "llama-3.1-8b-instant"

# More capable (70B parameter model)
"deep_think_llm": "llama-3.1-70b-versatile"

# Alternative models
"mixtral-8x7b-32768"  # Mixtral model
"gemma2-9b-it"        # Google Gemma
```

### Debate Rounds

Adjust the number of debate rounds in `.env`:

```bash
MAX_DEBATE_ROUNDS=1  # Quick analysis (1 round)
MAX_DEBATE_ROUNDS=2  # Balanced (default)
MAX_DEBATE_ROUNDS=3  # Thorough debate (3 rounds)
```

### Data Sources

Configure which APIs to use in `.env`:

```bash
# Use yfinance for all data (free, no API key needed)
CORE_STOCK_APIS=yfinance
TECHNICAL_INDICATORS=yfinance
FUNDAMENTAL_DATA=yfinance
NEWS_DATA=yfinance

# Or use premium sources
ALPHA_VANTAGE_API_KEY=your-key
FUNDAMENTAL_DATA=alpha_vantage
NEWS_DATA=alpha_vantage
```

## 🎨 Frontend Integration

You can integrate this into your React/Next.js components:

```
'use client'

import { useState } from 'react'

export default function DebateAnalysis() {
  const [symbol, setSymbol] = useState('AAPL')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const analyzeStock = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/groq-debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol })
      })
      const data = await res.json()
      setResult(data)
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Groq Multi-Agent Debate Analysis
      </h1>

      <div className="mb-4">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Enter symbol (e.g., AAPL)"
          className="border p-2 rounded"
        />
        <button
          onClick={analyzeStock}
          disabled={loading}
          className="ml-2 bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      {result?.success && (
        <div className="space-y-4">
          <div className="border rounded p-4">
            <h2 className="font-bold text-green-600">Bull Arguments</h2>
            <ul className="list-disc ml-5">
              {result.analysis.bull_arguments.map((arg, i) => (
                <li key={i}>{arg}</li>
              ))}
            </ul>
          </div>

          <div className="border rounded p-4">
            <h2 className="font-bold text-red-600">Bear Arguments</h2>
            <ul className="list-disc ml-5">
              {result.analysis.bear_arguments.map((arg, i) => (
                <li key={i}>{arg}</li>
              ))}
            </ul>
          </div>

          <div className="border rounded p-4">
            <h2 className="font-bold">Final Decision</h2>
            <p className="text-lg">{result.analysis.final_decision}</p>
            <p className="text-sm text-gray-600 mt-2">
              {result.analysis.reasoning}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
```

## 📊 Performance

### Speed
- **Groq Llama 3.1 8B**: ~500-1000 tokens/second
- **Groq Llama 3.1 70B**: ~200-400 tokens/second
- **Full analysis**: Typically 10-30 seconds for complete debate

### Cost
- Groq offers very competitive pricing (often free tier available)
- Significantly cheaper than GPT-4 while maintaining good quality
- Llama 3.1 70B provides excellent reasoning at fraction of GPT-4 cost

## 🐛 Troubleshooting

### Service Won't Start

```bash
# Check if dependencies are installed
cd agents/debate-analyst
pip list | grep langchain-groq

# Reinstall if needed
pip install langchain-groq>=0.1.0

# Check API key
echo $GROQ_API_KEY
```

### API Returns Error

```bash
# Check if service is running
curl http://localhost:8001/

# Check logs
cd agents/debate-analyst
python api_server.py  # Run in foreground to see logs
```

### Slow Performance

- Reduce `MAX_DEBATE_ROUNDS` in `.env`
- Use `llama-3.1-8b-instant` for all LLM calls
- Disable memory search if not needed

## 📚 Additional Resources

- [Groq Documentation](https://console.groq.com/docs)
- [LangChain Documentation](https://python.langchain.com/)
- [LangGraph Multi-Agent](https://langchain-ai.github.io/langgraph/)
- [Llama 3.1 Model Card](https://huggingface.co/meta-llama/Meta-Llama-3.1-70B)

## 🤝 Contributing

To extend the debate system:

1. Add new agent types in `agents/debate-analyst/tradingagents/agents/`
2. Modify debate flow in `tradingagents/graph/setup.py`
3. Add custom tools in `tradingagents/tools/`
4. Update prompts in agent initialization files

## 📝 License

This project uses MIT License. Groq and Llama models have their own licenses - check their respective documentation.
