import { MasterNodeRegTestContainer, RegTestContainer } from '@muirglacier/testcontainers'
import { ContainerAdapterClient } from '../../container_adapter_client'
import { BigNumber } from 'bignumber.js'
import { WalletFlag, WalletBalances } from '../../../src/category/wallet'

// TODO(aikchun): Add behavior tests for untrusted_pending, immature, used. Currently unable to do multi-node testing
describe('getBalances on masternode', () => {
  const container = new MasterNodeRegTestContainer()
  const client = new ContainerAdapterClient(container)

  beforeAll(async () => {
    await container.start()
    await container.waitForReady()
    await container.waitForWalletCoinbaseMaturity()
  })

  afterAll(async () => {
    await container.stop()
  })

  it('should getBalances', async () => {
    const balances: WalletBalances = await client.wallet.getBalances()
    expect(BigNumber.isBigNumber(balances.mine.trusted)).toStrictEqual(true)
    expect(BigNumber.isBigNumber(balances.mine.untrusted_pending)).toStrictEqual(true)
    expect(BigNumber.isBigNumber(balances.mine.immature)).toStrictEqual(true)
    expect(typeof balances.mine.used).toStrictEqual('undefined')

    expect(typeof balances.watchonly).toStrictEqual('undefined')
  })

  it('should show balances after sending the amount out', async () => {
    const balanceBefore: WalletBalances = await client.wallet.getBalances()

    await client.wallet.sendToAddress('bcrt1q2tke5fa7wx26m684d7yuyt85rvjl36u6q8l6e2', 10000)
    await container.generate(1)

    const balanceAfter: WalletBalances = await client.wallet.getBalances()

    expect(balanceBefore.mine.trusted.gt(balanceAfter.mine.trusted)).toStrictEqual(true)
  })

  it('test watchOnly', async () => {
    await container.call('importaddress', ['bcrt1q2tke5fa7wx26m684d7yuyt85rvjl36u6q8l6e2'])

    const balances: WalletBalances = await client.wallet.getBalances()

    expect(BigNumber.isBigNumber(balances.watchonly?.trusted)).toStrictEqual(true)
    expect(BigNumber.isBigNumber(balances.watchonly?.untrusted_pending)).toStrictEqual(true)
    expect(BigNumber.isBigNumber(balances.watchonly?.immature)).toStrictEqual(true)
  })
})

describe('getBalances without masternode', () => {
  const container = new RegTestContainer()
  const client = new ContainerAdapterClient(container)

  beforeAll(async () => {
    await container.start()
    await container.waitForReady()
  })

  afterAll(async () => {
    await container.stop()
  })

  it('should getBalances.mine.trusted = 0', async () => {
    const balances: WalletBalances = await client.wallet.getBalances()

    expect(balances.mine.trusted.isEqualTo(new BigNumber('0'))).toStrictEqual(true)
  })
})

describe('getBalances when wallet is set to avoid_reuse', () => {
  const container = new MasterNodeRegTestContainer()
  const client = new ContainerAdapterClient(container)

  beforeAll(async () => {
    await container.start()
    await container.waitForReady()
    await container.waitForWalletCoinbaseMaturity()
    await client.wallet.setWalletFlag(WalletFlag.AVOID_REUSE)
    await container.generate(1)
  })

  afterAll(async () => {
    await container.stop()
  })

  it('should have used', async () => {
    const balances: WalletBalances = await client.wallet.getBalances()

    expect(BigNumber.isBigNumber(balances.mine.trusted)).toStrictEqual(true)
    expect(BigNumber.isBigNumber(balances.mine.untrusted_pending)).toStrictEqual(true)
    expect(BigNumber.isBigNumber(balances.mine.immature)).toStrictEqual(true)
    expect(BigNumber.isBigNumber(balances.mine.used)).toStrictEqual(true)

    expect(typeof balances.watchonly).toStrictEqual('undefined')
  })
})
