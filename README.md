# Multicall on Starknet

Cairo multicall contract on starknet with typescript (100% typesafe) utility.

# NPM Package

## Install

```sh
pnpm add -D typescript abi-wan-kanabi
pnpm add starknet_multicall
```

## Use

```ts
import {createMulticallRequest, multicall} from 'starknet_multicall'

const calls = [
  createMulticallRequest('<contract address>', <ABI>, '<method_name>', [<method_arg1>, <method_arg2>]),
] as const

const [result1] = await multicall(calls, <multicall contract address>, <providerOrAccount>)
```

Find deployed `<multicall contract address>` in the last section.

## Development

Requirements:

- mise

## Install dependencies

```sh
mise install
pnpm install
```

### Test

```sh
pnpm test
```

### Build

```sh
pnpm build
```

### Publish new version

```sh
pnpm publish
```

# Contracts

## Development

Requirements:

- mise

## Install dependencies

```sh
mise install
```

## Test

```sh
scarb test
```

## Build

```sh
scarb --release build
```

## Declare & deploy

Using `sncast`: Prepare `snfoundry.toml` based on `snfoundry.toml.example`

Sepolia:

```sh
starkli declare ./target/release/starknet_multicall_Multicall.contract_class.json --compiler-version=2.11.4 --network=sepolia
starkli deploy <CLASS_HASH> --network=sepolia
```

Mainnet:

```sh
starkli declare ./target/release/starknet_multicall_Multicall.contract_class.json --compiler-version=2.11.4 --network=mainnet
starkli deploy <CLASS_HASH> --network=mainnet
```

## Deployed contract

Sepolia Class Hash: `0x0552f2f9422c58f182ca33f0da421018e577179dbd13e1b683e12f1fffe4871e`

Sepolia Contract Address: `0x066be29f7ddf044ebe2401d5174ab5aed9aec0a672858cc7ec66d5e4ed49191b`

Sepolia Class Hash: ``

Mainnet Contract Address: `0x620d16d511f5732fffc6ac780352619396f42f43ee3124af4123db199f0be2e`
