import { LoanMasterNodeRegTestContainer } from './loan_container'
import BigNumber from 'bignumber.js'
import { Testing } from '@muirglacier/jellyfish-testing'
import { RpcApiError } from '@muirglacier/jellyfish-api-core'

const container = new LoanMasterNodeRegTestContainer()
const testing = Testing.create(container)
let oracleId: string
let timestamp: number
const priceFeeds = [
  { token: 'DFI', currency: 'USD' },
  { token: 'UBER', currency: 'USD' }
]

async function setup (): Promise<void> {
  // token setup
  const aliceColAddr = await testing.generateAddress()
  await testing.token.dfi({ address: aliceColAddr, amount: 100000 })
  await testing.generate(1)

  // oracle setup
  const addr = await testing.generateAddress()
  oracleId = await testing.rpc.oracle.appointOracle(addr, priceFeeds, { weightage: 1 })
  await testing.generate(1)

  timestamp = Math.floor(new Date().getTime() / 1000)
  await testing.rpc.oracle.setOracleData(
    oracleId,
    timestamp,
    {
      prices: [
        { tokenAmount: '1@DFI', currency: 'USD' },
        { tokenAmount: '8@UBER', currency: 'USD' }
      ]
    }
  )
  await testing.generate(1)

  // setCollateralToken DFI
  await testing.rpc.loan.setCollateralToken({
    token: 'DFI',
    factor: new BigNumber(1),
    fixedIntervalPriceId: 'DFI/USD'
  })
  await testing.generate(1)

  // setLoanToken UBER
  await testing.rpc.loan.setLoanToken({
    symbol: 'UBER',
    fixedIntervalPriceId: 'UBER/USD'
  })
  await testing.generate(1)
}

describe('Oracle', () => {
  beforeAll(async () => {
    await testing.container.start()
    await testing.container.waitForWalletCoinbaseMaturity()
    await setup()
  })

  afterAll(async () => {
    await testing.container.stop()
  })

  it('should getFixedIntervalPrices', async () => {
    {
      const price = await testing.rpc.oracle.getFixedIntervalPrice('UBER/USD')
      expect(price).toStrictEqual({
        activePriceBlock: expect.any(Number),
        nextPriceBlock: expect.any(Number),
        fixedIntervalPriceId: 'UBER/USD',
        activePrice: new BigNumber('0'),
        nextPrice: new BigNumber('8'),
        timestamp: expect.any(Number),
        isLive: false
      })
    }

    {
      await testing.container.waitForPriceValid('UBER/USD')
      const price = await testing.rpc.oracle.getFixedIntervalPrice('UBER/USD')
      expect(price).toStrictEqual({
        activePriceBlock: expect.any(Number),
        nextPriceBlock: expect.any(Number),
        fixedIntervalPriceId: 'UBER/USD',
        activePrice: new BigNumber('8'),
        nextPrice: new BigNumber('8'),
        timestamp: expect.any(Number),
        isLive: true
      })
    }

    {
      await testing.rpc.oracle.setOracleData(oracleId, timestamp, { prices: [{ tokenAmount: '32@UBER', currency: 'USD' }] })
      await testing.container.waitForPriceInvalid('UBER/USD')

      const pricesBefore = await testing.rpc.oracle.getFixedIntervalPrice('UBER/USD')
      expect(pricesBefore).toStrictEqual({
        activePriceBlock: expect.any(Number),
        nextPriceBlock: expect.any(Number),
        fixedIntervalPriceId: 'UBER/USD',
        activePrice: new BigNumber('8'),
        nextPrice: new BigNumber('32'),
        timestamp: expect.any(Number),
        isLive: false
      })

      await testing.container.waitForPriceValid('UBER/USD')
      const priceAfter = await testing.rpc.oracle.getFixedIntervalPrice('UBER/USD')
      expect(priceAfter).toStrictEqual({
        activePriceBlock: expect.any(Number),
        nextPriceBlock: expect.any(Number),
        fixedIntervalPriceId: 'UBER/USD',
        activePrice: new BigNumber('32'),
        nextPrice: new BigNumber('32'),
        timestamp: expect.any(Number),
        isLive: true
      })
    }

    // should getFixedIntervalPrice with latest price
    {
      await testing.rpc.oracle.setOracleData(oracleId, timestamp, { prices: [{ tokenAmount: '10@UBER', currency: 'USD' }] })
      await testing.generate(1)
      await testing.rpc.oracle.setOracleData(oracleId, timestamp, { prices: [{ tokenAmount: '12@UBER', currency: 'USD' }] })
      await testing.generate(1)
      await testing.container.waitForPriceInvalid('UBER/USD')
      const price = await testing.rpc.oracle.getFixedIntervalPrice('UBER/USD')
      expect(price).toStrictEqual({
        activePriceBlock: expect.any(Number),
        nextPriceBlock: expect.any(Number),
        fixedIntervalPriceId: 'UBER/USD',
        activePrice: new BigNumber('32'),
        nextPrice: new BigNumber('12'),
        timestamp: expect.any(Number),
        isLive: false
      })
    }
  })

  it('should not getFixedIntervalPrice as empty id', async () => {
    const promise = testing.rpc.oracle.getFixedIntervalPrice('')
    await expect(promise).rejects.toThrow(RpcApiError)
    await expect(promise).rejects.toThrow('Invalid parameters, argument "fixedIntervalPriceId" must be non-null')
  })

  it('should not getFixedIntervalPrice as non-existence price id', async () => {
    const promise = testing.rpc.oracle.getFixedIntervalPrice('DURIAN/USD')
    await expect(promise).rejects.toThrow(RpcApiError)
    await expect(promise).rejects.toThrow('fixedIntervalPrice with id <DURIAN/USD> not found')
  })
})

