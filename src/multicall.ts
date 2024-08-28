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

export function createMulticallRequest<
  ContractAbi extends Abi,
  Method extends ExtractAbiFunctionNames<ContractAbi>,
  Args extends FunctionArgs<ContractAbi, Method> extends unknown[] // note: we have to do this because some how FunctionArgs is wrong for single element
    ? FunctionArgs<ContractAbi, Method>
    : [FunctionArgs<ContractAbi, Method>],
>(
  address: string,
  abi: ContractAbi,
  method: Method,
  args?: Args,
): {
  abi: ContractAbi
  contractAddress: string
  entrypoint: Method
  calldata: Args
} {
  const contract = new Contract(abi, address)
  const call = contract.populate(method, args as RawArgs)

  return {
    abi: abi,
    contractAddress: call.contractAddress,
    entrypoint: method,
    calldata: call.calldata as Args,
  }
}

interface CallAndAbi {
  abi: Abi
  contractAddress: string
  entrypoint: string
  calldata: unknown
}

export async function multicall<T extends CallAndAbi, Ts extends T[]>(
  calls: Ts,
  multicallAddress: string,
  providerOrAccount: ProviderInterface | AccountInterface,
): Promise<{[k in keyof Ts]: FunctionRet<Ts[k]['abi'], Ts[k]['entrypoint']>}> {
  const multicallContract = new Contract(MulticallABI, multicallAddress, providerOrAccount).typedv2(
    MulticallABI,
  )

  const results = await multicallContract.aggregate(
    calls.map(call => {
      return {
        to: call.contractAddress,
        selector: hash.getSelectorFromName(call.entrypoint),
        calldata: call.calldata as bigint[],
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
