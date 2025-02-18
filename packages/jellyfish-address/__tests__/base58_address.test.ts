import { Script } from '@muirglacier/jellyfish-transaction'
import { Network } from '@muirglacier/jellyfish-network'
import { Base58Address } from '../src'

class DummyB58Address extends Base58Address {
  getScript (): Script {
    return {
      stack: []
    }
  }

  getPrefix (): number {
    return this.network.pubKeyHashPrefix // match the fixture p2pkh prefix
  }
}

describe('Base58Address', () => {
  const b58Fixture = {
    p2sh: 'dFFPENo7FPMJpDV6fUcfo4QfkZrfrV1Uf8', // prefix = 0x12
    p2pkh: '8JBuS81VT8ouPrT6YS55qoS74D13Cw7h1Y'
  }

  const dummyNetwork: Network = {
    name: 'regtest',
    bech32: {
      hrp: 'dummy'
    },
    bip32: {
      publicPrefix: 0x00000000,
      privatePrefix: 0x00000000
    },
    wifPrefix: 0x00,
    pubKeyHashPrefix: 0x12,
    scriptHashPrefix: 0x00,
    messagePrefix: '\x00Dummy Msg Prefix:\n'
  } as any

  describe('extensible, should work for any defined network protocol', () => {
    it('fromAddress() - valid', () => {
      const valid = Base58Address.fromAddress<DummyB58Address>(dummyNetwork, b58Fixture.p2pkh, DummyB58Address)
      expect(valid.validate()).toBeTruthy()
    })

    it('fromAddress() - invalid character set', () => {
      const invalid = Base58Address.fromAddress<DummyB58Address>(dummyNetwork, 'invalid b58 address', DummyB58Address)
      expect(invalid.validate()).toBeFalsy()
    })

    it('fromAddress() - invalid prefix', () => {
      const invalid = Base58Address.fromAddress<DummyB58Address>(dummyNetwork, b58Fixture.p2sh, DummyB58Address)
      expect(invalid.validate()).toBeFalsy()

      const valid = Base58Address.fromAddress<DummyB58Address>(dummyNetwork, b58Fixture.p2pkh, DummyB58Address)
      expect(valid.validate()).toBeTruthy()
    })
  })
})
