import BigNumber from 'bignumber.js'
import { OPCode } from './script'

export enum SIGHASH {
  ALL = 0x01,
  NONE = 0x02,
  SINGLE = 0x03,
  ANYONECANPAY = 0x80,
  ALL_ANYONECANPAY = SIGHASH.ALL | SIGHASH.ANYONECANPAY,
  NONE_ANYONECANPAY = SIGHASH.NONE | SIGHASH.ANYONECANPAY,
  SINGLE_ANYONECANPAY = SIGHASH.SINGLE | SIGHASH.ANYONECANPAY,
}

/**
 * A transaction is a transfer of DeFi values that is broadcast to the DeFi network and collected into blocks.
 * The transfer of value in DeFi includes unspent, account token, liquidity, masternode creation, etc...
 *
 * @see https://github.com/DeFiCh/ain/blob/a011b9db38ce6d3d5c1b67c1e3bad9365b86f2ce/src/primitives/transaction.h#L210
 */
export interface Transaction {
  /**
   * Version is either 2 or 4
   * V2 structure is the same as Bitcoin
   * V4 contains tokenId in vout
   */
  version: number // -------------------| 4 bytes
  vin: Vin[] // ------------------------| c = VarUInt{1-9 bytes}, + c x Vin
  vout: Vout[] // ----------------------| c = VarUInt{1-9 bytes}, + c x Vout
  lockTime: number // ------------------| 4 bytes
}

/**
 * An input is a reference to an output from a previous transaction.
 * Multiple inputs are often listed in a transaction.
 *
 * script is 'scriptSig' in Vin
 *
 * Also know as Transaction In, TxIn, VectorIn, Spending UTXO.
 */
export interface Vin {
  txid: string // ----------------------| 32 bytes
  index: number // ---------------------| 4 bytes
  script: Script // --------------------| n = VarUInt{1-9 bytes}, + n bytes
  sequence: number // ------------------| 4 bytes
}

/**
 * An output contains instructions for sending DFI.
 * OP_RETURN script are usually custom transaction for DeFi related transaction.
 *
 * script is 'scriptPubKey' in Vout
 *
 * Also know as Transaction Out, TxOut, VectorOut, RedeemOut, Creating UTXO.
 */
export interface Vout {
  value: BigNumber // ------------------| 8 bytes
  script: Script // --------------------| n = VarUInt{1-9 bytes}, + n bytes
  tokenId: number // -------------------| 1 byte (Although it is VarUInt but disabled hence always 0x00)
}

/**
 * TransactionSegWit defines a new messages and serialization formats for propagation of transactions and blocks
 * committing to a segregated witness structure.
 *
 * @see https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki
 * @see https://github.com/bitcoin/bips/blob/master/bip-0143.mediawiki
 * @see https://github.com/bitcoin/bips/blob/master/bip-0144.mediawiki
 */
export interface TransactionSegWit extends Transaction {
  version: number // -------------------| 4 bytes
  marker: number // --------------------| 1 byte
  flag: number // ----------------------| 1 byte
  vin: Vin[] // ------------------------| c = VarUInt{1-9 bytes}, + c x Vin
  vout: Vout[] // ----------------------| c = VarUInt{1-9 bytes}, + c x Vout
  witness: Witness[] // ----------------| count(vin) x Witness
  lockTime: number // ------------------| 4 bytes
}

/**
 * Script witness consist of a stack of byte arrays.
 *
 * Each vin has its own script witness. The number of script witnesses is not explicitly encoded as it is implied by
 * count(vin): 'count(vin) x Witness', hence the VarUInt is omitted.
 * Each witness program is linked to a vin of the same index.
 *
 * Inside each script witness, it is encoded as a var_int item count followed by each item encoded as a var_int length
 * followed by a string of bytes.
 */
export interface Witness {
  scripts: WitnessScript[] // ----------| c = VarUInt{1-9 bytes}, + c x (n = VarUInt{1-9 bytes}, + n bytes)
}

/**
 * n = VarUInt{1-9 bytes}, + n bytes
 *
 * Like bitcoin, DeFi uses a scripting system for transactions.
 * Script is simple, stack-based, and processed from left to right.
 * It is intentionally none Turing-complete, with no loops.
 *
 * @see https://github.com/DeFiCh/ain/blob/master/src/script/script.h
 * @see OPCode
 */
export interface Script {
  stack: OPCode[]

  // TODO(fuxingloh): maybe should implement these
  //  asAsm (): string
  //  asHex (): string
}

/**
 * VarUInt{1-9 bytes}, + n bytes.
 *
 * WitnessScript just hold bytes array that is going to be pushed into the stack.
 * It does not follow the same semantic as Script.
 *
 * For P2WSH, the last item in the witness (the "witnessScript") is popped off, hashed with SHA256,
 * compared against the 32-byte-hash in scriptPubKey, and deserialized as a Script.
 *
 * @see https://github.com/bitcoin/bips/blob/master/bip-0144.mediawiki
 * @see https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki#P2WPKH
 * @see https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki#P2WSH
 */
export interface WitnessScript {
  /**
   * Witness script stored as LITTLE ENDIAN hex string.
   * It MUST BE STRIPPED of VarUInt{1-9 bytes}, those bytes will be generated by the composer.
   */
  hex: string // -----------------------| n = VarUInt{1-9 bytes}, + n bytes
}
