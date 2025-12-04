# Research Bot Server

A comprehensive Hono-based server for managing and scheduling AI-powered stock research bots with job queuing, automatic daily analysis, and detailed tracking.

## Features

- **Job Queue Management**: BullMQ-powered job queue with Redis backend
- **Daily Scheduling**: Automated daily analysis at market open (configurable via cron)
- **Multiple Analysis Sources**:
  - PrimoAgent: Deep financial analysis with backtesting
  - TradingAgents: Multi-agent debate system
  - Consensus: Combined analysis from both sources
- **Stock Tracking**: Monitor and manage tracked stocks with priority levels
- **Analysis History**: Complete history of all analysis jobs and results
- **Smart Alerts**: Automatic alerts for high-confidence signals and consensus
- **RESTful API**: Full CRUD operations for stocks, jobs, and analysis
- **Real-time Metrics**: Queue statistics and system monitoring

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Research Bot Server                       │
│                         (Hono)                                │
└─────────────────┬───────────────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
┌─────────┐  ┌──────────┐  ┌──────────┐
│  API    │  │ Scheduler│  │  Queue   │
│ Routes  │  │  (Cron)  │  │ (BullMQ) │
└────┬────┘  └─────┬────┘  └────┬─────┘
     │             │             │
     └─────────────┼─────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
         ▼                   ▼
  ┌─────────────┐    ┌──────────────┐
  │   Worker    │    │   Database   │
  │  (BullMQ)   │    │  (SQLite)    │
  └──────┬──────┘    └──────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────────┐
│ Primo  │ │  Trading     │
│ Agent  │ │  Agents      │
└────────┘ └──────────────┘
```

## Prerequisites

- Node.js 18+
- Redis (for job queue)
- PrimoAgent API running on port 8002
- TradingAgents API running on port 8001

## Installation

```bash
cd services/research-bot-server

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

## Configuration

Edit `.env` file:

```bash
# Server
PORT=3000
NODE_ENV=development

# Redis (required for job queue)
REDIS_HOST=localhost
REDIS_PORT=6379

# Research Bot APIs
PRIMO_AGENT_URL=http://localhost:8002
TRADING_AGENTS_URL=http://localhost:8001

# Daily Analysis Schedule
# Cron format: "minute hour day-of-month month day-of-week"
# Default: 9:35 AM EST, Monday-Friday (5 minutes after market open)
DAILY_ANALYSIS_CRON=35 9 * * 1-5

# Core stocks to track
CORE_STOCKS=AAPL,GOOGL,MSFT,NVDA,TSLA,META,AMZN

# Job Configuration
MAX_CONCURRENT_JOBS=3
JOB_TIMEOUT_MS=300000
RETRY_ATTEMPTS=3
```

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Using Docker
```bash
docker build -t research-bot-server .
docker run -p 3000:3000 --env-file .env research-bot-server
```

## API Documentation

### Base URL
```
http://localhost:3000
```

### Endpoints

#### Health & System

