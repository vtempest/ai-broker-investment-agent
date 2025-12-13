---
title: Groq Agent Api Guide
---

# Groq Agent API Integration Guide

This guide explains how to use Groq for real-time stock analysis with the Agent API.

## Overview

The TradingAgents API now supports **Groq** as a fast, cost-effective LLM provider for real-time stock analysis. Groq provides lightning-fast inference speeds, making it ideal for live trading scenarios.

## Quick Start

### 1. Set Your Groq API Key

Add your Groq API key to your `.env` file:

```bash
# Set Groq as default provider
NEXT_PUBLIC_LLM_PROVIDER=groq
GROQ_API_KEY=gsk_your_api_key_here

# Optional: Customize models
NEXT_PUBLIC_GROQ_DEEP_THINK_MODEL=llama-3.1-70b-versatile
NEXT_PUBLIC_GROQ_QUICK_THINK_MODEL=llama-3.1-8b-instant
```

Get a free Groq API key at: https://console.groq.com

### 2. Use the API

Once configured, the `/api/trading-agents` endpoint will automatically use Groq:

```bash
# Basic usage - uses Groq by default
curl -X POST http://localhost:3000/api/trading-agents \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL"
  }'
```

## API Endpoints

### POST /api/trading-agents

Run multi-agent stock analysis with Groq.

**Request Body:**

```
{
  symbol: string              // Required: Stock ticker (e.g., "AAPL")
  date?: string              // Optional: Analysis date (YYYY-MM-DD)
  analysts?: string[]        // Optional: ['market', 'social', 'news', 'fundamentals']
  config?: {
    llmProvider?: string     // Optional: 'groq', 'openai', or 'anthropic'
    deepThinkLLM?: string    // Optional: Model for complex analysis
    quickThinkLLM?: string   // Optional: Model for fast decisions
    temperature?: number     // Optional: 0-1 (default: 0.3)
  }
}
```

**Example Requests:**

```javascript
// 1. Basic analysis (uses environment defaults)
const response = await fetch('/api/trading-agents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    symbol: 'TSLA'
  })
})

// 2. Explicit Groq configuration
const response = await fetch('/api/trading-agents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    symbol: 'NVDA',
    config: {
      llmProvider: 'groq',
      deepThinkLLM: 'llama-3.1-70b-versatile',
      quickThinkLLM: 'llama-3.1-8b-instant'
    }
  })
})

// 3. Custom analysts with Groq
const response = await fetch('/api/trading-agents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    symbol: 'AAPL',
    analysts: ['market', 'news'],  // Only market and news analysis
    config: {
      llmProvider: 'groq'
    }
  })
})

// 4. Real-time analysis with specific date
const response = await fetch('/api/trading-agents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    symbol: 'META',
    date: '2024-12-11',
    config: {
      llmProvider: 'groq',
      temperature: 0.5
    }
  })
})
```

**Response:**

```
{
  success: boolean
  symbol: string
  date: string
  signal: {
    action: 'BUY' | 'SELL' | 'HOLD'
    confidence: number
    reasoning: string
    timestamp: string
  }
  analysis: {
    marketReport: string
    sentimentReport: string
    newsReport: string
    fundamentalsReport: string
    investmentDebate: {
      bullArguments: string
      bearArguments: string
      judgeDecision: string
    }
    traderDecision: string
  }
}
```

### GET /api/trading-agents

Get information about the API and current configuration.

```bash
curl http://localhost:3000/api/trading-agents
```

## Available Groq Models

### Deep Thinking Models (Complex Analysis)
- `llama-3.1-70b-versatile` (default) - Best for detailed analysis
- `llama-3.3-70b-versatile` - Latest version with improvements
- `llama-3.1-405b-reasoning` - Most powerful, best reasoning

### Quick Thinking Models (Fast Decisions)
- `llama-3.1-8b-instant` (default) - Fastest responses
- `llama-3.2-11b-vision-preview` - With vision capabilities
- `mixtral-8x7b-32768` - Good balance of speed and quality

## Configuration Priority

The API determines which LLM provider to use in this order:

1. Request `config.llmProvider` parameter
2. `NEXT_PUBLIC_LLM_PROVIDER` environment variable
3. Auto-detect (uses Groq if `GROQ_API_KEY` is set)
4. Fallback to OpenAI

## Multi-Agent Analysis Flow

When you call the API, here's what happens:

