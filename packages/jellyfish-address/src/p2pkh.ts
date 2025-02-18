import { Bs58 } from '@muirglacier/jellyfish-crypto'
import { getNetwork, Network, NetworkName } from '@muirglacier/jellyfish-network'
import { Script, OP_CODES, OP_PUSHDATA } from '@muirglacier/jellyfish-transaction'

import { Base58Address } from './base58_address'

export class P2PKH extends Base58Address {
  constructor (network: Network, utf8String: string, hex: string, validated: boolean = false) {
    super(network, utf8String, hex, validated, 'P2PKH')
  }

  getPrefix (): number {
    return this.network.pubKeyHashPrefix
  }

  getScript (): Script {
    if (!this.valid) {
      this.validate()
    }

    if (!this.valid) {
      throw new Error('InvalidDefiAddress')
    }

    return {
      stack: [
        OP_CODES.OP_DUP,
        OP_CODES.OP_HASH160,
        new OP_PUSHDATA(Buffer.from(this.hex, 'hex'), 'little'),
        OP_CODES.OP_EQUALVERIFY,
        OP_CODES.OP_CHECKSIG
      ]
    }
  }

  static to (net: NetworkName | Network, h160: string): P2PKH {
    if (h160.length !== Base58Address.DATA_HEX_LENGTH) {
      throw new Error('InvalidDataLength')
    }

    const network = typeof net === 'string' ? getNetwork(net) : net
    const address = Bs58.fromHash160(h160, network.pubKeyHashPrefix)
    return new P2PKH(network, address, h160, true)
  }
}
