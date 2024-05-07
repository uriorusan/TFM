
import { ethers } from 'ethers';
import { Web3 } from 'web3';
import { Alchemy, AlchemySubscription, Network } from "alchemy-sdk";
import IUniswapV2Router02 from '../../abis/IUniswapV2Router02';
import UniversalRouter from '../../abis/UniversalRouter';
import ISwapRouter from '../../abis/ISwapRouter';


const replacer = (key: any, value: any) => 
    typeof value === 'bigint' ? value.toString() : value; // Convert BigInt to String

function stringify(data: any) {
    return JSON.stringify(data, replacer, 4);
}

interface Transaction {
    blockHash: string | null;
    blockNumber: string | null;
    from: string;
    gas: string;
    gasPrice: string;
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
    hash: string;
    input: string;
    nonce: string;
    to: string;
    transactionIndex: string | null;
    value: string;
    type: string;
    accessList: string[];
    chainId: string;
    v: string;
    r: string;
    s: string;
    yParity: string;
}

const PoolInfoArray = [
    {
        "pairAddress": "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc",
        "token0": "USDC",
        "token1": "WETH"
    },
    {
        "pairAddress": "0x3041CbD36888bECc7bbCBc0045E3B1f144466f5f",
        "token0": "USDC",
        "token1": "USDT"
    },
    {
        "pairAddress": "0x004375Dff511095CC5A197A54140a24eFEF3A416",
        "token0": "USDC",
        "token1": "WBTC"
    },
    {
        "pairAddress": "0xAE461cA67B15dc8dc81CE7615e0320dA1A9aB8D5",
        "token0": "USDC",
        "token1": "DAI"
    },
    {
        "pairAddress": "0x0000000000000000000000000000000000000000",
        "token0": "USDC",
        "token1": "wstETH"
    },
    {
        "pairAddress": "0xd8C8a2B125527bf97c8e4845b25dE7e964468F77",
        "token0": "USDC",
        "token1": "LINK"
    },
    {
        "pairAddress": "0x02DD9Ff64EeC5D866a512EF08463C7c85A14e4Aa",
        "token0": "USDC",
        "token1": "BAT"
    },
    {
        "pairAddress": "0x0000000000000000000000000000000000000000",
        "token0": "USDC",
        "token1": "LUSD"
    },
    {
        "pairAddress": "0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852",
        "token0": "WETH",
        "token1": "USDT"
    },
    {
        "pairAddress": "0xBb2b8038a1640196FbE3e38816F3e67Cba72D940",
        "token0": "WETH",
        "token1": "WBTC"
    },
    {
        "pairAddress": "0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11",
        "token0": "WETH",
        "token1": "DAI"
    },
    {
        "pairAddress": "0x3f3eE751ab00246cB0BEEC2E904eF51e18AC4d77",
        "token0": "WETH",
        "token1": "wstETH"
    },
    {
        "pairAddress": "0xa2107FA5B38d9bbd2C461D6EDf11B11A50F6b974",
        "token0": "WETH",
        "token1": "LINK"
    },
    {
        "pairAddress": "0xB6909B960DbbE7392D405429eB2b3649752b4838",
        "token0": "WETH",
        "token1": "BAT"
    },
    {
        "pairAddress": "0xF20EF17b889b437C151eB5bA15A47bFc62bfF469",
        "token0": "WETH",
        "token1": "LUSD"
    },
    {
        "pairAddress": "0x0DE0Fa91b6DbaB8c8503aAA2D1DFa91a192cB149",
        "token0": "USDT",
        "token1": "WBTC"
    },
    {
        "pairAddress": "0xB20bd5D04BE54f870D5C0d3cA85d82b34B836405",
        "token0": "USDT",
        "token1": "DAI"
    },
    {
        "pairAddress": "0x0000000000000000000000000000000000000000",
        "token0": "USDT",
        "token1": "wstETH"
    },
    {
        "pairAddress": "0x9Db10C305c671153662119D453C4D2c123725566",
        "token0": "USDT",
        "token1": "LINK"
    },
    {
        "pairAddress": "0x0c11F54ec778Cdf062Ad0d8464cC7b7C9108c934",
        "token0": "USDT",
        "token1": "BAT"
    },
    {
        "pairAddress": "0x0000000000000000000000000000000000000000",
        "token0": "USDT",
        "token1": "LUSD"
    },
    {
        "pairAddress": "0x231B7589426Ffe1b75405526fC32aC09D44364c4",
        "token0": "WBTC",
        "token1": "DAI"
    },
    {
        "pairAddress": "0x0000000000000000000000000000000000000000",
        "token0": "WBTC",
        "token1": "wstETH"
    },
    {
        "pairAddress": "0x8a01BA64FBc7B12ee13F817DFa862881feC531b8",
        "token0": "WBTC",
        "token1": "LINK"
    },
    {
        "pairAddress": "0x65cc29d2E912827e6C1A53A5d18A7c23c9D2920d",
        "token0": "WBTC",
        "token1": "BAT"
    },
    {
        "pairAddress": "0x0000000000000000000000000000000000000000",
        "token0": "WBTC",
        "token1": "LUSD"
    },
    {
        "pairAddress": "0x0000000000000000000000000000000000000000",
        "token0": "DAI",
        "token1": "wstETH"
    },
    {
        "pairAddress": "0x6D4fd456eDecA58Cf53A8b586cd50754547DBDB2",
        "token0": "DAI",
        "token1": "LINK"
    },
    {
        "pairAddress": "0x6929abD7931D0243777d3CD147fE863646A752ba",
        "token0": "DAI",
        "token1": "BAT"
    },
    {
        "pairAddress": "0x0000000000000000000000000000000000000000",
        "token0": "DAI",
        "token1": "LUSD"
    },
    {
        "pairAddress": "0x0000000000000000000000000000000000000000",
        "token0": "wstETH",
        "token1": "LINK"
    },
    {
        "pairAddress": "0x0000000000000000000000000000000000000000",
        "token0": "wstETH",
        "token1": "BAT"
    },
    {
        "pairAddress": "0x0000000000000000000000000000000000000000",
        "token0": "wstETH",
        "token1": "LUSD"
    },
    {
        "pairAddress": "0x9773f438F0856099411fBBC0C964873b214B7406",
        "token0": "LINK",
        "token1": "BAT"
    },
    {
        "pairAddress": "0x0000000000000000000000000000000000000000",
        "token0": "LINK",
        "token1": "LUSD"
    },
    {
        "pairAddress": "0x0000000000000000000000000000000000000000",
        "token0": "BAT",
        "token1": "LUSD"
    },
];

