import BigNumber from 'bignumber.js'
import { MasterNodeRegTestContainer } from '@muirglacier/testcontainers'
import { JsonRpcClient } from '@muirglacier/jellyfish-api-jsonrpc'

export class TestingToken {
  constructor (
    private readonly container: MasterNodeRegTestContainer,
    private readonly rpc: JsonRpcClient
  ) {
  }

  async create (options: TestingTokenCreate): Promise<string> {
    await this.container.waitForWalletBalanceGTE(101) // token creation fee

    return await this.rpc.token.createToken({
      name: options.symbol,
      isDAT: true,
      mintable: true,
      tradeable: true,
      collateralAddress: await this.container.getNewAddress(),
      ...options
    })
  }

  async dfi (options: TestingTokenDFI): Promise<string> {
    const { amount, address } = options
    await this.container.waitForWalletBalanceGTE(new BigNumber(amount).toNumber())

    const to = address ?? await this.container.getNewAddress()
    const account = `${new BigNumber(amount).toFixed(8)}@0`
    return await this.rpc.account.utxosToAccount({ [to]: account })
  }

  async mint (options: TestingTokenMint): Promise<string> {
    const { amount, symbol } = options
    const account = `${new BigNumber(amount).toFixed(8)}@${symbol}`
    return await this.rpc.token.mintTokens(account)
  }

  async send (options: TestingTokenSend): Promise<string> {
    const { address, amount, symbol } = options
    const account = `${new BigNumber(amount).toFixed(8)}@${symbol}`
    const to = { [address]: [account] }
    return await this.rpc.account.sendTokensToAddress({}, to)
  }
}

interface TestingTokenCreate {
  symbol: string
  name?: string
  isDAT?: boolean
  mintable?: boolean
  tradeable?: boolean
  collateralAddress?: string
}

interface TestingTokenDFI {
  address?: string
  amount: number | string
}

interface TestingTokenMint {
  amount: number | string
  symbol: string
}

interface TestingTokenSend {
  address: string
  amount: number | string
  symbol: string
}
