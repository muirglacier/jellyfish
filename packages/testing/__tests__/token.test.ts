import waitForExpect from 'wait-for-expect'
import { MasterNodeRegTestContainer } from '@muirglacier/testcontainers'
import {
  createToken,
  mintTokens
} from '../src'

describe('utils', () => {
  const container = new MasterNodeRegTestContainer()

  beforeAll(async () => {
    await container.start()
    await container.waitForReady()
    await container.waitForWalletCoinbaseMaturity()
    await container.waitForWalletBalanceGTE(300)
  })

  afterAll(async () => {
    await container.stop()
  })

  describe('createToken', () => {
    it('should createToken', async () => {
      let assertions = 0
      let tokensLengthBefore = 0

      await waitForExpect(async () => {
        const tokens = await container.call('listtokens')
        expect(Object.keys(tokens).length).toBeGreaterThan(0)
        tokensLengthBefore = Object.keys(tokens).length
      })

      const tokenId = await createToken(container, 'DDD')
      expect(tokenId).toBeGreaterThan(0)

      await waitForExpect(async () => {
        const tokens = await container.call('listtokens')
        expect(Object.keys(tokens).length).toStrictEqual(tokensLengthBefore + 1)
      })

      const tokens = await container.call('listtokens')
      for (const k in tokens) {
        const token = tokens[k]
        if (token.symbol === 'DDD') {
          assertions += 1
        }
      }
      expect(assertions).toStrictEqual(1)
    })
  })

  describe('mintTokens', () => {
    beforeAll(async () => {
      await createToken(container, 'DOA')
    })

    it('should mintTokens', async () => {
      const tokensBefore = await container.call('listtokens')
      for (const k in tokensBefore) {
        const tokenBefore = tokensBefore[k]
        if (tokenBefore.symbol === 'DOA') {
          expect(tokenBefore.minted).toStrictEqual(0)
        }
      }

      await mintTokens(container, 'DOA')

      const tokensAfter = await container.call('listtokens')
      for (const k in tokensAfter) {
        const tokenAfter = tokensAfter[k]
        if (tokenAfter.symbol === 'DOA') {
          expect(tokenAfter.minted).toStrictEqual(2000)
        }
      }
    })
  })
})
