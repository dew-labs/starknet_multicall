use starknet::{contract_address_const, deploy_syscall, account::Call};

use snforge_std::{
    declare, ContractClassTrait
};

use starknet_multicall::multicall::Multicall::execute_multicall;
use starknet_multicall::dummy::Dummy;

#[test]
#[available_gas(2000000)]
#[should_panic(expected: ('multicall-failed', 0, "Contract not deployed at address: 0x000000000000000000000000000000000000000000000000000000000000002a"))]
fn execute_multicall_simple() {
    let call = Call { to: contract_address_const::<42>(), selector: 43, calldata: array![].span() };

    execute_multicall(array![call].span());
}

#[test]
#[available_gas(2000000)]
#[should_panic(expected: ('multicall-failed', 2, 'test dummy reverted'))]
fn execute_multicall_at_one() {
    let dummy_contract = declare("Dummy").unwrap();
    let (address0, _) = dummy_contract.deploy(@array![]).unwrap();

    let calldata1 = array![12];
    let call1 = Call {
        to: address0,
        selector: 1257997212343903061729138261393903607425919870525153789348007715635666768741, // set_number(number)
        calldata: calldata1.span()
    };

    let calldata2 = array![12];
    let call2 = Call {
        to: address0,
        selector: 966438596990474552217413352546537164754794065595593730315125915414067970214, // increase_number(number)
        calldata: calldata2.span()
    };

    let calldata3 = array![12];
    let call3 = Call {
        to: address0,
        selector: 1378405772398747753825744346429351463310669626437442629621279049660910933566, // throw_error(number)
        calldata: calldata3.span()
    };

    let arr = array![call1, call2, call3];
    execute_multicall(arr.span());
}
