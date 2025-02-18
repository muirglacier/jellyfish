import { MasterNodeRegTestContainer } from '@muirglacier/testcontainers'
import { ContainerAdapterClient } from '../../container_adapter_client'

describe('Oracle', () => {
  const container = new MasterNodeRegTestContainer()
  const client = new ContainerAdapterClient(container)

  beforeAll(async () => {
    await container.start()
    await container.waitForReady()
    await container.waitForWalletCoinbaseMaturity()
  })

  afterEach(async () => {
    const data = await container.call('listoracles')

    for (let i = 0; i < data.length; i += 1) {
      await container.call('removeoracle', [data[i]])
    }

    await container.generate(1)
  })

  afterAll(async () => {
    await container.stop()
  })

  it('should listOracles', async () => {
    const priceFeeds = [
      { token: 'AAPL', currency: 'EUR' },
      { token: 'TSLA', currency: 'USD' }
    ]

    await container.call('appointoracle', [await container.getNewAddress(), priceFeeds, 1])
    await container.call('appointoracle', [await container.getNewAddress(), priceFeeds, 2])

    await container.generate(1)

    // NOTE(jingyi2811): Pagination is not supported.
    const data = await client.oracle.listOracles()

    expect(data.length).toStrictEqual(2)
    expect(typeof data[0]).toStrictEqual('string')
    expect(data[0].length).toStrictEqual(64)
    expect(typeof data[1]).toStrictEqual('string')
    expect(data[1].length).toStrictEqual(64)
  })

  it('should listOracles with empty array if there is no oracle available', async () => {
    const data = await client.oracle.listOracles()
    expect(data.length).toStrictEqual(0)
  })
})
