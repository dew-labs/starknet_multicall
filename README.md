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

Requirements: (Recommended to install via `asdf`)

-   Scarb 2.6.5 (on cairo 2.6.4)
-   Starknet Foundry 0.26.0

## Test

`scarb test`

## Build

`scarb build`

## Declare & deploy

Using `sncast`: Prepare `snfoundry.toml` based on `snfoundry.toml.example`

```sh
scarb declare-sepolia
scarb declare-mainnet
scarb deploy-sepolia
scarb deploy-mainnet
```

## Deployed contract

Sepolia: `0x62e7261fc39b214e56a5dc9b6f77674d953973d1b8892f14d76f88c97909647`

Mainnet: `0x620d16d511f5732fffc6ac780352619396f42f43ee3124af4123db199f0be2e`
