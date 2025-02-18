import { MasterNodeRegTestContainer } from '@muirglacier/testcontainers'
import { RpcApiError } from '@muirglacier/jellyfish-api-core'
import { ContainerAdapterClient } from '../../container_adapter_client'

describe('Spv', () => {
  const container = new MasterNodeRegTestContainer()
  const client = new ContainerAdapterClient(container)

  beforeAll(async () => {
    await container.start()
    await container.waitForReady()

    await container.call('spv_fundaddress', [await container.call('spv_getnewaddress')]) // Funds 1 BTC
  })

  afterAll(async () => {
    await container.stop()
  })

  it('should claimHtlc', async () => {
    const pubKeyA = await container.call('spv_getaddresspubkey', [await container.call('spv_getnewaddress')])
    const pubKeyB = await container.call('spv_getaddresspubkey', [await container.call('spv_getnewaddress')])
    const htlc = await container.call('spv_createhtlc', [pubKeyA, pubKeyB, '10'])

    await container.call('spv_sendtoaddress', [htlc.address, 0.1]) // Funds HTLC address
    const claimedHtlc = await client.spv.claimHtlc(
      htlc.address,
      await container.call('spv_getnewaddress'),
      { seed: htlc.seed }
    )
    expect(typeof claimedHtlc.txid).toStrictEqual('string')
    expect(claimedHtlc.sendmessage).toStrictEqual('') // not empty when error found
  })

  it('should not claimHtlc when no unspent HTLC outputs found', async () => {
    const pubKeyA = await container.call('spv_getaddresspubkey', [await container.call('spv_getnewaddress')])
    const pubKeyB = await container.call('spv_getaddresspubkey', [await container.call('spv_getnewaddress')])
    const htlc = await container.call('spv_createhtlc', [pubKeyA, pubKeyB, '10'])

    const promise = client.spv.claimHtlc(
      htlc.address,
      await container.call('spv_getnewaddress'),
      { seed: htlc.seed }
    )
    await expect(promise).rejects.toThrow(RpcApiError)
    await expect(promise).rejects.toThrow('No unspent HTLC outputs found')
  })

  it('should not claimHtlc when provided seed is not in hex form', async () => {
    const pubKeyA = await container.call('spv_getaddresspubkey', [await container.call('spv_getnewaddress')])
    const pubKeyB = await container.call('spv_getaddresspubkey', [await container.call('spv_getnewaddress')])
    const htlc = await container.call('spv_createhtlc', [pubKeyA, pubKeyB, '10'])

    const promise = client.spv.claimHtlc(
      htlc.address,
      await container.call('spv_getnewaddress'),
      { seed: 'XXXX' }
    )
    await expect(promise).rejects.toThrow(RpcApiError)
    await expect(promise).rejects.toThrow("RpcApiError: 'Provided seed is not in hex form', code: -5, method: spv_claimhtlc")
  })

  it('should not claimHtlc when seed provided does not match seed hash in contract', async () => {
    const pubKeyA = await container.call('spv_getaddresspubkey', [await container.call('spv_getnewaddress')])
    const pubKeyB = await container.call('spv_getaddresspubkey', [await container.call('spv_getnewaddress')])
    const htlc = await container.call('spv_createhtlc', [pubKeyA, pubKeyB, '10'])

    const promise = client.spv.claimHtlc(
      htlc.address,
      await container.call('spv_getnewaddress'),
      { seed: '00' }
    )
    await expect(promise).rejects.toThrow(RpcApiError)
    await expect(promise).rejects.toThrow("RpcApiError: 'Seed provided does not match seed hash in contract', code: -5, method: spv_claimhtlc")
  })

  it('should not claimHtlc with invalid address', async () => {
    const pubKeyA = await container.call('spv_getaddresspubkey', [await container.call('spv_getnewaddress')])
    const pubKeyB = await container.call('spv_getaddresspubkey', [await container.call('spv_getnewaddress')])
    const htlc = await container.call('spv_createhtlc', [pubKeyA, pubKeyB, '10'])

    const promise = client.spv.claimHtlc(
      'XXXX',
      await container.call('spv_getnewaddress'),
      { seed: htlc.seed }
    )
    await expect(promise).rejects.toThrow(RpcApiError)
    await expect(promise).rejects.toThrow("RpcApiError: 'Invalid address', code: -5, method: spv_claimhtlc")
  })

  it('should not claimHtlc when redeem script not found in wallet', async () => {
    const pubKeyA = await container.call('spv_getaddresspubkey', [await container.call('spv_getnewaddress')])
    const pubKeyB = await container.call('spv_getaddresspubkey', [await container.call('spv_getnewaddress')])
    const htlc = await container.call('spv_createhtlc', [pubKeyA, pubKeyB, '10'])
    const randomAddress = '2Mu4edSkC5gKVwYayfDq2fTFwT6YD4mujSX'

    const promise = client.spv.claimHtlc(
      randomAddress,
      await container.call('spv_getnewaddress'),
      { seed: htlc.seed }
    )
    await expect(promise).rejects.toThrow(RpcApiError)
    await expect(promise).rejects.toThrow("RpcApiError: 'Redeem script not found in wallet', code: -4, method: spv_claimhtlc")
  })

  it('should not claimHtlc with invalid destination address', async () => {
    const pubKeyA = await container.call('spv_getaddresspubkey', [await container.call('spv_getnewaddress')])
    const pubKeyB = await container.call('spv_getaddresspubkey', [await container.call('spv_getnewaddress')])
    const htlc = await container.call('spv_createhtlc', [pubKeyA, pubKeyB, '10'])

    const promise = client.spv.claimHtlc(
      htlc.address,
      'XXXX',
      { seed: htlc.seed }
    )
    await expect(promise).rejects.toThrow(RpcApiError)
    await expect(promise).rejects.toThrow('Invalid destination address')
  })

  it('should not claimHtlc with not enough funds to cover fee', async () => {
    const pubKeyA = await container.call('spv_getaddresspubkey', [await container.call('spv_getnewaddress')])
    const pubKeyB = await container.call('spv_getaddresspubkey', [await container.call('spv_getnewaddress')])
    const htlc = await container.call('spv_createhtlc', [pubKeyA, pubKeyB, '10'])

    await container.call('spv_sendtoaddress', [htlc.address, 0.00000546]) // Funds HTLC address with dust

    const promise = client.spv.claimHtlc(
      htlc.address,
      await container.call('spv_getnewaddress'),
      { seed: htlc.seed }
    )
    await expect(promise).rejects.toThrow(RpcApiError)
    await expect(promise).rejects.toThrow('Not enough funds to cover fee')
  })
})