describe('Multi Oracles', () => {
  beforeAll(async () => {
    await testing.container.start()
    await testing.container.waitForWalletCoinbaseMaturity()
    await setup()
  })

  afterAll(async () => {
    await testing.container.stop()
  })

  it('should getFixedIntervalPrices with several oracles', async () => {
    // another oracle setup
    {
      const addr = await testing.generateAddress()
      const oracleId1 = await testing.rpc.oracle.appointOracle(addr, priceFeeds, { weightage: 1 })
      await testing.generate(1)

      await testing.rpc.oracle.setOracleData(
        oracleId1,
        timestamp,
        {
          prices: [
            { tokenAmount: '1@DFI', currency: 'USD' },
            { tokenAmount: '9@UBER', currency: 'USD' }
          ]
        }
      )
      await testing.generate(1)

      const oracle = await testing.rpc.oracle.getOracleData(oracleId)
      expect(oracle.tokenPrices[1]).toStrictEqual({
        token: 'UBER',
        currency: 'USD',
        amount: 8,
        timestamp: expect.any(Number)
      })

      const oracle1 = await testing.rpc.oracle.getOracleData(oracleId1)
      expect(oracle1.tokenPrices[1]).toStrictEqual({
        token: 'UBER',
        currency: 'USD',
        amount: 9,
        timestamp: expect.any(Number)
      })
    }

    {
      const prices = await testing.rpc.oracle.listPrices()
      expect(prices[1]).toStrictEqual({
        token: 'UBER',
        currency: 'USD',
        price: new BigNumber('8.5'),
        ok: true
      })
    }

    {
      const price = await testing.rpc.oracle.getFixedIntervalPrice('UBER/USD')
      expect(price).toStrictEqual({
        activePriceBlock: expect.any(Number),
        nextPriceBlock: expect.any(Number),
        fixedIntervalPriceId: 'UBER/USD',
        activePrice: new BigNumber('8'),
        nextPrice: new BigNumber('8.5'),
        timestamp: expect.any(Number),
        isLive: true
      })
    }

    {
      await testing.rpc.oracle.setOracleData(
        oracleId,
        timestamp,
        {
          prices: [
            { tokenAmount: '1@DFI', currency: 'USD' },
            { tokenAmount: '15@UBER', currency: 'USD' }
          ]
        }
      )

      await testing.container.waitForPriceInvalid('UBER/USD')
      const price = await testing.rpc.oracle.getFixedIntervalPrice('UBER/USD')
      expect(price).toStrictEqual({
        activePriceBlock: expect.any(Number),
        nextPriceBlock: expect.any(Number),
        fixedIntervalPriceId: 'UBER/USD',
        activePrice: new BigNumber('8.5'),
        nextPrice: new BigNumber('12'),
        timestamp: expect.any(Number),
        isLive: false
      })
    }
  })
})
