
import { Web3 } from 'web3';
import { FACTORY_ADDRESS } from '@uniswap/v3-sdk';
import UniswapV3Factory from '../abis/UniswapV3Factory';
import UniswapV3Pool from '../abis/UniswapV3Pool';
import { WETH_TOKEN, USDC_TOKEN } from '../constants';

  
const MAINNET_ACTIVE = true;

const HTTPS = MAINNET_ACTIVE ? "https://eth-mainnet.g.alchemy.com/v2/UC_bPY7j48f7J4AxuX21YFdUDtB62meR" : "https://eth-sepolia.g.alchemy.com/v2/2nQYF9TNYMKqoaCI2iW_iKjbcr4paCSd"
const WSS = MAINNET_ACTIVE ? "wss://eth-mainnet.g.alchemy.com/v2/UC_bPY7j48f7J4AxuX21YFdUDtB62meR" : "wss://eth-sepolia.g.alchemy.com/v2/2nQYF9TNYMKqoaCI2iW_iKjbcr4paCSd"

const web3 = new Web3(WSS);

// Read the ABI from the JSON file
let uniswapFactoryContractAbi = UniswapV3Factory.abi;
let uniswapFactoryContractAddress = MAINNET_ACTIVE ? FACTORY_ADDRESS : "0x0227628f3F023bb0B980b67D528571c95c6DaC1c";

let uniswapPoolContractAbi = UniswapV3Pool.abi;

// Main function to execute the script
async function main() {
    const uniSwapFactoryContract = new web3.eth.Contract(uniswapFactoryContractAbi, uniswapFactoryContractAddress);

    let poolAddress = await uniSwapFactoryContract.methods.getPool(USDC_TOKEN.address, WETH_TOKEN.address, 3000).call();

    console.log(poolAddress);

    let uniSwapPoolContract = new web3.eth.Contract(uniswapPoolContractAbi, poolAddress);
    console.log(await uniSwapPoolContract.methods.slot0().call());
    console.log(await uniSwapPoolContract.methods.liquidity().call());


    /*
    let uniSwapPoolContractAddress = await uniSwapFactoryContract.methods.getPool(0).call();

    console.log(uniSwapPoolContractAddress);

    let uniSwapPoolContract = new web3.eth.Contract(uniswapPoolContractAbi, uniSwapPoolContractAddress);

    console.log(await uniSwapPoolContract.methods.positions(0).call()); 

    console.log(await uniSwapPoolContract.methods.token0().call());
    */
}


main().catch(console.error).finally(() => process.exit(0));
// main().catch(console.error)


const replacer = (key: any, value: any) => 
    typeof value === 'bigint' ? value.toString() : value; // Convert BigInt to String
