import {
  ABIAddressType,
  ABIArrayDynamicType,
  ABIArrayStaticType,
  ABIBoolType,
  ABIByteType,
  ABIStringType,
  ABITupleType,
  ABIType,
  ABIUfixedType,
  ABIUintType,
  abiTypeIsReference,
  abiTypeIsTransaction,
} from 'algosdk'

export function getEquivalentType(abiTypeStr: string, ioType: 'input' | 'output'): string {
  if (abiTypeStr == 'void') {
    return 'void'
  }
  if (abiTypeIsTransaction(abiTypeStr)) {
    return 'TransactionToSign | Transaction | Promise<SendTransactionResult>'
  }
  if (abiTypeIsReference(abiTypeStr)) {
    return 'number | bigint'
  }

  const abiType = ABIType.from(abiTypeStr)

  return abiTypeToTs(abiType, ioType)

  function abiTypeToTs(abiType: ABIType, ioType: 'input' | 'output'): string {
    if (abiType instanceof ABIUintType) {
      if (abiType.bitSize <= 51) return 'number'
      return ioType === 'input' ? 'bigint | number' : 'bigint'
    }
    if (abiType instanceof ABIArrayDynamicType) {
      if (abiType.childType instanceof ABIByteType) return 'Uint8Array'
      return `${abiTypeToTs(abiType.childType, ioType)}[]`
    }
    if (abiType instanceof ABIArrayStaticType) {
      if (abiType.childType instanceof ABIByteType) return 'Uint8Array'
      return `[${new Array(abiType.staticLength).fill(abiTypeToTs(abiType.childType, ioType)).join(', ')}]`
    }
    if (abiType instanceof ABIAddressType) {
      return 'string'
    }
    if (abiType instanceof ABIBoolType) {
      return 'boolean'
    }
    if (abiType instanceof ABIUfixedType) {
      return 'number'
    }
    if (abiType instanceof ABITupleType) {
      return `[${abiType.childTypes.map((c) => abiTypeToTs(c, ioType)).join(', ')}]`
    }
    if (abiType instanceof ABIByteType) {
      return 'number'
    }
    if (abiType instanceof ABIStringType) {
      return 'string'
    }
    return 'unknown'
  }
}
