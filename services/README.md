# Trading Bots Services

This directory contains AI-powered trading analysis bots with comprehensive management and scheduling capabilities.

## Services Overview

### 1. Research Bot Server (NEW!)
Hono-based orchestration server for managing research bots with job scheduling.
- **Port**: 3000
- **Features**: Job queue management, daily scheduling, stock tracking, alerts, consensus analysis
- **Architecture**: Hono + BullMQ + Redis + SQLite
- **Purpose**: Orchestrate and schedule analysis from both PrimoAgent and TradingAgents

### 2. TradingAgents
Multi-agent trading analysis system using LangGraph for decision-making.
- **Port**: 8001
- **Features**: Technical analysis, fundamental analysis, news sentiment, social media analysis
- **Architecture**: Multi-agent debate system with risk management

### 3. PrimoAgent
AI financial analysis and backtesting platform.
- **Port**: 8002
- **Features**: Comprehensive stock analysis, backtesting, batch analysis
- **Architecture**: LangGraph workflow with multiple analysis agents

## 🆕 What's New

### Groq Integration
Both PrimoAgent and TradingAgents now support **Groq** for ultra-fast inference:
- **Speed**: Up to 750+ tokens/sec (20x faster than OpenAI)
- **Models**: Llama 3.1 (405B, 70B, 8B), Mixtral, Gemma
- **Cost**: Free tier available at https://console.groq.com
- **Configuration**: Set `GROQ_API_KEY` in `.env` files

### Comprehensive Examples Guide
See `COMPREHENSIVE_EXAMPLES_GUIDE.md` for:
- Architecture diagrams
- Python and TypeScript client examples
- Production deployment patterns
- Advanced integration strategies
- Consensus trading algorithms
- Continuous monitoring systems

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- Redis (for Research Bot Server)
- API Keys (see Environment Variables below)

### Environment Variables

Create `.env` files in each service directory:

#### Research Bot Server (.env)
```bash
# Server Configuration
PORT=3000
REDIS_HOST=localhost
REDIS_PORT=6379

# Bot APIs
PRIMO_AGENT_URL=http://localhost:8002
TRADING_AGENTS_URL=http://localhost:8001

# Scheduling (9:35 AM EST, Monday-Friday)
DAILY_ANALYSIS_CRON=35 9 * * 1-5

# Stocks to track
CORE_STOCKS=AAPL,GOOGL,MSFT,NVDA,TSLA,META,AMZN
```

#### TradingAgents (.env)
```bash
# LLM Provider (choose one)
OPENAI_API_KEY=your_openai_api_key
# OR use Groq for faster inference
GROQ_API_KEY=your_groq_api_key

# Optional: Alpha Vantage for financial data
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key

# Optional: Reddit API for social sentiment
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_secret
REDDIT_USER_AGENT=your_app_name

# Server Port
PORT=8001
```

#### PrimoAgent (.env)
```bash
# LLM Provider (choose one)
OPENAI_API_KEY=your_openai_api_key
# OR use Groq for ultra-fast inference (recommended)
GROQ_API_KEY=your_groq_api_key

# Optional: Tavily for search
TAVILY_API_KEY=your_tavily_key

# Optional: Perplexity for research
PERPLEXITY_API_KEY=your_perplexity_key

# Optional: Finnhub for financial data
FINNHUB_API_KEY=your_finnhub_key

# Server Port
PORT=8002
```

## Installation & Setup

### Research Bot Server (Recommended - Start Here)

```bash
cd services/research-bot-server

# Install dependencies
npm install

# Create .env file
cp .env.example .env
nano .env  # Configure your settings

# Start with Docker Compose (includes Redis)
docker-compose up -d

# OR run manually (requires Redis running separately)
npm run dev
```

Server will be available at: `http://localhost:3000`

Dashboard: `http://localhost:3000/api/analysis/dashboard`

**Note:** The Research Bot Server automatically manages both PrimoAgent and TradingAgents, scheduling daily analysis and providing a unified API.

### TradingAgents

```bash
cd services/TradingAgents

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-api.txt

# Create .env file with your API keys
cp .env.example .env
nano .env  # Add your API keys

# Run the API server
python api_server.py
```

Server will be available at: `http://localhost:8001`

### PrimoAgent

```bash
cd services/PrimoAgent-main

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-api.txt

# Create .env file with your API keys
cp .env.example .env
nano .env  # Add your API keys

# Run the API server
python api_server.py
```

Server will be available at: `http://localhost:8002`

## Running with Docker

### TradingAgents
```bash
cd services/TradingAgents
docker build -t tradingagents-api .
docker run -p 8001:8001 --env-file .env tradingagents-api
```

### PrimoAgent
```bash
cd services/PrimoAgent-main
docker build -t primoagent-api .
docker run -p 8002:8002 --env-file .env primoagent-api
```

## API Documentation

Once running, visit:
- TradingAgents: http://localhost:8001/docs
- PrimoAgent: http://localhost:8002/docs

Interactive API documentation (Swagger UI) is automatically available.

## Testing the APIs

### Test TradingAgents
```bash
# Health check
curl http://localhost:8001/health

# Analyze a stock
curl -X POST http://localhost:8001/analyze \
  -H "Content-Type: application/json" \
  -d '{"symbol": "AAPL", "date": "2024-05-10"}'
```

### Test PrimoAgent
```bash
# Health check
curl http://localhost:8002/health

# Analyze a stock
curl -X POST http://localhost:8002/analyze \
  -H "Content-Type: application/json" \
  -d '{"symbols": ["AAPL"], "date": "2024-05-10"}'
```

## Integration with Main App

The main Next.js application can call these APIs:

```typescript
// Example: Call TradingAgents API
const response = await fetch('http://localhost:8001/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    symbol: 'AAPL',
    date: '2024-05-10'
  })
})
const data = await response.json()
```

## Production Deployment

### Using PM2 (Process Manager)
```bash
# Install PM2
npm install -g pm2

# Start TradingAgents
cd services/TradingAgents
pm2 start api_server.py --name tradingagents --interpreter python

# Start PrimoAgent
cd services/PrimoAgent-main
pm2 start api_server.py --name primoagent --interpreter python

# Save configuration
pm2 save
pm2 startup
```

### Using systemd (Linux)
Create service files in `/etc/systemd/system/`:

```ini
# /etc/systemd/system/tradingagents.service
[Unit]
Description=TradingAgents API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/services/TradingAgents
Environment="PATH=/path/to/venv/bin"
ExecStart=/path/to/venv/bin/python api_server.py
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start services
sudo systemctl enable tradingagents
sudo systemctl start tradingagents
sudo systemctl status tradingagents
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Change PORT in .env file or kill existing process
   lsof -ti:8001 | xargs kill -9
   ```

2. **Missing API keys**
   - Ensure all required API keys are set in `.env`
   - Check environment variables: `printenv | grep API_KEY`

3. **Module not found**
   - Ensure virtual environment is activated
   - Reinstall dependencies: `pip install -r requirements.txt`

4. **CORS errors**
   - Both APIs have CORS enabled for all origins
   - Check if API is running: `curl http://localhost:8001/health`

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Check the individual service READMEs for detailed documentation
- Review API docs at `/docs` endpoint

## License

See main repository LICENSE file.
