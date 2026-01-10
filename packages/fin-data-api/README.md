# Financial Data API

A comprehensive TypeScript financial data API with **Scalar OpenAPI documentation**, converted from the OpenBB Finance APIs Python codebase. This API provides access to multiple financial data sources including Congressional data, earnings calendars, and CFTC reports.

## 🌟 Features

- **TypeScript**: Full type safety with TypeScript and Zod validation
- **Scalar OpenAPI Documentation**: Beautiful, interactive API documentation
- **Multiple Data Providers**: Congress.gov, Seeking Alpha, CFTC, and more
- **Modern Express Server**: Fast, secure, and scalable
- **Standardized Responses**: Consistent OBBject response format
- **Error Handling**: Comprehensive error handling with detailed messages
- **Data Validation**: Zod schemas for request/response validation

## 📚 Data Providers

### Congress.gov
- Congressional bills (House & Senate)
- Bill types: HR, S, Joint Resolutions, Concurrent Resolutions, Simple Resolutions
- Historical data from 1993 (103rd Congress)
- Full text versions and metadata

### Seeking Alpha
- Earnings calendar data
- US and Canadian markets
- Market cap, exchange, sector information
- Reporting times and dates

### CFTC (Commodity Futures Trading Commission)
- Commitment of Traders (COT) reports
- Legacy, Disaggregated, and Financial (TFF) reports
- Historical data from 1995
- Futures-only and combined reports

## 🚀 Quick Start

### Installation

```bash
cd packages/fin-data-api
npm install
```

### Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Add your API keys to `.env`:
```env
CONGRESS_GOV_API_KEY=your_key_here
CFTC_APP_TOKEN=your_token_here
```

Get API keys:
- Congress.gov: https://api.congress.gov/sign-up/
- CFTC: https://data.cftc.gov/login

### Running the Server

```bash
# Development mode with hot reload
npm run dev

# Build TypeScript
npm run build

# Production mode
npm start
```

The server will start at `http://localhost:3000`

## 📖 API Documentation

Once the server is running, access the interactive Scalar documentation at:

**http://localhost:3000/docs**

The OpenAPI spec is available at:

**http://localhost:3000/openapi.json**

## 🔌 API Endpoints

### Congressional Bills

```http
GET /api/congress/bills
```

**Query Parameters:**
- `congress` (integer): Congress number (e.g., 118)
- `bill_type` (string): hr, s, hjres, sjres, hconres, sconres, hres, sres
- `start_date` (date): Filter by update date (YYYY-MM-DD)
- `end_date` (date): Filter by update date (YYYY-MM-DD)
- `limit` (integer): Max results (default: 100, max: 250, 0 for all)
- `offset` (integer): Skip results (default: 0)
- `sort_by` (string): asc or desc (default: desc)

**Example:**
```bash
curl "http://localhost:3000/api/congress/bills?bill_type=hr&congress=118&limit=10"
```

### Earnings Calendar

```http
GET /api/earnings/calendar
```

**Query Parameters:**
- `start_date` (date): Start date (YYYY-MM-DD)
- `end_date` (date): End date (YYYY-MM-DD)
- `country` (string): us or ca (default: us)

**Example:**
```bash
curl "http://localhost:3000/api/earnings/calendar?start_date=2024-01-01&end_date=2024-01-07&country=us"
```

### CFTC Commitment of Traders

```http
GET /api/cftc/cot
```

**Query Parameters:**
- `id` (string): Commodity code, name, or "all" (default: all)
- `start_date` (date): Start date (YYYY-MM-DD)
- `end_date` (date): End date (YYYY-MM-DD)
- `report_type` (string): legacy, disaggregated, financial, supplemental (default: legacy)
- `futures_only` (boolean): true or false (default: false)

**Example:**
```bash
curl "http://localhost:3000/api/cftc/cot?id=gold&report_type=legacy"
```

## 📦 Response Format

All endpoints return data in the standardized OBBject format:

```json
{
  "results": [...],
  "provider": "congress_gov",
  "warnings": [],
  "extra": {}
}
```

### Example Response

```json
{
  "results": [
    {
      "update_date": "2024-01-15",
      "latest_action_date": "2024-01-14",
      "bill_url": "https://api.congress.gov/v3/bill/118/hr/1234",
      "congress": 118,
      "bill_number": 1234,
      "origin_chamber": "House",
      "origin_chamber_code": "H",
      "bill_type": "hr",
      "title": "Example Bill Title",
      "latest_action": "Referred to committee"
    }
  ],
  "provider": "congress_gov"
}
```

## 🏗️ Project Structure

```
fin-data-api/
├── src/
│   ├── api/
│   │   ├── routers/
│   │   │   ├── congressRouter.ts
│   │   │   ├── earningsRouter.ts
│   │   │   └── cftcRouter.ts
│   │   └── openapi.ts
│   ├── providers/
│   │   ├── congress_gov/
│   │   │   ├── models/
│   │   │   │   └── congressBills.ts
│   │   │   └── utils/
│   │   │       ├── constants.ts
│   │   │       └── helpers.ts
│   │   ├── seeking_alpha/
│   │   │   ├── models/
│   │   │   │   └── calendarEarnings.ts
│   │   │   └── utils/
│   │   │       └── helpers.ts
│   │   └── cftc/
│   │       └── models/
│   │           └── cot.ts
│   ├── types/
│   │   └── base.ts
│   ├── utils/
│   │   ├── http.ts
│   │   └── dates.ts
│   └── index.ts
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🛠️ Development

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Testing

```bash
npm test
```

## 🔒 Authentication

API keys can be provided in two ways:

1. **Environment Variables** (recommended):
   ```env
   CONGRESS_GOV_API_KEY=your_key
   CFTC_APP_TOKEN=your_token
   ```

2. **Request Headers**:
   ```http
   X-Congress-Api-Key: your_key
   X-Cftc-App-Token: your_token
   ```

## 🌐 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
CONGRESS_GOV_API_KEY=xxx
CFTC_APP_TOKEN=xxx
```

### Docker Deployment (Optional)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Check the Scalar documentation at `/docs`

## 🙏 Acknowledgments

This project is a TypeScript conversion of the OpenBB Finance APIs Python codebase. Special thanks to the OpenBB team for the original implementation and data provider integrations.

---

**Built with ❤️ using TypeScript, Express, Zod, and Scalar**
