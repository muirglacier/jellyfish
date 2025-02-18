import { SmartBuffer } from 'smart-buffer'
import { ComposableBuffer } from '@muirglacier/jellyfish-buffer'

export function expectHexBufferToObject<T> (hex: string, data: T, asC: ((buffer: SmartBuffer) => ComposableBuffer<T>)): void {
  const composable = asC(SmartBuffer.fromBuffer(
    Buffer.from(hex, 'hex')
  ))

  expect(composable.toObject()).toStrictEqual(data)
  // parse and stringify due to JSON path inconsistent positioning
  expect(JSON.parse(JSON.stringify(composable.toObject()))).toStrictEqual(
    JSON.parse(JSON.stringify(data))
  )

  expect(composable.toHex()).toStrictEqual(hex)
}

export function expectObjectToHexBuffer<T> (data: T, hex: string, asC: ((data: T) => ComposableBuffer<T>)): void {
  const txn = asC(data)

  const buffer = new SmartBuffer()
  txn.toBuffer(buffer)

  expect(buffer.toBuffer().toString('hex')).toStrictEqual(hex)
  // parse and stringify due to JSON path inconsistent positioning
  expect(JSON.parse(JSON.stringify(txn.toObject()))).toStrictEqual(
    JSON.parse(JSON.stringify(data))
  )

  expect(txn.toHex()).toStrictEqual(hex)
}
