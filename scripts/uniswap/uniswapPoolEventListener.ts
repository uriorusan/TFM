
import { Web3 } from 'web3';
import { FACTORY_ADDRESS } from '@uniswap/v3-sdk';
import UniswapV3Factory from '../../abis/UniswapV3Factory';
import UniswapV3Pool from '../../abis/UniswapV3Pool';
import { WETH_TOKEN, USDC_TOKEN } from '../../constants';

  
const MAINNET = true;
const DOMAIN = MAINNET ? process.env.ALCHEMY_MAINNET_ENDPOINT_WSS : process.env.ALCHEMY_SEPOLIA_ENDPOINT_WSS;

const web3 = new Web3(DOMAIN);

// Read the ABI from the JSON file
let uniswapFactoryContractAbi = UniswapV3Factory.abi;
let uniswapFactoryContractAddress = MAINNET ? FACTORY_ADDRESS : "0x0227628f3F023bb0B980b67D528571c95c6DaC1c";

let uniswapPoolContractAbi = UniswapV3Pool.abi;

// Main function to execute the script
async function main() {
    const uniSwapFactoryContract = new web3.eth.Contract(uniswapFactoryContractAbi, uniswapFactoryContractAddress);

    let poolFeeAmount = 3000;
    let usdcWethPoolAddress = await uniSwapFactoryContract.methods.getPool(USDC_TOKEN.address, WETH_TOKEN.address, poolFeeAmount).call();

    console.log(usdcWethPoolAddress);

    let uniSwapUsdcWethPoolContract = new web3.eth.Contract(uniswapPoolContractAbi, usdcWethPoolAddress);
    const slot0 = await uniSwapUsdcWethPoolContract.methods.slot0().call();
    const liquidity = await uniSwapUsdcWethPoolContract.methods.liquidity().call();

    uniSwapUsdcWethPoolContract.events.Swap().on('data', (event: any) => {
        console.log(event);
    });
}


main().catch(console.error);


const replacer = (key: any, value: any) => 
    typeof value === 'bigint' ? value.toString() : value; // Convert BigInt to String
