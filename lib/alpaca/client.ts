import Alpaca from '@alpacahq/alpaca-trade-api'

export interface AlpacaConfig {
  keyId: string
  secretKey: string
  paper?: boolean
}

export function createAlpacaClient(config: AlpacaConfig) {
  return new Alpaca({
    keyId: config.keyId,
    secretKey: config.secretKey,
    paper: config.paper ?? true,
  })
}

export type { Alpaca }
