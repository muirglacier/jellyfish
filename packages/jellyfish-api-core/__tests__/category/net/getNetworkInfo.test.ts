import { MasterNodeRegTestContainer, RegTestContainer } from '@muirglacier/testcontainers'
import { ContainerAdapterClient } from '../../container_adapter_client'
import { net } from '../../../src'

describe('Network without masternode', () => {
  const container = new RegTestContainer()
  const client = new ContainerAdapterClient(container)

  beforeAll(async () => {
    await container.start()
    await container.waitForReady()
  })

  afterAll(async () => {
    await container.stop()
  })

  it('should getNetworkInfo', async () => {
    const info: net.NetworkInfo = await client.net.getNetworkInfo()
    expect(info.version).toBeGreaterThanOrEqual(0)
    expect(typeof info.subversion).toStrictEqual('string')
    expect(info.protocolversion).toBeGreaterThanOrEqual(0)
    expect(typeof info.localservices).toStrictEqual('string')
    expect(typeof info.localrelay).toStrictEqual('boolean')
    expect(info.timeoffset).toBeGreaterThanOrEqual(0)
    expect(info.connections).toBeGreaterThanOrEqual(0)
    expect(typeof info.networkactive).toStrictEqual('boolean')

    const networks = info.networks

    for (let i = 0; i < networks.length; i += 1) {
      const network = networks[i]
      expect(['ipv4', 'ipv6', 'onion']).toContain(network.name)
      expect(typeof network.limited).toStrictEqual('boolean')
      expect(typeof network.reachable).toStrictEqual('boolean')
      expect(typeof network.proxy).toStrictEqual('string')
      expect(typeof network.proxy_randomize_credentials).toStrictEqual('boolean')
    }

    expect(info.relayfee).toBeGreaterThanOrEqual(0)
    expect(info.incrementalfee).toBeGreaterThanOrEqual(0)

    const localaddresses = info.localaddresses

    for (let i = 0; i < localaddresses.length; i += 1) {
      const localaddress = localaddresses[i]
      expect(localaddress.address).toStrictEqual('string')
      expect(localaddress.port).toBeGreaterThanOrEqual(0)
      expect(localaddress.port).toBeLessThanOrEqual(65535)
      expect(localaddress.score).toBeGreaterThanOrEqual(0)
    }

    expect(typeof info.warnings).toStrictEqual('string')
  })
})

describe('Network on masternode', () => {
  const container = new MasterNodeRegTestContainer()
  const client = new ContainerAdapterClient(container)

  beforeAll(async () => {
    await container.start()
    await container.waitForReady()
  })

  afterAll(async () => {
    await container.stop()
  })

  it('should getNetworkInfo', async () => {
    const info: net.NetworkInfo = await client.net.getNetworkInfo()
    expect(info.version).toBeGreaterThanOrEqual(0)
    expect(typeof info.subversion).toStrictEqual('string')
    expect(info.protocolversion).toBeGreaterThanOrEqual(0)
    expect(typeof info.localservices).toStrictEqual('string')
    expect(typeof info.localrelay).toStrictEqual('boolean')
    expect(info.timeoffset).toBeGreaterThanOrEqual(0)
    expect(info.connections).toBeGreaterThanOrEqual(0)
    expect(typeof info.networkactive).toStrictEqual('boolean')

    const networks = info.networks

    for (let i = 0; i < networks.length; i += 1) {
      const network = networks[i]
      expect(['ipv4', 'ipv6', 'onion']).toContain(network.name)
      expect(typeof network.limited).toStrictEqual('boolean')
      expect(typeof network.reachable).toStrictEqual('boolean')
      expect(typeof network.proxy).toStrictEqual('string')
      expect(typeof network.proxy_randomize_credentials).toStrictEqual('boolean')
    }

    expect(info.relayfee).toBeGreaterThanOrEqual(0)
    expect(info.incrementalfee).toBeGreaterThanOrEqual(0)

    const localaddresses = info.localaddresses

    for (let i = 0; i < localaddresses.length; i += 1) {
      const localaddress = localaddresses[i]
      expect(localaddress.address).toStrictEqual('string')
      expect(localaddress.port).toBeGreaterThanOrEqual(0)
      expect(localaddress.port).toBeLessThanOrEqual(65535)
      expect(localaddress.score).toBeGreaterThanOrEqual(0)
    }

    expect(typeof info.warnings).toStrictEqual('string')
  })
})
