import type {
  Abi,
  ExtractAbiFunctionNames,
  FunctionArgs,
  FunctionRet,
} from 'node_modules/abi-wan-kanabi/dist/kanabi'
import {
  type AccountInterface,
  CallData,
  Contract,
  hash,
  type ProviderInterface,
  type RawArgs,
} from 'starknet'
import invariant from 'tiny-invariant'

import MulticallABI from '../artifacts/MulticallABI'

export type ContractMethodArgs<
  ContractAbi extends Abi,
  Method extends ExtractAbiFunctionNames<ContractAbi>,
> =
  FunctionArgs<ContractAbi, Method> extends unknown[] // note: we have to do this because some how FunctionArgs is wrong for single element
    ? FunctionArgs<ContractAbi, Method>
    : [FunctionArgs<ContractAbi, Method>]

export function createMulticallRequest<
  ContractAbi extends Abi,
  Method extends ExtractAbiFunctionNames<ContractAbi>,
>(
  address: string,
  abi: ContractAbi,
  method: Method,
  args?: ContractMethodArgs<ContractAbi, Method>,
): {
  abi: ContractAbi
  contractAddress: string
  entrypoint: Method
  calldata: bigint[]
} {
  const contract = new Contract(abi, address)
  const call = contract.populate(method, args as RawArgs)

  return {
    abi: abi,
    contractAddress: call.contractAddress,
    entrypoint: method,
    calldata: call.calldata as bigint[],
  }
}

export interface CallAndAbi {
  abi: Abi
  contractAddress: string
  entrypoint: string
  calldata: bigint[]
}

export type MulticallResult<T extends CallAndAbi, Ts extends readonly T[]> = Promise<{
  [k in keyof Ts]: FunctionRet<Ts[k]['abi'], Ts[k]['entrypoint']>
}>

export async function multicall<T extends CallAndAbi, Ts extends readonly T[]>(
  calls: Ts,
  multicallAddress: string,
  providerOrAccount: ProviderInterface | AccountInterface,
): MulticallResult<T, Ts> {
  const multicallContract = new Contract(MulticallABI, multicallAddress, providerOrAccount).typedv2(
    MulticallABI,
  )

  const results = await multicallContract.aggregate(
    calls.map(call => {
      return {
        to: call.contractAddress,
        selector: hash.getSelectorFromName(call.entrypoint),
        calldata: call.calldata,
      }
    }),
  )

  const result = results[1]
  invariant(Array.isArray(result), 'Multicall failed, response is not an array')

  // @ts-expect-error -- too complex
  return result.map((result, index) => {
    const call = calls[index]
    invariant(call, 'Multicall failed, call is undefined')

    const callData = new CallData(call.abi)
    return callData.parse(call.entrypoint, result as string[])
  })
}
