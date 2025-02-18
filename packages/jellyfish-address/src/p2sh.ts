import { Bs58 } from '@muirglacier/jellyfish-crypto'
import { getNetwork, Network, NetworkName } from '@muirglacier/jellyfish-network'
import { Script, OP_CODES, OP_PUSHDATA } from '@muirglacier/jellyfish-transaction'

import { Base58Address } from './base58_address'

export class P2SH extends Base58Address {
  static SCRIPT_HASH_LENGTH = 50 // 25 bytes, 50 char

  constructor (network: Network, utf8String: string, hex: string, validated: boolean = false) {
    super(network, utf8String, hex, validated, 'P2SH')
  }

  getPrefix (): number {
    return this.network.scriptHashPrefix
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
        OP_CODES.OP_HASH160,
        new OP_PUSHDATA(Buffer.from(this.hex, 'hex'), 'little'),
        OP_CODES.OP_EQUAL
      ]
    }
  }

  static to (net: NetworkName | Network, h160: string): P2SH {
    if (h160.length !== Base58Address.DATA_HEX_LENGTH) {
      throw new Error('InvalidDataLength')
    }

    const network = typeof net === 'string' ? getNetwork(net) : net
    const address = Bs58.fromHash160(h160, network.scriptHashPrefix)
    return new P2SH(network, address, h160, true)
  }
}
