# Comprehensive Trading Bots Examples Guide

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [PrimoAgent Examples](#primoagent-examples)
- [TradingAgents Examples](#tradingagents-examples)
- [Advanced Integration Patterns](#advanced-integration-patterns)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

## Overview

This guide provides comprehensive examples for using the two AI-powered trading analysis bots:

### PrimoAgent (Port 8002)
- **Purpose**: Deep financial analysis with backtesting capabilities
- **Architecture**: LangGraph workflow with specialized agents
- **Strengths**: Historical analysis, batch processing, performance validation
- **Best for**: Long-term strategies, comprehensive research, backtesting

### TradingAgents (Port 8001)
- **Purpose**: Real-time trading decisions through agent debate
- **Architecture**: Multi-agent debate system with risk management
- **Strengths**: Real-time analysis, diverse perspectives, risk assessment
- **Best for**: Active trading, quick decisions, risk-conscious strategies

## Architecture

### PrimoAgent Workflow
```
┌─────────────────────────────────────────────────────┐
│                   API Request                        │
│            (symbols, date, parameters)               │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│              Data Collection Agent                   │
│  • Fetch historical price data (yfinance)           │
│  • Gather company fundamentals (Finnhub)            │
│  • Calculate technical indicators                    │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│           News Intelligence Agent                    │
│  • Fetch news from Finnhub                          │
│  • Deep research with Perplexity                    │
│  • Extract content with Firecrawl                   │
│  • Assess news significance                         │
│  • Generate NLP sentiment features                  │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│          Technical Analysis Agent                    │
│  • Calculate RSI, MACD, Bollinger Bands            │
│  • Identify support/resistance levels               │
│  • Detect chart patterns                            │
│  • Trend analysis                                   │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│          Portfolio Manager Agent                     │
│  • Synthesize all analysis                          │
│  • Generate BUY/SELL/HOLD decision                  │
│  • Set price targets                                │
│  • Risk assessment                                  │
│  • Position sizing                                  │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│              Save to CSV & Return                    │
└─────────────────────────────────────────────────────┘
```

### TradingAgents Workflow
```
┌─────────────────────────────────────────────────────┐
│                   API Request                        │
│              (symbol, date, config)                  │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│              Data Collection Layer                   │
│  ┌─────────────────────────────────────────────┐   │
│  │  Market Analyst    │  Fetches OHLCV data    │   │
│  │  Fundamentals      │  P/E, EPS, growth      │   │
│  │  News Analyst      │  Sentiment analysis    │   │
│  │  Social Media      │  Reddit, Twitter       │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│            Research Manager Layer                    │
│  ┌─────────────────────────────────────────────┐   │
│  │  Bull Researcher   │  Finds positive signals│   │
│  │  Bear Researcher   │  Identifies risks      │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│              Risk Debate Layer                       │
│  ┌─────────────────────────────────────────────┐   │
│  │  Aggressive Debator  │  Higher risk/reward │   │
│  │  Conservative Debator│  Risk minimization  │   │
│  │  Neutral Debator     │  Balanced view      │   │
│  └─────────────────────────────────────────────┘   │
│              (Multiple debate rounds)                │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│                Risk Manager                          │
│  • Synthesizes debate conclusions                   │
│  • Final BUY/SELL/HOLD decision                     │
│  • Position sizing                                  │
│  • Stop loss / Take profit levels                   │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│                Trader Execution                      │
│  • Formats decision for execution                   │
│  • Validates against constraints                    │
└─────────────────────────────────────────────────────┘
```

## Getting Started

### Prerequisites
```bash
# Python 3.9+
python --version

# Node.js 18+ (for Hono server)
node --version

# Git
git --version
```

### Environment Setup

#### Create Environment Files

**services/PrimoAgent-main/.env**:
```bash
# Required
OPENAI_API_KEY=sk-...
# Or use Groq (faster, cheaper)
GROQ_API_KEY=gsk_...

# Optional but recommended
PERPLEXITY_API_KEY=pplx-...
FINNHUB_API_KEY=...
FIRECRAWL_API_KEY=...

# Server configuration
PORT=8002
```

**services/TradingAgents/.env**:
```bash
# Required
OPENAI_API_KEY=sk-...
# Or use Groq
GROQ_API_KEY=gsk_...

# Optional
ALPHA_VANTAGE_API_KEY=...
REDDIT_CLIENT_ID=...
REDDIT_CLIENT_SECRET=...
REDDIT_USER_AGENT=TradingBot/1.0

# Server configuration
PORT=8001
```

### Installation

```bash
# Install both services
cd services

# PrimoAgent
cd PrimoAgent-main
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-api.txt

# TradingAgents
cd ../TradingAgents
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-api.txt
```

## PrimoAgent Examples

### Example 1: Basic Single Stock Analysis

```python
import requests
from datetime import datetime

BASE_URL = "http://localhost:8002"

def analyze_single_stock():
    """Analyze a single stock for today"""
    response = requests.post(
        f"{BASE_URL}/analyze",
        json={
            "symbols": ["AAPL"],
            "date": datetime.now().strftime("%Y-%m-%d")
        }
    )

    result = response.json()

    if result['success']:
        analysis = result['result']['analyses']['AAPL']
        print(f"Symbol: AAPL")
        print(f"Recommendation: {analysis['recommendation']}")
        print(f"Confidence: {analysis['confidence']:.2%}")
        print(f"Price Target: ${analysis['price_target']:.2f}")
        print(f"\nTechnical Analysis:")
        print(f"  Trend: {analysis['technical_analysis']['trend']}")
        print(f"  Support: ${analysis['technical_analysis']['support']:.2f}")
        print(f"  Resistance: ${analysis['technical_analysis']['resistance']:.2f}")
        print(f"\nRisk Factors: {', '.join(analysis['risk_factors'])}")

    return result

# Run analysis
result = analyze_single_stock()
```

### Example 2: Multi-Stock Portfolio Analysis

```python
import requests
from typing import List, Dict

BASE_URL = "http://localhost:8002"

class PortfolioAnalyzer:
    def __init__(self, symbols: List[str]):
        self.symbols = symbols
        self.results = {}

    def analyze_all(self, date: str = None) -> Dict:
        """Analyze all stocks in portfolio"""
        response = requests.post(
            f"{BASE_URL}/analyze",
            json={
                "symbols": self.symbols,
                "date": date or datetime.now().strftime("%Y-%m-%d")
            }
        )

        result = response.json()

        if result['success']:
            self.results = result['result']['analyses']

        return result

    def get_buy_recommendations(self, min_confidence: float = 0.7) -> List[str]:
        """Get stocks with BUY recommendation above confidence threshold"""
        return [
            symbol for symbol, analysis in self.results.items()
            if analysis['recommendation'] == 'BUY'
            and analysis['confidence'] >= min_confidence
        ]

    def get_risk_summary(self) -> Dict:
        """Summarize risk factors across portfolio"""
        risk_counts = {}
        for symbol, analysis in self.results.items():
            for risk in analysis['risk_factors']:
                risk_counts[risk] = risk_counts.get(risk, 0) + 1

        return dict(sorted(risk_counts.items(), key=lambda x: x[1], reverse=True))

    def print_summary(self):
        """Print portfolio analysis summary"""
        print(f"\n{'='*60}")
        print(f"PORTFOLIO ANALYSIS - {len(self.symbols)} Stocks")
        print(f"{'='*60}\n")

        for symbol, analysis in self.results.items():
            print(f"{symbol:6} | {analysis['recommendation']:4} | "
                  f"Conf: {analysis['confidence']:.2%} | "
                  f"Target: ${analysis['price_target']:7.2f}")

        print(f"\n{'-'*60}")
        print(f"BUY Recommendations (>70% conf): {len(self.get_buy_recommendations())}")
        print(f"\nTop Risk Factors:")
        for risk, count in list(self.get_risk_summary().items())[:5]:
            print(f"  • {risk}: {count} stocks")

# Usage
portfolio = PortfolioAnalyzer(["AAPL", "GOOGL", "MSFT", "NVDA", "TSLA"])
portfolio.analyze_all()
portfolio.print_summary()

# Get actionable recommendations
buy_list = portfolio.get_buy_recommendations(min_confidence=0.75)
print(f"\nHigh-confidence BUY list: {', '.join(buy_list)}")
```

### Example 3: Historical Batch Analysis with Progress Tracking

```python
import requests
from datetime import datetime, timedelta
from tqdm import tqdm
import pandas as pd

BASE_URL = "http://localhost:8002"

class HistoricalAnalyzer:
    def __init__(self):
        self.results_df = None

    def analyze_period(
        self,
        symbols: List[str],
        days_back: int = 30,
        save_csv: bool = True
    ):
        """Analyze stocks over a historical period"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days_back)

        print(f"Analyzing {len(symbols)} stocks from {start_date.date()} to {end_date.date()}")

        response = requests.post(
            f"{BASE_URL}/analyze/batch",
            json={
                "symbols": symbols,
                "start_date": start_date.strftime("%Y-%m-%d"),
                "end_date": end_date.strftime("%Y-%m-%d")
            }
        )

        result = response.json()

        if result['success']:
            print(f"\n✓ Completed: {result['successful_runs']}/{result['trading_days']} days")
            print(f"✗ Failed: {result['failed_runs']}")

            # Convert to DataFrame
            records = []
            for day_result in result['results']:
                if day_result['success']:
                    for symbol, analysis in day_result['result']['analyses'].items():
                        records.append({
                            'date': day_result['date'],
                            'symbol': symbol,
                            'recommendation': analysis['recommendation'],
                            'confidence': analysis['confidence'],
                            'price_target': analysis['price_target']
                        })

            self.results_df = pd.DataFrame(records)

            if save_csv:
                filename = f"analysis_{start_date.date()}_to_{end_date.date()}.csv"
                self.results_df.to_csv(filename, index=False)
                print(f"\n📊 Saved results to: {filename}")

        return result

    def analyze_performance(self):
        """Analyze recommendation patterns"""
        if self.results_df is None:
            print("No data to analyze. Run analyze_period() first.")
            return

        print("\n" + "="*60)
        print("RECOMMENDATION ANALYSIS")
        print("="*60 + "\n")

        # Recommendations by symbol
        print("Recommendations by Symbol:")
        rec_by_symbol = self.results_df.groupby(['symbol', 'recommendation']).size().unstack(fill_value=0)
        print(rec_by_symbol)

        # Average confidence
        print("\n\nAverage Confidence by Symbol:")
        avg_conf = self.results_df.groupby('symbol')['confidence'].mean().sort_values(ascending=False)
        for symbol, conf in avg_conf.items():
            print(f"  {symbol}: {conf:.2%}")

        # Recommendation trends
        print("\n\nDaily Recommendation Distribution:")
        daily_recs = self.results_df.groupby(['date', 'recommendation']).size().unstack(fill_value=0)
        print(daily_recs.tail(10))

# Usage
analyzer = HistoricalAnalyzer()

# Analyze tech stocks for past 60 days
analyzer.analyze_period(
    symbols=["AAPL", "GOOGL", "MSFT", "NVDA", "META", "TSLA"],
    days_back=60,
    save_csv=True
)

# Analyze patterns
analyzer.analyze_performance()
```

### Example 4: Backtesting with Performance Comparison

```python
import requests
from typing import Dict, List
import matplotlib.pyplot as plt

BASE_URL = "http://localhost:8002"

class BacktestRunner:
    def __init__(self):
        self.results = {}

    def run_backtest(self, symbol: str, data_dir: str = "./output/csv") -> Dict:
        """Run backtest for a single symbol"""
        response = requests.post(
            f"{BASE_URL}/backtest",
            json={
                "symbol": symbol,
                "data_dir": data_dir,
                "printlog": False
            }
        )

        result = response.json()

        if result['success']:
            self.results[symbol] = result
            print(f"\n{symbol} Backtest Results:")
            print(f"  PrimoAgent Return: {result['primo_results']['Cumulative Return [%]']:.2f}%")
            print(f"  Buy & Hold Return: {result['buyhold_results']['Cumulative Return [%]']:.2f}%")
            print(f"  Relative Return: {result['comparison']['relative_return']:.2f}%")
            print(f"  Sharpe Ratio: {result['primo_results']['Sharpe Ratio']:.2f}")
            print(f"  Max Drawdown: {result['primo_results']['Max Drawdown [%]']:.2f}%")
            print(f"  Total Trades: {result['primo_results']['Total Trades']}")

        return result

    def batch_backtest(self, symbols: List[str]) -> Dict[str, Dict]:
        """Run backtests for multiple symbols"""
        print(f"Running backtests for {len(symbols)} symbols...\n")

        for symbol in symbols:
            try:
                self.run_backtest(symbol)
            except Exception as e:
                print(f"  ✗ {symbol} failed: {str(e)}")

        return self.results

    def compare_strategies(self):
        """Compare PrimoAgent vs Buy & Hold across all symbols"""
        if not self.results:
            print("No backtest results available.")
            return

        symbols = list(self.results.keys())
        primo_returns = [r['primo_results']['Cumulative Return [%]'] for r in self.results.values()]
        buyhold_returns = [r['buyhold_results']['Cumulative Return [%]'] for r in self.results.values()]

        # Create comparison chart
        fig, ax = plt.subplots(figsize=(12, 6))
        x = range(len(symbols))
        width = 0.35

        ax.bar([i - width/2 for i in x], primo_returns, width, label='PrimoAgent', color='#4CAF50')
        ax.bar([i + width/2 for i in x], buyhold_returns, width, label='Buy & Hold', color='#2196F3')

        ax.set_xlabel('Symbol')
        ax.set_ylabel('Cumulative Return (%)')
        ax.set_title('PrimoAgent vs Buy & Hold Strategy Performance')
        ax.set_xticks(x)
        ax.set_xticklabels(symbols)
        ax.legend()
        ax.grid(axis='y', alpha=0.3)

        plt.tight_layout()
        plt.savefig('backtest_comparison.png', dpi=300)
        print("\n📊 Comparison chart saved to: backtest_comparison.png")

        # Print summary
        wins = sum(1 for r in self.results.values() if r['comparison']['outperformed'])
        print(f"\n{'='*60}")
        print(f"BACKTEST SUMMARY")
        print(f"{'='*60}")
        print(f"PrimoAgent outperformed Buy & Hold: {wins}/{len(symbols)} stocks ({wins/len(symbols)*100:.1f}%)")

        avg_primo = sum(primo_returns) / len(primo_returns)
        avg_buyhold = sum(buyhold_returns) / len(buyhold_returns)
        print(f"\nAverage Returns:")
        print(f"  PrimoAgent: {avg_primo:.2f}%")
        print(f"  Buy & Hold: {avg_buyhold:.2f}%")
        print(f"  Difference: {avg_primo - avg_buyhold:.2f}%")

# Usage
backtester = BacktestRunner()

# Run backtests
backtester.batch_backtest(["AAPL", "GOOGL", "MSFT", "NVDA", "TSLA", "META"])

# Compare results
backtester.compare_strategies()
```

### Example 5: Automated Daily Analysis Pipeline

```python
import requests
import schedule
import time
from datetime import datetime
from typing import List
import json

BASE_URL = "http://localhost:8002"

class DailyAnalysisPipeline:
    def __init__(self, watch_list: List[str], output_file: str = "daily_alerts.json"):
        self.watch_list = watch_list
        self.output_file = output_file
        self.alerts = []

    def run_daily_analysis(self):
        """Run analysis and generate alerts"""
        print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Starting daily analysis...")

        response = requests.post(
            f"{BASE_URL}/analyze",
            json={
                "symbols": self.watch_list,
                "date": datetime.now().strftime("%Y-%m-%d")
            }
        )

        result = response.json()

        if result['success']:
            self.process_results(result['result']['analyses'])
        else:
            print(f"  ✗ Analysis failed: {result.get('detail', 'Unknown error')}")

    def process_results(self, analyses: Dict):
        """Process analysis results and generate alerts"""
        today = datetime.now().strftime("%Y-%m-%d")

        for symbol, analysis in analyses.items():
            recommendation = analysis['recommendation']
            confidence = analysis['confidence']

            # Generate alerts for high-confidence recommendations
            if confidence >= 0.8:
                alert = {
                    "date": today,
                    "symbol": symbol,
                    "recommendation": recommendation,
                    "confidence": confidence,
                    "price_target": analysis['price_target'],
                    "risk_factors": analysis['risk_factors']
                }

                self.alerts.append(alert)

                print(f"  🚨 ALERT: {symbol} - {recommendation} "
                      f"(Confidence: {confidence:.2%}, Target: ${analysis['price_target']:.2f})")

        self.save_alerts()

    def save_alerts(self):
        """Save alerts to JSON file"""
        with open(self.output_file, 'w') as f:
            json.dump(self.alerts, f, indent=2)

        print(f"  💾 Saved {len(self.alerts)} alerts to {self.output_file}")

    def start_scheduler(self, run_time: str = "09:35"):
        """Start scheduled daily runs"""
        schedule.every().day.at(run_time).do(self.run_daily_analysis)

        print(f"Scheduler started. Will run daily at {run_time}")
        print(f"Watching {len(self.watch_list)} symbols: {', '.join(self.watch_list)}")
        print("Press Ctrl+C to stop.\n")

        while True:
            schedule.run_pending()
            time.sleep(60)

# Usage
pipeline = DailyAnalysisPipeline(
    watch_list=["AAPL", "GOOGL", "MSFT", "NVDA", "TSLA", "META", "AMZN"],
    output_file="daily_alerts.json"
)

# Run once immediately
pipeline.run_daily_analysis()

# Or start scheduler for daily runs
# pipeline.start_scheduler(run_time="09:35")  # 9:35 AM after market open
```

## TradingAgents Examples

### Example 1: Basic Trading Decision

```python
import requests
from datetime import datetime

BASE_URL = "http://localhost:8001"

def get_trading_decision(symbol: str, date: str = None):
    """Get trading decision from TradingAgents"""
    response = requests.post(
        f"{BASE_URL}/analyze",
        json={
            "symbol": symbol,
            "date": date or datetime.now().strftime("%Y-%m-%d"),
            "max_debate_rounds": 2
        }
    )

    result = response.json()

    if result['success']:
        decision = result['decision']
        print(f"\n{'='*60}")
        print(f"TRADING DECISION: {symbol}")
        print(f"{'='*60}")
        print(f"Action: {decision['action']}")
        print(f"Confidence: {decision['confidence']:.2%}")
        print(f"\nTechnical Analysis:")
        print(f"  Trend: {decision['analysis']['technical']['trend']}")
        print(f"  RSI: {decision['analysis']['technical']['indicators']['rsi']}")
        print(f"  MACD: {decision['analysis']['technical']['indicators']['macd']}")
        print(f"\nRisk Assessment:")
        print(f"  Level: {decision['risk_assessment']['level']}")
        print(f"  Factors: {', '.join(decision['risk_assessment']['factors'])}")
        print(f"\nRecommendation:")
        print(f"  Position Size: {decision['recommendation']['position_size']:.1%}")
        print(f"  Stop Loss: ${decision['recommendation']['stop_loss']:.2f}")
        print(f"  Take Profit: ${decision['recommendation']['take_profit']:.2f}")

    return result

# Get decision
result = get_trading_decision("AAPL")
```

### Example 2: Advanced Multi-Agent Analysis

```python
import requests
from typing import Dict, List

BASE_URL = "http://localhost:8001"

class TradingAnalyzer:
    def __init__(self, deep_model: str = "gpt-4o-mini", quick_model: str = "gpt-4o-mini"):
        self.deep_model = deep_model
        self.quick_model = quick_model

    def analyze_with_debate(
        self,
        symbol: str,
        debate_rounds: int = 3,
        date: str = None
    ) -> Dict:
        """Run analysis with multiple debate rounds"""
        print(f"\nAnalyzing {symbol} with {debate_rounds} debate rounds...")

        response = requests.post(
            f"{BASE_URL}/analyze",
            json={
                "symbol": symbol,
                "date": date or datetime.now().strftime("%Y-%m-%d"),
                "deep_think_llm": self.deep_model,
                "quick_think_llm": self.quick_model,
                "max_debate_rounds": debate_rounds
            }
        )

        result = response.json()
        return result

    def compare_debate_depths(self, symbol: str) -> Dict:
        """Compare results with different debate depths"""
        rounds = [1, 2, 3]
        results = {}

        print(f"\nComparing debate depths for {symbol}...")

        for round_count in rounds:
            result = self.analyze_with_debate(symbol, debate_rounds=round_count)

            if result['success']:
                decision = result['decision']
                results[round_count] = {
                    'action': decision['action'],
                    'confidence': decision['confidence'],
                    'risk_level': decision['risk_assessment']['level']
                }

                print(f"  {round_count} rounds: {decision['action']} "
                      f"(conf: {decision['confidence']:.2%}, "
                      f"risk: {decision['risk_assessment']['level']})")

        return results

    def batch_analyze_with_reflection(self, symbols: List[str]) -> Dict:
        """Analyze multiple symbols and reflect on aggregate results"""
        results = {}

        for symbol in symbols:
            result = self.analyze_with_debate(symbol, debate_rounds=2)
            if result['success']:
                results[symbol] = result['decision']

        # Reflect on portfolio results (example: assume $1000 profit)
        self.reflect_on_trading(1000.0)

        return results

    def reflect_on_trading(self, returns: float):
        """Update agent memory based on trading results"""
        response = requests.post(
            f"{BASE_URL}/reflect",
            json={"position_returns": returns}
        )

        result = response.json()

        if result['success']:
            print(f"\n💭 Reflection updated: {result['message']}")

# Usage
analyzer = TradingAnalyzer(deep_model="gpt-4o", quick_model="gpt-4o-mini")

# Single analysis with debate
result = analyzer.analyze_with_debate("NVDA", debate_rounds=3)

# Compare debate depths
comparison = analyzer.compare_debate_depths("TSLA")

# Batch analysis with reflection
portfolio_results = analyzer.batch_analyze_with_reflection(
    ["AAPL", "GOOGL", "MSFT"]
)
```

## Advanced Integration Patterns

### Example 1: Combining Both Services for Consensus

```python
import requests
from typing import Dict, List
from datetime import datetime

class ConsensusTrader:
    def __init__(self):
        self.primo_url = "http://localhost:8002"
        self.trading_url = "http://localhost:8001"

    def get_consensus(self, symbol: str, date: str = None) -> Dict:
        """Get consensus from both services"""
        analysis_date = date or datetime.now().strftime("%Y-%m-%d")

        print(f"\nGetting consensus for {symbol}...")

        # Get PrimoAgent analysis
        primo_response = requests.post(
            f"{self.primo_url}/analyze",
            json={"symbols": [symbol], "date": analysis_date}
        )

        # Get TradingAgents decision
        trading_response = requests.post(
            f"{self.trading_url}/analyze",
            json={"symbol": symbol, "date": analysis_date, "max_debate_rounds": 2}
        )

        if not (primo_response.json()['success'] and trading_response.json()['success']):
            return {"success": False, "error": "One or both services failed"}

        primo_result = primo_response.json()['result']['analyses'][symbol]
        trading_result = trading_response.json()['decision']

        # Calculate consensus
        consensus = self.calculate_consensus(primo_result, trading_result)

        print(f"\n{'='*60}")
        print(f"CONSENSUS ANALYSIS: {symbol}")
        print(f"{'='*60}")
        print(f"PrimoAgent: {primo_result['recommendation']} "
              f"(conf: {primo_result['confidence']:.2%})")
        print(f"TradingAgents: {trading_result['action']} "
              f"(conf: {trading_result['confidence']:.2%})")
        print(f"\nConsensus: {consensus['decision']} "
              f"(strength: {consensus['strength']:.2%})")
        print(f"Agreement: {consensus['agreement']}")

        return consensus

    def calculate_consensus(self, primo_result: Dict, trading_result: Dict) -> Dict:
        """Calculate consensus between two analyses"""
        primo_action = primo_result['recommendation']
        trading_action = trading_result['action']

        # Check agreement
        agreement = primo_action == trading_action

        # Calculate consensus strength
        avg_confidence = (primo_result['confidence'] + trading_result['confidence']) / 2

        # Determine final decision
        if agreement:
            decision = primo_action
            strength = avg_confidence * 1.2  # Boost for agreement
        else:
            # Weight by confidence
            if primo_result['confidence'] > trading_result['confidence']:
                decision = primo_action
                strength = avg_confidence * 0.8
            else:
                decision = trading_action
                strength = avg_confidence * 0.8

        strength = min(strength, 1.0)  # Cap at 100%

        return {
            "decision": decision,
            "strength": strength,
            "agreement": agreement,
            "primo_analysis": primo_result,
            "trading_analysis": trading_result
        }

    def portfolio_consensus(self, symbols: List[str]) -> Dict[str, Dict]:
        """Get consensus for multiple symbols"""
        results = {}

        for symbol in symbols:
            try:
                results[symbol] = self.get_consensus(symbol)
            except Exception as e:
                print(f"  ✗ {symbol} failed: {str(e)}")

        return results

# Usage
trader = ConsensusTrader()

# Single symbol consensus
consensus = trader.get_consensus("AAPL")

# Portfolio consensus
portfolio = trader.portfolio_consensus(["AAPL", "GOOGL", "MSFT", "NVDA"])

# Filter strong consensus recommendations
strong_buys = [
    symbol for symbol, result in portfolio.items()
    if result.get('decision') == 'BUY'
    and result.get('strength', 0) >= 0.75
    and result.get('agreement', False)
]

print(f"\n🎯 Strong consensus BUY recommendations: {', '.join(strong_buys)}")
```

### Example 2: Continuous Monitoring System

```python
import requests
import time
from datetime import datetime
from typing import Dict, List
import json
from collections import deque

class ContinuousMonitor:
    def __init__(
        self,
        symbols: List[str],
        check_interval: int = 300,  # 5 minutes
        history_size: int = 50
    ):
        self.symbols = symbols
        self.check_interval = check_interval
        self.primo_url = "http://localhost:8002"
        self.trading_url = "http://localhost:8001"
        self.history = {symbol: deque(maxlen=history_size) for symbol in symbols}

    def check_all_symbols(self):
        """Check all symbols and update history"""
        timestamp = datetime.now()
        print(f"\n[{timestamp.strftime('%H:%M:%S')}] Checking {len(self.symbols)} symbols...")

        for symbol in self.symbols:
            try:
                # Quick check with TradingAgents
                response = requests.post(
                    f"{self.trading_url}/analyze",
                    json={
                        "symbol": symbol,
                        "max_debate_rounds": 1
                    },
                    timeout=30
                )

                if response.json()['success']:
                    decision = response.json()['decision']

                    snapshot = {
                        'timestamp': timestamp.isoformat(),
                        'action': decision['action'],
                        'confidence': decision['confidence'],
                        'risk_level': decision['risk_assessment']['level']
                    }

                    self.history[symbol].append(snapshot)

                    # Check for significant changes
                    self.check_for_alerts(symbol, snapshot)

            except Exception as e:
                print(f"  ✗ {symbol} error: {str(e)}")

    def check_for_alerts(self, symbol: str, current: Dict):
        """Check if current snapshot warrants an alert"""
        history = self.history[symbol]

        if len(history) < 2:
            return

        previous = history[-2]

        # Alert on action change
        if previous['action'] != current['action']:
            print(f"  🚨 {symbol}: Action changed from {previous['action']} "
                  f"to {current['action']}")

        # Alert on high-confidence recommendations
        if current['action'] in ['BUY', 'SELL'] and current['confidence'] >= 0.85:
            print(f"  ⚡ {symbol}: High-confidence {current['action']} "
                  f"({current['confidence']:.2%})")

        # Alert on confidence spike
        conf_change = current['confidence'] - previous['confidence']
        if abs(conf_change) >= 0.2:
            print(f"  📊 {symbol}: Confidence {'increased' if conf_change > 0 else 'decreased'} "
                  f"by {abs(conf_change):.2%}")

    def get_trend_analysis(self, symbol: str, periods: int = 10) -> Dict:
        """Analyze trends for a symbol"""
        history = list(self.history[symbol])[-periods:]

        if len(history) < 2:
            return {"error": "Insufficient data"}

        # Count recommendations
        buy_count = sum(1 for h in history if h['action'] == 'BUY')
        sell_count = sum(1 for h in history if h['action'] == 'SELL')
        hold_count = sum(1 for h in history if h['action'] == 'HOLD')

        # Average confidence
        avg_confidence = sum(h['confidence'] for h in history) / len(history)

        # Trend direction
        recent_actions = [h['action'] for h in history[-3:]]

        return {
            'symbol': symbol,
            'periods_analyzed': len(history),
            'buy_count': buy_count,
            'sell_count': sell_count,
            'hold_count': hold_count,
            'avg_confidence': avg_confidence,
            'recent_trend': recent_actions,
            'recommendation_stability': max(buy_count, sell_count, hold_count) / len(history)
        }

    def print_dashboard(self):
        """Print monitoring dashboard"""
        print(f"\n{'='*80}")
        print(f"MONITORING DASHBOARD - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*80}")

        for symbol in self.symbols:
            if not self.history[symbol]:
                continue

            latest = self.history[symbol][-1]
            trend = self.get_trend_analysis(symbol, periods=10)

            print(f"\n{symbol}:")
            print(f"  Current: {latest['action']} (conf: {latest['confidence']:.2%}, "
                  f"risk: {latest['risk_level']})")
            print(f"  Trend (last 10): BUY:{trend['buy_count']} SELL:{trend['sell_count']} "
                  f"HOLD:{trend['hold_count']}")
            print(f"  Avg Confidence: {trend['avg_confidence']:.2%}")
            print(f"  Stability: {trend['recommendation_stability']:.2%}")

    def start(self):
        """Start continuous monitoring"""
        print(f"Starting continuous monitoring...")
        print(f"Symbols: {', '.join(self.symbols)}")
        print(f"Check interval: {self.check_interval}s")
        print("Press Ctrl+C to stop.\n")

        try:
            while True:
                self.check_all_symbols()
                self.print_dashboard()
                time.sleep(self.check_interval)
        except KeyboardInterrupt:
            print("\n\nMonitoring stopped.")
            self.save_history()

    def save_history(self):
        """Save history to file"""
        filename = f"monitoring_history_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

        history_dict = {
            symbol: list(deque_history)
            for symbol, deque_history in self.history.items()
        }

        with open(filename, 'w') as f:
            json.dump(history_dict, f, indent=2)

        print(f"💾 History saved to: {filename}")

# Usage
monitor = ContinuousMonitor(
    symbols=["AAPL", "GOOGL", "MSFT", "NVDA", "TSLA"],
    check_interval=300,  # 5 minutes
    history_size=50
)

monitor.start()
```

## Production Deployment

### Docker Deployment

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  primoagent:
    build: ./PrimoAgent-main
    ports:
      - "8002:8002"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - GROQ_API_KEY=${GROQ_API_KEY}
      - PERPLEXITY_API_KEY=${PERPLEXITY_API_KEY}
      - FINNHUB_API_KEY=${FINNHUB_API_KEY}
    volumes:
      - ./data/primo:/app/output
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8002/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  tradingagents:
    build: ./TradingAgents
    ports:
      - "8001:8001"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - GROQ_API_KEY=${GROQ_API_KEY}
      - ALPHA_VANTAGE_API_KEY=${ALPHA_VANTAGE_API_KEY}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - primoagent
      - tradingagents
    restart: unless-stopped
```

### Nginx Load Balancing

**nginx.conf**:
```nginx
events {
    worker_connections 1024;
}

http {
    upstream primoagent {
        server primoagent:8002;
    }

    upstream tradingagents {
        server tradingagents:8001;
    }

    server {
        listen 80;

        location /api/primo/ {
            proxy_pass http://primoagent/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /api/trading/ {
            proxy_pass http://tradingagents/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

### Kubernetes Deployment

**k8s-deployment.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: primoagent
spec:
  replicas: 3
  selector:
    matchLabels:
      app: primoagent
  template:
    metadata:
      labels:
        app: primoagent
    spec:
      containers:
      - name: primoagent
        image: primoagent:latest
        ports:
        - containerPort: 8002
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: api-keys
              key: openai
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8002
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: primoagent-service
spec:
  selector:
    app: primoagent
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8002
  type: LoadBalancer
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Connection Errors

```python
import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

def create_resilient_session():
    """Create session with retry logic"""
    session = requests.Session()

    retry = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504],
    )

    adapter = HTTPAdapter(max_retries=retry)
    session.mount('http://', adapter)
    session.mount('https://', adapter)

    return session

# Usage
session = create_resilient_session()
response = session.post("http://localhost:8002/analyze", json={...}, timeout=60)
```

#### 2. API Rate Limiting

```python
import time
from functools import wraps

def rate_limit(calls_per_minute=10):
    """Rate limiting decorator"""
    min_interval = 60.0 / calls_per_minute
    last_called = [0.0]

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            elapsed = time.time() - last_called[0]
            left_to_wait = min_interval - elapsed

            if left_to_wait > 0:
                time.sleep(left_to_wait)

            result = func(*args, **kwargs)
            last_called[0] = time.time()
            return result

        return wrapper
    return decorator

@rate_limit(calls_per_minute=10)
def analyze_stock(symbol):
    return requests.post(f"{BASE_URL}/analyze", json={"symbols": [symbol]})
```

#### 3. Timeout Handling

```python
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError
import requests

def analyze_with_timeout(symbol: str, timeout: int = 60):
    """Analyze with configurable timeout"""
    with ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(
            requests.post,
            f"{BASE_URL}/analyze",
            json={"symbols": [symbol]},
            timeout=timeout
        )

        try:
            response = future.result(timeout=timeout)
            return response.json()
        except FuturesTimeoutError:
            print(f"Analysis for {symbol} timed out after {timeout}s")
            return {"success": False, "error": "timeout"}
        except Exception as e:
            print(f"Error analyzing {symbol}: {str(e)}")
            return {"success": False, "error": str(e)}
```

## Performance Optimization Tips

1. **Batch Operations**: Use batch endpoints for multiple stocks
2. **Caching**: Implement caching for repeated queries
3. **Parallel Requests**: Use `concurrent.futures` for parallel API calls
4. **Connection Pooling**: Reuse sessions for better performance
5. **Error Handling**: Implement retry logic with exponential backoff
6. **Resource Monitoring**: Monitor API quotas and usage

This comprehensive guide should help you effectively use both trading bots in various scenarios from basic analysis to production deployment!
