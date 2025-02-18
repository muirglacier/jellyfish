import { Network } from '@muirglacier/jellyfish-network'
import { Script } from '@muirglacier/jellyfish-transaction'

export type AddressTypeDeprecated = 'Unknown' | 'P2PKH' | 'P2SH' | 'P2WPKH' | 'P2WSH'
export type Validator = () => boolean

export abstract class Address {
  network: Network
  utf8String: string
  type: AddressTypeDeprecated
  valid: boolean
  validatorPassed: number

  constructor (network: Network, utf8String: string, valid: boolean, type: AddressTypeDeprecated) {
    this.network = network
    this.utf8String = utf8String
    this.valid = valid
    this.type = type
    this.validatorPassed = 0
  }

  abstract validators (): Validator[]
  abstract getScript (): Script

  validate (): boolean {
    this.valid = true
    this.validatorPassed = 0
    this.validators().forEach((validator, index) => {
      const passed = validator()
      this.valid = this.valid && passed
      if (passed) {
        this.validatorPassed += 1
      }
    })
    return this.valid
  }
}

/**
 * Default Address implementation when parsed address do not matched any type
 */
export class UnknownTypeAddress extends Address {
  constructor (network: Network, raw: string) {
    super(network, raw, false, 'Unknown')
  }

  validators (): Validator[] {
    return []
  }

  validate (): boolean {
    return false
  }

  getScript (): Script {
    throw new Error('InvalidDeFiAddress')
  }
}
