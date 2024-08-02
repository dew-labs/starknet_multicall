import { json } from "starknet";
import { readFileSync, writeFileSync } from "node:fs";

const CONTRACTS = [["Multicall", "./target/dev/starknet_multicall_Multicall.contract_class.json"]];

function getAbis() {
    CONTRACTS.forEach(([name, path]) => {
        const compiledSierra = json.parse(readFileSync(path).toString("ascii"));
        const abiContent = JSON.stringify(compiledSierra.abi);
        writeFileSync(`${__dirname}/../artifacts/${name}Abi.json`, abiContent, { flag: "w" });
        const tsContent = `const ${name}ABI=${abiContent} as const;export default ${name}ABI`;
        writeFileSync(`${__dirname}/../artifacts/${name}ABI.ts`, tsContent, { flag: "w" });
    });
}

getAbis();
