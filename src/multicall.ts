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
  Args extends ContractMethodArgs<ContractAbi, Method>,
>(
  address: string,
  abi: ContractAbi,
  method: Method,
  args?: Args,
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

export type MulticallResult<T extends CallAndAbi, Ts extends T[]> = Promise<{
  [k in keyof Ts]: FunctionRet<Ts[k]['abi'], Ts[k]['entrypoint']>
}>

export async function multicall<T extends CallAndAbi, Ts extends T[]>(
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

  // @ts-expect-error -- too complex
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call -- its safe
  return results[1].map((result, index) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unsafe-member-access -- guranteed
    const callData = new CallData(calls[index]!.abi)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unsafe-member-access -- guranteed
    return callData.parse(calls[index]!.entrypoint, result as unknown as string[])
  })
}
