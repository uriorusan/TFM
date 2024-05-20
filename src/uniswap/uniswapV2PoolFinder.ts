
import { Web3 } from 'web3';
import { FACTORY_ADDRESS } from '@uniswap/v3-sdk';
import { IPool } from '../../typechain-types';


// Main function to execute the script
async function main() {
}



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