interface IPoolInfo {
    pairAddress: string;
    token0: string;
    token1: string;
}

const MAINNET = true;
const DOMAIN = MAINNET ? process.env.ALCHEMY_MAINNET_ENDPOINT_WSS : process.env.ALCHEMY_SEPOLIA_ENDPOINT_WSS;

const web3 = new Web3(DOMAIN);

const settings = {
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET, 
};
  
const alchemy = new Alchemy(settings);

// Read the ABI from the JSON files
let uniswapV2RouterContractAbi = IUniswapV2Router02.abi;
let uniswapV2RouterContractAddress = MAINNET ? "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D" : "";
let uniswapV2RouterContractInterface = new ethers.Interface(uniswapV2RouterContractAbi);

let uniswapV3SwapRouterContractAbi = ISwapRouter.abi;
let uniswapV3SwapRouterContractAddress = MAINNET ? "0xE592427A0AEce92De3Edee1F18E0157C05861564" : "";
let uniswapV3SwapRouterContractInterface = new ethers.Interface(uniswapV3SwapRouterContractAbi);

let uniswapUniversalRouterContractAbi = UniversalRouter.abi;
let uniswapUniversalRouterContractAddress = MAINNET ? "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD" : "";
let uniswapUniversalRouterContractInterface = new ethers.Interface(uniswapUniversalRouterContractAbi);

// Find the bytes for the functions we're interested in
let exactInputSingleV3SwapRouter = "0x414bf389" ; // Function: exactInputSingle(tuple params)


// Main function to execute the script
async function main() {
      
    let count = 0;
    alchemy.ws.on(
    {
        method: AlchemySubscription.PENDING_TRANSACTIONS,
        toAddress: [
            uniswapV3SwapRouterContractAddress,
        ],
    },
        (tx: Transaction) => {
            if (tx.input.startsWith(exactInputSingleV3SwapRouter)) {
                let result = uniswapV3SwapRouterContractInterface.decodeFunctionData("exactInputSingle", tx.input);
                let parsedResult = uniswapV3SwapRouterContractInterface.decodeFunctionResult("exactInputSingle", tx.input);
                console.log(`${stringify(parsedResult)}`);
            }
        }
    );

}

main().catch(console.error);


