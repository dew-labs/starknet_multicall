# Multicall on Starknet

Cairo multicall contract on starknet with typescript (100% typesafe) utility.

## Install

```sh
pnpm add starknet_multicall
pnpm add -D typescript abi-wan-kanabi
```
## Use

```ts
import {createMulticallRequest, multicall} from 'starknet_multicall'

const calls = [
  createMulticallRequest('<contract address>', <ABI>, '<method_name>', [<method_arg1>, <method_arg2>]),
]

const [result1] = await multicall(calls, <multicall contract address>, <providerOrAccount>)
```

Find deployed `<multicall contract address>` in the last section.

## Development

Requirements: (Recommended to install via `mise`)

-   Scarb 2.8.4 (on cairo 2.8.4)
-   Starknet Foundry 0.32.0

## Test

`scarb test`

## Build

`scarb build`

## Declare & deploy

Using `sncast`: Prepare `snfoundry.toml` based on `snfoundry.toml.example`

Sepolia:
```sh
starkli declare ./target/dev/starknet_multicall_Multicall.contract_class.json --compiler-version=2.8.2 --network=sepolia
starkli deploy <CLASS_HASH> --network=sepolia
```

Mainnet:
```sh
starkli declare ./target/dev/starknet_multicall_Multicall.contract_class.json --compiler-version=2.8.2 --network=mainnet
starkli deploy <CLASS_HASH> --network=mainnet
```

## Deployed contract

Sepolia: `0x00d3d1c15729a0ce7234adb4bee69b36db08553ce11440e2c48553b2c409f7eb`

Mainnet: `0x620d16d511f5732fffc6ac780352619396f42f43ee3124af4123db199f0be2e`
