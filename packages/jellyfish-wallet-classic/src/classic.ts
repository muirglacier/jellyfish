import { WalletEllipticPair } from '@muirglacier/jellyfish-wallet'
import { EllipticPair } from '@muirglacier/jellyfish-crypto'
import { SIGHASH, Transaction, TransactionSegWit, Vout } from '@muirglacier/jellyfish-transaction'
import { TransactionSigner } from '@muirglacier/jellyfish-transaction-signature'

/**
 * WalletClassic extends WalletEllipticPair with a simple classic implementation.
 *
 * Single elliptic pair wallet.
 */
export class WalletClassic implements WalletEllipticPair {
  constructor (public readonly ellipticPair: EllipticPair) {
  }

  /**
   * @return {Promise<Buffer>} compressed public key
   */
  async publicKey (): Promise<Buffer> {
    return await this.ellipticPair.publicKey()
  }

  /**
   * @return {Promise<Buffer>} privateKey
   */
  async privateKey (): Promise<Buffer> {
    return await this.ellipticPair.privateKey()
  }

  /**
   * @param {Buffer} hash to sign
   * @return {Buffer} signature in DER format, SIGHASHTYPE not included
   * @see https://tools.ietf.org/html/rfc6979
   * @see https://github.com/bitcoin/bitcoin/pull/13666
   */
  async sign (hash: Buffer): Promise<Buffer> {
    return await this.ellipticPair.sign(hash)
  }

  /**
   * @param {Buffer} hash to verify with signature
   * @param {Buffer} derSignature of the hash in encoded with DER, SIGHASHTYPE must not be included
   * @return {boolean} validity of signature of the hash
   */
  async verify (hash: Buffer, derSignature: Buffer): Promise<boolean> {
    return await this.ellipticPair.verify(hash, derSignature)
  }

  /**
   * WalletClassic transaction signing.
   *
   * @param {Transaction} transaction to sign
   * @param {Vout[]} prevouts of the transaction to fund this transaction
   * @return {TransactionSegWit} a signed transaction
   */
  async signTx (transaction: Transaction, prevouts: Vout[]): Promise<TransactionSegWit> {
    return await TransactionSigner.signPrevoutsWithEllipticPairs(transaction, prevouts, prevouts.map(() => this), {
      sigHashType: SIGHASH.ALL
    })
  }
}
