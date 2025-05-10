import {readFileSync, writeFileSync} from 'node:fs'

import {json, type SierraContractClass} from 'starknet'

const CONTRACTS = [
  ['Multicall', './target/release/starknet_multicall_Multicall.contract_class.json'],
] as const

function getAbis() {
  CONTRACTS.forEach(([name, path]) => {
    const fileContent = readFileSync(path).toString('ascii')
    const compiledSierra = json.parse(fileContent) as SierraContractClass
    const abiContent = JSON.stringify(compiledSierra.abi)
    writeFileSync(`${__dirname}/../../artifacts/${name}Abi.json`, abiContent, {flag: 'w'})
    const tsContent = `const ${name}ABI=${abiContent} as const;export default ${name}ABI`
    writeFileSync(`${__dirname}/../../artifacts/${name}ABI.ts`, tsContent, {flag: 'w'})
  })
}

getAbis()
