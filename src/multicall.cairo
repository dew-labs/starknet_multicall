// From
// https://github.com/argentlabs/argent-contracts-starknet/blob/556313fdfe4cb6512c277be1a2dc9bedc812b81d/src/utils/multicall.cairo
use starknet::account::Call;

#[starknet::interface]
trait IMulticall<TContractState> {
    fn aggregate(self: @TContractState, calls: Array<Call>) -> (u64, Array<Span<felt252>>);
}

#[starknet::contract]
mod Multicall {
    use starknet::info::get_block_number;
    use starknet::account::Call;
    use starknet::call_contract_syscall;

    fn execute_multicall(mut calls: Span<Call>) -> Array<Span<felt252>> {
        let mut result: Array<Span<felt252>> = array![];
        let mut idx = 0;
        loop {
            match calls.pop_front() {
                Option::Some(call) => {
                    match call_contract_syscall(*call.to, *call.selector, *call.calldata) {
                        Result::Ok(retdata) => {
                            result.append(retdata);
                            idx = idx + 1;
                        },
                        Result::Err(mut revert_reason) => {
                            let mut data = array!['multicall-failed', idx];

                            loop {
                                match revert_reason.pop_front() {
                                    Option::Some(item) => data.append(item),
                                    Option::None => { break; },
                                }
                            }

                            panic(data);
                        },
                    }
                },
                Option::None => { break; },
            }
        }
        result
    }

    #[storage]
    struct Storage {}

    #[abi(embed_v0)]
    impl MulticallImpl of super::IMulticall<ContractState> {
        fn aggregate(self: @ContractState, calls: Array<Call>) -> (u64, Array<Span<felt252>>) {
            (get_block_number(), execute_multicall(calls.span()))
        }
    }
}
