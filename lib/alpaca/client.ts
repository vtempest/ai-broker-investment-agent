import Alpaca from '@alpacahq/alpaca-trade-api'

export interface AlpacaConfig {
  paper?: boolean
  keyId?: string
  secretKey?: string
}

export function createAlpacaClient(config?: Partial<AlpacaConfig>) {
  const keyId = config?.keyId || process.env.ALPACA_API_KEY || ""
  const secretKey = config?.secretKey || process.env.ALPACA_SECRET || ""

  if (!keyId || !secretKey) {
    console.warn("Alpaca keys missing - check .env")
  }

  return new Alpaca({
    keyId,
    secretKey,
    paper: config?.paper ?? true,
  })
}

export type { Alpaca }
