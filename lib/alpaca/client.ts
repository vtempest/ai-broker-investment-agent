import Alpaca from '@alpacahq/alpaca-trade-api'

interface AlpacaConfig {
  keyId?: string
  secretKey?: string
  paper?: boolean
}

/**
 * Creates an Alpaca API client instance
 * Falls back to environment variables if credentials are not provided
 */
export function createAlpacaClient(config: AlpacaConfig) {
  const keyId = config.keyId || process.env.ALPACA_API_KEY
  const secretKey = config.secretKey || process.env.ALPACA_SECRET
  const paper = config.paper ?? true

  if (!keyId || !secretKey) {
    throw new Error('Alpaca API credentials are required')
  }

  return new Alpaca({
    keyId,
    secretKey,
    paper,
  })
}
