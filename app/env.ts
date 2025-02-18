import { Environment } from "@getpara/react-sdk"

export type Env = {
  contract: string
  rpc: string
  apiKey: string
  environment: Environment
}

export const env : Env = {
  contract: 'CHANGEME',
  rpc : 'CHANGEME',
  apiKey : 'CHANGEME',
  environment : Environment.PRODUCTION,
}
