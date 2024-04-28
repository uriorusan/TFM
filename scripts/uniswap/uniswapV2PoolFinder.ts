
import { Web3 } from 'web3';
import { FACTORY_ADDRESS } from '@uniswap/v3-sdk';
import UniswapV3Factory from '../../abis/UniswapV3Factory';
import UniswapV3Pool from '../../abis/UniswapV3Pool';
import IUniswapV2Router02 from '../../abis/IUniswapV2Router02';
import IUniswapV2Factory from '../../abis/IUniswapV2Factory';

  
const MAINNET = true;
const DOMAIN = MAINNET ? process.env.ALCHEMY_MAINNET_ENDPOINT_WSS : process.env.ALCHEMY_SEPOLIA_ENDPOINT_WSS;

const web3 = new Web3(DOMAIN);

// Read the ABI from the JSON files
let uniswapV3FactoryContractAbi = UniswapV3Factory.abi;
let uniswapV3FactoryContractAddress = MAINNET ? FACTORY_ADDRESS : "0x0227628f3F023bb0B980b67D528571c95c6DaC1c";

let uniswapV3PoolContractAbi = UniswapV3Pool.abi;

let uniswapV2RouterContractAbi = IUniswapV2Router02.abi;
let uniswapV2RouterContractAddress = MAINNET ? "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D" : "";

let uniswapV2FactoryContractAbi = IUniswapV2Factory.abi;

// Main function to execute the script
async function main() {
    const uniSwapV3FactoryContract = new web3.eth.Contract(uniswapV3FactoryContractAbi, uniswapV3FactoryContractAddress);

    const uniswapV2RouterContract = new web3.eth.Contract(uniswapV2RouterContractAbi, uniswapV2RouterContractAddress);

    let uniswapV2FactoryContractAddress = await uniswapV2RouterContract.methods.factory().call();

    console.log(`Uniswap V2 Factory Address: ${uniswapV2FactoryContractAddress}`);

    let uniswapV2FactoryContract = new web3.eth.Contract(uniswapV2FactoryContractAbi, uniswapV2FactoryContractAddress);

    // generate an array of pair of most borrowed assets from the most_borrowed_assets array, skipping pairs with itself and duplicates
    let most_borrowed_assets_pairs = [];
    for (let i = 0; i < most_borrowed_assets.length; i++) {
        for (let j = i + 1; j < most_borrowed_assets.length; j++) {
            most_borrowed_assets_pairs.push([most_borrowed_assets[i], most_borrowed_assets[j]]);
        }
    }

    for (let i = 0; i < most_borrowed_assets_pairs.length; i++) {
        let pairAddress = await uniswapV2FactoryContract.methods.getPair(most_borrowed_assets_pairs[i][0], most_borrowed_assets_pairs[i][1]).call();
        let tokenA = getTokenNameByAddress(most_borrowed_assets_pairs[i][0]);
        let tokenB = getTokenNameByAddress(most_borrowed_assets_pairs[i][1]);

        let ret = {
            pairAddress: pairAddress,
            token0: tokenA,
            token1: tokenB,
        }
        console.log(JSON.stringify(ret, null, 4));
    }
}

main().catch(console.error).finally(() => process.exit(0));


const replacer = (key: any, value: any) => 
    typeof value === 'bigint' ? value.toString() : value; // Convert BigInt to String

const most_borrowed_assets_names = {
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": "USDC",
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": "WETH",
    "0xdAC17F958D2ee523a2206206994597C13D831ec7": "USDT",
    "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599": "WBTC",
    "0x6B175474E89094C44Da98b954EedeAC495271d0F": "DAI",
    "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0": "wstETH",
    "0x514910771AF9Ca656af840dff83E8264EcF986CA": "LINK",
    "0x0D8775F648430679A709E98d2b0Cb6250d2887EF": "BAT",
    "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0": "LUSD",
} as const;

const most_borrowed_assets = [
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
    "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    "0x0D8775F648430679A709E98d2b0Cb6250d2887EF",
    "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0",
];

type Address = keyof typeof most_borrowed_assets_names;
type TokenName = typeof most_borrowed_assets_names[Address];

function getTokenNameByAddress(address: string): TokenName | 'Unknown' {
    const tokenName = most_borrowed_assets_names[address as Address];
    return tokenName || 'Unknown';
}
