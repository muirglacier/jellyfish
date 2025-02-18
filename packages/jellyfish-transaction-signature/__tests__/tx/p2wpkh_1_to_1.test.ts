import BigNumber from 'bignumber.js'
import { SmartBuffer } from 'smart-buffer'
import { Bech32, WIF } from '@muirglacier/jellyfish-crypto'
import { CTransaction, CTransactionSegWit, OP_CODES } from '@muirglacier/jellyfish-transaction'
import { SignInputOption, TransactionSigner } from '../../src'

// From Address P2WPKH
const input = {
  bech32: 'bcrt1qykj5fsrne09yazx4n72ue4fwtpx8u65zac9zhn',
  privKey: 'cQSsfYvYkK5tx3u1ByK2ywTTc9xJrREc1dd67ZrJqJUEMwgktPWN'
}

const unsigned = '0400000001346faf87ccf6fe45463831a23054780d78e4a6decab10575aba212d2e087eb3d0000000000ffffffff010065cd1d000000001600144ab4391ce5a732e36139e72d79a28e01b7b080340000000000'
const signed = '04000000000101346faf87ccf6fe45463831a23054780d78e4a6decab10575aba212d2e087eb3d0000000000ffffffff010065cd1d000000001600144ab4391ce5a732e36139e72d79a28e01b7b0803400024730440220691a0adc945ae033716e7025235b19618a579545874521d3d70faffcbe95971602200dd1886fe71ab5ab447077680bf891c8faeede9c52e15c0b3789e128899b320e012103987aec2e508e124468f0f07a836d185b329026e7aaf75be48cf12be8f18cbe8100000000'

it('sign transaction', async () => {
  const txUnsigned = new CTransaction(
    SmartBuffer.fromBuffer(Buffer.from(unsigned, 'hex'))
  )

  const wep = WIF.asEllipticPair(input.privKey)
  const inputs: SignInputOption[] = [{
    prevout: {
      script: {
        stack: [
          OP_CODES.OP_0,
          OP_CODES.OP_PUSHDATA(Bech32.toHash160(input.bech32, 'bcrt', 0x00), 'little')
        ]
      },
      value: new BigNumber('10'),
      tokenId: 0
    },
    publicKey: async () => await wep.publicKey(),
    sign: async (hash) => await wep.sign(hash)
  }]
  const txSigned = new CTransactionSegWit(await TransactionSigner.sign(txUnsigned, inputs))

  const toBuffer = new SmartBuffer()
  txSigned.toBuffer(toBuffer)

  expect(toBuffer.toBuffer().toString('hex')).toStrictEqual(signed)
})
