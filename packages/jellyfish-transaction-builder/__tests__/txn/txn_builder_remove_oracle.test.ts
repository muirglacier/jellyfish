import { GenesisKeys, MasterNodeRegTestContainer } from '@muirglacier/testcontainers'
import { getProviders, MockProviders } from '../provider.mock'
import { P2WPKHTransactionBuilder } from '../../src'
import { calculateTxid, fundEllipticPair, sendTransaction } from '../test.utils'
import { WIF } from '@muirglacier/jellyfish-crypto'
import { RegTest } from '@muirglacier/jellyfish-network'

const container = new MasterNodeRegTestContainer()
let providers: MockProviders
let builder: P2WPKHTransactionBuilder

beforeAll(async () => {
  await container.start()
  await container.waitForReady()
  await container.waitForWalletCoinbaseMaturity()

  providers = await getProviders(container)
  providers.setEllipticPair(WIF.asEllipticPair(GenesisKeys[GenesisKeys.length - 1].owner.privKey))
  builder = new P2WPKHTransactionBuilder(providers.fee, providers.prevout, providers.elliptic, RegTest)

  // Prep 1000 DFI Token for testing
  await container.waitForWalletBalanceGTE(1001)
})

afterAll(async () => {
  await container.stop()
})

describe('remove oracle', () => {
  beforeEach(async () => {
    await container.waitForWalletBalanceGTE(1)

    // Fund 10 DFI UTXO
    await fundEllipticPair(container, providers.ellipticPair, 10)
    await providers.setupMocks() // required to move utxos
  })

  it('should appoint and then remove oracle', async () => {
    // Appoint Oracle
    const script = await providers.elliptic.script()
    const appointTxn = await builder.oracles.appointOracle({
      script: script,
      weightage: 1,
      priceFeeds: [
        {
          token: 'TEST',
          currency: 'USD'
        }
      ]
    }, script)

    const txid = calculateTxid(appointTxn)
    await sendTransaction(container, appointTxn)

    // Ensure oracle is created
    const listOraclesResult = await container.call('listoracles')
    expect(listOraclesResult.length).toStrictEqual(1)

    // Remove Oracle
    const removeTxn = await builder.oracles.removeOracle({
      oracleId: txid
    }, script)

    // Ensure the created txn is correct.
    const outs = await sendTransaction(container, removeTxn)
    expect(outs[0].value).toStrictEqual(0)
    expect(outs[1].value).toBeLessThan(10)
    expect(outs[1].value).toBeGreaterThan(9.999)
    expect(outs[1].scriptPubKey.addresses[0]).toStrictEqual(await providers.getAddress())

    // Ensure you don't send all your balance away during appoint oracle
    const prevouts = await providers.prevout.all()
    expect(prevouts.length).toStrictEqual(1)
    expect(prevouts[0].value.toNumber()).toBeLessThan(10)
    expect(prevouts[0].value.toNumber()).toBeGreaterThan(9.999)

    // Ensure oracle is removed
    const removedlistOraclesResult = await container.call('listoracles')
    expect(removedlistOraclesResult.length).toStrictEqual(0)
  })
})