**GET /** - Server info
```bash
curl http://localhost:3000/
```

**GET /health** - Health check with queue stats
```bash
curl http://localhost:3000/health
```

**GET /api/system/info** - System configuration
```bash
curl http://localhost:3000/api/system/info
```

#### Stocks Management

**GET /api/stocks** - List all tracked stocks
```bash
curl http://localhost:3000/api/stocks
```

**GET /api/stocks/:symbol** - Get stock details
```bash
curl http://localhost:3000/api/stocks/AAPL
```

**POST /api/stocks** - Add tracked stock
```bash
curl -X POST http://localhost:3000/api/stocks \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "sector": "Technology",
    "priority": 8
  }'
```

**PATCH /api/stocks/:symbol** - Update stock
```bash
curl -X PATCH http://localhost:3000/api/stocks/AAPL \
  -H "Content-Type: application/json" \
  -d '{"priority": 9, "enabled": true}'
```

**DELETE /api/stocks/:symbol** - Remove stock
```bash
curl -X DELETE http://localhost:3000/api/stocks/AAPL
```

**GET /api/stocks/:symbol/stats** - Get stock statistics
```bash
curl http://localhost:3000/api/stocks/AAPL/stats
```

#### Jobs Management

**GET /api/jobs/stats** - Queue statistics
```bash
curl http://localhost:3000/api/jobs/stats
```

**GET /api/jobs/history** - Job history
```bash
curl "http://localhost:3000/api/jobs/history?limit=50&status=completed"
```

**POST /api/jobs** - Create single job
```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "jobType": "consensus",
    "priority": 8
  }'
```

**POST /api/jobs/batch** - Create batch jobs
```bash
curl -X POST http://localhost:3000/api/jobs/batch \
  -H "Content-Type: application/json" \
  -d '{
    "symbols": ["AAPL", "GOOGL", "MSFT"],
    "jobType": "consensus"
  }'
```

**POST /api/jobs/trigger-daily** - Trigger immediate daily analysis
```bash
curl -X POST http://localhost:3000/api/jobs/trigger-daily \
  -H "Content-Type: application/json" \
  -d '{"symbols": ["AAPL", "GOOGL"]}'
```

**POST /api/jobs/clear** - Clear queue
```bash
curl -X POST http://localhost:3000/api/jobs/clear
```

**GET /api/jobs/:jobId** - Get job details
```bash
curl http://localhost:3000/api/jobs/primo-AAPL-1234567890
```

#### Analysis Results

**GET /api/analysis** - Get analysis results
```bash
curl "http://localhost:3000/api/analysis?symbol=AAPL&limit=20"
```

**GET /api/analysis/latest/:symbol** - Latest analysis for symbol
```bash
curl http://localhost:3000/api/analysis/latest/AAPL
```

**GET /api/analysis/trends/:symbol** - Analysis trends
```bash
curl "http://localhost:3000/api/analysis/trends/AAPL?days=30"
```

**GET /api/analysis/dashboard** - Dashboard summary
```bash
curl http://localhost:3000/api/analysis/dashboard
```

**GET /api/analysis/alerts** - Get alerts
```bash
curl "http://localhost:3000/api/analysis/alerts?unread=true"
```

**PATCH /api/analysis/alerts/:id/read** - Mark alert as read
```bash
curl -X PATCH http://localhost:3000/api/analysis/alerts/123/read
```

## Usage Examples

### Example 1: Setup and Start Daily Analysis

```bash
# 1. Add stocks to track
curl -X POST http://localhost:3000/api/stocks \
  -H "Content-Type: application/json" \
  -d '{"symbol": "AAPL", "priority": 9}'

curl -X POST http://localhost:3000/api/stocks \
  -H "Content-Type: application/json" \
  -d '{"symbol": "GOOGL", "priority": 8}'

# 2. Trigger immediate analysis (don't wait for scheduled time)
curl -X POST http://localhost:3000/api/jobs/trigger-daily

# 3. Check job progress
curl http://localhost:3000/api/jobs/stats

# 4. View results
curl http://localhost:3000/api/analysis/dashboard
```

### Example 2: Monitor Specific Stock

```bash
# Get latest analysis
curl http://localhost:3000/api/analysis/latest/AAPL

# Get 30-day trends
curl "http://localhost:3000/api/analysis/trends/AAPL?days=30"

# Get detailed stats
curl http://localhost:3000/api/stocks/AAPL/stats
```

### Example 3: Manual Job Execution

```bash
# Run PrimoAgent analysis only
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"symbol": "NVDA", "jobType": "primo"}'

# Run TradingAgents analysis only
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"symbol": "NVDA", "jobType": "trading"}'

# Run consensus (both)
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"symbol": "NVDA", "jobType": "consensus"}'
```

### Example 4: TypeScript Client

```typescript
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

class ResearchBotClient {
  async addStock(symbol: string, priority = 5) {
    return axios.post(`${BASE_URL}/api/stocks`, {
      symbol,
      priority,
    });
  }

  async triggerDailyAnalysis(symbols?: string[]) {
    return axios.post(`${BASE_URL}/api/jobs/trigger-daily`, { symbols });
  }

  async getLatestAnalysis(symbol: string) {
    const { data } = await axios.get(
      `${BASE_URL}/api/analysis/latest/${symbol}`
    );
    return data;
  }

  async getDashboard() {
    const { data } = await axios.get(`${BASE_URL}/api/analysis/dashboard`);
    return data;
  }

  async getAlerts(unreadOnly = true) {
    const { data } = await axios.get(
      `${BASE_URL}/api/analysis/alerts?unread=${unreadOnly}`
    );
    return data.alerts;
  }
}

// Usage
const client = new ResearchBotClient();

// Add stocks
await client.addStock('AAPL', 9);
await client.addStock('GOOGL', 8);

// Trigger analysis
await client.triggerDailyAnalysis();

// Check results
const dashboard = await client.getDashboard();
console.log('Today\'s analyses:', dashboard.summary.totalAnalyses);

// Get alerts
const alerts = await client.getAlerts();
console.log('Unread alerts:', alerts.length);
```

## Database Schema

The server uses SQLite with the following tables:

- **tracked_stocks**: Stocks being monitored
- **job_history**: Complete job execution history
- **analysis_results**: All analysis results from bots
- **alerts**: System alerts and notifications
- **system_metrics**: Performance and system metrics

## Scheduling

The server runs automated daily analysis based on the cron schedule. Default:
- **Time**: 9:35 AM EST (5 minutes after market open)
- **Days**: Monday-Friday (trading days)
- **Timezone**: America/New_York

Customize via `DAILY_ANALYSIS_CRON` environment variable.

## Job Queue

Uses BullMQ with Redis for robust job processing:
- **Concurrent Jobs**: Configurable (default: 3)
- **Retry Logic**: Exponential backoff
- **Job Persistence**: Redis-backed
- **Job History**: Stored in SQLite

## Logging

Logs are written to:
- Console (development)
- `./logs/research-bot.log` (all logs)
- `./logs/error.log` (errors only)

Log level configurable via `LOG_LEVEL` environment variable.

## Production Deployment

### Using PM2
```bash
npm install -g pm2
pm2 start dist/index.js --name research-bot-server
pm2 save
pm2 startup
```

### Using Docker Compose
```yaml
version: '3.8'

services:
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

  research-bot-server:
    build: .
    ports:
      - "3000:3000"
    environment:
      - REDIS_HOST=redis
    depends_on:
      - redis
    restart: unless-stopped
```

## Monitoring

Monitor system health:
```bash
# Health check
curl http://localhost:3000/health

# Queue stats
curl http://localhost:3000/api/jobs/stats

# Recent job history
curl "http://localhost:3000/api/jobs/history?limit=10"

# Dashboard
curl http://localhost:3000/api/analysis/dashboard
```

## Troubleshooting

### Redis Connection Errors
Ensure Redis is running:
```bash
redis-cli ping
# Should return: PONG
```

### Job Timeouts
Increase timeout in `.env`:
```bash
JOB_TIMEOUT_MS=600000  # 10 minutes
```

### Worker Not Processing Jobs
Check worker logs and restart:
```bash
npm run dev
# Check console for worker startup messages
```

## License

MIT