1. **Market Analyst** - Analyzes technical indicators using the deep think model
2. **Bull Researcher** - Builds bullish arguments (3 rounds of debate)
3. **Bear Researcher** - Builds bearish arguments (counters bull's points)
4. **Investment Judge** - Evaluates both sides using quick think model
5. **Trader** - Makes final decision based on all analysis

All of this runs with Groq's lightning-fast inference!

## Performance Benefits

Groq offers significant advantages for real-time trading:

- **Speed**: 300+ tokens/second (vs ~50 for other providers)
- **Cost**: Much cheaper than GPT-4 (up to 90% savings)
- **Quality**: Llama 3.1 70B rivals GPT-4 performance
- **Reliability**: Consistent low-latency responses

## Python Client Example

```python
import requests
import json

def analyze_stock_with_groq(symbol: str):
    """Analyze a stock using Groq-powered agents"""

    url = "http://localhost:3000/api/trading-agents"

    payload = {
        "symbol": symbol,
        "config": {
            "llmProvider": "groq",
            "deepThinkLLM": "llama-3.1-70b-versatile",
            "quickThinkLLM": "llama-3.1-8b-instant"
        }
    }

    response = requests.post(url, json=payload)
    result = response.json()

    if result['success']:
        signal = result['signal']
        print(f"Symbol: {result['symbol']}")
        print(f"Action: {signal['action']}")
        print(f"Confidence: {signal['confidence']:.2%}")
        print(f"Reasoning: {signal['reasoning']}")
        return result
    else:
        print(f"Error: {result.get('error')}")
        return None

# Usage
analysis = analyze_stock_with_groq("AAPL")
```

## TypeScript/React Example

```
import { useState } from 'react'

interface StockAnalysis {
  success: boolean
  symbol: string
  signal: {
    action: 'BUY' | 'SELL' | 'HOLD'
    confidence: number
    reasoning: string
  }
  analysis: any
}

function useStockAnalysis() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<StockAnalysis | null>(null)

  const analyze = async (symbol: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/trading-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          config: {
            llmProvider: 'groq'  // Force Groq for fast analysis
          }
        })
      })

      const data = await response.json()
      setResult(data)
      return data
    } catch (error) {
      console.error('Analysis failed:', error)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { analyze, loading, result }
}

// Usage in component
function StockAnalyzer() {
  const { analyze, loading, result } = useStockAnalysis()

  const handleAnalyze = () => {
    analyze('TSLA')
  }

  return (
    <div>
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze Stock'}
      </button>

      {result && (
        <div>
          <h3>Signal: {result.signal.action}</h3>
          <p>Confidence: {(result.signal.confidence * 100).toFixed(1)}%</p>
          <p>{result.signal.reasoning}</p>
        </div>
      )}
    </div>
  )
}
```

## Troubleshooting

### API Key Issues

If you get authentication errors:

1. Verify your Groq API key is correct
2. Check that it's properly set in `.env`
3. Restart your Next.js dev server after adding the key

```bash
# Verify your key
echo $GROQ_API_KEY

# Restart server
npm run dev
```

### Model Not Found

If you get model errors, use one of the supported models:

- `llama-3.1-70b-versatile`
- `llama-3.1-8b-instant`
- `llama-3.3-70b-versatile`
- `mixtral-8x7b-32768`

### Slow Responses

If responses are slow despite using Groq:

1. Check your network connection
2. Verify you're using Groq (check GET /api/trading-agents)
3. Try the faster `llama-3.1-8b-instant` model

## Advanced Usage

### Batch Analysis

Analyze multiple stocks in parallel:

```javascript
const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA']

const analyses = await Promise.all(
  symbols.map(symbol =>
    fetch('/api/trading-agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol,
        config: { llmProvider: 'groq' }
      })
    }).then(r => r.json())
  )
)

// Process all results
analyses.forEach(result => {
  console.log(`${result.symbol}: ${result.signal.action}`)
})
```

### Custom Temperature

Adjust temperature for more/less creative analysis:

```javascript
// More conservative (lower temperature)
const conservative = await fetch('/api/trading-agents', {
  method: 'POST',
  body: JSON.stringify({
    symbol: 'AAPL',
    config: {
      llmProvider: 'groq',
      temperature: 0.1  // Very focused, deterministic
    }
  })
})

// More creative (higher temperature)
const creative = await fetch('/api/trading-agents', {
  method: 'POST',
  body: JSON.stringify({
    symbol: 'AAPL',
    config: {
      llmProvider: 'groq',
      temperature: 0.7  // More varied responses
    }
  })
})
```

## Next Steps

- Review the [Groq LangChain Integration Guide](./GROQ_LANGCHAIN_INTEGRATION.md)
- Check out example implementations in `lib/trading-agents/examples/`
- Read the [Groq Debate Setup](./GROQ_DEBATE_SETUP.md) for Python integration

## Support

For issues or questions:
- Check the API status: `GET /api/trading-agents`
- Review Groq docs: https://console.groq.com/docs
- Open an issue on GitHub
