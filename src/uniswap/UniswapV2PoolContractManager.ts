
import { FACTORY_ADDRESS } from '@uniswap/v3-sdk';
import { ContractManager } from '../lib/ContractManager';
import { ethers } from 'hardhat'
import { IUniswapV2Pair, IERC20Metadata } from '../../typechain-types';

// Main function to execute the script

export class UniswapV2PoolContractManager extends ContractManager<IUniswapV2Pair> {
    token0: IERC20Metadata = {} as IERC20Metadata;
    token1: IERC20Metadata = {} as IERC20Metadata;
    token0Address: string = "";
    token1Address: string = "";
    zero = ethers.getBigInt(0);
    reserves = [this.zero,this.zero,this.zero];

    constructor(address?: string) {
        super("@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol:IUniswapV2Pair", address);
    }

    async extraInitalize() {
        this.token0Address = await this.contract.token0();
        this.token1Address = await this.contract.token1();

        this.token0 = await this.getErc20Token(this.token0Address);
        this.token1 = await this.getErc20Token(this.token1Address);

        this.reserves = await this.contract.getReserves();

    }

    async getPrice() {

        const token0Name = await this.token0.name();
        const token1Name = await this.token1.name();

        const token0Symbol = await this.token0.symbol();
        const token1Symbol = await this.token1.symbol();

        const token0Decimals = await this.token0.decimals();
        const token1Decimals = await this.token1.decimals();

        let reserve0 = Number(this.reserves[0] / (ethers.getBigInt(10) ** token0Decimals));
        let reserve1 = Number(this.reserves[1] / (ethers.getBigInt(10) ** token1Decimals));

        let price0_in_terms_of_1 = "";
        if (reserve1 > 0) {
            price0_in_terms_of_1 = (reserve0 / reserve1).toString(10);
        }

        let price1_in_terms_of_0 = "";
        if (reserve0 > 0) {
            price1_in_terms_of_0 = (reserve1 / reserve0).toString(10);
        }

        console.log(`Price of 1 ${token0Name} (${token0Symbol}) in ${token1Name} (${token1Symbol}): ${price1_in_terms_of_0}`)
        console.log(`Price of 1 ${token1Name} (${token1Symbol}) in ${token0Name} (${token0Symbol}): ${price0_in_terms_of_1}`)

    }

    async getWrappedEthPrice(): Promise<string> {
        const token0Name = await this.token0.name();
        const token1Name = await this.token1.name();

        const token0Symbol = await this.token0.symbol();
        const token1Symbol = await this.token1.symbol();

        const token0Decimals = await this.token0.decimals();
        const token1Decimals = await this.token1.decimals();

        let reserve0 = Number(this.reserves[0] / (ethers.getBigInt(10) ** token0Decimals));
        let reserve1 = Number(this.reserves[1] / (ethers.getBigInt(10) ** token1Decimals));

        let price0_in_terms_of_1 = "";
        if (reserve1 > 0) {
            price0_in_terms_of_1 = (reserve0 / reserve1).toString(10);
        }

        let price1_in_terms_of_0 = "";
        if (reserve0 > 0) {
            price1_in_terms_of_0 = (reserve1 / reserve0).toString(10);
        }

        if (token0Symbol === "WETH") {
            return price1_in_terms_of_0;
        } else if (token1Symbol === "WETH"){
            return price0_in_terms_of_1;
        } else {
            console.log("Neither token is WETH");
            return "0";
        }
    }
}


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
